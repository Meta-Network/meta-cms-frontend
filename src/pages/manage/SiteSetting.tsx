import FormattedDescription from '@/components/FormattedDescription';
import SiteSettingFormItems from '@/components/SiteSettingFormItems';
import {
  getDefaultSiteConfig,
  updateSiteConfigSetting,
  updateSiteInfoSetting,
} from '@/services/api/meta-cms';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, message } from 'antd';
import { useState } from 'react';
import { useIntl } from 'umi';

export default () => {
  const intl = useIntl();
  const [defaultSiteConfig, setDefaultSiteConfig] = useState<CMS.SiteConfiguration>();
  const [faviconUrl, setFaviconUrl] = useState<string>('');

  const handleFinishing = async (values: GLOBAL.SiteSetting) => {
    if (faviconUrl) {
      values.favicon = faviconUrl; // eslint-disable-line no-param-reassign
    }

    if (defaultSiteConfig?.id && defaultSiteConfig?.siteInfo?.id) {
      const siteConfigResponse = updateSiteConfigSetting(defaultSiteConfig.id, {
        language: values.language,
        timezone: values.timezone,
      });

      const siteInfoResponse = updateSiteInfoSetting(defaultSiteConfig.siteInfo.id, {
        title: values.title,
        subtitle: values.subtitle,
        description: values.description,
        author: values.author,
        keywords: values.keywords,
        favicon: values.favicon,
      });

      const done = message.loading(intl.formatMessage({ id: 'messages.site.submittingInfo' }), 0);
      let success = true;

      const response = await Promise.all([siteConfigResponse, siteInfoResponse]);
      response.forEach((res) => {
        if (res.message !== 'Ok') {
          message.error(
            intl.formatMessage({ id: 'messages.site.submitFailed' }, { reason: res.message }),
          );
          success = false;
        }
      });

      if (success) {
        message.success(intl.formatMessage({ id: 'messages.site.submitSuccess' }));
      }
      done();
    }
  };

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.site.title' })}
      content={<FormattedDescription id="messages.site.description" />}
    >
      <Card>
        <ProForm
          style={{ width: 500 }}
          request={async () => {
            const defaultSite = (await getDefaultSiteConfig()).data;
            setFaviconUrl(defaultSite.siteInfo.favicon);
            setDefaultSiteConfig(defaultSite);
            return {
              title: defaultSite.siteInfo.title,
              subtitle: defaultSite.siteInfo.subtitle,
              author: defaultSite.siteInfo.author,
              description: defaultSite.siteInfo.description,
              keywords: defaultSite.siteInfo.keywords,
              favicon: defaultSite.siteInfo.favicon,
              language: defaultSite.language,
              timezone: defaultSite.timezone,
            };
          }}
          onFinish={handleFinishing}
          requiredMark="optional"
        >
          <SiteSettingFormItems />
        </ProForm>
      </Card>
    </PageContainer>
  );
};
