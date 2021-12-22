import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { history, useIntl, useModel } from 'umi';
import { Input, message, notification } from 'antd';
import Editor from '@/components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import EditorHeader from '@/components/Editor/editorHeader';
import { useMount, useThrottleFn } from 'ahooks';
import {
  dbPostsUpdate,
  dbPostsAdd,
  dbPostsGet,
  PostTempData,
  dbMetadatasAdd,
  MetadataTempData,
  dbPostsWhereExistByTitle,
} from '@/db/db';
import { imageUploadByUrlAPI } from '@/helpers';
import { assign, cloneDeep } from 'lodash';
// import type Vditor from 'vditor';
import { uploadMetadata, generateSummary, postDataMergedUpdateAt } from '@/utils/editor';
import FullLoading from '@/components/FullLoading';
import Settings from '@/components/Editor/settings';
// import HeaderCloudDraftUpload from '@/components/Editor/headerCloudDraftUpload';
// import HeaderCloudDraftDownload from '@/components/Editor/headerCloudDraftDownload';
import SettingsTags from '@/components/Editor/settingsTags';
import SettingsOriginalLink from '@/components/Editor/settingsOriginalLink';
import SettingsLearnMore from '@/components/Editor/settingsLearnMore';
import SettingsCopyrightNotice from '@/components/Editor/settingsCopyrightNotice';
import SettingsTips from '@/components/Editor/settingsTips';
import type { PostMetadata } from '@metaio/meta-signature-util';
import { fetchPostsStorage, postStoragePublish, postStorageUpdate } from '@/services/api/meta-cms';
import { mergedMessage } from '@/utils';
import moment from 'moment';
import {
  OSS_MATATAKI,
  OSS_MATATAKI_FEUSE,
  KEY_GUN_ROOT,
  KEY_GUN_ROOT_DRAFT,
  KEY_META_CMS_GUN_PAIR,
} from '../../../../config';
import { DraftMode, FetchPostsStorageParamsState } from '@/services/constants';
import Gun from 'gun';
import {
  fetchGunDraftsAndUpdateLocal,
  syncNewDraft,
  syncDraft,
  fetchGunDrafts,
  signIn,
} from '@/utils/gun';
import { storeGet } from '@/utils/store';

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
  // vditor
  // const [vditor, setVditor] = useState<Vditor>();
  // 处理图片上传开关
  const [flagImageUploadToIpfs, setFlagImageUploadToIpfs] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  const { setSiteNeedToDeploy } = useModel('storage');
  const { initialState } = useModel('@@initialState');

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

  // upload metadata
  const uploadMetadataFn = useCallback(
    async (gateway: boolean): Promise<CMS.metadata | undefined> => {
      let metadataData: CMS.metadata = {
        authorDigestRequestMetadataStorageType: 'ipfs' as CMS.MetadataStorageType,
        authorDigestRequestMetadataRefer: '',
        authorDigestSignatureMetadataStorageType: 'ipfs' as CMS.MetadataStorageType,
        authorDigestSignatureMetadataRefer: '',
      };

      if (gateway) {
        const payload: PostMetadata = {
          title: title,
          cover: cover,
          summary: generateSummary(),
          content: content,
          license: license,
          categories: '',
          tags: tags.join(),
        };

        const uploadMetadataResult = await uploadMetadata({ payload });

        if (uploadMetadataResult) {
          const {
            digestMetadata,
            authorSignatureMetadata,
            digestMetadataIpfs,
            authorSignatureMetadataIpfs,
          } = uploadMetadataResult;
          const { id } = history.location.query as Router.PostQuery;

          // local add metadada
          await dbMetadatasAdd(
            assign(MetadataTempData(), {
              postId: Number(id),
              metadata: {
                digestMetadata: digestMetadata,
                authorSignatureMetadata: authorSignatureMetadata,
                digestMetadataIpfs: digestMetadataIpfs,
                authorSignatureMetadataIpfs: authorSignatureMetadataIpfs,
              },
            }),
          );

          metadataData = assign(metadataData, {
            authorDigestRequestMetadataRefer: digestMetadataIpfs.hash,
            authorDigestSignatureMetadataRefer: authorSignatureMetadataIpfs.hash,
          });

          return metadataData;
        } else {
          message.error(
            intl.formatMessage({
              id: 'messages.editor.submit.uploadMetadata.fail',
            }),
          );

          return;
        }
      } else {
        return metadataData;
      }
    },
    [content, cover, intl, license, tags, title],
  );

  // update
  const postStorageUpdateFn = useCallback(
    async ({
      post,
      gateway,
      siteConfig,
    }: {
      post: CMS.Post;
      gateway: boolean;
      siteConfig: CMS.SiteConfiguration;
    }) => {
      setPublishLoading(true);

      const metadata = await uploadMetadataFn(gateway);
      if (!metadata) {
        setPublishLoading(false);
        return;
      }

      const data: any = {
        configIds: [siteConfig.id],
        posts: [
          {
            ...post,
            title: title,
            cover: cover,
            summary: generateSummary(),
            tags: tags,
            categories: [],
            source: content,
            license: license,
            state: 'published' as CMS.PostState,
            ...metadata,
            updatedAt: moment().toISOString(),
          },
        ],
      };

      const result = await postStorageUpdate(false, data);

      setPublishLoading(false);

      // 文档写的 200 成功，但是实际是 201
      if (result.statusCode === 201 || result.statusCode === 200) {
        message.success(intl.formatMessage({ id: 'messages.editor.success' }));

        // 统一 title 方便下次 更新
        const _post = {
          ...result.data.posts[0],
          titleInStorage: title,
          stateId: result.data.stateIds[0],
        };

        const { id } = history.location.query as Router.PostQuery;
        await handleUpdate(Number(id), postDataMergedUpdateAt({ post: _post, draft: null }));

        setSiteNeedToDeploy(true);
        history.push('/content/drafts');
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
    [
      title,
      cover,
      content,
      tags,
      license,
      uploadMetadataFn,
      setSiteNeedToDeploy,
      intl,
      handleUpdate,
    ],
  );

  // publish
  const postStoragePublishFn = useCallback(
    async ({ gateway, siteConfig }: { gateway: boolean; siteConfig: CMS.SiteConfiguration }) => {
      setPublishLoading(true);

      const metadata = await uploadMetadataFn(gateway);
      if (!metadata) {
        setPublishLoading(false);
        return;
      }

      const data = {
        configIds: [siteConfig.id],
        posts: [
          {
            title: title,
            titleInStorage: title,
            cover: cover,
            summary: generateSummary(),
            tags: tags,
            categories: [],
            source: content,
            license: license,
            platform: 'editor',
            state: 'pending' as CMS.PostState,
            ...metadata,
            createdAt: moment().toISOString(),
            updatedAt: moment().toISOString(),
          },
        ],
      };

      const result = await postStoragePublish(false, data);

      setPublishLoading(false);

      // 文档写的 200 成功，但是实际是 201
      if (result.statusCode === 201 || result.statusCode === 200) {
        message.success(intl.formatMessage({ id: 'messages.editor.success' }));

        const _post = {
          ...result.data.posts[0],
          stateId: result.data.stateIds[0],
        };

        const { id } = history.location.query as Router.PostQuery;
        await handleUpdate(Number(id), postDataMergedUpdateAt({ post: _post, draft: null }));

        setSiteNeedToDeploy(true);
        history.push('/content/drafts');
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
    [
      title,
      cover,
      content,
      tags,
      license,
      uploadMetadataFn,
      setSiteNeedToDeploy,
      handleUpdate,
      intl,
    ],
  );

  const checkTitle = useCallback(
    async ({ titleValue, id }: { titleValue: string; id: number }): Promise<boolean> => {
      /**
       * check local draft
       * check repo post
       */

      if (!initialState?.currentUser && !initialState?.siteConfig) {
        return false;
      }

      const isLocalExist = await dbPostsWhereExistByTitle({
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

  // handle publish
  const handlePublish = useCallback(
    async (gateway: boolean) => {
      const { id } = history.location.query as Router.PostQuery;
      if (!id) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.tip.id',
          }),
        );
        return;
      }

      if (!title || !content) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.tip.titleOrContent',
          }),
        );
        return;
      }

      // check title
      if (
        !(await checkTitle({
          titleValue: title,
          id: Number(id),
        }))
      ) {
        message.warning('标题重复，请修改');
        return;
      }

      // check cover format
      if (cover && !cover.includes(FLEEK_NAME)) {
        message.success(
          intl.formatMessage({
            id: 'messages.editor.tip.coverFormat',
          }),
        );
        return;
      }

      const siteConfig = initialState?.siteConfig;
      if (!siteConfig) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.noDefaultConfig',
          }),
        );
        return;
      }

      const result = await dbPostsGet(Number(id));
      // 转存草稿发布
      if (result && result.post) {
        postStorageUpdateFn({
          post: result.post,
          gateway,
          siteConfig,
        });
      } else {
        postStoragePublishFn({
          gateway,
          siteConfig,
        });
      }
    },
    [
      title,
      cover,
      content,
      postStorageUpdateFn,
      postStoragePublishFn,
      checkTitle,
      initialState,
      intl,
    ],
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

      // get img src
      const result = i.outerHTML.match('src=".*?"');
      const _src = result ? result[0].slice(5, -1) : '';
      // console.log('_src', _src);

      return i.src && !i.src.includes(FLEEK_NAME) && reg.test(_src);
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

      for (let i = 0; i < imgListFilter.length; i++) {
        const ele = imgListFilter[i];

        const result = await imageUploadByUrlAPI(ele.src.replace(OSS_MATATAKI_FEUSE, OSS_MATATAKI));
        if (result) {
          // _vditor.tip('上传成功', 2000);
          ele.src = result.publicUrl;
          ele.alt = result.key;
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
  }, [flagImageUploadToIpfs, asyncContentToDB, intl]);

  /**
   * handle async content to db
   */
  const handleAsyncContentToDB = useCallback(
    async (val: string) => {
      await asyncContentToDB(val);
      await handleImageUploadToIpfs();
    },
    [asyncContentToDB, handleImageUploadToIpfs],
  );

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
    // 10s handle all image
    const timer = setInterval(handleImageUploadToIpfs, 1000 * 10);
    return () => clearInterval(timer);
  }, [handleImageUploadToIpfs]);

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
              <SettingsOriginalLink hash={postData.post?.source || postData.draft?.source || ''} />
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
          maxLength={100}
          value={title}
          onChange={(e) => handleChangeTitle(e.target.value)}
        />
        <Editor asyncContentToDB={handleAsyncContentToDB} />
      </section>

      <FullLoading
        loading={publishLoading}
        setLoading={setPublishLoading}
        tip={intl.formatMessage({
          id: 'messages.editor.publish.tip',
        })}
      />
    </section>
  );
};

export default Edit;
