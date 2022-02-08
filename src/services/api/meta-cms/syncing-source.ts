import request from './request';

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
        // it should has an entry to bind platform
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

/**
 * Decrypt restricted matataki post
 */
export async function decryptMatatakiPost(iv: string, encryptedData: string) {
  const response = await request<GLOBAL.GeneralResponse<MATATAKI.PostMetadata>>(
    `/post/decrypt/matataki`,
    {
      method: 'POST',
      data: { iv, encryptedData },
    },
  );

  return response.data;
}
