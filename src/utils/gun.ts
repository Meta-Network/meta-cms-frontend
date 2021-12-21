import { assign, cloneDeep } from 'lodash';
import moment from 'moment';
import Gun from 'gun';
import 'gun/sea';
import { dbPostsUpdate, dbPostsAdd, dbPostsAll, dbPostsGet } from '@/db/db';
import {
  KEY_GUN_ROOT,
  KEY_GUN_ROOT_DRAFT,
  KEY_META_CMS_GUN_SEED,
  KEY_META_CMS_GUN_PAIR,
  GUN_PEERS,
} from '../../config';
import { storeGet, storeSet } from './store';
import { generateSeed, generateKeys } from '@metaio/meta-signature-util';
import type { KeyPair } from '@metaio/meta-signature-util';

export const signIn = (gun: any): Promise<string> => {
  /**
   * 判断本地是否生成了用户
   *  有 用户登录
   *  没有 用户注册, 生成 pair
   */

  // TODO: 后面再来接入
  // const userGun = gun.user().recall({ sessionStorage: true });

  const createUser = (user: string, pass: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      gun.user().create(user, pass, (ack: GunType.GunCreateCb) => {
        if (ack.err) {
          console.error('ack', ack);
          reject(ack.err);
        } else if (ack.ok === 0 || ack.pub) {
          console.log('success');
          resolve('success');
        } else {
          reject('未知错误');
        }
      });
    });
  };

  return new Promise(async (resolve, reject) => {
    // pair
    const gunPair = JSON.parse(storeGet(KEY_META_CMS_GUN_PAIR) || '""');
    if (gunPair) {
      //
    } else {
      const pair = await Gun.SEA.pair();
      storeSet(KEY_META_CMS_GUN_PAIR, JSON.stringify(pair));
    }

    const gunSeed = JSON.parse(storeGet(KEY_META_CMS_GUN_SEED) || '[]');
    if (gunSeed.length) {
      const keys: KeyPair = generateKeys(gunSeed);

      gun.user().auth(keys.public, keys.private, (at: GunType.GunAuthCb) => {
        if (at.err) {
          console.error('at', at);
          if (at.err.includes('Wrong user or password.')) {
            createUser(keys.public, keys.private)
              .then((response) => {
                resolve(response);
              })
              .catch((e) => {
                reject(e);
              });
          } else {
            reject(at.err);
          }
        } else {
          console.log('auth success');
          resolve('success');
        }
      });
    } else {
      const seed: string[] = generateSeed();
      const keys: KeyPair = generateKeys(seed);

      storeSet(KEY_META_CMS_GUN_SEED, JSON.stringify(seed));

      createUser(keys.public, keys.private)
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    }
  });
};

export const initGun = () => {
  console.log('> Gun constructor!');
  const gun = new Gun({
    peers: GUN_PEERS,
  });

  signIn(gun);
  (window as any).gun = gun;
};

/**
 * fetch gun drafts by user scope
 * @param param0 GunDraftArgs
 * @returns
 */
export const fetchGunDrafts = ({
  gunDraft,
  scope,
  userId,
}: GunType.FetchGunDraftsArgs): Promise<GunType.GunDraft[]> => {
  return new Promise((resolve, reject) => {
    try {
      gunDraft.get(scope).once(async (data: any) => {
        if (!data && !data?._['>']) {
          resolve([]);
          return;
        }

        const pair = JSON.parse(storeGet(KEY_META_CMS_GUN_PAIR) || '""');
        if (!pair) {
          resolve([]);
          return;
        }

        const list = [];
        for (const key in data._['>']) {
          if (data[key]) {
            // 解密
            const msg = await Gun.SEA.verify(data[key], pair.pub);
            const dec = (await Gun.SEA.decrypt(msg, pair)) as GunType.GunDraft;

            if (dec) {
              dec.key = key;
            }
            list.push(dec);
          }
        }

        const listFilter = list.filter((i) => i && i?.userId === userId);
        resolve(listFilter);
      });
    } catch (e) {
      console.error(e);
      reject([]);
    }
  });
};

