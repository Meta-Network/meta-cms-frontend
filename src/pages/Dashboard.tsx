import { PageHeader, Tabs } from 'antd';
import { FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import FormattedDescription from '@/components/FormattedDescription';
import SiteSettingStatus from '@/components/dashboard/SiteSettingStatus';
import SubmittedPostsTable from '@/components/dashboard/SubmmitedPostsTable';

export default () => {
  // const intl = useIntl();
  const { TabPane } = Tabs;
  const publishDataAndStatus = (
    <>
      <FormattedMessage id="messages.dashboard.lastPublishDate" values={{ time: Date.now() }} />{' '}
      <FormattedMessage id="messages.publish.success" />
    </>
  );

  return (
    <PageContainer
      title={<FormattedMessage id="menu.dashboard" />}
      subTitle={publishDataAndStatus}
      content={
        <FormattedDescription id="guide.intro.description" customClass="header-text-description" />
      }
      breadcrumb={{}}
    >
      <PageHeader
        className="site-page-header"
        title={<FormattedMessage id="messages.dashboard.waitForPublish" />}
        subTitle={publishDataAndStatus}
      />
      <Tabs defaultActiveKey="1">
        <TabPane tab={<FormattedMessage id="messages.dashboard.submitted" />} key="1">
          <SubmittedPostsTable />
        </TabPane>
        <TabPane tab={<FormattedMessage id="messages.dashboard.settings" />} key="2">
          <SiteSettingStatus />
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};
