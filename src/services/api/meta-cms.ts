import { notification } from 'antd';
import { extend } from 'umi-request';

const request = extend({
  prefix: 'https://meta-cms-api-dev.mttk.net',
  credentials: 'include', // 默认请求是否带上cookie
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

/** 提交新的站点信息 POST /site/info */
export async function postSiteInfo(body: CMS.PostSiteInfo) {
  return request<GLOBAL.GeneralResponse<any>>('/site/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 提交新的站点设置 POST /site/config */
export async function postSiteConfig(body: CMS.PostSiteConfig) {
  return request<GLOBAL.GeneralResponse<any>>('/site/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
