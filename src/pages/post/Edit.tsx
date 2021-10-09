import React, { useState, useCallback, useEffect } from 'react';

import { history } from 'umi';
import { Input } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import Editor from '../../components/Editor';
import styles from './Edit.less';

export default () => {
  // title
  const [title, setTitle] = useState<string>('hello');
  // content
  const [content, setContent] = useState<string>('');
  // draft mode
  const [draftMode, setDraftMode] = useState(0); // 0 1 2

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

  /**
   * async content
   */
  const asyncContent = () => {
    const vditor = (window as any).vditor;
    if (vditor) {
      const mdValue = vditor.getValue();
      setContent(mdValue);
    }
  };

  useEffect(() => {
    setDraftMode(1);
    console.log('....');
    setTimeout(() => {
      setDraftMode(2);
    }, 300);
  }, [content]);

  useEffect(() => {
    // TODO: need api event, watching content change
    const timer = setInterval(asyncContent, 1000);
    return () => clearInterval(timer);
  }, []);

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
        <Input
          type="text"
          placeholder="Title"
          className={styles.title}
          maxLength={30}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Editor />
      </section>
    </section>
  );
};
