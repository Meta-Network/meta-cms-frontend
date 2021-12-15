import type { Table, Transaction } from 'dexie';
import Dexie from 'dexie';
import type { Posts } from './Posts';
import type { Metadatas, MetadataTempDataState } from './Metadatas';
import moment from 'moment';
import { License } from '../../config';

export class StoreDB extends Dexie {
  posts!: Table<Posts, number>;
  metadatas!: Table<Metadatas, number>;
  constructor() {
    super('StoreDB');
    this.version(11)
      .stores({
        posts:
          '++id, cover, title, summary, content, hash, status, timestamp, delete, post, draft, tags, license, createdAt, updatedAt',
        metadatas: '++id, postId, metadata, delete, createdAt, updatedAt',
      })
      .upgrade((tx: Transaction | any) => {
        const time = moment().toISOString();
        // TODO: modify typescript
        tx.posts.toCollection().modify((post: Posts) => {
          // console.log('post', post);
          post.cover = post.cover || '';
          post.title = post.title || '';
          post.summary = post.summary || '';
          post.content = post.content || '';
          post.hash = post.hash || '';
          post.status = post.status || 'pending';
          post.timestamp = post.timestamp || Date.now();
          post.delete = post.delete || false;
          post.post = post.post || null;
          post.draft = post.draft || null;
          post.tags = post.tags || [];
          post.license = post.license || License;
          post.createdAt = post.createdAt || time;
          post.updatedAt = post.updatedAt || time;
        });
        tx.metadatas.toCollection().modify((metadata: Metadatas) => {
          // console.log('Metadatas', metadata);
          metadata.delete = metadata.delete || false;
        });
      });
  }
}

export const db = new StoreDB();

/**
 * db posts update
 * @param id
 * @param data
 * @returns
 */
export const dbPostsUpdate = async <T>(id: number, data: T): Promise<number> => {
  return await db.posts.update(id, data);
};

/**
 * db posts add
 * @param data
 * @returns
 */
export const dbPostsAdd = async (data: Posts): Promise<number> => {
  return await db.posts.add(data);
};

/**
 * db posts get
 * @param id
 * @returns
 */
export const dbPostsGet = async (id: number): Promise<Posts | undefined> => {
  return await db.posts.get(id);
};

/**
 * db posts delete
 */
export const dbPostsDelete = async (id: number): Promise<void> => {
  return await db.posts.delete(id);
};

/**
 * db posts delete all
 * @returns
 */
export const dbPostsDeleteAll = async (): Promise<number> => {
  return await db.posts.toCollection().delete();
};

/**
 * db posts all
 * @returns
 */
export const dbPostsAll = async (): Promise<Posts[] | undefined> => {
  return await db.posts
    .filter((i) => !i.delete)
    .reverse()
    .sortBy('updatedAt');
};

/**
 * db posts all counter
 * @returns
 */
export const dbPostsAllCount = async (): Promise<number> => {
  return await db.posts.filter((i) => !i.delete).count();
};

/**
 * db posts where exist by id
 */
export const dbPostsWhereExist = async (id: number): Promise<boolean> => {
  // 草稿删除了 允许重新编辑
  const result = await db.posts
    .filter((i) => !i.delete)
    .reverse()
    .sortBy('id');

  return result.some((post) => post.post && Number(post.post.id) === id);
};

export const dbPostsWhereByID = async (id: number): Promise<Posts | undefined> => {
  // 草稿删除了 允许重新编辑
  const result = await db.posts
    .filter((i) => !i.delete)
    .reverse()
    .sortBy('id');

  return result.find((post) => post.post && Number(post.post.id) === id);
};

// post data temp
export const PostTempData = (): Posts => ({
  cover: '',
  title: '',
  summary: '',
  content: '',
  hash: '',
  status: 'pending',
  timestamp: Date.now(),
  delete: false,
  post: null,
  draft: null,
  tags: [],
  license: License,
  createdAt: moment().toISOString(),
  updatedAt: moment().toISOString(),
});

// db metadatas

// metadata data temp
export const MetadataTempData = (): MetadataTempDataState => ({
  delete: false,
  createdAt: moment().toISOString(),
  updatedAt: moment().toISOString(),
});

/**
 * db metadatas add
 * @param data
 * @returns
 */
export const dbMetadatasAdd = async (data: Metadatas): Promise<number> => {
  return await db.metadatas.add(data);
};

/**
 * db metadatas update by postId
 * @param id
 * @param data
 * @returns
 */
export const dbMetadatasUpdateByPostId = async <T>(postId: number, data: T): Promise<number> => {
  return await db.metadatas.where('postId').equals(postId).modify(data);
};

/**
 * db metadatas delete all
 * @returns
 */
export const dbMetadatasDeleteAll = async (): Promise<number> => {
  return await db.metadatas.toCollection().delete();
};
