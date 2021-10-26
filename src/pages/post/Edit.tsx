import React, { useState, useCallback, useEffect } from 'react';
import { history, useIntl } from 'umi';
import { Input, message, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Editor from '@/components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import EditorHeader from '@/components/Editor/editorHeader';
import { useMount, useThrottleFn } from 'ahooks';
import { dbPostsUpdate, dbPostsAdd, dbPostsGet } from '@/db/db';
import { PostTempData } from '@/db/Posts.d';
import {
  imageUploadByUrlAPI,
  getDefaultSiteConfigAPI,
  publishPendingPostAPI,
  publishPostAPI,
  updatePostAPI,
  publishPostAsDraftAPI,
} from '@/helpers';
import { assign } from 'lodash';
import type Vditor from 'vditor';
import { generateSummary } from '@/utils/editor';
import FullLoading from '@/components/FullLoading';

const { confirm } = Modal;

const Edit: React.FC = () => {
  const intl = useIntl();
  // cover
  const [cover, setCover] = useState<string>('');
  // title
  const [title, setTitle] = useState<string>('');
  // content
  const [content, setContent] = useState<string>('');
  // draft mode
  const [draftMode, setDraftMode] = useState<0 | 1 | 2>(0); // 0 1 2
  // vditor
  const [vditor, setVditor] = useState<Vditor>();
  // 处理图片上传开关
  const [flagImageUploadToIpfs, setFlagImageUploadToIpfs] = useState<boolean>(false);
  // 更新草稿开关
  const [flagUpdateDraft, setFlagUpdateDraft] = useState<boolean>(false);
  // publish loading
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  /**
   * draft publish as post
   */
  const draftPublishAsPost = useCallback(
    async (id: number) => {
      setPublishLoading(true);

      const siteConfig = await getDefaultSiteConfigAPI();
      if (!siteConfig) {
        message.warning(
          intl.formatMessage({
            id: 'editor.defaultConfig',
          }),
        );
        setPublishLoading(false);
        return;
      }

      const res = await publishPendingPostAPI(id, [siteConfig.id]);
      if (res) {
        // 发布文章， 更新最新 Post 数据
        await dbPostsUpdate(Number(id), { post: res, draft: null });

        message.success(
          intl.formatMessage({
            id: 'editor.success',
          }),
        );
      } else {
        message.error(
          intl.formatMessage({
            id: 'editor.fail',
          }),
        );
      }
      setPublishLoading(false);

      if (res) {
        history.push('/posts');
      }
    },
    [intl],
  );

  /**
   * local draft as post
   */
  const publishAsPost = useCallback(
    async (data: CMS.LocalDraft) => {
      setPublishLoading(true);

      const res = await publishPostAPI(data);
      if (res) {
        // 发布文章 更新最新 Post 数据
        const { id } = history.location.query as Router.PostQuery;
        await dbPostsUpdate(Number(id), { post: res });

        message.success(
          intl.formatMessage({
            id: 'editor.success',
          }),
        );
      } else {
        message.error(
          intl.formatMessage({
            id: 'editor.fail',
          }),
        );
      }
      setPublishLoading(false);

      if (res) {
        history.push('/posts');
      }
    },
    [intl],
  );

  /**
   * update draft
   */
  const updateDraft = useCallback(async () => {
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
      // console.log('updateDraft', result);
      const res = await updatePostAPI(Number(result.draft.id), {
        title: title,
        cover: cover,
        summary: generateSummary(),
        content: content,
      });
      if (res) {
        // 更新草稿信息
        await dbPostsUpdate(Number(id), { draft: res });
      }
    }
    setFlagUpdateDraft(false);
  }, [title, cover, content, flagUpdateDraft]);

  /**
   * post publish to post
   */
  const postPublishToPost = useCallback(
    async (id: number) => {
      setPublishLoading(true);

      // post publish draft
      const _draft = await publishPostAsDraftAPI(Number(id));
      if (!_draft) {
        message.error(
          intl.formatMessage({
            id: 'editor.saveToDraftFail',
          }),
        );
        // setTransferDraftLoading(false);
        setPublishLoading(false);
        return;
      }
      message.success(
        intl.formatMessage({
          id: 'editor.saveToDraftSuccess',
        }),
      );

      // update post(draft)
      const resultUpdatePost = await updatePostAPI(Number(_draft.id), {
        title: title,
        cover: cover,
        summary: generateSummary(),
        content: content,
      });

      // update local db draft data
      if (resultUpdatePost) {
        const { id: _id } = history.location.query as Router.PostQuery;
        await dbPostsUpdate(Number(_id), { draft: resultUpdatePost });
      } else {
        message.error(
          intl.formatMessage({
            id: 'editor.draftUpdateFail',
          }),
        );
        setPublishLoading(false);
        return Promise.reject();
      }
      // send
      await draftPublishAsPost(_draft.id);

      return Promise.resolve();
    },
    [draftPublishAsPost, title, cover, content, intl],
  );

  /**
   * publish
   */
  const handlePublish = useCallback(async () => {
    // console.log('publish');

    const { id } = history.location.query as Router.PostQuery;
    if (!id) {
      message.warning(
        intl.formatMessage({
          id: 'editor.tip.id',
        }),
      );
      return;
    }

    if (!title && !content) {
      message.warning(
        intl.formatMessage({
          id: 'editor.tip.titleOrContent',
        }),
      );
      return;
    }

    // check cover format
    if (cover && !cover.includes(FLEEK_NAME)) {
      message.success(
        intl.formatMessage({
          id: 'editor.tip.coverFormat',
        }),
      );
    }

    const result = await dbPostsGet(Number(id));
    // 转存草稿发布
    if (result && result.draft) {
      await draftPublishAsPost(result.draft.id);
    } else if (result && result.post) {
      confirm({
        icon: <ExclamationCircleOutlined />,
        content: intl.formatMessage({
          id: 'editor.tip.postExists',
        }),
        onOk() {
          postPublishToPost(result.post!.id);
        },
        onCancel() {},
      });
    } else {
      // 本地编辑发布
      await publishAsPost({
        title: title,
        cover: cover,
        summary: generateSummary(),
        tags: [],
        categories: [],
        content: content,
      });
    }
  }, [title, cover, content, publishAsPost, draftPublishAsPost, postPublishToPost, intl]);

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
      const data = { content: val, summary: generateSummary() };
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData, data));
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
              id: 'editor.upload.image.success',
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
   * fetch DB content
   */
  const fetchDBContent = useCallback(async () => {
    const { id } = history.location.query as Router.PostQuery;
    if (id) {
      const resultPost = await dbPostsGet(Number(id));
      if (resultPost) {
        // console.log('resultPost', resultPost);
        setCover(resultPost.cover);
        setTitle(resultPost.title);
        setContent(resultPost.content);

        // TODO：need modify
        setTimeout(() => {
          (window as any).vditor!.setValue(resultPost.content);
          // handle all image
          handleImageUploadToIpfs();
        }, 1000);
      }
    }
  }, [handleImageUploadToIpfs]);

  /**
   * async cover to DB
   */
  const asyncCoverToDB = useCallback(
    async (url: string) => {
      setCover(url);
      setDraftMode(1);

      const { id } = history.location.query as Router.PostQuery;
      const data = { cover: url };
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData, data));
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
      const data = { title: val };
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        assign(PostTempData, data);
        const resultID = await dbPostsAdd(assign(PostTempData, data));
        handleHistoryState(String(resultID));
      }
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

  useMount(() => {
    fetchDBContent();
  });

  useEffect(() => {
    // console.log('watch', vditor);
    if (!!vditor) {
      // console.log(`Update Default Vditor:`, vditor);
    }

    // 10s handle all image
    const timer = setInterval(handleImageUploadToIpfs, 10000);
    return () => clearInterval(timer);
  }, [vditor, handleImageUploadToIpfs]);

  useEffect(() => {
    updateDraft();
  }, [title, content, cover]);

  return (
    <section className={styles.container}>
      <EditorHeader draftMode={draftMode} handlePublish={handlePublish} />
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
        <Editor asyncContentToDB={handleAsyncContentToDB} bindVditor={setVditor} />
      </section>

      <FullLoading loading={publishLoading} setLoading={setPublishLoading} />
    </section>
  );
};

export default Edit;
