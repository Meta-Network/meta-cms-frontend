import Submit from '@/components/Submit/editor';
import type { GatewayType } from '@/services/constants';
import { DraftMode } from '@/services/constants';
import { DownOutlined, LeftOutlined } from '@ant-design/icons';
import { Dropdown, Tooltip } from 'antd';
import React, { Fragment, useCallback, useState } from 'react';
import { history, useIntl } from 'umi';
import styles from './editorHeader.less';

interface Props {
  readonly draftMode: DraftMode;
  readonly loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  settings: JSX.Element;
  handlePublish: (gateway: GatewayType) => void;
  // headerCloudDraftUpload: JSX.Element;
  // headerCloudDraftDownload: JSX.Element;
}

const EditorHeader: React.FC<Props> = ({
  loading,
  setLoading,
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
        <span className={styles.action}>
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
                  setLoading={setLoading}
                  handlePublish={handlePublish}
                  setDropdownVisible={setDropdownVisible}
                />
              }
              visible={dropdownVisible}
              onVisibleChange={(visible: boolean) => setDropdownVisible(visible)}
            >
              <span className={styles.headerPublish}>
                {intl.formatMessage({
                  id: 'component.button.publish',
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
