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

export async function webauthnLogin(body: any, options?: Record<string, any>) {
  return request<API.GeneralResponse<{ user: API.CurrentUser }>>('/accounts/webauthn/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function webauthnSignup(body: any, signature: string, options?: Record<string, any>) {
  return request<API.GeneralResponse<{ user: API.CurrentUser }>>(
    `/accounts/webauthn/signup/${signature}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** 获取 WebAuthN 验证码 POST /accounts/webauthn/verification-code */
export async function webauthnGetAssertion(
  body: API.VerificationCodeParams,
  options?: Record<string, any>,
) {
  return request<API.GeneralResponse<any>>('/accounts/webauthn/generate-assertion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { key: body },
    ...(options || {}),
  });
}

/** 获取 WebAuthN 验证码 POST /accounts/webauthn/verification-code */
export async function webauthnGetAttestation(
  body: API.VerificationCodeParams,
  options?: Record<string, any>,
) {
  return request<API.GeneralResponse<any>>('/accounts/webauthn/generate-attestation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { key: body },
    ...(options || {}),
  });
}

/** 邮箱登录接口 POST /accounts/email/login */
export async function emailLogin(body: API.EmailLoginParams, options?: Record<string, any>) {
  return request<API.GeneralResponse<{ user: API.CurrentUser }>>('/accounts/email/login', {
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
  return request<API.GeneralResponse<{ key: string }>>('/accounts/email/verification-code', {
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
  return request<API.GeneralResponse<API.CurrentUser>>('/users/me', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取当前用户所有的邀请码 GET /invitations/mine */
export async function queryInvitations(options?: Record<string, any>) {
  return request<API.GeneralResponse<API.Invitation[]>>('/invitations/mine', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新邀请码的信息 PATCH /invitations/mine */
export async function updateInvitation(
  signature: string,
  body: API.InvitationInfo,
  options?: Record<string, any>,
) {
  return request<API.GeneralResponse<API.Invitation>>(`/invitations/${signature}/message`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 退出登录接口 DELETE /accounts/tokens */
export async function outLogin(options?: Record<string, any>) {
  return request<API.GeneralResponse<null>>('/accounts/tokens', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 刷新 Tokens 接口 PATCH /accounts/tokens */
export async function refreshTokens(options?: Record<string, any>) {
  return request<API.GeneralResponse<API.CurrentUser>>('/accounts/tokens', {
    method: 'PATCH',
    ...(options || {}),
  });
}

/** 请求 Social Auth 链接接口 POST /social-auth/{platform}/authorize-request */
export async function requestSocialAuth(
  platform: string,
  redirectUrl: string,
  options?: Record<string, any>,
) {
  return request<API.GeneralResponse<string>>(`/social-auth/${platform}/authorize-request`, {
    data: { redirect_url: redirectUrl },
    method: 'POST',
    ...(options || {}),
  });
}

/** 更新用户的个人信息 PATCH /users/me */
export async function updateUserInfo(body: Partial<API.UserInfo>, options?: Record<string, any>) {
  return request<API.GeneralResponse<API.Invitation>>('/users/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传并更新用户头像 PUT /users/me/avatar */
export async function uploadAvatar(
  { file, name }: { file: ArrayBuffer; name: string },
  options?: Record<string, any>,
) {
  return request<API.GeneralResponse<any>>('/users/me/avatar', {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/octet-stream',
      'file-name': name,
    },
    data: file,
    ...(options || {}),
  });
}
