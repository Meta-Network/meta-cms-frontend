import type { FetchPostsStorageParamsState } from '@/services/constants';
import request from './request';

/**
 *  获取当前用户的用户文章数据 GET /v1/pipelines/post-orders/mine/count
 */
export async function fetchPostCount() {
  return request<GLOBAL.GeneralResponse<CMS.PostCount>>('/v1/pipelines/post-orders/mine/count', {
    method: 'GET',
  });
}

/**
 * fetch post sync
 * @param params
 * @returns
 */
export async function fetchPostSync(params: { page: number; limit: number; state: CMS.PostState }) {
  return request<GLOBAL.GeneralResponse<CMS.ExistsPostsResponse>>('/post/sync', {
    method: 'GET',
    params: params,
  });
}

/**
 * fetch Posts Storage by siteConfigId
 * 暂不支持 limit
 * @param siteConfigId
 * @param params
 * @returns
 */
export async function fetchPostsStorage(
  siteConfigId: number,
  params: { page?: number; limit?: number; state: FetchPostsStorageParamsState },
) {
  return request<GLOBAL.GeneralResponse<CMS.ExistsPostsResponse>>(`/post/storage/${siteConfigId}`, {
    method: 'GET',
    params: params,
  });
}
/**
 * fetch Posts Storage State by stateIds
 * @param params
 * @returns
 */
export async function fetchPostsStorageState(params: { stateIds: number[] }) {
  return request<GLOBAL.GeneralResponse<CMS.FetchPostsStorageState[]>>(`/post/storage/state`, {
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

/** 取消发布一篇待同步待文章 POST /post/{postId}/ignore */
export async function ignorePendingPost(postId: number) {
  return request<GLOBAL.GeneralResponse<any>>(`/post/sync/${postId}/ignore`, {
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
  return request<GLOBAL.GeneralResponse<CMS.PostStoragePublish>>('/post/storage/publish', {
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
  return request<GLOBAL.GeneralResponse<CMS.PostStoragePublish>>('/post/storage/update', {
    method: 'POST',
    params: {
      draft: draft,
    },
    data: data,
  });
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
