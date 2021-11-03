import React, { Fragment, useCallback, useState } from 'react';
import { history, useIntl } from 'umi';
import { Tooltip, Modal, Dropdown, message, Button, Space } from 'antd';
import styles from './editorHeader.less';
import {
  LeftOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { sleep } from '@/utils';

interface Props {
  readonly draftMode: 0 | 1 | 2;
  settings: JSX.Element;
  submit: JSX.Element;
}

const EditorHeader: React.FC<Props> = ({ draftMode, submit, settings }) => {
  const intl = useIntl();
  const [cloudDraftUploadVisible, setCloudDraftUploadVisible] = useState<boolean>(false);
  const [cloudDraftUploadLoading, setCloudDraftUploadLoading] = useState<boolean>(false);

  const [cloudDraftDownloadVisible, setCloudDraftDownloadVisible] = useState<boolean>(false);
  const [cloudDraftDownloadLoading, setCloudDraftDownloadLoading] = useState<boolean>(false);
  /**
   * back page
   */
  const handleBack = useCallback(() => {
    history.goBack();
  }, []);
  /**
   * handle upload cloud draft
   */
  const handleCloudDraftUpload = useCallback(async () => {
    setCloudDraftUploadLoading(true);
    // const result = await something()
    await sleep(2000);
    const result = true;
    if (result) {
      message.success('同步成功');

      // 更新本地数据

      setCloudDraftUploadLoading(false);
      return Promise.resolve();
    } else {
      message.error('同步失败');

      setCloudDraftUploadLoading(false);
      return Promise.reject();
    }
  }, []);

  /**
   * handle cloud draft download
   */
  const handleCloudDraftDownload = useCallback(async () => {
    setCloudDraftDownloadLoading(true);
    // const result = await something()
    await sleep(2000);
    const result = true;
    if (result) {
      message.success('下载成功');

      // 覆盖内容

      setCloudDraftDownloadLoading(false);
      return Promise.resolve();
    } else {
      message.error('下载失败');
      setCloudDraftDownloadLoading(false);
      return Promise.reject();
    }
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
          <Tooltip
            placement="bottom"
            title={'手动在您的私密存储仓库中云端保存草稿，实现云端同步。'}
          >
            <span onClick={() => setCloudDraftUploadVisible(true)} className={styles.headerUpload}>
              <CloudUploadOutlined />
              <span className={styles.headerIconText}>10分钟前</span>
            </span>
          </Tooltip>
          <Tooltip placement="bottom" title={'云端下载后会覆盖当前编辑器中的内容。'}>
            <span
              onClick={() => setCloudDraftDownloadVisible(true)}
              className={styles.headerDownload}
            >
              <CloudDownloadOutlined />
              <span className={styles.headerIconText}>下载</span>
            </span>
          </Tooltip>
        </span>
        <span>
          <Tooltip placement="left" title={'无需经过平台直接提交至存储仓库'}>
            <Dropdown overlayClassName={styles.headerDropdown} trigger={['click']} overlay={submit}>
              <span className={styles.headerPublish}>
                提交
                <DownOutlined className={styles.headerIconText} />
              </span>
            </Dropdown>
          </Tooltip>

          {settings}
        </span>
      </section>
      <Modal
        visible={cloudDraftUploadVisible}
        title={
          <Fragment>
            <CloudUploadOutlined />
            &nbsp;上传
          </Fragment>
        }
        onCancel={() => setCloudDraftUploadVisible(false)}
        footer={[
          <Button onClick={() => setCloudDraftUploadVisible(false)}>取消</Button>,
          <Button type="primary" loading={cloudDraftUploadLoading} onClick={handleCloudDraftUpload}>
            上传
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <div>在私密存储仓库中云端保存草稿，实现云端同步。</div>
          <div>云端最新版本上传时间：2021-10-30 12:00:00</div>
        </Space>
      </Modal>
      <Modal
        visible={cloudDraftDownloadVisible}
        title={
          <Fragment>
            <CloudUploadOutlined />
            &nbsp;下载
          </Fragment>
        }
        onCancel={() => setCloudDraftDownloadVisible(false)}
        footer={[
          <Button onClick={() => window.open('https://www.metaspaces.life', '_blank')}>
            查看云端内容
          </Button>,
          <Button
            type="primary"
            loading={cloudDraftDownloadLoading}
            onClick={handleCloudDraftDownload}
          >
            下载
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <div>云端下载后会覆盖当前编辑器中的内容。</div>
          <div>云端最新版本上传时间：2021-10-30 12:00:00</div>
        </Space>
      </Modal>
    </Fragment>
  );
};

export default EditorHeader;
