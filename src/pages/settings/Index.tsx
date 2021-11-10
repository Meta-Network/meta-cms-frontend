import { useCallback } from 'react';
import { useIntl } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Typography, Button, Popconfirm, message, Space } from 'antd';
import { dbPostsDeleteAll } from '@/db/db';

const { Text } = Typography;

export default () => {
  const intl = useIntl();

  /**
   * handle delete all local draft
   */
  const handleDeleteAllLocalDraft = useCallback(async () => {
    await dbPostsDeleteAll();
    message.success('删除成功');
  }, []);

  return (
    <PageContainer
      breadcrumb={{}}
      title="系统设置"
      content={<div className="text-info">管理系统设置</div>}
    >
      <Card>
        <Space>
          <Text type="danger">删除本地所有草稿</Text>
          <Popconfirm
            title="您确定要删除本地所有草稿吗?"
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
              删除
            </Button>
          </Popconfirm>
        </Space>
      </Card>
    </PageContainer>
  );
};
