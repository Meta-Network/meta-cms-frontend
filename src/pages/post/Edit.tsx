import React, { useState, useCallback } from 'react';

import { history } from 'umi';
import { Input } from 'antd';
import Editor from '../../components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import EditorHeader from '@/components/Editor/editorHeader';
import { useMount } from 'ahooks';
import { dbPostsUpdate, dbPostsAdd, dbPostsGet } from '../../models/db';
import type { Query } from '../../typings/Posts.d';
import { fetchTokenAPI } from '@/helpers';

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
    const htmlContent = (window as any).vditor.getHTML();
    if (htmlContent) {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      return div.innerText;
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
      const { id } = history.location.query as Query;
      setDraftMode(1);

      if (id) {
        await dbPostsUpdate(Number(id), { content: val, summary: generateSummary() });
      } else {
        const resultID = await dbPostsAdd({
          cover: cover,
          title: title,
          summary: generateSummary(),
          content: val,
          hash: '',
          status: 'pending',
          timestamp: Date.now(),
          delete: 0,
        });
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [cover, title, generateSummary, handleHistoryState],
  );

  /**
   * synchronize content
   */
  const synchronizeContent = useCallback((val: string) => {
    console.log('synchronizeContent');
    setContent(val);
    asyncContentToDB(val);
    // todo：暂时不能加入依赖 会导致编辑器重新渲染
  }, []);

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
        setContent(result.content);
        setTitle(result.title);
        setCover(result.cover);
        setTimeout(() => {
          (window as any).vditor.setValue(result.content);
        }, 1000);
      }
    }
  }, []);

  /**
   * async cover to DB
   */
  const asyncCoverToDB = useCallback(
    async (url: string) => {
      setCover(url);

      const { id } = history.location.query as Query;
      setDraftMode(1);

      if (id) {
        await dbPostsUpdate(Number(id), { cover: url });
      } else {
        const resultID = await dbPostsAdd({
          cover: url,
          title: title,
          summary: generateSummary(),
          content: content,
          hash: '',
          status: 'pending',
          timestamp: Date.now(),
          delete: 0,
        });
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [title, content, generateSummary, handleHistoryState],
  );

  /**
   * async title to DB
   */
  const asyncTitleToDB = useCallback(
    async (val: string) => {
      setTitle(val);

      const { id } = history.location.query as Query;
      setDraftMode(1);

      if (id) {
        await dbPostsUpdate(Number(id), { title: val });
      } else {
        const resultID = await dbPostsAdd({
          cover: cover,
          title: val,
          summary: generateSummary(),
          content: content,
          hash: '',
          status: 'pending',
          timestamp: Date.now(),
          delete: 0,
        });
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [cover, content, generateSummary, handleHistoryState],
  );

  useMount(() => {
    fetchToken();
    fetchDBContent();
  });

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
        <Editor synchronizeContent={synchronizeContent} token={token} />
      </section>
    </section>
  );
};

export default Edit;
