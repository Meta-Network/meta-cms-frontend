import { extendWithErrorHandler } from '@/services/api/base-request';

const request = extendWithErrorHandler({
  credentials: 'include',
  prefix: META_NETWORK_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 获取当前用户所占据的地块，没有地块则返回结果不含 {data}
 * @returns {Promise<GLOBAL.GeneralResponse<{user: NETWORK.HexGrid}>>}
 */
export async function getMyHexGrid() {
  return request<GLOBAL.GeneralResponse<{ user: NETWORK.HexGrid }>>('/hex-grids/mine', {
    method: 'GET',
  });
}
