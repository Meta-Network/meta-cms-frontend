import request from './request';

/** 获取主题模板 GET /theme/template */
export async function getThemeTemplates(type: 'HEXO' | 'ALL') {
  return request<GLOBAL.GeneralResponse<CMS.ThemeTemplatesResponse[]>>('/templates', {
    method: 'GET',
    params: { type },
  });
}

/** 提交新的站点信息 POST /site/info */
export async function newSiteInfoSetting(body: CMS.SiteInfoSettingRequest) {
  return request<GLOBAL.GeneralResponse<any>>('/site/info', {
    method: 'POST',
    data: body,
  });
}

/** 提交新的站点设置 POST /site/config */
export async function newSiteConfigSetting(siteInfoId: number, body: CMS.SiteConfigSettingRequest) {
  return request<GLOBAL.GeneralResponse<any>>('/site/config', {
    params: {
      siteInfoId,
    },
    method: 'POST',
    data: body,
  });
}

/** 更新一个站点信息 PATCH /site/info */
export async function updateSiteInfoSetting(siteInfoId: number, body: CMS.SiteInfoSettingRequest) {
  return request<GLOBAL.GeneralResponse<any>>(`/site/info/${siteInfoId}`, {
    method: 'PATCH',
    data: body,
  });
}

/** 更新一个站点设置 PATCH /site/config */
export async function updateSiteConfigSetting(
  configId: number,
  body: CMS.SiteConfigSettingRequest,
) {
  return request<GLOBAL.GeneralResponse<any>>(`/site/config/${configId}`, {
    method: 'PATCH',
    data: body,
  });
}

/** 提交新的存储配置 POST /storage/{platform} */
export async function newSiteStorageSetting(
  configId: number,
  platform: string,
  body: CMS.SiteStorageSettingRequest,
) {
  return request<GLOBAL.GeneralResponse<any>>(`/storage/${platform}`, {
    params: {
      configId,
    },
    method: 'POST',
    data: body,
  });
}

/** 提交新的存储配置 POST /storage/{platform} */
export async function newSitePublishSetting(
  configId: number,
  platform: string,
  body: CMS.SitePublishSettingRequest,
) {
  return request<GLOBAL.GeneralResponse<any>>(`/publisher/${platform}`, {
    params: {
      configId,
    },
    method: 'POST',
    data: body,
  });
}

/** 提交新的存储配置 POST /tasks/deploy-publish */
export async function deployAndPublishSite(data: {
  configId: number;
  authorPublishMetaSpaceRequestMetadataStorageType: string;
  authorPublishMetaSpaceRequestMetadataRefer: string;
}) {
  return request<GLOBAL.GeneralResponse<any>>('/tasks/deploy-publish', {
    method: 'POST',
    data: data,
  });
}

/** 进行特定平台的文章同步 POST /post/sync/{platform} */
export async function syncPostsByPlatform(platform: string) {
  return request<GLOBAL.GeneralResponse<any>>(`/post/sync/${platform}`, {
    method: 'POST',
  });
}