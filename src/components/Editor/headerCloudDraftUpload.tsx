import { sleep } from '@/utils';
import { CloudUploadOutlined } from '@ant-design/icons';
import { Button, message, Modal, Space, Tooltip } from 'antd';
import React, { Fragment, useCallback, useState } from 'react';
import styles from './editorHeader.less';

const HeaderCloudDraftUpload: React.FC = () => {
  const [cloudDraftUploadVisible, setCloudDraftUploadVisible] = useState<boolean>(false);
  const [cloudDraftUploadLoading, setCloudDraftUploadLoading] = useState<boolean>(false);

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

  return (
    <Fragment>
      <Tooltip placement="bottom" title={'手动在您的私密存储仓库中云端保存草稿，实现云端同步。'}>
        <span onClick={() => setCloudDraftUploadVisible(true)} className={styles.headerUpload}>
          <CloudUploadOutlined />
          <span className={styles.headerIconText}>10分钟前</span>
        </span>
      </Tooltip>
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
          <Button onClick={() => setCloudDraftUploadVisible(false)} key="close">
            取消
          </Button>,
          <Button
            type="primary"
            loading={cloudDraftUploadLoading}
            onClick={handleCloudDraftUpload}
            key="upload"
          >
            上传
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <div>在私密存储仓库中云端保存草稿，实现云端同步。</div>
          <div>云端最新版本上传时间：2021-10-30 12:00:00</div>
        </Space>
      </Modal>
    </Fragment>
  );
};

export default HeaderCloudDraftUpload;
