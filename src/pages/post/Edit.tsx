import React, { useState, useCallback } from 'react';

import { history } from 'umi';
import { Input } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import Editor from '../../components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import { requestStorageToken } from '@/services/api/meta-ucenter';
import { useMount } from 'ahooks';
// import md from '../../components/Editor/index.md';
import { db } from '../../models/db';

const Edit: React.FC = () => {
  // cover
  const [imageUrl, setImageUrl] = useState<string>('');
  // title
  const [title, setTitle] = useState<string>('');
  // content
  const [content, setContent] = useState<string>('');
  // draft mode
  const [draftMode, setDraftMode] = useState(0); // 0 1 2
  const [token, setToken] = useState<string>('');

  /**
   * back page
   */
  const handleBack = useCallback(() => {
    history.goBack();
  }, []);

  /**
   * publish
   */
  const handlePublish = useCallback(() => {
    console.log('publish');

    console.log(title);
    console.log(content);
  }, [title, content]);

  const asyncContentToDB = useCallback(async (val: string) => {
    // TODO: ts
    const { id }: any = history.location.query;
    setDraftMode(1);

    if (id) {
      const result = await db.posts.update(Number(id), { content: val });
      console.log('id', id);
      console.log('result', result);
    } else {
      const result = await db.posts.add({
        cover:
          'https://media.karousell.com/media/photos/products/2020/12/14/jk__s39_1607947727_e81eb3f8_progressive.jpg',
        title: 'title',
        summary: 'summary',
        content: val,
        hash: '',
        status: 'pending',
        timestamp: Date.now(),
      });
      window.history.replaceState({}, '', `?id=${result}`);
      // TODO: ts
      (history as any).location.query.id = String(result);
      console.log('history', history);
      console.log('result', result);
    }
    setDraftMode(2);
  }, []);

  /**
   * synchronize content
   */
  const synchronizeContent = useCallback((val: string) => {
    // if (vditor) {
    //   const mdValue = vditor.getValue();
    //   setContent(mdValue);
    // }
    console.log('synchronizeContent');
    setContent(val);
    asyncContentToDB(val);
  }, []);

  // 获取 Token
  const fetchToken = useCallback(async () => {
    try {
      const res = await requestStorageToken();
      if (res.statusCode === 201) {
        setToken(res.data);
      } else {
        throw new Error(res.message);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const fetchDBContent = useCallback(async () => {
    // TODO: ts
    const { id }: any = history.location.query;
    if (id) {
      // TODO: ts
      const result: any = await db.posts.get(Number(id));
      console.log('result', result);
      setContent(result?.content);
      setTitle(result?.title);
      setImageUrl(result?.cover);
      setTimeout(() => {
        (window as any).vditor.setValue(result?.content);
      }, 3000);
    }
  }, []);

  useMount(() => {
    (window as any).historys = history;
    console.log('history.location', history.location);
    fetchToken();
    fetchDBContent();
  });

  return (
    <section className={styles.container}>
      <section className={styles.header}>
        <span>
          <span className={styles.headerBack} onClick={handleBack}>
            <LeftOutlined /> Posts
          </span>
          <span className={styles.headerStatus}>
            Draft{draftMode === 1 ? ' - Saving...' : draftMode === 2 ? ' - Saved' : ''}
          </span>
        </span>
        <span>
          {/* <span className={styles.headerPreview}>Preview</span> */}
          <span className={styles.headerPublish} onClick={handlePublish}>
            Publish
          </span>
        </span>
      </section>
      <section className={styles.edit}>
        <UploadImage token={token} imageUrl={imageUrl} setImageUrl={setImageUrl} />
        <Input
          type="text"
          placeholder="Title"
          className={styles.title}
          maxLength={30}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Editor md={''} synchronizeContent={synchronizeContent} token={token} />
      </section>
    </section>
  );
};

export default Edit;
