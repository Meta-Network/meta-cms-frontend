import {
  newSiteInfoSetting,
  newSiteStorageSetting,
  newSiteConfigSetting,
  newSitePublishSetting,
  deployAndPublishSite,
} from '@/services/api/meta-cms';

export default async ({
  siteSetting,
  themeSetting,
  storeSetting,
  domainSetting,
  setOnError,
  setStageCompleted,
  updateProcessing,
}: any) => {
  const infoSetting = await newSiteInfoSetting({
    title: siteSetting.title,
    subtitle: siteSetting.subtitle,
    description: siteSetting.description,
    author: siteSetting.author,
    keywords: siteSetting.keywords,
    favicon: siteSetting.favicon, // TODO: change this
  });

  if (infoSetting.message === 'Ok') {
    updateProcessing({ message: '提交 Meta Space 信息成功。', state: 'success' });
    updateProcessing({ message: `SiteInfoId: ${infoSetting.data.id}。`, state: 'info' });
  } else {
    updateProcessing({
      message: `提交 Meta Space 信息失败，原因：${infoSetting.message}。`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  const configSetting = await newSiteConfigSetting(infoSetting.data.id, {
    language: siteSetting.language,
    timezone: siteSetting.timezone,
    templateId: themeSetting,
    metaSpacePrefix: domainSetting,
    domain: `${domainSetting}.${META_SPACE_BASE_DOMAIN || 'metaspaces.me'}`,
  });

  if (configSetting.message === 'Ok') {
    updateProcessing({ message: '提交 Meta Space 配置成功。', state: 'success' });
    updateProcessing({ message: `SiteConfigId: ${configSetting.data.id}。`, state: 'info' });
  } else {
    updateProcessing({
      message: `提交 Meta Space 配置失败，原因：${configSetting.message}。`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  const storageSetting = await newSiteStorageSetting(
    configSetting.data.id,
    storeSetting.storage.toLowerCase(),
    {
      userName: storeSetting.username,
      repoName: storeSetting.repo,
      branchName: 'master',
      dataType: 'HEXO',
      useGitProvider: true,
    },
  );

  if (storageSetting.message === 'Ok') {
    updateProcessing({ message: '提交存储配置成功。', state: 'success' });
    updateProcessing({
      message: `StorageSettingId: ${storageSetting.data.id}。`,
      state: 'info',
    });
  } else {
    updateProcessing({
      message: `提交存储配置失败，原因：${storageSetting.message}。`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  const publishSetting = await newSitePublishSetting(
    configSetting.data.id,
    storeSetting.storage.toLowerCase(),
    {
      userName: storeSetting.username,
      repoName: storeSetting.repo,
      branchName: 'gh-pages',
      dataType: 'HEXO',
      useGitProvider: true,
      publishDir: 'public',
    },
  );

  if (publishSetting.message === 'Ok') {
    updateProcessing({ message: '提交发布配置成功。', state: 'success' });
    updateProcessing({
      message: `PublishSettingId: ${publishSetting.data.id}。`,
      state: 'info',
    });
  } else {
    updateProcessing({
      message: `提交发布配置失败，原因：${publishSetting.message}。`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  const deployAndPublish = await deployAndPublishSite(configSetting.data.id);

  if (deployAndPublish.message === 'Ok') {
    updateProcessing({ message: ' Meta Space 部署与发布成功。', state: 'success' });
  } else {
    updateProcessing({
      message: `提交发布配置失败，原因：${deployAndPublish.message}。`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  updateProcessing({
    message: `请在左侧菜单中访问您的 Meta Space。`,
    state: 'success',
  });

  setStageCompleted(true);
};
