import { useCallback } from 'react';
import { useIntl } from 'umi';
import { Typography, Button, Popconfirm, message, Space } from 'antd';
import { dbPostsDeleteAll, dbMetadatasDeleteAll } from '@/db/db';

const { Text } = Typography;

export default () => {
  const intl = useIntl();

  /**
   * handle delete all local draft
   */
  const handleDeleteAllLocalDraft = useCallback(async () => {
    await dbPostsDeleteAll();
    await dbMetadatasDeleteAll();
    message.success(
      intl.formatMessage({
        id: 'messages.delete.success',
      }),
    );
  }, [intl]);

  return (
    <Space>
      <Text type="danger">
        {intl.formatMessage({
          id: 'setting.DeleteLocalDraft.all',
        })}
      </Text>
      <Popconfirm
        title={intl.formatMessage({
          id: 'setting.DeleteLocalDraft.all.tip',
        })}
        onConfirm={handleDeleteAllLocalDraft}
        // onCancel={}
        okText={intl.formatMessage({
          id: 'component.button.yes',
        })}
        cancelText={intl.formatMessage({
          id: 'component.button.no',
        })}
      >
        <Button type="primary" danger>
          {intl.formatMessage({
            id: 'component.button.delete',
          })}
        </Button>
      </Popconfirm>
    </Space>
  );
};
