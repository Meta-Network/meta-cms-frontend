import React, { Fragment, useCallback, useState } from 'react';
import { history, useIntl } from 'umi';
import { Tooltip, Dropdown } from 'antd';
import styles from './editorHeader.less';
import { LeftOutlined, DownOutlined } from '@ant-design/icons';
import Submit from '@/components/Submit/editor';
import { DraftMode } from '@/services/constants';

interface Props {
  readonly draftMode: DraftMode;
  readonly loading: boolean;
  settings: JSX.Element;
  handlePublish: (gateway: boolean) => void;
  // headerCloudDraftUpload: JSX.Element;
  // headerCloudDraftDownload: JSX.Element;
}

const EditorHeader: React.FC<Props> = ({
  loading,
  draftMode,
  handlePublish,
  // headerCloudDraftUpload,
  // headerCloudDraftDownload,
  settings,
}) => {
  const intl = useIntl();
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  /**
   * back page
   */
  const handleBack = useCallback(() => {
    history.goBack();
  }, []);

  return (
    <Fragment>
      <section className={styles.header}>
        <span>
          <span className={styles.headerBack} onClick={handleBack}>
            <LeftOutlined />{' '}
            {intl.formatMessage({
              id: 'editor.header.title',
            })}
          </span>
          <Tooltip
            placement="bottom"
            title={intl.formatMessage({
              id: 'editor.header.draft.tip',
            })}
          >
            <span className={styles.headerStatus}>
              {intl.formatMessage({
                id: 'editor.header.draft',
              })}
              {draftMode === DraftMode.Saving
                ? ` - ${intl.formatMessage({
                    id: 'editor.header.draft.saving',
                  })}`
                : draftMode === DraftMode.Saved
                ? ` - ${intl.formatMessage({
                    id: 'editor.header.draft.saved',
                  })}`
                : ''}
            </span>
          </Tooltip>
          {/* {headerCloudDraftUpload} */}
          {/* {headerCloudDraftDownload} */}
        </span>
        <span>
          <Tooltip
            placement="left"
            title={intl.formatMessage({
              id: 'editor.submit.tip',
            })}
          >
            <Dropdown
              overlayClassName={styles.headerDropdown}
              trigger={['click']}
              overlay={
                <Submit
                  loading={loading}
                  handlePublish={handlePublish}
                  setDropdownVisible={setDropdownVisible}
                />
              }
              visible={dropdownVisible}
              onVisibleChange={(visible: boolean) => setDropdownVisible(visible)}
            >
              <span className={styles.headerPublish}>
                {intl.formatMessage({
                  id: 'component.button.submit',
                })}
                <DownOutlined className={styles.headerIconText} />
              </span>
            </Dropdown>
          </Tooltip>
          {settings}
        </span>
      </section>
    </Fragment>
  );
};

export default EditorHeader;
