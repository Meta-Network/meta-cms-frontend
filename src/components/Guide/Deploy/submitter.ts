import { postNewStorageSetting, postSiteConfig, postSiteInfo } from '@/services/api/meta-cms';

export default async ({
  siteSetting,
  themeSetting,
  storeSetting,
  domainSetting,
  setOnError,
  setStageCompleted,
  updateProcessing,
}: any) => {
  const submitSiteInfo = await postSiteInfo({
    title: siteSetting.title,
    subtitle: siteSetting.subtitle,
    description: siteSetting.description,
    author: siteSetting.author,
    keywords: siteSetting.keywords,
    favicon: siteSetting.favicon, // TODO: change this
  });

  if (submitSiteInfo.message === 'Ok') {
    updateProcessing({ message: '提交站点信息成功。', state: 'success' });
    updateProcessing({ message: `SiteInfoId: ${submitSiteInfo.data.id}。`, state: 'info' });
  } else {
    updateProcessing({
      message: `提交站点信息失败，原因：${submitSiteInfo.message}`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  const submitSiteConfig = await postSiteConfig(submitSiteInfo.data.id, {
    language: siteSetting.language,
    timezone: siteSetting.timezone,
    templateId: themeSetting,
    domain: `${domainSetting}.metaspaces.me`,
    subdomain: `${domainSetting}.metaspaces.me`,
  });

  if (submitSiteConfig.message === 'Ok') {
    updateProcessing({ message: '提交站点配置成功。', state: 'success' });
    updateProcessing({ message: `SiteConfigId: ${submitSiteConfig.data.id}。`, state: 'info' });
  } else {
    updateProcessing({
      message: `提交站点配置失败，原因：${submitSiteConfig.message}`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  const submitStorageSetting = await postNewStorageSetting(
    submitSiteConfig.data.id,
    storeSetting.storage.toLowerCase(),
    {
      userName: storeSetting.username,
      repoName: storeSetting.repo,
      branchName: 'master',
      dataType: 'HEXO',
      useGitProvider: true,
    },
  );

  if (submitStorageSetting.message === 'Ok') {
    updateProcessing({ message: '提交存储配置成功。', state: 'success' });
    updateProcessing({
      message: `StorageSettingId: ${submitStorageSetting.data.id}。`,
      state: 'info',
    });
  } else {
    updateProcessing({
      message: `提交存储配置失败，原因：${submitStorageSetting.message}`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  updateProcessing({ message: '部署站点完成。', state: 'success' });
  setStageCompleted(true);
};
