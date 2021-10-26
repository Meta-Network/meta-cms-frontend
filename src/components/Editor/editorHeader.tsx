import React, { useCallback } from 'react';
import { history, useIntl } from 'umi';
import styles from './editorHeader.less';
import { LeftOutlined } from '@ant-design/icons';
import Settings from './settings';

interface Props {
  readonly post: CMS.Post | CMS.Draft | null;
  readonly draftMode: 0 | 1 | 2;
  handlePublish: () => void;
}

const EditorHeader: React.FC<Props> = ({ post, draftMode, handlePublish }) => {
  const intl = useIntl();

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
          <LeftOutlined />{' '}
          {intl.formatMessage({
            id: 'editor.header.title',
          })}
        </span>
        <span className={styles.headerStatus}>
          {intl.formatMessage({
            id: 'editor.header.draft',
          })}
          {draftMode === 1
            ? ` - ${intl.formatMessage({
                id: 'editor.header.draft.saving',
              })}`
            : draftMode === 2
            ? ` - ${intl.formatMessage({
                id: 'editor.header.draft.saved',
              })}`
            : ''}
        </span>
      </span>
      <span>
        {/* <span className={styles.headerPreview}>Preview</span> */}
        <span className={styles.headerPublish} onClick={handlePublish}>
          {intl.formatMessage({
            id: 'editor.header.publish',
          })}
        </span>
        <Settings post={post} />
      </span>
    </section>
  );
};

export default EditorHeader;
