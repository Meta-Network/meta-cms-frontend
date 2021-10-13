import React, { useCallback } from 'react';
import styles from './editorHeader.less';
import { LeftOutlined } from '@ant-design/icons';
import { history } from 'umi';

interface Props {
  readonly draftMode: 0 | 1 | 2;
  handlePublish: () => void;
}

const EditorHeader: React.FC<Props> = ({ draftMode, handlePublish }) => {
  /**
   * back page
   */
  const handleBack = useCallback(() => {
    history.goBack();
  }, []);

  return (
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
  );
};

export default EditorHeader;
