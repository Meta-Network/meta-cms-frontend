// @ts-ignore
/* eslint-disable */

declare namespace API {
  type GeneralResponse<T> = {
    statusCode: number;
    message: string;
    data: T;
  };

  type CurrentUser = {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
    bio: string;
  };

  type UserResponse = CurrentUser;

  type UserInfo = {
    nickname: string;
    avatar: string;
    bio: string;
  };

  type VerificationCodeParams = {
    key: string;
  };

  type EmailLoginParams = {
    account: string;
    verifyCode: string;
    hcaptchaToken: string;
  };

  type InvitationInfo = {
    sub: string;
    message: string;
  };

  type Invitation = {
    id: number;
    sub: string;
    signature: string;
    salt: string;
    issuer: string;
    message: string;
    cause: string;
    invitee_user_id: number;
    inviter_user_id: number;
    matataki_user_id: number;
    expired_at: Date;
    created_at: Date;
    updated_at: Date;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type SiteTheme = {
    name: string;
    description: string;
    link: string;
    image: string;
  };

  type SiteInfo = {
    title: string;
    subtitle: string;
    author: string;
    description: string;
    keywords: string;
    favicon: string;
  };

  type StoreProvider = 'GitHub' | 'Gitee';

  enum Storage {
    ThemeSetting = 'themeSetting',
    StoreSetting = 'storeSetting',
  }
}
