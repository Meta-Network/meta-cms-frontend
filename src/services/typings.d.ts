declare namespace CMS {
  type PostSiteInfo = {
    userId: number;
    title: string;
    subtitle: string;
    description: string;
    author: string;
    keywords: string[];
    favicon: string;
  };

  type PostSiteConfig = {
    language: string;
    timezone: string;
    templateId: number;
    domain: string;
  };

  type PostStorageGithub = {
    userName: string;
    repoName: string;
    branchName: string;
    lastCommitHash?: string;
    dataType: 'HEXO';
    useGitProvider: boolean;
  };

  type ThemeTemplatesResponse = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    templateName: string;
    templateType: string;
    templateDescription: string;
    repoUrl: string;
    branchName: string;
    themeName: string;
    previewImage: string;
    previewSite: string;
  };
}

declare namespace GLOBAL {
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

  type SiteSetting = {
    title: string;
    subtitle: string;
    author: string;
    language: string;
    description: string;
    keywords: string;
    favicon: string;
  };

  type LogMessagesTemplate = {
    message: string;
    state: 'info' | 'error' | 'success' | 'null';
  };

  type StoreSetting = {
    storage: string;
    username: string;
    repo?: string;
  };

  type StoreProvider = 'GitHub' | 'Gitee';
}
