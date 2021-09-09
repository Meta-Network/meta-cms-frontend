import { notification } from 'antd';
import { extend } from 'umi-request';

const request = extend({
  errorHandler: (error: any) => {
    // eslint-disable-next-line no-console
    console.log(error.data);
    const { data, response } = error;
    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    return data;
  },
});

/** 获取 GitHub 用户名 */
export async function getGithubUsername(token: string): Promise<string> {
  const res = await request<any>('https://api.github.com/user', {
    method: 'GET',
    headers: {
      Authorization: `token ${token}`,
    },
  });

  // just return the username as result
  return res.login;
}

/** 上传并更新用户头像 */
export async function uploadAvatar(file: FormData, token: string) {
  return request<GLOBAL.GeneralResponse<any>>(
    META_STORAGE_API || 'https://meta-storage-koa-gateway.vercel.app/fleek/storage',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: file,
    },
  );
}
