import request from './request';

/** 验证域名可用性 POST /domain/validate */
export async function isDomainForbidden(domain: string) {
  if (!domain) return true;
  const response = await request<GLOBAL.GeneralResponse<any>>('/domain/validate', {
    method: 'POST',
    data: { domain },
  });
  return response?.data?.status !== 'AVAILABLE';
}

/** 获取当前用户默认的站点设置 GET /site/config/default */
export async function getDefaultSiteConfig() {
  return request<GLOBAL.GeneralResponse<CMS.SiteConfiguration>>('/site/config/default', {
    method: 'GET',
  });
}

/**
 * get storage setting
 */
export async function getStorageSetting(configId: number, platform: CMS.StoragePlatform) {
  return request<GLOBAL.GeneralResponse<CMS.StoragePlatformSetting>>(`/storage/${platform}`, {
    params: { configId },
    method: 'GET',
  });
}

/**
 * get publisher setting
 * @param configId
 * @param platform
 * @returns
 */
export async function getPublisherSetting(configId: number, platform: CMS.StoragePlatform) {
  return request<GLOBAL.GeneralResponse<CMS.PublisherPlatformSetting>>(`/publisher/${platform}`, {
    params: { configId },
    method: 'GET',
  });
}
