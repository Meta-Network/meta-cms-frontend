import { notification } from 'antd';
import { extend } from 'umi-request';

const request = extend({
  prefix: 'https://ucenter-test-api.mttk.net',
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

export async function webauthnLogin(body: any) {
  return request<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>>('/accounts/webauthn/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function webauthnSignup(body: any, signature: string) {
  return request<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>>(
    `/accounts/webauthn/signup/${signature}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
    },
  );
}

/** 获取 WebAuthN 验证码 POST /accounts/webauthn/verification-code */
export async function webauthnGetAssertion(body: GLOBAL.VerificationCodeParams) {
  return request<GLOBAL.GeneralResponse<any>>('/accounts/webauthn/generate-assertion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { key: body },
  });
}

/** 获取 WebAuthN 验证码 POST /accounts/webauthn/verification-code */
export async function webauthnGetAttestation(body: GLOBAL.VerificationCodeParams) {
  return request<GLOBAL.GeneralResponse<any>>('/accounts/webauthn/generate-attestation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { key: body },
  });
}

/** 邮箱登录接口 POST /accounts/email/login */
export async function emailLogin(body: GLOBAL.EmailLoginParams) {
  return request<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>>('/accounts/email/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 获取邮箱验证码 POST /accounts/email/verification-code */
export async function emailGetVerificationCode(body: GLOBAL.VerificationCodeParams) {
  return request<GLOBAL.GeneralResponse<{ key: string }>>('/accounts/email/verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 获取当前的用户 GET /users/me */
export async function queryCurrentUser() {
  return request<GLOBAL.GeneralResponse<GLOBAL.CurrentUser>>('/users/me', {
    method: 'GET',
  });
}

/** 获取当前用户所有的邀请码 GET /invitations/mine */
export async function queryInvitations() {
  return request<GLOBAL.GeneralResponse<GLOBAL.Invitation[]>>('/invitations/mine', {
    method: 'GET',
  });
}

/** 更新邀请码的信息 PATCH /invitations/mine */
export async function updateInvitation(signature: string, body: GLOBAL.InvitationInfo) {
  return request<GLOBAL.GeneralResponse<GLOBAL.Invitation>>(`/invitations/${signature}/message`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 退出登录接口 DELETE /accounts/tokens */
export async function outLogin() {
  return request<GLOBAL.GeneralResponse<null>>('/accounts/tokens', {
    method: 'DELETE',
  });
}

/** 刷新 Tokens 接口 PATCH /accounts/tokens */
export async function refreshTokens() {
  return request<GLOBAL.GeneralResponse<GLOBAL.CurrentUser>>('/accounts/tokens', {
    method: 'PATCH',
  });
}

/** 请求 Social Auth 链接接口 POST /social-auth/{platform}/authorize-request */
export async function requestSocialAuth(platform: string, redirectUrl: string) {
  return request<GLOBAL.GeneralResponse<string>>(`/social-auth/${platform}/authorize-request`, {
    data: { redirect_url: redirectUrl },
    method: 'POST',
  });
}

/** 请求 Social Auth Token 验证存在性接口 GET /social-auth/{platform}/token */
export async function getSocialAuthToken(platform: string) {
  return request<GLOBAL.GeneralResponse<{ token: string }>>(`/social-auth/${platform}/token`, {
    method: 'GET',
  });
}

/** 更新用户的个人信息 PATCH /users/me */
export async function updateUserInfo(body: Partial<GLOBAL.UserInfo>) {
  return request<GLOBAL.GeneralResponse<GLOBAL.Invitation>>('/users/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 请求存储 token POST /storage/token */
export async function requestStorageToken() {
  return request<GLOBAL.GeneralResponse<string>>('/storage/token', {
    method: 'POST',
  });
}
