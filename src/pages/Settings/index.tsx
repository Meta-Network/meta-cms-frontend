import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import { useIntl } from 'umi';
import DeleteLocalDraft from './components/DeleteLocalDraft/index';

export default () => {
  const intl = useIntl();

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({
        id: 'setting.title',
      })}
      content={
        <div className="text-info">
          {intl.formatMessage({
            id: 'setting.description',
          })}
        </div>
      }
    >
      <Card>
        <DeleteLocalDraft />
      </Card>
    </PageContainer>
  );
};
