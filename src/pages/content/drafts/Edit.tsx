import React, { Fragment, useState, useCallback, useEffect, useMemo } from 'react';
import { history, useIntl, useModel } from 'umi';
import { Input, message, notification } from 'antd';
import Editor from '@/components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import EditorHeader from '@/components/Editor/editorHeader';
import { useMount, useThrottleFn, useEventEmitter } from 'ahooks';
import {
  dbPostsUpdate,
  dbPostsAdd,
  dbPostsGet,
  PostTempData,
  dbPostsWhereExistByTitleAndId,
} from '@/db/db';
import { imageUploadByUrlAPI } from '@/helpers';
import { assign, cloneDeep, trim, uniq } from 'lodash';
// import type Vditor from 'vditor';
import {
  generateSummary,
  postDataMergedUpdateAt,
  pipelinesPostOrdersData,
  isValidImage,
} from '@/utils/editor';
import FullLoading from '@/components/FullLoading';
import Settings from '@/components/Editor/settings';
// import HeaderCloudDraftUpload from '@/components/Editor/headerCloudDraftUpload';
// import HeaderCloudDraftDownload from '@/components/Editor/headerCloudDraftDownload';
import SettingsTags from '@/components/Editor/settingsTags';
import SettingsOriginalLink from '@/components/Editor/settingsOriginalLink';
import SettingsLearnMore from '@/components/Editor/settingsLearnMore';
import SettingsCopyrightNotice from '@/components/Editor/settingsCopyrightNotice';
import SettingsTips from '@/components/Editor/settingsTips';
import { fetchPostsStorage, pipelinesPostOrders } from '@/services/api/meta-cms';
import { mergedMessage } from '@/utils';
import moment from 'moment';
import {
  OSS_MATATAKI,
  OSS_MATATAKI_FEUSE,
  KEY_GUN_ROOT,
  KEY_GUN_ROOT_DRAFT,
  KEY_META_CMS_GUN_PAIR,
  editorRules,
} from '../../../../config';
import { DraftMode, FetchPostsStorageParamsState, SyncPlatform } from '@/services/constants';
import Gun from 'gun';
import {
  fetchGunDraftsAndUpdateLocal,
  syncNewDraft,
  syncDraft,
  fetchGunDrafts,
  signIn,
} from '@/utils/gun';
import { storeGet } from '@/utils/store';
import PublishingTip from '@/components/Editor/PublishingTip';
import type { GatewayType } from '@/services/constants';
import type {
  AuthorPostDigestMetadata,
  AuthorPostSignatureMetadata,
} from '@metaio/meta-signature-util-v2';

const keyUploadAllImages = 'keyUploadAllImages';
const keyUploadAllImagesMessage = 'keyUploadAllImagesMessage';

