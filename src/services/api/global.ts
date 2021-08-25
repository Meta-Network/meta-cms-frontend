import { notification } from 'antd';
import { extend } from 'umi-request';

const request = extend({
  errorHandler: (error: any) => {
    const { response } = error;
    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    throw error;
  },
});

export async function saveImageCloud(image: string, options?: Record<string, any>) {
  // TODO: this api only for testing
  return request<API.GeneralResponse<{ url: string }>>('https://api.imgbb.com/1/upload', {
    method: 'POST',
    params: {
      key: 'ff13afcc789a0c0e8951e5ac9c7a3e2b',
    },
    referrerPolicy: 'no-referrer',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: {
      image,
    },
    ...(options || {}),
  });
}
