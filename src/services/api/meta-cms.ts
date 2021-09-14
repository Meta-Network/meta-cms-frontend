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
export async function postSiteConfig(body: CMS.PostSiteConfig) {
  return request<GLOBAL.GeneralResponse<any>>('/site/config', {
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

/** 获取待同步的文章列表 POST /site/info */
export async function fetchPostsPendingSync() {
  return mockRequest<GLOBAL.GeneralResponse<any>>('/site/info', {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
