import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { history, useIntl, useModel } from 'umi';
import { Input, message } from 'antd';
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
} from '@/db/db';
import type { Posts } from '@/db/Posts.d';
import { imageUploadByUrlAPI, getDefaultSiteConfigAPI } from '@/helpers';
import { assign } from 'lodash';
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
import { postStoragePublish, postStorageUpdate } from '@/services/api/meta-cms';
import { mergedMessage } from '@/utils';
import moment from 'moment';
import { OSS_MATATAKI, OSS_MATATAKI_FEUSE } from '../../../../config';

const Edit: React.FC = () => {
  const intl = useIntl();
  // post data
  const [postData, setPostData] = useState<Posts>({} as Posts);
  const [cover, setCover] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [license, setLicense] = useState<string>('');

  // draft mode
  const [draftMode, setDraftMode] = useState<0 | 1 | 2>(0); // 0 1 2
  // vditor
  // const [vditor, setVditor] = useState<Vditor>();
  // 处理图片上传开关
  const [flagImageUploadToIpfs, setFlagImageUploadToIpfs] = useState<boolean>(false);
  // publish loading
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  const { setSiteNeedToDeploy } = useModel('storage');

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
        message.success('成功');

        // 统一 title 方便下次 更新
        const _post = {
          ...result.data[0],
          titleInStorage: title,
        };

        const { id } = history.location.query as Router.PostQuery;
        await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ post: _post, draft: null }));

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
        message.error('失败');
      }
    },
    [title, cover, content, tags, license, uploadMetadataFn, setSiteNeedToDeploy],
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
        message.success('成功');

        const { id } = history.location.query as Router.PostQuery;
        await dbPostsUpdate(
          Number(id),
          postDataMergedUpdateAt({ post: result.data[0], draft: null }),
        );

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
        message.error('失败');
      }
    },
    [title, cover, content, tags, license, uploadMetadataFn, setSiteNeedToDeploy],
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

      // check cover format
      if (cover && !cover.includes(FLEEK_NAME)) {
        message.success(
          intl.formatMessage({
            id: 'messages.editor.tip.coverFormat',
          }),
        );
        return;
      }

      const siteConfig = await getDefaultSiteConfigAPI();
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
    [title, cover, content, postStorageUpdateFn, postStoragePublishFn, intl],
  );

  // handle history url state
  const handleHistoryState = useCallback((id: string) => {
    window.history.replaceState({}, '', `?id=${id}`);
    history.location.query!.id = id;
  }, []);

  /**
   * async content to DB
   */
  const asyncContentToDB = useCallback(
    async (val: string) => {
      setContent(val);
      setDraftMode(1);

      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({
        content: val,
        summary: generateSummary(),
      });
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData(), data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [handleHistoryState],
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

      for (let i = 0; i < imgListFilter.length; i++) {
        const ele = imgListFilter[i];

        const result = await imageUploadByUrlAPI(ele.src.replace(OSS_MATATAKI_FEUSE, OSS_MATATAKI));
        if (result) {
          // _vditor.tip('上传成功', 2000);
          message.success(
            intl.formatMessage({
              id: 'messages.editor.upload.image.success',
            }),
          );
          ele.src = result.publicUrl;
          ele.alt = result.key;
        }
      }

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
      setDraftMode(1);

      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({ cover: url });
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData(), data));
        handleHistoryState(String(resultID));
      }
      setDraftMode(2);
    },
    [handleHistoryState],
  );

  /**
   * async title to DB
   */
  const { run: asyncTitleToDB } = useThrottleFn(
    async (val: string) => {
      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({ title: val });
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData(), data));
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
      setDraftMode(1);

      await asyncTitleToDB(val);

      setDraftMode(2);
    },
    [asyncTitleToDB],
  );

  /**
   * handle change tags
   */
  const handleChangeTags = useCallback(
    async (val: string[]) => {
      setTags(val);
      setDraftMode(1);

      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({ tags: val });
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData(), data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [handleHistoryState],
  );

  /**
   * handle change license
   */
  const handleChangeLicense = useCallback(
    async (val: string) => {
      setLicense(val);
      setDraftMode(1);

      const { id } = history.location.query as Router.PostQuery;
      const data = postDataMergedUpdateAt({ license: val });
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData(), data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [handleHistoryState],
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
          (window as any).vditor!.setValue(resultPost.content);
          // handle all image
          handleImageUploadToIpfs();
        }, 1000);
      }
    }
  }, [handleImageUploadToIpfs]);

  useMount(() => {
    fetchDBContent();
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
          maxLength={30}
          value={title}
          onChange={(e) => handleChangeTitle(e.target.value)}
        />
        <Editor asyncContentToDB={handleAsyncContentToDB} />
      </section>

      <FullLoading loading={publishLoading} setLoading={setPublishLoading} />
    </section>
  );
};

export default Edit;