/**
 * sync local draft
 * @param param0
 * @returns
 */
export const syncLocalDrafts = ({
  drafts,
  gunDrafts,
}: GunType.SyncLocalDraftsArgs): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const _draftsClone = cloneDeep(drafts);
      const _gunDraftsClone = cloneDeep(gunDrafts);

      for (let i = 0; i < _gunDraftsClone.length; i++) {
        const ele = _gunDraftsClone[i];
        const idx = _draftsClone.findIndex(
          (j: any) => String(ele.timestamp) === String(j.timestamp) && ele.userId === j.userId,
        );

        if (~idx) {
          /**
           * 对比更新时间 更新内容
           * 更新本地草稿不需要 key
           * 新文章不需要 ID 和 key
           */

          // 删除 gun 草稿的 id，防止写入错误
          const data = cloneDeep(ele);
          delete data.id;

          let _data;
          // 如果本地文章比较新
          if (moment(data.updatedAt).isBefore(_draftsClone[idx].updatedAt)) {
            _data = assign(data, _draftsClone[idx]);
          } else {
            // 否则 gun 比较新
            _data = assign(_draftsClone[idx], data);
          }
          _draftsClone[idx] = _data;

          // 更新本地草稿不需要 key
          const updateData = cloneDeep(_data);
          delete updateData.key;

          await dbPostsUpdate(updateData.id!, updateData);
        } else {
          _draftsClone.push(ele);

          // 写入新草稿
          const data = cloneDeep(ele);
          delete data.key;
          delete data.id;
          console.log('syncLocalDrafts add', data);

          await dbPostsAdd(data);
        }
      }
      resolve(_draftsClone);
    } catch (e) {
      console.error(e);
      reject([]);
    }
  });
};

/**
 * sync New Draft
 * @param param0
 * @returns
 */
export const syncNewDraft = async ({ id, userId }: GunType.SyncNewDraftArgs): Promise<void> => {
  await signIn((window as any).gun);

  const userScope = `user_${userId}`;
  const _gun = (window as any).gun.user().get(KEY_GUN_ROOT).get(KEY_GUN_ROOT_DRAFT);
  const draft = await dbPostsGet(id);

  const pair = JSON.parse(storeGet(KEY_META_CMS_GUN_PAIR) || '""');
  if (!pair) {
    return;
  }

  // 加密
  const enc = await Gun.SEA.encrypt(JSON.stringify(draft), pair);
  const dataMsg = await Gun.SEA.sign(enc, pair);

  _gun.get(userScope).set(dataMsg);
};

/**
 * sync Draft
 * @param param0
 */
export const syncDraft = async ({ userId, key, data }: GunType.SyncDraftArgs): Promise<void> => {
  await signIn((window as any).gun);

  const userScope = `user_${userId}`;
  const _gun = (window as any).gun.user().get(KEY_GUN_ROOT).get(KEY_GUN_ROOT_DRAFT);

  const pair = JSON.parse(storeGet(KEY_META_CMS_GUN_PAIR) || '""');
  if (!pair) {
    return;
  }

  // 加密
  const enc = await Gun.SEA.encrypt(JSON.stringify(data), pair);
  const dataMsg = await Gun.SEA.sign(enc, pair);

  _gun.get(userScope).get(key).put(dataMsg);
};

/**
 * sync gun drafts
 * @param param0 SyncGunDraftsArgs
 * @returns
 */
export const syncGunDrafts = ({ drafts, userId }: GunType.SyncGunDraftsArgs): Promise<void> => {
  return new Promise(async (resolve) => {
    const draftsClone = cloneDeep(drafts);
    for (let i = 0; i < draftsClone.length; i++) {
      const ele = draftsClone[i];
      if (ele.key) {
        await syncDraft({
          userId,
          key: ele.key,
          data: ele,
        });
      } else {
        await syncNewDraft({
          id: ele.id!,
          userId,
        });
      }
    }
    resolve();
  });
};

