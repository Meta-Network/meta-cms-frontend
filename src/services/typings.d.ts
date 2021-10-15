declare namespace CMS {
  type SourceStatusResponse = {
    id: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    platform: string;
    accessToken: string;
    active: boolean;
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

  type SiteInfoSettingRequest = {
    title: string;
    subtitle: string;
    description: string;
    author: string;
    keywords: string[];
    favicon: string;
  };

  type SiteConfigSettingRequest = Partial<{
    language: string;
    timezone: string;
    templateId: number;
    domain: string;
    metaSpacePrefix: string;
  }>;

  type SiteStorageSettingRequest = Partial<{
    userName: string;
    repoName: string;
    branchName: string;
    lastCommitHash?: string;
    dataType: 'HEXO';
    useGitProvider: boolean;
  }>;

  type SitePublishSettingRequest = Partial<{
    userName: string;
    repoName: string;
    branchName: string;
    lastCommitHash?: string;
    dataType: 'HEXO';
    useGitProvider: boolean;
    publishDir: string;
  }>;

  type SiteConfiguration = {
    language: string;
    timezone: string;
    templateId: number;
    domain: string;
    storeType: string;
    storeProviderId: number;
    cicdType: string;
    cicdProviderId: number;
    publisherType: string;
    publisherProviderId: number;
    cdnType: string;
    cdnProviderId: number;
    status: string;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    metaSpacePrefix: string;
    siteInfo: {
      subtitle: string;
      description: string;
      author: string;
      keywords: string[];
      favicon: string;
      id: number;
      createdAt: Date;
      updatedAt: Date;
      userId: number;
      title: string;
    };
  };

  type LocalDraft = {
    title: string;
    cover: string;
    summary: string;
    tags: string[];
    categories: string[];
    content: string;
  };

  type Draft = {
    userId: number;
    title: string;
    cover: string;
    summary: string | null;
    platform: string;
    source: string;
    state: string;
    categories: string[] | null;
    tags: string[];
    id: number;
    createdAt: Date;
    updatedAt: Date;
    content?: string;
  };

  type Post = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    title: string;
    cover: string;
    summary: string;
    platform: string;
    source: string;
    state: string;
    category: string;
    tags: string[];
    siteConfigRelas: {
      id: number;
      createdAt: Date;
      updatedAt: Date;
      state: 'SUCCESS';
    }[];
  };

  type ExistsPostsResponse = {
    items: Post[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
    links: {
      first: string;
      previous: string;
      next: string;
      last: string;
    };
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
    timezone: string;
    language: string;
    description: string;
    keywords: string[];
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

  type SourcePlatformProperties = {
    name: string;
    active: boolean;
  };

  type SourcePlatforms = {
    matataki: SourcePlatformProperties;
  };

  type StoreProvider = 'GitHub' | 'Gitee';
}
