// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./constants.ts" />

declare namespace CMS {
  type SourceStatusResponse = {
    id: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    username: string;
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
    lastPublishedAt: string;
    siteInfo: {
      title: string;
      subtitle: string;
      description: string;
      author: string;
      keywords: string[];
      favicon: string;
      id: number;
      createdAt: Date;
      updatedAt: Date;
      userId: number;
    };
  };

  type MetadataStorageType = 'ipfs';

  type metadata = {
    authorDigestRequestMetadataStorageType: MetadataStorageType;
    authorDigestRequestMetadataRefer: string;
    authorDigestSignatureMetadataStorageType: MetadataStorageType;
    authorDigestSignatureMetadataRefer: string;
  };

  type LocalDraft = {
    title?: string;
    cover?: string;
    summary?: string;
    tags?: string[];
    categories?: string[];
    content?: string;
    license?: string;
    authorDigestRequestMetadataStorageType?: MetadataStorageType;
    authorDigestRequestMetadataRefer?: string;
    authorDigestSignatureMetadataStorageType?: MetadataStorageType;
    authorDigestSignatureMetadataRefer?: string;
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
    license: string;
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
    titleInStorage: string;
    cover: string;
    summary: string;
    platform: SyncPlatform;
    source: string;
    state: 'drafted' | 'pending';
    category: string;
    tags: string[];
    license: string;
    siteConfigRelas: {
      id: number;
      createdAt: Date;
      updatedAt: Date;
      state: 'SUCCESS';
    }[];
  } & PostMetadata;

  type PostMetadata = {
    authorPublicKey: string;
    authorDigestRequestMetadataRefer: string;
    authorDigestRequestMetadataStorageType: MetadataStorageType;
    authorDigestSignatureMetadataRefer: string;
    authorDigestSignatureMetadataStorageType: MetadataStorageType;
    serverVerificationMetadataRefer: string;
    serverVerificationMetadataStorageType: MetadataStorageType;
  };

  type PostStoragePublish = {
    posts: Post[];
    stateIds: number[];
  };

  // TODO： 暂时不知道怎么导入，先重复写一份
  enum TaskCommonState {
    TODO = 'TODO',
    DOING = 'DOING',
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
  }

