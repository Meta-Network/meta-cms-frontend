import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import DeleteLocalDraft from './components/DeleteLocalDraft/index';

export default () => {
  return (
    <PageContainer
      breadcrumb={{}}
      title="系统设置"
      content={<div className="text-info">管理系统设置</div>}
    >
      <Card>
        <DeleteLocalDraft />
      </Card>
    </PageContainer>
  );
};
