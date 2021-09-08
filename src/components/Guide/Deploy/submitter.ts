import { postSiteConfig, postSiteInfo } from '@/services/api/meta-cms';
import { Storage, StorageKeys } from '@/services/constants';

export default async ({
  initialState,
  onError,
  setOnError,
  setStageCompleted,
  updateProcessing,
}: any) => {
  // doesn't action when onError isn't false
  if (onError) {
    return;
  }

  const siteForm = JSON.parse(Storage.get(StorageKeys.SiteInfo) as string);

  const submitSiteInfo = await postSiteInfo({
    userId: initialState?.currentUser?.id as number,
    title: siteForm.title,
    subtitle: siteForm.subtitle,
    description: siteForm.description,
    author: siteForm.author,
    keywords: siteForm.keywords,
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
    language: siteForm.language,
    timezone: siteForm.timezone,
    templateId: parseInt(Storage.get(StorageKeys.ThemeSetting) as string, 10),
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

  setStageCompleted(true);
};
