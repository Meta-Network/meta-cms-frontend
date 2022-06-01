import SiteSettingStatus from '@/components/dashboard/SiteSettingStatus';
import SubmittedPostsTable from '@/components/dashboard/SubmmitedPostsTable';
import FormattedDescription from '@/components/FormattedDescription';
import { getDefaultSiteConfigAPI } from '@/helpers';
import { PageContainer } from '@ant-design/pro-layout';
import { useMount } from 'ahooks';
import { PageHeader, Tabs } from 'antd';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'umi';

enum SiteStatus {
  /** SiteConfig generated */
  Configured = 'CONFIGURED',
  /** Deploy worker running */
  Deploying = 'DEPLOYING',
  /** Site deployed, e.g. repo init & push */
  Deployed = 'DEPLOYED',
  /** Publish worker running */
  Publishing = 'PUBLISHING',
  /** Site published, can be visit */
  Published = 'PUBLISHED',
}

export default () => {
  // const intl = useIntl();
  const { TabPane } = Tabs;

  const [lastUpdate, setLastUpdate] = useState('');
  const [publishState, setPublishState] = useState(SiteStatus.Configured);

  const fetchDefaultConfig = useCallback(async () => {
    const defaultConfig = await getDefaultSiteConfigAPI();
    if (defaultConfig) {
      setLastUpdate(defaultConfig.lastPublishedAt);
      setPublishState(defaultConfig.status as SiteStatus);
    }
  }, []);

  useMount(() => {
    fetchDefaultConfig();
  });

  const renderPublishStatus = () => {
    if (publishState === SiteStatus.Published) {
      return <FormattedMessage id="messages.publish.success" />;
    } else if (publishState === SiteStatus.Publishing) {
      return <FormattedMessage id="messages.publish.publishing" />;
    } else {
      return <FormattedMessage id="messages.publish.waiting" />;
    }
  };

  const publishDataAndStatus = (
    <>
      {lastUpdate ? (
        <FormattedMessage
          id="messages.dashboard.lastPublishDate"
          values={{ time: new Date(lastUpdate) }}
        />
      ) : (
        <FormattedMessage id="messages.dashboard.noLastPublishDate" />
      )}{' '}
      {renderPublishStatus()}
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
