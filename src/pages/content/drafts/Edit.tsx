import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { history, useIntl, useModel } from 'umi';
import { Input, message, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Editor from '@/components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import EditorHeader from '@/components/Editor/editorHeader';
import { useMount, useThrottleFn } from 'ahooks';
import { dbPostsUpdate, dbPostsAdd, dbPostsGet, PostTempData } from '@/db/db';
import type { Posts } from '@/db/Posts.d';
import {
  imageUploadByUrlAPI,
  getDefaultSiteConfigAPI,
  publishPendingPostAPI,
  publishPostAPI,
  updatePostAPI,
  publishPostAsDraftAPI,
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

const { confirm } = Modal;

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
   * post or draft ID
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
        setPublishLoading(false);
        return;
      }

      const res = await publishPendingPostAPI(postId, [siteConfig.id]);
      if (res) {
        // 发布文章， 更新最新 Post 数据
        const { id } = history.location.query as Router.PostQuery;
        await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ post: res, draft: null }));

        message.success(
          intl.formatMessage({
            id: 'messages.editor.success',
          }),
        );
        setSiteNeedToDeploy(true);
      } else {
        message.error(
          intl.formatMessage({
            id: 'messages.editor.fail',
          }),
        );
      }
      setPublishLoading(false);

      if (res) {
        history.push('/posts');
      }
    },
    [intl, setSiteNeedToDeploy],
  );

  /**
   * local draft as post
   */
  const publishAsPost = useCallback(
    async (data: CMS.LocalDraft) => {
      setPublishLoading(true);

      const resultDraft = await publishPostAPI(data);
      if (resultDraft) {
        // 发布文章 更新最新 Draft 数据, 如果第二次发送失败少增加一篇草稿
        const { id } = history.location.query as Router.PostQuery;
        await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ draft: resultDraft }));

        setSiteNeedToDeploy(true);
        await draftPublishAsPost(resultDraft.id);
        setSiteNeedToDeploy(true);
      } else {
        message.error(
          intl.formatMessage({
            id: 'messages.editor.fail',
          }),
        );
        setPublishLoading(false);
      }
    },
    [intl, draftPublishAsPost, setSiteNeedToDeploy],
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

      // 更新草稿
      if (result && result.draft) {
        const res = await updatePostAPI(Number(result.draft.id), data);
        if (res) {
          // 更新草稿信息
          await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ draft: res }));
        }
      }
      setFlagUpdateDraft(false);
    },
    [flagUpdateDraft],
  );

  /**
   * post publish to post
   */
  const postPublishToPost = useCallback(
    async (postId: number) => {
      setPublishLoading(true);

      // post publish draft
      const _draft = await publishPostAsDraftAPI(Number(postId));
      if (!_draft) {
        message.error(
          intl.formatMessage({
            id: 'messages.editor.saveToDraftFail',
          }),
        );
        // setTransferDraftLoading(false);
        setPublishLoading(false);
        return;
      }
      message.success(
        intl.formatMessage({
          id: 'messages.editor.saveToDraftSuccess',
        }),
      );

      // update post(draft)
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
        message.error('上传 metadata 失败');
        return;
      }

      const resultUpdatePost = await updatePostAPI(Number(_draft.id), {
        ...data,
        tags: tags,
        authorDigestRequestMetadataStorageType: 'ipfs',
        authorDigestRequestMetadataRefer: uploadMetadataResult.digestMetadataIpfs.hash,
        authorDigestSignatureMetadataStorageType: 'ipfs',
        authorDigestSignatureMetadataRefer: uploadMetadataResult.authorSignatureMetadataIpfs.hash,
      });

      // update local db draft data
      if (resultUpdatePost) {
        const { id } = history.location.query as Router.PostQuery;
        await dbPostsUpdate(Number(id), postDataMergedUpdateAt({ draft: resultUpdatePost }));
      } else {
        message.error(
          intl.formatMessage({
            id: 'messages.editor.draftUpdateFail',
          }),
        );
        setPublishLoading(false);
        return Promise.reject();
      }
      // send
      await draftPublishAsPost(_draft.id);
      setSiteNeedToDeploy(true);

      return Promise.resolve();
    },
    [draftPublishAsPost, title, cover, content, tags, license, intl, setSiteNeedToDeploy],
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
      await draftPublishAsPost(result.draft.id);
    } else if (result && result.post) {
      confirm({
        icon: <ExclamationCircleOutlined />,
        content: intl.formatMessage({
          id: 'messages.editor.tip.postExists',
        }),
        onOk() {
          postPublishToPost(result.post!.id);
        },
        onCancel() {},
      });
    } else {
      // 本地编辑发布
      const data = {
        title: title,
        cover: cover,
        summary: generateSummary(),
        content: content,
        license: license,
      };

      const payload: PostMetadata = {
        ...data,
        categories: '',
        tags: tags.join(),
      };

      const uploadMetadataResult = await uploadMetadata({ payload });

      if (!uploadMetadataResult) {
        message.error('上传 metadata 失败');
        return;
      }

      await publishAsPost({
        ...data,
        tags: tags,
        categories: [],
        authorDigestRequestMetadataStorageType: 'ipfs',
        authorDigestRequestMetadataRefer: uploadMetadataResult.digestMetadataIpfs.hash,
        authorDigestSignatureMetadataStorageType: 'ipfs',
        authorDigestSignatureMetadataRefer: uploadMetadataResult.authorSignatureMetadataIpfs.hash,
      });
    }
  }, [
    title,
    cover,
    content,
    tags,
    license,
    publishAsPost,
    draftPublishAsPost,
    postPublishToPost,
    intl,
  ]);

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
    { wait: 500 },
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
