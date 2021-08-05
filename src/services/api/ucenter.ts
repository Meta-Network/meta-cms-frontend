import { notification } from 'antd';
import { extend } from 'umi-request';

const request = extend({
  prefix: 'https://ucenter-test-api.mttk.net',
  credentials: 'include', // 默认请求是否带上cookie
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

/** 邮箱登录接口 POST /accounts/email/login */
export async function emailLogin(body: API.EmailLoginParams, options?: Record<string, any>) {
  return request<API.GeneralResponse<{user: API.CurrentUser}>>('/accounts/email/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取邮箱验证码 POST /accounts/email/verification-code */
export async function emailGetVerificationCode(
  body: API.VerificationCodeParams,
  options?: Record<string, any>,
) {
  return request('/accounts/email/verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /users/me */
export async function queryCurrentUser(options?: Record<string, any>) {
  return request<{
    data: API.CurrentUser;
  }>('/users/me', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 DELETE /accounts/tokens */
export async function outLogin(options?: Record<string, any>) {
  return request<Record<string, any>>('/accounts/tokens', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 刷新 Tokens 接口 PATCH /accounts/tokens */
export async function refreshTokens(options?: Record<string, any>) {
  return request<{
    data: API.CurrentUser;
  }>('/accounts/tokens', {
    method: 'PATCH',
    ...(options || {}),
  });
}
