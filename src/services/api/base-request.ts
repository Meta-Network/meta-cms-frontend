import { notification } from 'antd';
import { extend } from 'umi-request';

export function extendWithErrorHandler(options = {}) {
  return extend({
    ...options,
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
}
