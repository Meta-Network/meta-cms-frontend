import request from './request';
import type { GatewayType } from '@/services/constants';
import type {
  AuthorPostDigestMetadata,
  AuthorPostSignatureMetadata,
} from '@metaio/meta-signature-util-v2';

type PipelinesOrdersPayload = {
  certificateStorageType: GatewayType;
  authorPostDigest: AuthorPostDigestMetadata;
  authorPostSign: AuthorPostSignatureMetadata;
};

/**
 * v1
 * pipelines
 */

/**
 * pipeline
 * 拥护请求发布文章
 * @param payload
 * @returns
 */
export async function pipelinesPostOrders(data: PipelinesOrdersPayload) {
  return request<GLOBAL.GeneralResponse<CMS.PipelinesOrdersData>>('/v1/pipelines/post-orders', {
    method: 'POST',
    data: data,
  });
}

/**
 * pipeline
 * 全部文章
 * @param payload
 * @returns
 */
export async function pipelinesPostOrdersMine(params: CMS.Pagination) {
  return request<GLOBAL.GeneralResponse<CMS.PipelinesOrdersMine>>(
    '/v1/pipelines/post-orders/mine',
    {
      method: 'GET',
      params: params,
    },
  );
}
/**
 * 发布中文章
 * @param params
 * @returns
 */
export async function pipelinesPostOrdersMinePublishing(params: CMS.Pagination) {
  return request<GLOBAL.GeneralResponse<CMS.PipelinesOrdersMine>>(
    '/v1/pipelines/post-orders/mine/publishing',
    {
      method: 'GET',
      params: params,
    },
  );
}

/**
 * 发布完成文章
 * @param params
 * @returns
 */
export async function pipelinesPostOrdersMinePublished(params: CMS.Pagination) {
  return request<GLOBAL.GeneralResponse<CMS.PipelinesOrdersMine>>(
    '/v1/pipelines/post-orders/mine/published',
    {
      method: 'GET',
      params: params,
    },
  );
}

/**
 * 用户请求重新发布失败文章
 * @param id
 * @returns
 */
export async function pipelinesPostOrdersRetryById(id: string) {
  return request<GLOBAL.GeneralResponse<void>>(`/v1/pipelines/post-orders/${id}/retry`, {
    method: 'POST',
  });
}

/**
 * Site Orders Publish
 * @returns
 */
export async function pipelinesSiteOrdersPublish() {
  return request<GLOBAL.GeneralResponse<void>>('/v1/pipelines/site-orders/publish', {
    method: 'POST',
  });
}

export const pipelinesSiteOrdersPublishQueueUrl = '/v1/pipelines/site-orders/mine/publish-in-queue';
export async function pipelinesSiteOrdersPublishQueue(url = pipelinesSiteOrdersPublishQueueUrl) {
  return request<GLOBAL.GeneralResponse<CMS.PipelinesSiteOrdersPublishQueue>>(url, {
    method: 'GET',
  });
}
