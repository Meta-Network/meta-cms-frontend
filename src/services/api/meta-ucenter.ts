import { extendWithErrorHandler } from '@/services/api/base-request';
import type { Wallet } from 'use-wallet/dist/cjs/types';

const request = extendWithErrorHandler({
  credentials: 'include',
  prefix: META_UCENTER_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function service(wallet: Wallet, action: 'login' | 'signup') {
  const walletAccount = wallet.account;
  const {
    data: { code },
  } = await request<GLOBAL.GeneralResponse<{ code: string }>>(
    '/accounts/metamask/verification-code',
    {
      method: 'POST',
      data: {
        key: walletAccount,
        hcaptchaToken: 'not-required',
      },
    },
  );
  const message = `\x19Ethereum Signed Message:\n Code Length: ${code.length}; Code: ${code}`;
  const signature = await wallet.ethereum.request({
    method: 'personal_sign',
    params: [message, walletAccount],
  });

  return request<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>>(
    `/accounts/metamask/${action}`,
    {
      method: 'POST',
      data: {
        account: walletAccount,
        signature,
        hcaptchaToken: 'not-required',
      },
    },
  );
}

export async function signup(
  wallet: Wallet,
): Promise<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>> {
  return await service(wallet, 'signup');
}

export async function login(
  wallet: Wallet,
): Promise<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>> {
  return await service(wallet, 'login');
}

export async function webauthnLogin(body: any) {
  return request<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>>('/accounts/webauthn/login', {
    method: 'POST',
    data: body,
  });
}

export async function webauthnSignup(body: any, signature: string) {
  return request<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>>(
    `/accounts/webauthn/signup/${signature}`,
    {
      method: 'POST',
      data: body,
    },
  );
}

/** 获取 WebAuthN 验证码 POST /accounts/webauthn/verification-code */
export async function webauthnGetAssertion(body: GLOBAL.VerificationCodeParams) {
  return request<GLOBAL.GeneralResponse<any>>('/accounts/webauthn/generate-assertion', {
    method: 'POST',
    data: { key: body },
  });
}

/** 获取 WebAuthN 验证码 POST /accounts/webauthn/verification-code */
export async function webauthnGetAttestation(body: GLOBAL.VerificationCodeParams) {
  return request<GLOBAL.GeneralResponse<any>>('/accounts/webauthn/generate-attestation', {
    method: 'POST',
    data: { key: body },
  });
}

/** 邮箱登录接口 POST /accounts/email/login */
export async function emailLogin(body: GLOBAL.EmailLoginParams) {
  return request<GLOBAL.GeneralResponse<{ user: GLOBAL.CurrentUser }>>('/accounts/email/login', {
    method: 'POST',
    data: body,
  });
}

/** 获取邮箱验证码 POST /accounts/email/verification-code */
export async function emailGetVerificationCode(body: GLOBAL.VerificationCodeParams) {
  return request<GLOBAL.GeneralResponse<{ key: string }>>('/accounts/email/verification-code', {
    method: 'POST',
    data: body,
  });
}

/** 获取当前用户的信息 GET /users/me */
export async function queryCurrentUser() {
  return request<GLOBAL.GeneralResponse<GLOBAL.CurrentUser>>('/users/me', {
    method: 'GET',
  });
}

/** 获取当前的用户的账户信息 GET /accounts/mine */
export async function queryMyAccounts() {
  return request<GLOBAL.GeneralResponse<GLOBAL.Account[]>>('/accounts/mine', {
    method: 'GET',
  });
}

/** 退出登录接口 DELETE /accounts/tokens */
export async function logoutAccount() {
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
    data: body,
  });
}

/** 删除一个内容源平台的 token POST /storage/token */
export async function deleteSourcePlatformToken(platform: string) {
  return request<GLOBAL.GeneralResponse<string>>(`/social-auth/${platform}/token`, {
    method: 'DELETE',
  });
}

/** 请求存储 token POST /storage/token */
export async function requestStorageToken() {
  return request<GLOBAL.GeneralResponse<string>>('/storage/token', {
    method: 'POST',
  });
}

/**
 * 验证用户名是否存在
 * @param data
 * @returns
 */
export const usersUsernameValidate = (data: LoginType.UsersMeUsernameState) => {
  return request<GLOBAL.GeneralResponse<LoginType.UsersUsernameValidate>>(
    '/users/username/validate',
    {
      method: 'POST',
      data,
    },
  );
};

/**
 * 更新用户的用户名
 * @param data
 * @returns
 */
export const setUsername = (data: LoginType.UsersMeUsernameState) => {
  return request<GLOBAL.GeneralResponse<string>>('/users/me/username', {
    method: 'PUT',
    data,
  });
};
