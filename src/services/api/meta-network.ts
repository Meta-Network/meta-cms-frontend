/*
import { extend } from 'umi-request';

const request = extend({
  prefix: META_NETWORK_API || 'https://meta-network-api.testenv.mttk.net/',
});

// 获取当前用户的地块 GET /hex-grids/mine
export async function getMyGrid(options?: Record<string, any>) {
  return request<API.GeneralResponse<any>>('/hex-grids/mine', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });

  return { data: {} };
}
*/
