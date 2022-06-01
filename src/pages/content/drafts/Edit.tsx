import Editor from '@/components/Editor';
import EditorHeader from '@/components/Editor/editorHeader';
import Settings from '@/components/Editor/settings';
import UploadImage from '@/components/Editor/uploadImage';
import FullLoading from '@/components/FullLoading';
import {
  dbPostsAdd,
  dbPostsGet,
  dbPostsUpdate,
  dbPostsWhereExistByTitleAndId,
  PostTempData,
} from '@/db/db';
import { imageUploadByUrlAPI } from '@/helpers';
import {
  checkAllImageLink,
  convertInvalidUrlMessage,
  generateSummary,
  getPreviewImageLink,
  hasVditor,
  isValidImage,
  pipelinesPostOrdersData,
  postDataMergedUpdateAt,
  renderFilteredContent,
} from '@/utils/editor';
import { useEventEmitter, useMount, useThrottleFn } from 'ahooks';
import { Input, message, notification } from 'antd';
import { assign, cloneDeep, trim, uniq } from 'lodash';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { history, useIntl, useModel } from 'umi';
import styles from './Edit.less';
// import HeaderCloudDraftUpload from '@/components/Editor/headerCloudDraftUpload';
// import HeaderCloudDraftDownload from '@/components/Editor/headerCloudDraftDownload';
import PublishingTip from '@/components/Editor/PublishingTip';
import SettingsCopyrightNotice from '@/components/Editor/settingsCopyrightNotice';
import SettingsLearnMore from '@/components/Editor/settingsLearnMore';
import SettingsOriginalLink from '@/components/Editor/settingsOriginalLink';
import SettingsTags from '@/components/Editor/settingsTags';
import SettingsTips from '@/components/Editor/settingsTips';
import useEditorSubmit from '@/hooks/useEditorSubmit';
import { fetchPostsStorage, pipelinesPostOrders } from '@/services/api/meta-cms';
import type { GatewayType } from '@/services/constants';
import { DraftMode, FetchPostsStorageParamsState, SyncPlatform } from '@/services/constants';
import { mergedMessage } from '@/utils';
import type {
  AuthorPostDigestMetadata,
  AuthorPostSignatureMetadata,
} from '@metaio/meta-signature-util-v2';
import { editorRules, OSS_MATATAKI, OSS_MATATAKI_FEUSE } from '../../../../config';

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
  // 保存失败的图片地址
  const [contentImagesSrc, setContentImagesSrc] = useState<string[]>([]);
  const focus$ = useEventEmitter<string>();
  const [visiblePublishingTip, setVisiblePublishingTip] = useState<boolean>(false);
  // 处理图片上传开关
  const [flagImageUploadToIpfs, setFlagImageUploadToIpfs] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  const { initialState } = useModel('@@initialState');

  const { validate } = useEditorSubmit();

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

  // handle history url state
  const handleHistoryState = useCallback((id: string) => {
    window.history.replaceState({}, '', `?id=${id}`);
    history.location.query!.id = id;
  }, []);

  // 处理更新
  const handleUpdate = useCallback(async (id: number, data: any) => {
    // local update
    await dbPostsUpdate(id, data);
  }, []);

  /**
   * 发布文章
   */
  const pipelinesPostOrdersFn = useCallback(
    async (gatewayType: GatewayType) => {
      setPublishLoading(true);

      const filterContent = await renderFilteredContent();
      const summary = await generateSummary();

      const payload = {
        title: trim(title),
        cover: cover,
        summary: summary,
        content: trim(filterContent),
        license: license,
        categories: '',
        tags: tags.join(),
      };

      console.log('payload', payload);

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
    [title, cover, tags, license, handleUpdate, intl],
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
      // 内容不能为空
      const _content = trim(content);
      // 过滤后的内容不能为空
      const _contentXssFilter = trim(await renderFilteredContent());
      // summary 长度判断
      const summary = await generateSummary();

      const tagsStr = tags.join();

      const validateResult = await validate({
        title: _title,
        content: _content,
        contentXssFilter: _contentXssFilter,
        summary: summary,
        cover: cover,
        tags: tags,
        tagsStr: tagsStr,
        license: license,
      });

      if (!validateResult) {
        setPublishLoading(false);
        return;
      }

      // 检查 xxxx.png 类型的图片格式，不让提交。
      const checkAllImageLinkList = await checkAllImageLink();
      if (checkAllImageLinkList.length) {
        const msg = convertInvalidUrlMessage(checkAllImageLinkList);
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.content.invalidUrl',
            },
            {
              message: msg,
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
    [
      title,
      cover,
      content,
      pipelinesPostOrdersFn,
      checkTitle,
      initialState,
      license,
      tags,
      intl,
      validate,
    ],
  );

  /**
   * async content to DB
   */
  const asyncContentToDB = useCallback(
    async (val: string) => {
      setContent(val);
      setDraftMode(DraftMode.Saving);

      const data = postDataMergedUpdateAt({
        content: val,
        summary: await generateSummary(),
      });

      const { id } = history.location.query as Router.PostQuery;
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
   */
  const handleImageUploadToIpfs = useCallback(async () => {
    /**
     * 1. 获取所有图片地址
     * 2. 上传前校验一次是否有效(处理前 oss 地址替换)
     * 3. 上传图片到 IPFS
     * 4. 存在替换 src 地址
     * 5. 不存在保持错误地址
     */

    if (flagImageUploadToIpfs) return;
    setFlagImageUploadToIpfs(true);

    await hasVditor();

    const contentImagesSrcDeep = cloneDeep(contentImagesSrc);
    const previewImageLinkList = await getPreviewImageLink(contentImagesSrcDeep);

    if (!previewImageLinkList.length) {
      setFlagImageUploadToIpfs(false);
      return;
    }

    window.vditor.disabled();

    const done = message.loading(
      intl.formatMessage({ id: 'messages.editor.uploadAllImages.notification' }),
      0,
    );

    let contentDeep = window.vditor.getValue();

    for (let i = 0; i < previewImageLinkList.length; i++) {
      const src = previewImageLinkList[i];
      // mttk oss 替换
      const uploadSrc = src.replace(OSS_MATATAKI_FEUSE, OSS_MATATAKI);

      // 无效图片跳过处理
      const isValidImageResult = await isValidImage(uploadSrc);
      if (!isValidImageResult) {
        contentImagesSrcDeep.push(src);
        continue;
      }

      // 上传图片
      const result = await imageUploadByUrlAPI(uploadSrc);
      if (result) {
        contentDeep = contentDeep.replaceAll(src, result.publicUrl);
      } else {
        contentImagesSrcDeep.push(src);
      }
    }

    done();

    message.destroy(keyUploadAllImagesMessage);
    message.success({
      key: keyUploadAllImagesMessage,
      content: intl.formatMessage({
        id: 'messages.editor.uploadAllImages.success',
      }),
    });

    setContentImagesSrc(uniq(contentImagesSrcDeep));

    window.vditor.setValue(contentDeep);
    await asyncContentToDB(contentDeep);

    window.vditor.enable();

    setFlagImageUploadToIpfs(false);
  }, [flagImageUploadToIpfs, intl, contentImagesSrc, asyncContentToDB]);

  // handle async content to db
  const handleAsyncContentToDB = useCallback(async () => {
    await hasVditor();

    const value = window.vditor.getValue();

    await asyncContentToDB(value);
    await handleImageUploadToIpfs();
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

        await hasVditor();

        window.vditor.setValue(resultPost.content);

        // handle all image
        handleImageUploadToIpfs();
      }
    }
  }, [handleImageUploadToIpfs]);

  useMount(() => {
    fetchDBContent();
  });

  // 编辑器内容改变
  focus$.useSubscription((val: string) => {
    if (val === 'editor-input') {
      // console.log('editor-input');
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
          placeholder={intl.formatMessage({ id: 'editor.title' })}
          className={styles.title}
          maxLength={editorRules.title.max}
          value={title}
          onChange={(e) => handleChangeTitle(e.target.value)}
        />
        <Input
          type="text"
          placeholder={intl.formatMessage({ id: 'editor.filename' })}
          className={styles.filename}
          maxLength={editorRules.title.max}
          value={`${title}.md`}
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
