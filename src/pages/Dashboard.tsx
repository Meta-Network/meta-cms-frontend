import { PageHeader, Tabs } from 'antd';
import { FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import FormattedDescription from '@/components/FormattedDescription';
import SiteSettingStatus from '@/components/dashboard/SiteSettingStatus';
import SubmittedPostsTable from '@/components/dashboard/SubmmitedPostsTable';

export default () => {
  // const intl = useIntl();
  const { TabPane } = Tabs;

  return (
    <PageContainer
      title={<FormattedMessage id="guide.intro.title" />}
      subTitle={'上次发布时间：2132131231 发布成功'}
      content={
        <FormattedDescription id="guide.intro.description" customClass="header-text-description" />
      }
      breadcrumb={{}}
    >
      <PageHeader
        className="site-page-header"
        title="待发布"
        subTitle={'上次发布时间：2132131231 发布成功'}
      />
      <Tabs defaultActiveKey="1">
        <TabPane tab="已提交" key="1">
          <SubmittedPostsTable />
        </TabPane>
        <TabPane tab="设置项" key="2">
          <SiteSettingStatus />
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};
