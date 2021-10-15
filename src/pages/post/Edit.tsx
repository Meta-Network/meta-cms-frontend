import React, { useState, useCallback, useEffect } from 'react';

import { history } from 'umi';
import { Input, message } from 'antd';
import Editor from '../../components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import EditorHeader from '@/components/Editor/editorHeader';
import { useMount } from 'ahooks';
import { dbPostsUpdate, dbPostsAdd, dbPostsGet } from '../../models/db';
import { PostTempData } from '../../models/Posts';
import type { Query } from '../../typings/Posts.d';
import {
  imageUploadByUrlAPI,
  getDefaultSiteConfigAPI,
  publishPendingPostAPI,
  publishPostAPI,
  updatePostAPI,
} from '@/helpers';
import { assign } from 'lodash';
import type Vditor from 'vditor';
import { FleekName } from '@/services/storage';
const Edit: React.FC = () => {
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
  const [flagImageUploadToIpfs, setFlagImageUploadToIpfs] = useState(false);
  const [flagUpdateDraft, setFlagUpdateDraft] = useState(false);

  /**
   * generate summary
   */
  const generateSummary = useCallback((): string => {
    // TODO: modify
    try {
      const htmlContent = (window as any).vditor!.getHTML();
      if (htmlContent) {
        const div = document.createElement('div');
        div.innerHTML = htmlContent;
        return div.innerText.length >= 100 ? div.innerText.slice(0, 97) + '...' : div.innerText;
      }
      return '';
    } catch (e) {
      console.log(e);
      return '';
    }
  }, []);

  /**
   * draft publish as post
   */
  const draftPublishAsPost = useCallback(async (id: number) => {
    const siteConfig = await getDefaultSiteConfigAPI();
    if (!siteConfig) {
      message.warning('获取默认配置失败');
      return;
    }

    const res = await publishPendingPostAPI(id, [siteConfig.id]);
    if (res) {
      // 发布文章， 更新最新 Post 数据
      await dbPostsUpdate(Number(id), { post: res, draft: null });

      message.success('发布成功');
      history.push('/posts');
    } else {
      message.error('发布失败');
    }
  }, []);

  /**
   * local draft as post
   */
  const publishAsPost = useCallback(async (data: CMS.LocalDraft) => {
    const res = await publishPostAPI(data);
    if (res) {
      // 发布文章 更新最新 Post 数据
      const { id } = history.location.query as Query;
      await dbPostsUpdate(Number(id), { post: res });

      message.success('发布成功');
      history.push('/posts');
    } else {
      message.error('发布失败');
    }
  }, []);

  /**
   * publish
   */
  const handlePublish = useCallback(async () => {
    // console.log('publish');

    const { id } = history.location.query as Query;
    if (!id) {
      message.warning('请先编辑文章');
      return;
    }

    if (!title && !content) {
      message.warning('文章或内容不能为空');
      return;
    }

    const result = await dbPostsGet(Number(id));
    // 转存草稿发布
    if (result && result.draft) {
      await draftPublishAsPost(result.draft.id);
    } else if (result && result.post) {
      message.warning('文章已经发布了，但还没对接功能');
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
  }, [title, cover, content, generateSummary, publishAsPost, draftPublishAsPost]);

  /**
   * update draft
   */
  const updateDraft = useCallback(async () => {
    if (flagUpdateDraft) return;

    setFlagUpdateDraft(true);
    const { id } = history.location.query as Query;
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
      console.log('updateDraft', result);
      const res = await updatePostAPI(Number(result.draft.id), {
        title: title,
        cover: cover,
        summary: generateSummary(),
        tags: [],
        categories: [],
        content: content,
      });
      if (res) {
        // 更新草稿信息
        await dbPostsUpdate(Number(id), { draft: res });
      }
    }
    setFlagUpdateDraft(false);
  }, [title, cover, content, flagUpdateDraft, generateSummary]);

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

      const { id } = history.location.query as Query;
      const data = { content: val, summary: generateSummary() };
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData, data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [generateSummary, handleHistoryState],
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

      return i.src && !i.src.includes(FleekName) && reg.test(_src);
    });
    // console.log('imgListFilter', imgListFilter);

    if (imgListFilter.length > 0) {
      _vditor.disabled();

      for (let i = 0; i < imgListFilter.length; i++) {
        const ele = imgListFilter[i];

        const result = await imageUploadByUrlAPI(ele.src);
        if (result) {
          // _vditor.tip('上传成功', 2000);
          message.success('上传成功');
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
  }, [flagImageUploadToIpfs, asyncContentToDB]);

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
    const { id } = history.location.query as Query;
    if (id) {
      const result = await dbPostsGet(Number(id));
      if (result) {
        console.log('result', result);
        setCover(result.cover);
        setTitle(result.title);
        setContent(result.content);

        setTimeout(() => {
          (window as any).vditor!.setValue(result.content);
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

      const { id } = history.location.query as Query;
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
  const asyncTitleToDB = useCallback(
    async (val: string) => {
      setTitle(val);
      setDraftMode(1);

      const { id } = history.location.query as Query;
      const data = { title: val };
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        assign(PostTempData, data);
        const resultID = await dbPostsAdd(assign(PostTempData, data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [handleHistoryState],
  );

  useMount(() => {
    fetchDBContent();
  });

  useEffect(() => {
    console.log('watch', vditor);
    if (!!vditor) {
      console.log(`Update Default Vditor:`, vditor);
    }

    // 10s handle all image
    const timer = setInterval(handleImageUploadToIpfs, 10000);
    return () => clearInterval(timer);
  }, [vditor, handleImageUploadToIpfs]);

  useEffect(() => {
    console.log('updateDraft useEffect');

    updateDraft();
    // watch title, content, cover
    // TODO: modify
  }, [title, content, cover]);

  return (
    <section className={styles.container}>
      <EditorHeader draftMode={draftMode} handlePublish={handlePublish} />
      <section className={styles.edit}>
        <UploadImage cover={cover} asyncCoverToDB={asyncCoverToDB} />
        <Input
          type="text"
          placeholder="Title"
          className={styles.title}
          maxLength={30}
          value={title}
          onChange={(e) => asyncTitleToDB(e.target.value)}
        />
        <Editor asyncContentToDB={handleAsyncContentToDB} bindVditor={setVditor} />
      </section>
    </section>
  );
};

export default Edit;
