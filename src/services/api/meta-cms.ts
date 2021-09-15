import { extendWithErrorHandler } from '@/services/api/base-request';

const mockRequest = extendWithErrorHandler({
  prefix: '/api',
});

const request = extendWithErrorHandler({
  prefix: META_CMS_API || 'https://meta-cms-api-dev.mttk.net',
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
export async function postSiteInfo(body: CMS.PostSiteInfo) {
  return request<GLOBAL.GeneralResponse<any>>('/site/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 提交新的站点设置 POST /site/config */
export async function postSiteConfig(siteId: number, body: CMS.PostSiteConfig) {
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
export async function postNewStorageSetting(
  configId: number,
  platform: string,
  body: CMS.PostNewStorageSetting,
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

/** 验证域名可用性 POST /domain/validate */
export async function isDomainForbidden(domain: string) {
  return mockRequest<GLOBAL.GeneralResponse<any>>('/domain/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { domain },
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
