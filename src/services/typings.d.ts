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

  type VerificationCodeParams = {
    key: string;
  };

  type EmailLoginParams = {
    email: string;
    verifyCode: string;
    hcaptchaToken: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
