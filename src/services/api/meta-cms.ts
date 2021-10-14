import { extendWithErrorHandler } from '@/services/api/base-request';
import type { Storage } from '../../typings/Storage.d';

const mockRequest = extendWithErrorHandler({
  prefix: '/api',
});

const request = extendWithErrorHandler({
  prefix: META_CMS_API || 'https://meta-cms-api-dev.mttk.net',
  // prefix: META_CMS_API || 'http://127.0.0.1:3002',

  credentials: 'include', // 默认请求是否带上cookie
});

/** 获取主题模板 GET /theme/template */
export async function getThemeTemplates(type: 'HEXO' | 'ALL') {
  return request<GLOBAL.GeneralResponse<CMS.ThemeTemplatesResponse[]>>('/templates', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { type },
  });
}

/** 提交新的站点信息 POST /site/info */
export async function newSiteInfoSetting(body: CMS.NewSiteInfoSettingRequest) {
  return request<GLOBAL.GeneralResponse<any>>('/site/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 提交新的站点设置 POST /site/config */
export async function newSiteConfigSetting(siteId: number, body: CMS.NewSiteConfigSettingRequest) {
  return request<GLOBAL.GeneralResponse<any>>('/site/config', {
    params: {
      siteId,
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 提交新的存储配置 POST /storage/{platform} */
export async function newSiteStorageSetting(
  configId: number,
  platform: string,
  body: CMS.NewSiteStorageSettingRequest,
) {
  return request<GLOBAL.GeneralResponse<any>>(`/storage/${platform}`, {
    params: {
      configId,
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 提交新的存储配置 POST /storage/{platform} */
export async function newSitePublishSetting(
  configId: number,
  platform: string,
  body: CMS.NewSitePublishSettingRequest,
) {
  return request<GLOBAL.GeneralResponse<any>>(`/publisher/${platform}`, {
    params: {
      configId,
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 提交新的存储配置 POST /tasks/deploy-publish */
export async function deployAndPublishSite(configId: number) {
  return request<GLOBAL.GeneralResponse<any>>('/tasks/deploy-publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      configId,
    },
  });
}

/** 验证域名可用性 POST /domain/validate */
export async function isDomainForbidden(domain: string) {
  if (!domain) return true;
  const response = await request<GLOBAL.GeneralResponse<any>>('/domain/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { domain },
  });
  return response?.data?.status !== 'AVAILABLE';
}

/** 进行特定平台的文章同步 POST /post/sync/{platform} */
export async function syncPostsByPlatform(platform: string) {
  return request<GLOBAL.GeneralResponse<any>>(`/post/sync/${platform}`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** 获取待同步的文章列表 GET /post */
export async function fetchPostsPendingSync() {
  return mockRequest<GLOBAL.GeneralResponse<any>>('/post', {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** 获取已经同步的文章列表 GET /post */
export async function fetchPublishedPosts() {
  return mockRequest<GLOBAL.GeneralResponse<{ items: any }>>('/published-posts', {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** 发布一篇待同步待文章 POST /post/{postId}/publish */
export async function publishPendingPost(postId: number) {
  return mockRequest<GLOBAL.GeneralResponse<any>>(`/post/${postId}/publish`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** 取消发布一篇待同步待文章 POST /post/{postId}/ignore */
export async function ignorePendingPost(postId: number) {
  return mockRequest<GLOBAL.GeneralResponse<any>>(`/post/${postId}/ignore`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** 获取文章同步源账号的绑定状态 GET /token */
export async function getSourceStatus() {
  return request<GLOBAL.GeneralResponse<CMS.SourceStatusResponse[]>>('/token', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** 绑定一个内容源平台的 token POST /token/{platform}/enable_sync */
export async function bindSourcePlatform(platform: string) {
  return request<GLOBAL.GeneralResponse<string>>(`/token/${platform}/enable_sync`, {
    method: 'POST',
  });
}

/** 解绑一个内容源平台的 token POST /token/{platform}/disable_sync */
export async function unbindSourcePlatform(platform: string) {
  return request<GLOBAL.GeneralResponse<string>>(`/token/${platform}/disable_sync`, {
    method: 'POST',
  });
}

/**
 * image upload by url
 */
export async function imageUploadByUrl(url: string) {
  return request<GLOBAL.GeneralResponse<Storage>>(`/image/uploadByUrl`, {
    method: 'POST',
    data: { url },
  });
}
