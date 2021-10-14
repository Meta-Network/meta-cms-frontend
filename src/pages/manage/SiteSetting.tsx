import SiteSettingFormItems from '@/components/SiteSettingFormItems';
import { useModel } from '@@/plugin-model/useModel';
import { Card } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import {
  getDefaultSiteConfig,
  modifySiteInfoSetting,
  modifySiteConfigSetting,
} from '@/services/api/meta-cms';
import { message } from 'antd';
import ProForm from '@ant-design/pro-form';
import { useState } from 'react';

export default () => {
  const [defaultSiteConfig, setDefaultSiteConfig] = useState<CMS.SiteConfiguration>();
  const [faviconUrl, setFaviconUrl] = useState<string>('');
  const { setSiteNeedToDeploy } = useModel('storage');

  const handleFinishing = async (values: GLOBAL.SiteSetting) => {
    if (faviconUrl) {
      values.favicon = faviconUrl; // eslint-disable-line no-param-reassign
    }

    if (defaultSiteConfig?.id && defaultSiteConfig?.siteInfo?.id) {
      const siteConfigRequest = modifySiteConfigSetting(
        defaultSiteConfig.siteInfo.id,
        defaultSiteConfig.id,
        {
          language: values.language,
          timezone: values.timezone,
        },
      );

      const siteInfoRequest = modifySiteInfoSetting(defaultSiteConfig.siteInfo.id, {
        title: values.title,
        subtitle: values.subtitle,
        description: values.description,
        author: values.author,
        keywords: values.keywords,
        favicon: values.favicon,
      });

      const done = message.loading('正在提交数据，请等待完成…', 0);
      await Promise.all([siteConfigRequest, siteInfoRequest]);
      done();
      message.success('数据提交完成。');
      setSiteNeedToDeploy(true);
    }
  };

  return (
    <PageContainer
      breadcrumb={{}}
      title="站点信息设置"
      content={
        <div key="header-info">
          <p>在此编辑您的 Meta Space 信息</p>
        </div>
      }
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
          <SiteSettingFormItems faviconUrl={faviconUrl} setFavIconUrl={setFaviconUrl} />
        </ProForm>
      </Card>
    </PageContainer>
  );
};
