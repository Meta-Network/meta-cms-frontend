// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 邮箱登录接口 POST /accounts/email/login */
export async function emailLogin(body: API.EmailLoginParams, options?: { [key: string]: any }) {
  return request<API.GeneralResponse<CurrentUser>>('/accounts/email/login', {
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
  return request<API.LoginResult>('/accounts/email/verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /users/me */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/users/me', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}
