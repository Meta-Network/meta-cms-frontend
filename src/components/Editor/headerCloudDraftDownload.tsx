import React, { Fragment, useCallback, useState } from 'react';
import { Tooltip, Modal, message, Button, Space } from 'antd';
import styles from './editorHeader.less';
import { CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { sleep } from '@/utils';

const HeaderCloudDraftDownload: React.FC = () => {
  const [cloudDraftDownloadVisible, setCloudDraftDownloadVisible] = useState<boolean>(false);
  const [cloudDraftDownloadLoading, setCloudDraftDownloadLoading] = useState<boolean>(false);

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
      <Tooltip placement="bottom" title={'云端下载后会覆盖当前编辑器中的内容。'}>
        <span onClick={() => setCloudDraftDownloadVisible(true)} className={styles.headerDownload}>
          <CloudDownloadOutlined />
          <span className={styles.headerIconText}>下载</span>
        </span>
      </Tooltip>
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
          <Button
            onClick={() => window.open(`https://${META_SPACE_BASE_DOMAIN}`, '_blank')}
            key="button"
          >
            查看云端内容
          </Button>,
          <Button
            type="primary"
            loading={cloudDraftDownloadLoading}
            onClick={handleCloudDraftDownload}
            key="download"
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

export default HeaderCloudDraftDownload;
