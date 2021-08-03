// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 邮箱登录接口 POST /accounts/email/login */
export async function emailLogin(body: API.EmailLoginParams, options?: { [key: string]: any }) {
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
  options?: { [key: string]: any },
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
export async function queryCurrentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/users/me', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 DELETE /accounts/tokens */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/accounts/tokens', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 刷新 Tokens 接口 PATCH /accounts/tokens */
export async function refreshTokens(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/accounts/tokens', {
    method: 'PATCH',
    ...(options || {}),
  });
}
