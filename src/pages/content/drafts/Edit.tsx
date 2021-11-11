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
import {
  imageUploadByUrlAPI,
  getDefaultSiteConfigAPI,
  publishPendingPostAPI,
  publishPostAPI,
  updatePostAPI,
} from '@/helpers';
import { assign } from 'lodash';
// import type Vditor from 'vditor';
import { uploadMetadata, generateSummary, postDataMergedUpdateAt } from '@/utils/editor';
import FullLoading from '@/components/FullLoading';
import Settings from '@/components/Editor/settings';
import Submit from '@/components/Editor/submit';
import HeaderCloudDraftUpload from '@/components/Editor/headerCloudDraftUpload';
import HeaderCloudDraftDownload from '@/components/Editor/headerCloudDraftDownload';
import SettingsTags from '@/components/Editor/settingsTags';
import SettingsOriginalLink from '@/components/Editor/settingsOriginalLink';
import SettingsLearnMore from '@/components/Editor/settingsLearnMore';
import SettingsCopyrightNotice from '@/components/Editor/settingsCopyrightNotice';
import SettingsTips from '@/components/Editor/settingsTips';
import type { PostMetadata } from '@metaio/meta-signature-util/type/types.d';

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
  // 更新草稿开关
  const [flagUpdateDraft, setFlagUpdateDraft] = useState<boolean>(false);
  // publish loading
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  const { setSiteNeedToDeploy } = useModel('storage');

  /**
   * draft publish as post
   * post ID or draft ID
   */
  const draftPublishAsPost = useCallback(
    async (postId: number) => {
      setPublishLoading(true);

      const siteConfig = await getDefaultSiteConfigAPI();
      if (!siteConfig) {
        message.warning(
          intl.formatMessage({
            id: 'messages.editor.noDefaultConfig',
          }),
        );
        return false;
      }

      const postResult = await publishPendingPostAPI(postId, [siteConfig.id]);
      if (postResult) {
        // publish post, update db post data
        const { id } = history.location.query as Router.PostQuery;
        await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ post: postResult, draft: null }));

        message.success(
          intl.formatMessage({
            id: 'messages.editor.success',
          }),
        );
        return true;
      } else {
        message.error(
          intl.formatMessage({
            id: 'messages.editor.fail',
          }),
        );
        return false;
      }
    },
    [intl],
  );

  /**
   * update draft
   * 在更新 title content cover 更新草稿
   */
  const updateDraft = useCallback(
    async (data: CMS.LocalDraft) => {
      if (flagUpdateDraft) return;

      setFlagUpdateDraft(true);
      const { id } = history.location.query as Router.PostQuery;
      if (!id) {
        setFlagUpdateDraft(false);
        return;
      }
      const result = await dbPostsGet(Number(id));
      if (!result) {
        setFlagUpdateDraft(false);
        return;
      }

      if (result && (result.draft || result.post)) {
        const postId = result.draft?.id || result.post?.id;
        const res = await updatePostAPI(Number(postId), data);
        if (res) {
          // update local draft data
          if (result.draft) {
            await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ draft: res }));
          } else if (result.post) {
            await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ post: res }));
          }
        }
      }
      setFlagUpdateDraft(false);
    },
    [flagUpdateDraft],
  );

  /**
   * post publish to post
   * If mode is draft or post, postId is required
   */
  const postPublishToPost = useCallback(
    async ({ mode, postId }: { mode: 'local' | 'draft' | 'post'; postId?: number }) => {
      setPublishLoading(true);

      const data = {
        title: title,
        cover: cover,
        summary: generateSummary(),
        content: content,
        // tags: tags,
        license: license,
      };

      const payload: PostMetadata = {
        ...data,
        categories: '',
        tags: tags.join(),
      };

      const uploadMetadataResult = await uploadMetadata({ payload });

      if (!uploadMetadataResult) {
        message.error('上传 metadata 失败, 请重试！');
        setPublishLoading(false);
        return;
      }

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

      let draftResult: CMS.Draft | '' = '';
      const metadataData = {
        authorDigestRequestMetadataStorageType: 'ipfs' as CMS.LocalDraftStorageType,
        authorDigestRequestMetadataRefer: digestMetadataIpfs.hash,
        authorDigestSignatureMetadataStorageType: 'ipfs' as CMS.LocalDraftStorageType,
        authorDigestSignatureMetadataRefer: authorSignatureMetadataIpfs.hash,
      };
      if (mode === 'local') {
        draftResult = await publishPostAPI({
          ...data,
          ...metadataData,
          tags: tags,
          categories: [],
        });
      } else if (mode === 'draft' || mode === 'post') {
        draftResult = await updatePostAPI(Number(postId), {
          ...data,
          ...metadataData,
          tags: tags,
        });
      }

      // update local db draft data
      if (draftResult) {
        await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ draft: draftResult }));

        let _postId: number = 0;
        if (mode === 'local') {
          _postId = draftResult.id!;
        } else if (mode === 'draft' || mode === 'post') {
          _postId = postId!;
        }

        // publish
        const postResult = await draftPublishAsPost(_postId);
        if (postResult) {
          setSiteNeedToDeploy(true);
          history.push('/content/drafts');
        }
      } else {
        message.error('发布失败');
      }
      setPublishLoading(false);
    },
    [draftPublishAsPost, title, cover, content, tags, license, setSiteNeedToDeploy],
  );

  /**
   * publish
   */
  const handlePublish = useCallback(async () => {
    const { id } = history.location.query as Router.PostQuery;
    if (!id) {
      message.warning(
        intl.formatMessage({
          id: 'messages.editor.tip.id',
        }),
      );
      return;
    }

    if (!title && !content) {
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

    const result = await dbPostsGet(Number(id));
    // 转存草稿发布
    if (result && result.draft) {
      postPublishToPost({
        mode: 'draft',
        postId: result.draft.id,
      });
    } else if (result && result.post) {
      postPublishToPost({
        mode: 'post',
        postId: result.post.id,
      });
    } else {
      postPublishToPost({
        mode: 'post',
      });
    }
  }, [title, cover, content, postPublishToPost, intl]);

  /**
   * handle history url state
   */
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
   * handle image upload to ipfs
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

        const result = await imageUploadByUrlAPI(ele.src);
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

      // update draft content and sumary
      await updateDraft({
        content: val,
        summary: generateSummary(),
      });
    },
    [asyncContentToDB, handleImageUploadToIpfs, updateDraft],
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

      // update draft cover
      await updateDraft({
        cover: url,
      });

      setDraftMode(2);
    },
    [handleHistoryState, updateDraft],
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

      // update draft title
      await updateDraft({
        title: val,
      });
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

      // update draft tags
      await updateDraft({
        tags: val,
      });

      setDraftMode(2);
    },
    [handleHistoryState, updateDraft],
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

      // update draft license
      await updateDraft({
        license: val,
      });

      setDraftMode(2);
    },
    [handleHistoryState, updateDraft],
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
        headerCloudDraftUpload={<HeaderCloudDraftUpload />}
        headerCloudDraftDownload={<HeaderCloudDraftDownload />}
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
        submit={<Submit handlePublish={handlePublish} />}
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
