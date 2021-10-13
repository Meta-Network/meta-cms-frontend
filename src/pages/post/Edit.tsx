import React, { useState, useCallback, useEffect } from 'react';

import { history } from 'umi';
import { Input } from 'antd';
import Editor from '../../components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import EditorHeader from '@/components/Editor/editorHeader';
import { useMount } from 'ahooks';
import { dbPostsUpdate, dbPostsAdd, dbPostsGet } from '../../models/db';
import { PostTempData } from '../../models/Posts';
import type { Query } from '../../typings/Posts.d';
import { fetchTokenAPI } from '@/helpers';
import { assign } from 'lodash';
import type Vditor from 'vditor';
const Edit: React.FC = () => {
  // cover
  const [cover, setCover] = useState<string>('');
  // title
  const [title, setTitle] = useState<string>('');
  // content
  const [content, setContent] = useState<string>('');
  // draft mode
  const [draftMode, setDraftMode] = useState<0 | 1 | 2>(0); // 0 1 2
  const [token, setToken] = useState<string>('');
  const [vditor, setVditor] = useState<Vditor>();
  /**
   * publish
   */
  const handlePublish = useCallback(() => {
    console.log('publish');

    console.log(title);
    console.log(content);
  }, [title, content]);

  /**
   * generate summary
   */
  const generateSummary = useCallback((): string => {
    const htmlContent = (window as any).vditor!.getHTML();
    if (htmlContent) {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      return div.innerText.length >= 100 ? div.innerText.slice(0, 97) + '...' : div.innerText;
    }
    return '';
  }, []);

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
   * 获取 Token
   */
  const fetchToken = useCallback(async () => {
    const result = await fetchTokenAPI();
    setToken(result);
  }, []);

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
        }, 300);
      }
    }
  }, []);

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
    fetchToken();
  });

  useEffect(() => {
    if (!!vditor) {
      console.log(`Update Default Vditor:`, vditor);
    }
  }, [vditor]);

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
        <Editor asyncContentToDB={asyncContentToDB} token={token} bindVditor={setVditor} />
      </section>
    </section>
  );
};

export default Edit;