const Edit: React.FC = () => {
  const intl = useIntl();
  const [postData, setPostData] = useState<PostType.Posts>({} as PostType.Posts);
  const [cover, setCover] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [license, setLicense] = useState<string>('');
  const [draftMode, setDraftMode] = useState<DraftMode>(DraftMode.Default);
  const [contentImagesSrc, setContentImagesSrc] = useState<string[]>([]);
  const focus$ = useEventEmitter<string>();
  const [visiblePublishingTip, setVisiblePublishingTip] = useState<boolean>(false);

  // vditor
  // const [vditor, setVditor] = useState<Vditor>();
  // 处理图片上传开关
  const [flagImageUploadToIpfs, setFlagImageUploadToIpfs] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  const { initialState } = useModel('@@initialState');

  // 原文链接
  const settingsOriginalLinkHash = useMemo(() => {
    if (postData.sourceData?.platform === SyncPlatform.MATATAKI) {
      return postData.sourceData.source;
    } else {
      return '';
    }
  }, [postData]);

  const postTempDataMergedUserId = useCallback(
    () => assign(PostTempData(), { userId: initialState?.currentUser?.id }),
    [initialState],
  );

  // watch current draft
  const watchCurrentDraft = useCallback(
    async (id: number) => {
      if (!initialState?.currentUser?.id) {
        return;
      }
      const draft = await dbPostsGet(id);

      if (!draft) {
        return;
      }

      const { currentUser } = initialState;
      const userScope = `user_${currentUser.id}`;
      const _gun = (window as any).gun.user().get(KEY_GUN_ROOT).get(KEY_GUN_ROOT_DRAFT);

      // 获取所有草稿找到 key
      const gunAllDrafts = await fetchGunDrafts({
        gunDraft: _gun,
        scope: userScope,
        userId: currentUser.id,
      });

      const draftFind: any = gunAllDrafts.find(
        (i) => String(i.timestamp) === String(draft.timestamp) && i.userId === currentUser.id,
      );

      const updateDraftFn = async (data: string) => {
        const pair = JSON.parse(storeGet(KEY_META_CMS_GUN_PAIR) || '""');
        if (!pair) {
          return;
        }

        // 解密
        const msg = await Gun.SEA.verify(data, pair.pub);
        const gunDraft = (await Gun.SEA.decrypt(msg, pair)) as PostType.Posts;

        // 如果文章变动
        if (
          moment(draft.updatedAt).isBefore(gunDraft.updatedAt) &&
          draft.userId === gunDraft.userId
        ) {
          // 监测到更新，立即本地更新
          const _data = assign(draft, gunDraft);
          const updateData: any = cloneDeep(_data);
          delete updateData.key;

          await dbPostsUpdate(updateData.id!, updateData);
        }
      };

      if (draftFind && draftFind?.key) {
        _gun
          .get(userScope)
          .get(draftFind.key)
          .on((data: any) => {
            if (data) {
              updateDraftFn(data);
            }
          });
      }
    },
    [initialState],
  );

  // handle history url state
  const handleHistoryState = useCallback(
    (id: string) => {
      window.history.replaceState({}, '', `?id=${id}`);
      history.location.query!.id = id;

      if (initialState?.currentUser?.id) {
        // 同步新草稿
        syncNewDraft({
          id: Number(id),
          userId: initialState.currentUser.id!,
        });
      }
    },
    [initialState],
  );

  // 处理更新
  const handleUpdate = useCallback(
    async (id: number, data: any) => {
      // local update
      await dbPostsUpdate(id, data);

      // gun.js update
      // 更新到 gun.js
      if (!initialState?.currentUser?.id) {
        return;
      }

      const { currentUser } = initialState;
      const draft = await dbPostsGet(id);

      const userScope = `user_${currentUser.id}`;
      const _gun = (window as any).gun.user().get(KEY_GUN_ROOT).get(KEY_GUN_ROOT_DRAFT);

      const gunAllDrafts = await fetchGunDrafts({
        gunDraft: _gun,
        scope: userScope,
        userId: currentUser.id,
      });

      const draftFind: any = gunAllDrafts.find(
        (i) => String(i.timestamp) === String(draft?.timestamp) && i.userId === currentUser.id,
      );

      // 更新草稿
      if (draftFind && draftFind?.key) {
        syncDraft({
          userId: currentUser.id,
          key: draftFind?.key,
          data: draft,
        });
      } else {
        // 如果文章在 gun 被删了
        syncNewDraft({
          id: id,
          userId: currentUser.id,
        });
      }
    },
    [initialState],
  );

  /**
   * 发布文章
   */
  const pipelinesPostOrdersFn = useCallback(
    async (gatewayType: GatewayType) => {
      setPublishLoading(true);

      const payload = {
        title: trim(title),
        cover: cover,
        summary: generateSummary(),
        content: trim(content),
        license: license,
        categories: '',
        tags: tags.join(),
      };

      // 校验 seed key，可能不匹配
      let pipelinesPostOrdersDataResult;
      try {
        pipelinesPostOrdersDataResult = pipelinesPostOrdersData({ payload }) as {
          authorPostDigest: AuthorPostDigestMetadata;
          authorPostDigestSign: AuthorPostSignatureMetadata;
        };
      } catch (e: any) {
        console.error('pipelinesPostOrders', e);
        message.error(e.message);
      }

      if (!pipelinesPostOrdersDataResult) {
        setPublishLoading(false);
        return;
      }

      const { authorPostDigest, authorPostDigestSign } = pipelinesPostOrdersDataResult;
      const result = await pipelinesPostOrders({
        certificateStorageType: gatewayType,
        authorPostDigest,
        authorPostSign: authorPostDigestSign,
      });

      setPublishLoading(false);

      if (result.statusCode === 201) {
        message.success(intl.formatMessage({ id: 'messages.editor.success' }));

        const { id } = history.location.query as Router.PostQuery;
        await handleUpdate(Number(id), postDataMergedUpdateAt({ post: result.data, draft: null }));

        setVisiblePublishingTip(true);
      } else if (result.statusCode === 400) {
        const _message =
          typeof result.message === 'string' ? result.message : mergedMessage(result.message);
        message.error(_message);
      } else if (result.statusCode === 409) {
        // 'When post state is not pending or pending_edit.'
        message.error(result.message);
      } else if (result.statusCode === 500) {
        message.error(result.message);
      } else {
        message.error(intl.formatMessage({ id: 'messages.editor.fail' }));
      }

      if (!(result.statusCode === 201 || result.statusCode === 200)) {
        notification.open({
          message: intl.formatMessage({
            id: 'messages.editor.notification.title',
          }),
          description: intl.formatMessage({
            id: 'messages.editor.publish.notification.fail',
          }),
          duration: null,
        });
      }
    },
    [title, cover, content, tags, license, handleUpdate, intl],
  );

  /**
   * 校验标题
   */
  const checkTitle = useCallback(
    async ({ titleValue, id }: { titleValue: string; id: number }): Promise<boolean> => {
      /**
       * check local draft
       * check repo post
       */

      if (!initialState?.currentUser && !initialState?.siteConfig) {
        return false;
      }

      const isLocalExist = await dbPostsWhereExistByTitleAndId({
        title: titleValue,
        id,
        userId: initialState.currentUser!.id,
      });
      // console.log('isLocalExist', isLocalExist);

      if (isLocalExist) {
        return false;
      }

      const allPostsResult = await fetchPostsStorage(initialState.siteConfig!.id, {
        state: FetchPostsStorageParamsState.Posted,
      });

      if (allPostsResult.statusCode !== 200) {
        return false;
      }
      const isExistPost = allPostsResult.data.items.some((i) => i.title === titleValue);
      // console.log('isExistPost', isExistPost);

      if (isExistPost) {
        return false;
      }

      return true;
    },
    [initialState],
  );

  // 处理提交
  const handlePublish = useCallback(
    async (gatewayType: GatewayType) => {
      setPublishLoading(true);

      const { id } = history.location.query as Router.PostQuery;
      if (!id) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.tip.id',
          }),
        );
        setPublishLoading(false);
        return;
      }

      // 标题不能为空
      const _title = trim(title);
      const _content = trim(content);

      if (!_title) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.verify.title.empty',
          }),
        );
        setPublishLoading(false);
        return;
      }

      // 内容不能为空
      if (!_content) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.verify.content.empty',
          }),
        );
        setPublishLoading(false);
        return;
      }

      // title 长度判断
      if (_title.length < editorRules.title.min || _title.length > editorRules.title.max) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.title.length',
            },
            {
              min: editorRules.title.min,
              max: editorRules.title.max,
            },
          ),
        );
        setPublishLoading(false);
        return;
      }

      // content 长度判断
      if (_content.length < editorRules.content.min || _content.length > editorRules.content.max) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.content.length',
            },
            {
              min: editorRules.content.min,
              max: editorRules.content.max,
            },
          ),
        );
        setPublishLoading(false);
        return;
      }

      // summary 长度判断
      const summary = generateSummary();
      if (summary.length < editorRules.summary.min || summary.length > editorRules.summary.max) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.summary.length',
            },
            {
              min: editorRules.summary.min,
              max: editorRules.summary.max,
            },
          ),
        );
        setPublishLoading(false);
        return;
      }

      // 封面长度判断
      if (cover.length < editorRules.cover.min || cover.length > editorRules.cover.max) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.cover.length',
            },
            {
              min: editorRules.cover.min,
              max: editorRules.cover.max,
            },
          ),
        );
        setPublishLoading(false);
        return;
      }

      // 封面格式判断
      if (cover && !cover.includes(FLEEK_NAME)) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.tip.coverFormat',
          }),
        );
        setPublishLoading(false);
        return;
      }

      // site config 判断
      const siteConfig = initialState?.siteConfig;
      if (!siteConfig) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.noDefaultConfig',
          }),
        );
        setPublishLoading(false);
        return;
      }

      // tags 长度 个数 判断
      if (tags.length > editorRules.tags.maxNumber) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.tag.number',
            },
            {
              maxNumber: editorRules.tags.maxNumber,
            },
          ),
        );

        setPublishLoading(false);
        return;
      }

      // tag 单个个数长度判断
      const tagsFilter = tags.filter((i) => i.length > editorRules.tags.singleLength);
      if (tagsFilter.length) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.tag.singleLength',
            },
            {
              max: editorRules.tags.singleLength,
            },
          ),
        );

        setPublishLoading(false);
        return;
      }

      const tagsStr = tags.join();
      if (tagsStr.length < editorRules.tags.min || tagsStr.length > editorRules.tags.max) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.tag.length',
            },
            {
              min: editorRules.tags.min,
              max: editorRules.tags.max,
            },
          ),
        );

        setPublishLoading(false);
        return;
      }

      // categories 长度判断
      // 暂无

      // license 长度判断
      if (license.length < editorRules.license.min || license.length > editorRules.license.max) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.license.length',
            },
            {
              min: editorRules.license.min,
              max: editorRules.license.max,
            },
          ),
        );

        setPublishLoading(false);
        return;
      }

      // check title
      const checkTitleResult = await checkTitle({
        titleValue: trim(title),
        id: Number(id),
      });

      if (!checkTitleResult) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.verify.title.repeat',
          }),
        );

        setPublishLoading(false);
        return;
      }

      pipelinesPostOrdersFn(gatewayType);
    },
    [title, cover, content, pipelinesPostOrdersFn, checkTitle, initialState, license, tags, intl],
  );

  /**
   * async content to DB
   */
  const asyncContentToDB = useCallback(
    async (val: string) => {
      setContent(val);
      setDraftMode(DraftMode.Saving);

      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({
        content: val,
        summary: generateSummary(),
      });
      if (id) {
        await handleUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(postTempDataMergedUserId(), data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(DraftMode.Saved);
    },
    [handleHistoryState, postTempDataMergedUserId, handleUpdate],
  );

  /**
   * handle image upload to IPFS
   * TODO: 如果图片失败下次跳过执行
   */
  const handleImageUploadToIpfs = useCallback(async () => {
    if (flagImageUploadToIpfs) return;
    setFlagImageUploadToIpfs(true);

    const _vditor = (window as any).vditor;
    if (!_vditor) {
      setFlagImageUploadToIpfs(false);
      return;
    }

    const contentHTML = _vditor.getHTML();
    const DIV = document.createElement('div');
    DIV.innerHTML = contentHTML;

    const imgList: HTMLImageElement[] = [
      ...(DIV.querySelectorAll('img') as NodeListOf<HTMLImageElement>),
    ];

    const imgListFilter = imgList.filter((i) => {
      const reg = new RegExp('[a-zA-z]+://[^s]*');

      const result = i.outerHTML.match('src=".*?"');
      const _src = result ? result[0].slice(5, -1) : '';
      // console.log('_src', _src);

      return (
        i.src && !i.src.includes(FLEEK_NAME) && reg.test(_src) && !contentImagesSrc.includes(_src)
      );
    });
    // console.log('imgListFilter', imgListFilter);

    if (imgListFilter.length > 0) {
      _vditor.disabled();

      notification.open({
        key: keyUploadAllImages,
        message: intl.formatMessage({
          id: 'messages.editor.notification.title',
        }),
        description: intl.formatMessage({
          id: 'messages.editor.uploadAllImages.notification',
        }),
        duration: null,
      });

      // 保存失败的图片地址
      const saveFailAddress = (src: string) => {
        const _list = cloneDeep(contentImagesSrc);
        _list.push(src);
        setContentImagesSrc(uniq(_list));
      };

      for (let i = 0; i < imgListFilter.length; i++) {
        const ele = imgListFilter[i];

        const src = ele.src.replace(OSS_MATATAKI_FEUSE, OSS_MATATAKI);

        // 无效图片跳过处理
        const isValidImageResult = await isValidImage(src);
        if (!isValidImageResult) {
          saveFailAddress(ele.src);
          continue;
        }

        const result = await imageUploadByUrlAPI(src);
        if (result) {
          // _vditor.tip('上传成功', 2000);
          ele.src = result.publicUrl;
          ele.alt = result.key;
        } else {
          saveFailAddress(ele.src);
        }
      }

      notification.close(keyUploadAllImages);

      message.destroy(keyUploadAllImagesMessage);
      message.success({
        key: keyUploadAllImagesMessage,
        content: intl.formatMessage({
          id: 'messages.editor.uploadAllImages.success',
        }),
      });

      // console.log('imgList', imgList);

      const mdValue = _vditor.html2md(DIV.innerHTML);

      _vditor.setValue(mdValue);

      await asyncContentToDB(mdValue);

      _vditor.enable();
    }

    setFlagImageUploadToIpfs(false);
  }, [flagImageUploadToIpfs, asyncContentToDB, intl, contentImagesSrc]);

  // handle async content to db
  const handleAsyncContentToDB = useCallback(async () => {
    if ((window as any)?.vditor) {
      const value = (window as any).vditor.getValue();

      await asyncContentToDB(value);
      await handleImageUploadToIpfs();
    }
  }, [asyncContentToDB, handleImageUploadToIpfs]);

  /**
   * async cover to DB
   */
  const asyncCoverToDB = useCallback(
    async (url: string) => {
      setCover(url);
      setDraftMode(DraftMode.Saving);

      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({ cover: url });
      if (id) {
        await handleUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(postTempDataMergedUserId(), data));
        handleHistoryState(String(resultID));
      }
      setDraftMode(DraftMode.Saved);
    },
    [handleHistoryState, postTempDataMergedUserId, handleUpdate],
  );

  /**
   * async title to DB
   */
  const { run: asyncTitleToDB } = useThrottleFn(
    async (val: string) => {
      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({ title: val });
      if (id) {
        await handleUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(postTempDataMergedUserId(), data));
        handleHistoryState(String(resultID));
      }
    },
    { wait: 800 },
  );

  /**
   * handle change title
   */
  const handleChangeTitle = useCallback(
    async (val: string) => {
      setTitle(val);
      setDraftMode(DraftMode.Saving);

      await asyncTitleToDB(val);

      setDraftMode(DraftMode.Saved);
    },
    [asyncTitleToDB],
  );

  /**
   * handle change tags
   */
  const handleChangeTags = useCallback(
    async (val: string[]) => {
      setTags(val);
      setDraftMode(DraftMode.Saving);

      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({ tags: val });
      if (id) {
        await handleUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(postTempDataMergedUserId(), data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(DraftMode.Saved);
    },
    [handleHistoryState, postTempDataMergedUserId, handleUpdate],
  );

  /**
   * handle change license
   */
  const handleChangeLicense = useCallback(
    async (val: string) => {
      setLicense(val);
      setDraftMode(DraftMode.Saving);

      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({ license: val });
      if (id) {
        await handleUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(postTempDataMergedUserId(), data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(DraftMode.Saved);
    },
    [handleHistoryState, postTempDataMergedUserId, handleUpdate],
  );

  /**
   * fetch DB post content
   */
  const fetchDBContent = useCallback(async () => {
    const { id } = history.location.query as Router.PostQuery;
    if (id) {
      const resultPost = await dbPostsGet(Number(id));
      if (resultPost) {
        // console.log('resultPost', resultPost);

        setPostData(resultPost);

        setCover(resultPost.cover);
        setTitle(resultPost.title);
        setContent(resultPost.content);
        setTags(resultPost.tags);
        setLicense(resultPost.license);

        // TODO：need modify
        setTimeout(() => {
          if ((window as any).vditor) {
            (window as any).vditor!.setValue(resultPost.content);
            // handle all image
            handleImageUploadToIpfs();
          }
        }, 1000);
      }
    }
  }, [handleImageUploadToIpfs]);

  useMount(() => {
    if (initialState?.currentUser) {
      fetchGunDraftsAndUpdateLocal(initialState.currentUser).then(() => {
        fetchDBContent();
      });

      // 初始化监听
      const { id } = history.location.query as Router.PostQuery;
      if (id) {
        // 有草稿的监听
        signIn((window as any).gun).then(() => {
          watchCurrentDraft(Number(id));
        });
      }
    }
  });

  useEffect(() => {
    // 30s handle all image
    const timer = setInterval(handleImageUploadToIpfs, 1000 * 30);
    return () => clearInterval(timer);
  }, [handleImageUploadToIpfs]);

  focus$.useSubscription((val: string) => {
    if (val === 'editor-input') {
      handleAsyncContentToDB();
    }
  });

  return (
    <section className={styles.container}>
      <EditorHeader
        draftMode={draftMode}
        // headerCloudDraftUpload={<HeaderCloudDraftUpload />}
        // headerCloudDraftDownload={<HeaderCloudDraftDownload />}
        settings={
          <Settings>
            <Fragment>
              <SettingsTags tags={tags} handleChangeTags={handleChangeTags} />
              <SettingsOriginalLink hash={settingsOriginalLinkHash} />
              <SettingsCopyrightNotice
                license={license}
                handleChangeLicense={handleChangeLicense}
              />
              <SettingsTips />
              <SettingsLearnMore />
            </Fragment>
          </Settings>
        }
        loading={publishLoading}
        setLoading={setPublishLoading}
        handlePublish={handlePublish}
      />
      <section className={styles.edit}>
        <UploadImage cover={cover} asyncCoverToDB={asyncCoverToDB} />
        <Input
          type="text"
          placeholder={intl.formatMessage({
            id: 'editor.title',
          })}
          className={styles.title}
          maxLength={editorRules.title.max}
          value={title}
          onChange={(e) => handleChangeTitle(e.target.value)}
        />
        <Editor focus$={focus$} />
      </section>

      <FullLoading
        loading={publishLoading}
        setLoading={setPublishLoading}
        tip={intl.formatMessage({
          id: 'messages.editor.publish.tip',
        })}
      />

      <PublishingTip
        cover={cover}
        visiblePublishingTip={visiblePublishingTip}
        setVisiblePublishingTip={setVisiblePublishingTip}
      />
    </section>
  );
};

export default Edit;
