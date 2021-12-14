/* eslint-disable no-await-in-loop */
import { extendWithErrorHandler } from '@/services/api/base-request';

const request = extendWithErrorHandler({
  credentials: 'include',
  prefix: META_CMS_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

/** 进行特定平台的文章同步 POST /post/sync/{platform} */
export async function syncPostsByPlatform(platform: string) {
  return request<GLOBAL.GeneralResponse<any>>(`/post/sync/${platform}`, {
    method: 'POST',
  });
}

export async function fetchPostSync(params: { page: number; limit: number; state: CMS.PostState }) {
  return request<GLOBAL.GeneralResponse<CMS.ExistsPostsResponse>>('/post/sync', {
    method: 'GET',
    params: params,
  });
}

/** 获取待同步的文章列表 GET /post */
export async function fetchPostsPending(page: number, limit: number) {
  return request<GLOBAL.GeneralResponse<CMS.ExistsPostsResponse>>('/post', {
    method: 'GET',
    params: {
      page,
      limit,
      state: 'pending',
    },
  });
}

/** 获取已经发布的文章列表 GET /post */
export async function fetchPostsPublished(page: number, limit: number) {
  return request<GLOBAL.GeneralResponse<CMS.ExistsPostsResponse>>('/post', {
    method: 'GET',
    params: {
      page,
      limit,
      state: 'published',
    },
  });
}

/** 获取已经提交的文章列表 GET /post */
export async function fetchPostsSubmitted(page: number, limit: number) {
  return request<GLOBAL.GeneralResponse<CMS.ExistsPostsResponse>>('/post', {
    method: 'GET',
    params: {
      page,
      limit,
      state: 'submitted',
    },
  });
}

/** 发布一篇待同步待文章 POST /post/{postId}/publish */
export async function publishPostById(postId: number, configIds: number[]) {
  return request<GLOBAL.GeneralResponse<any>>(`/post/${postId}/publish`, {
    method: 'POST',
    data: { configIds },
  });
}

/**
 * 文章转存一份为草稿
 * @param postId
 * @returns
 */
export async function publishPostAsDraft(postId: number) {
  return request<GLOBAL.GeneralResponse<CMS.Draft>>(`/post/${postId}/draft`, {
    method: 'POST',
  });
}

/**
 * 获取 post，草稿 id 会返回 content
 * @param postId
 * @returns
 */
export async function postById(postId: number) {
  return request<GLOBAL.GeneralResponse<CMS.Draft>>(`/post/${postId}`, {
    method: 'GET',
  });
}

/**
 * local draft publish as post
 * @param data
 * @returns
 */
export async function publishPost(data: CMS.LocalDraft) {
  return request<GLOBAL.GeneralResponse<CMS.Draft>>(`/post`, {
    method: 'POST',
    data,
  });
}

/** 发布若干篇待同步待文章 POST /post/publish */
export async function publishPosts(postIds: number[], configIds: number[]) {
  return request<GLOBAL.GeneralResponse<any>>(`/post/publish`, {
    method: 'POST',
    data: { postIds, configIds },
  });
}

/** 取消发布一篇待同步待文章 POST /post/{postId}/ignore */
export async function ignorePendingPost(postId: number) {
  return request<GLOBAL.GeneralResponse<any>>(`/post/${postId}/ignore`, {
    method: 'POST',
  });
}
/**
 * 发布到用户储存
 * Publish posts to user storage, state must be pending or pending_edit.
 * If draft is true, post will publish as draft. For example: in Hexo platform, when draft is set true, will create a post file in _drafts folder.
 * @param draft
 * @param data
 * @returns
 */
export async function postStoragePublish(draft: boolean, data: CMS.PostStoragePublishData) {
  return request<GLOBAL.GeneralResponse<CMS.Post[]>>('/post/storage/publish', {
    method: 'POST',
    params: {
      draft: draft,
    },
    data: data,
  });
}

/**
 * 更新到用户储存
 * Update posts in user storage, state must be published or drafted
 * If draft is true, will update draft post. For example: in Hexo platform, when draft is set true, will update post file in _drafts folder.
 * @param draft
 * @param data
 * @returns
 */
export async function postStorageUpdate(draft: boolean, data: CMS.PostStorageUpdateData) {
  return request<GLOBAL.GeneralResponse<CMS.Post>>('/post/storage/update', {
    method: 'POST',
    params: {
      draft: draft,
    },
    data: data,
  });
}

/** 启用一个内容源平台的 token POST /token/{platform}/enable_sync */
export async function bindSourcePlatform(platform: string) {
  return request<GLOBAL.GeneralResponse<string>>(`/token/${platform}/enable_sync`, {
    method: 'POST',
  });
}

/** 获取文章同步源账号的绑定状态 GET /token */
export async function getSourceStatus() {
  const response = await request<GLOBAL.GeneralResponse<CMS.SourceStatusResponse[]>>('/token', {
    method: 'GET',
  });

  // WARNING of side effect: set active as true for all platforms
  response.data = response.data.map((platform) => {
    if (!platform.active) {
      try {
        // TODO: shouldn't run this method here
        // it should has a entry to bind platform
        bindSourcePlatform(platform.platform);
        // eslint-disable-next-line no-param-reassign
        platform.active = true;
      } catch (e) {}
    }
    return platform;
  });

  return response;
}

/** 等待一个平台文章同步完成 GET /post/sync/{platform}/state */
export async function waitUntilSyncFinish(platform: string) {
  const requestState = () =>
    request<GLOBAL.GeneralResponse<string | number>>(`/post/sync/${platform}/state`, {
      method: 'GET',
    });

  let status = (await requestState()).data;
  while (typeof status !== 'number' && status === 'syncing') {
    // sleep for 3 seconds after every request
    await new Promise((r) => setTimeout(r, 3000));
    status = (await requestState()).data;
  }

  return true;
}

/** 等待一个平台文章同步完成 GET /tasks/workspaces/{siteConfigId}/locked */
export async function IsSiteWorkspaceLocked(siteConfigId: number) {
  return (
    await request<GLOBAL.GeneralResponse<boolean>>(`/tasks/workspaces/${siteConfigId}/locked`, {
      method: 'GET',
    })
  )?.data;
}

/**
 * image upload by url
 */
export async function imageUploadByUrl(url: string) {
  return request<GLOBAL.GeneralResponse<Storage.Fleek>>(`/image/uploadByUrl`, {
    method: 'POST',
    data: { url },
  });
}
