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

export async function saveImageCloud(
  { file, name }: { file: string; name: string },
  options?: Record<string, any>,
) {
  // TODO: this api only for testing
  return request<API.GeneralResponse<any>>(
    // 'https://meta-storage-worker-production.metaio-dev.workers.dev',
    // 'https://meta-storage-worker.metaio-dev.workers.dev',
    'http://127.0.0.1:8787',
    {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/octet-stream',
        'file-name': name,
      },
      data: file,
      ...(options || {}),
    },
  );
}