  enum PostAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
  }

  type FetchPostsStorageState = {
    action: PostAction;
    createdAt: Date;
    id: number;
    postTitle: string;
    siteConfig: CMS.SiteConfiguration;
    state: TaskCommonState;
    taskWorkspace: string;
    updatedAt: Date;
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

  type StoragePlatform = 'github' | 'gitee';
  type StoragePlatformSetting = {
    lastCommitHash: string | null;
    useGitProvider: boolean;
    id: number;
    createdAt: string;
    updatedAt: string;
    userName: string;
    repoName: string;
    branchName: string;
    dataType: 'HEXO' | string;
  };
  type PublisherPlatformSetting = {
    lastCommitHash: string | null;
    useGitProvider: boolean;
    id: number;
    createdAt: string;
    updatedAt: string;
    userName: string;
    repoName: string;
    branchName: string;
    dataType: 'HEXO' | string;
    publishDir: 'public';
  };
  type PostState = 'pending' | 'published';
  type PostStoragePublishData = {
    configIds: number[];
    posts: {
      title: string;
      titleInStorage: string;
      cover: string;
      summary: string;
      tags: string[];
      categories: string[];
      source: string;
      license: string;
      platform: string;
      state: PostState;
      authorDigestRequestMetadataStorageType: MetadataStorageType;
      authorDigestRequestMetadataRefer: string;
      authorDigestSignatureMetadataStorageType: MetadataStorageType;
      authorDigestSignatureMetadataRefer: string;
      createdAt: string;
      updatedAt: string;
    }[];
  };
  // 可能会有变动 暂时命名区分
  type PostStorageUpdateData = PostStoragePublishData;

  // V1 pipeline
  type PipelinesOrdersData = {
    postOrder: {
      id: string;
      userId: 34;
      serverVerificationId: string;
      postMetadata: {
        id: string;
        title: string;
        cover: string;
        summary: string;
        categories: string;
        tags: string;
        license: string;
        authorPublicKey: string;
        digest: string;
        createdAt: Date;
      };
      createdAt: Date;
      updatedAt: Date;
      submitState: 'pending';
      publishState: 'pending';
      certificateStorageType: '';
      certificateId: '';
      certificateState: '';
      postTaskId: '';
      publishSiteOrderId: 0;
      publishSiteTaskId: '';
    };
    serverVerification: {
      '@context': 'https://metanetwork.online/ns/cms';
      '@type': 'server-verification-sign';
      '@version': '2.0.0';
      signatureAlgorithm: 'curve25519';
      publicKey: string;
      nonce: string;
      claim: string;
      signature: string;
      ts: number;
      reference: [
        {
          refer: string;
          rel: 'content';
          body: {
            '@context': 'https: //metanetwork.online/ns/cms';
            '@type': 'author-post-digest';
            '@version': '1.1.0';
            algorithm: 'sha256';
            categories: string;
            content: string;
            cover: string;
            license: string;
            summary: string;
            tags: string;
            title: string;
            digest: string;
            ts: number;
          };
        },
        {
          refer: string;
          rel: 'request';
          body: {
            '@context': 'https://metanetwork.online/ns/cms';
            '@type': 'author-digest-sign';
            '@version': '1.0.0';
            signatureAlgorithm: 'curve25519';
            publicKey: string;
            digest: string;
            nonce: string;
            claim: string;
            signature: string;
            ts: number;
          };
        },
      ];
    };
  };

  type PipelinesOrdersItem = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    submitState: PipelineOrderTaskCommonState;
    publishState: PipelineOrderTaskCommonState;
    serverVerificationId: string;
    certificateStorageType: GatewayType;
    certificateId: string;
    certificateState: PipelineOrderTaskCommonState;
    postTaskId: string;
    publishSiteOrderId: number;
    publishSiteTaskId: string;
    postMetadata: {
      id: string;
      createdAt: Date;
      title: string;
      cover: string;
      summary: string;
      categories: string;
      tags: string;
      license: string;
      authorPublicKey: string;
      digest: string;
    };
  };
  type PipelinesOrdersMine = {
    items: PipelinesOrdersItem[];
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

  type Pagination = {
    page: number;
    limit: number;
  };

  type PostCount = {
    allPostCount: number;
    publishingCount: number;
    publishedCount: number;
    publishingAlertFlag: boolean;
  };

  type PipelinesSiteOrder = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    siteConfigId: number;
    serverVerificationId: string;
    publishSiteTaskId: string;
    state: PipelineOrderTaskCommonState;
  };

  type PipelinesSiteOrdersPublishQueue = Record<'pending' | 'doing', PipelinesSiteOrder>;
}

declare namespace GLOBAL {
  type InitialState = {
    currentUser: GLOBAL.CurrentUser | undefined;
    siteConfig: CMS.SiteConfiguration | undefined;
    fetchUserInfo: () => Promise<GLOBAL.CurrentUser | undefined>;
    localDraftCount: number;
  } & CMS.PostCount;

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

  type Account = {
    id: number;
    user_id: number;
    account_id: string;
    platform: string;
    created_at: Date;
    updated_at: Date;
  };

  type UserResponse = CurrentUser;

  type UserInfo = {
    nickname: string;
    avatar: string;
    bio: string;
  };

  type VerificationCodeParams = {
    key: string;
    hcaptchaToken?: string;
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

  type StorageSetting = {
    storage: string;
    username: string;
    repos?: {
      storageRepo: string;
      publishRepo: string;
    };
  };

  type SourcePlatformStatusProperties = {
    name: string;
    username: string;
    active: boolean;
  };

  type SourcePlatformStatus = {
    matataki: SourcePlatformStatusProperties;
  };

  type StorageProvider = 'GitHub' | 'Gitee';

  type InvitationsValidateProps = {
    invitation: string;
  };

  type InvitationsValidateState = {
    available: boolean;
    exists: boolean;
  };
}

declare namespace Storage {
  type Fleek = {
    hash: string;
    hashV0: string;
    key: string;
    bucket: string;
    publicUrl: string;
  };
}

declare namespace Space {
  type Tags = {
    name: string;
    path: string;
    count: number;
  };
}

declare namespace NETWORK {
  type HexGrid = {
    createdAt: Date;
    updatedAt: Date;
    id: number;
    siteName: string;
    x: number;
    y: number;
    z: number;
    userId: number;
    username: string;
    userNickname: string;
    userBio: string;
    userAvatar: string;
    subdomain: string;
    metaSpaceSiteId: number;
    metaSpaceSiteUrl: string;
    metaSpaceSiteProofUrl: string;
    inviterUserId: number;
  };
}

declare namespace MATATAKI {
  type GenericPostMetadata = {
    content?: string;
    iv?: string;
    encryptedData?: string;
  };
  type PostMetadata = {
    content: string;
  };
}
