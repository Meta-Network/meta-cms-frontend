import { postSiteConfig, postSiteInfo } from '@/services/api/meta-cms';

export default async ({
  initialState,
  siteSetting,
  themeSetting,
  setOnError,
  setStageCompleted,
  updateProcessing,
}: any) => {
  const submitSiteInfo = await postSiteInfo({
    userId: initialState?.currentUser?.id as number,
    title: siteSetting.title,
    subtitle: siteSetting.subtitle,
    description: siteSetting.description,
    author: siteSetting.author,
    keywords: siteSetting.keywords,
    favicon: 'https://github.com/favicon.ico', // TODO: change this
  });

  if (submitSiteInfo.message === 'Ok') {
    updateProcessing({ message: '提交站点信息成功。', state: 'success' });
  } else {
    updateProcessing({
      message: `提交站点信息失败，原因：${submitSiteInfo.message}`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  const submitSiteConfig = await postSiteConfig({
    language: siteSetting.language,
    timezone: siteSetting.timezone,
    templateId: themeSetting,
    domain: 'https://pages.github.com/',
  });

  if (submitSiteConfig.message === 'Ok') {
    updateProcessing({ message: '提交站点配置成功。', state: 'success' });
  } else {
    updateProcessing({
      message: `提交站点配置失败，原因：${submitSiteConfig.message}`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  // TODO: finish this
  const submitStorageConfig = await postSiteConfig({
    language: siteSetting.language,
    timezone: siteSetting.timezone,
    templateId: themeSetting,
    domain: 'https://pages.github.com/',
  });

  if (submitStorageConfig.message === 'Ok') {
    updateProcessing({ message: '提交与存储相关配置失败。', state: 'success' });
  } else {
    updateProcessing({
      message: `提交与存储相关配置失败，原因：${submitSiteConfig.message}`,
      state: 'error',
    });
    setOnError(true);
    return;
  }

  setStageCompleted(true);
};
