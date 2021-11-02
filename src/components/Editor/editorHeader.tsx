import React, { useCallback } from 'react';
import { history, useIntl } from 'umi';
import { Tooltip, Modal, Dropdown } from 'antd';
import styles from './editorHeader.less';
import {
  LeftOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DownOutlined,
} from '@ant-design/icons';

interface Props {
  readonly draftMode: 0 | 1 | 2;
  settings: JSX.Element;
  submit: JSX.Element;
}

const { confirm } = Modal;

function showConfirm() {
  confirm({
    title: '下载',
    icon: <CloudDownloadOutlined />,
    content: (
      <div>
        <p>云端下载后会覆盖当前编辑器中的内容</p>
        <p>云端最新版本上传时间：2021-10-30 12:00:00</p>
      </div>
    ),
    okText: '下载',
    cancelText: '查看云端内容',
    closable: true,
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
  });
}

function showConfirmUpload() {
  confirm({
    title: '上传',
    icon: <CloudUploadOutlined />,
    content: (
      <div>
        <p>在私密存储仓库中云端保存草稿，实现云端同步。</p>
        <p>云端最新版本上传时间：2021-10-30 12:00:00</p>
      </div>
    ),
    okText: '上传',
    cancelText: '取消',
    closable: true,
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
  });
}

const EditorHeader: React.FC<Props> = ({ draftMode, submit, settings }) => {
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
        <Tooltip placement="bottom" title={'在您设备的浏览器中自动保存草稿，跨设备不可同步。'}>
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
        </Tooltip>
        <Tooltip placement="bottom" title={'手动在您的私密存储仓库中云端保存草稿，实现云端同步。'}>
          <span onClick={showConfirmUpload} className={styles.headerUpload}>
            <CloudUploadOutlined />
            <span className={styles.headerIconText}>10分钟前</span>
          </span>
        </Tooltip>
        <Tooltip placement="bottom" title={'云端下载后会覆盖当前编辑器中的内容。'}>
          <span onClick={showConfirm} className={styles.headerDownload}>
            <CloudDownloadOutlined />
            <span className={styles.headerIconText}>下载</span>
          </span>
        </Tooltip>
      </span>
      <span>
        <Tooltip placement="left" title={'无需经过平台直接提交至存储仓库'}>
          <Dropdown trigger={['click']} overlay={submit}>
            <span className={styles.headerPublish}>
              提交
              <DownOutlined className={styles.headerIconText} />
            </span>
          </Dropdown>
        </Tooltip>

        {settings}
      </span>
    </section>
  );
};

export default EditorHeader;
