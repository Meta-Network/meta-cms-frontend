import { notification } from 'antd';
import { extend } from 'umi-request';

const request = extend({
  errorHandler: (error: any) => {
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

/** 上传并更新用户头像 PUT /users/me/avatar */
export async function uploadAvatar(file: FormData, token: string) {
  return request<GLOBAL.GeneralResponse<any>>(
    'https://meta-storage-koa-gateway.vercel.app/fleek/storage',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: file,
    },
  );
}