/**
 * two way sync
 * @param user
 */
export const fetchGunDraftsAndUpdateLocal = async (
  user: GLOBAL.CurrentUser,
): Promise<GunType.GunDraft[]> => {
  /**
   * 获取所有本地文章
   * 获取 gun.js 所有文章
   * 更新本地文章
   */

  // 获取所有本地文章
  const drafts = (await dbPostsAll(user.id)) || [];
  // console.log('drafts', drafts);

  // 获取 gun.js 所有文章
  const userScope = `user_${user.id}`;
  const _gun = (window as any).gun.user().get(KEY_GUN_ROOT).get(KEY_GUN_ROOT_DRAFT);

  const _gunDrafts: any[] = await fetchGunDrafts({
    gunDraft: _gun,
    scope: userScope,
    userId: user.id,
  });
  // console.log('_gunDrafts', _gunDrafts);

  // 更新本地文章
  const allDrafts: any[] = await syncLocalDrafts({
    drafts: drafts,
    gunDrafts: _gunDrafts,
  });
  // console.log('allDrafts', allDrafts);

  return allDrafts;
};

export const twoWaySyncDrafts = async (user: GLOBAL.CurrentUser): Promise<GunType.GunDraft[]> => {
  /**
   * 获取所有本地文章
   * 获取 gun.js 所有文章
   * 更新本地文章
   * 更新远端文章
   */

  // 获取所有本地文章
  const drafts = (await dbPostsAll(user.id)) || [];
  // console.log('drafts', drafts);

  // 获取 gun.js 所有文章
  const userScope = `user_${user.id}`;
  const _gun = (window as any).gun.user().get(KEY_GUN_ROOT).get(KEY_GUN_ROOT_DRAFT);

  const _gunDrafts: any[] = await fetchGunDrafts({
    gunDraft: _gun,
    scope: userScope,
    userId: user.id,
  });
  // console.log('_gunDrafts', _gunDrafts);

  // 更新本地文章
  const allDrafts: any[] = await syncLocalDrafts({
    drafts: drafts,
    gunDrafts: _gunDrafts,
  });
  // console.log('allDrafts', allDrafts);

  // 更新远端文章
  await syncGunDrafts({
    drafts: allDrafts,
    userId: user.id,
  });

  return allDrafts;
};

/**
 * delete draft
 * @param param0
 */
export const deleteDraft = async ({ userId, key }: GunType.DeleteDraftArgs) => {
  await signIn((window as any).gun);

  const userScope = `user_${userId}`;
  const _gun = (window as any).gun.user().get(KEY_GUN_ROOT).get(KEY_GUN_ROOT_DRAFT);
  _gun.get(userScope).get(key).put(null);
};

/**
 * generate seed pair
 */
export const generateSeedAndPair = async () => {
  const seed: string[] = generateSeed();
  const pair = await Gun.SEA.pair();

  storeSet(KEY_META_CMS_GUN_SEED, JSON.stringify(seed));
  storeSet(KEY_META_CMS_GUN_PAIR, JSON.stringify(pair));

  sessionStorage.clear();
  await signIn((window as any).gun);
};

/**
 * get seed pair
 * @returns
 */
export const getSeedAndPair = () => {
  // TODO: 复制出来的格式并不好看，可以考虑加密成一串字符然后导入再解密 待考虑
  const seed = storeGet(KEY_META_CMS_GUN_SEED);
  const pair = storeGet(KEY_META_CMS_GUN_PAIR);
  return JSON.stringify([seed, pair]);
};

/**
 * save seed pair
 */
export const saveSeedAndPair = async (seedAndPair: string) => {
  if (!seedAndPair) {
    return;
  }

  const [seed, pair] = JSON.parse(seedAndPair);
  storeSet(KEY_META_CMS_GUN_SEED, seed);
  storeSet(KEY_META_CMS_GUN_PAIR, pair);

  sessionStorage.clear();
  await signIn((window as any).gun);
};
