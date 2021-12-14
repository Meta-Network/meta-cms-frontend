import { fileUploadToIpfs } from '@/services/api/global';
import {
  getDefaultSiteConfig,
  imageUploadByUrl,
  postById,
  publishPostById,
  publishPost,
  publishPostAsDraft,
  updatePost,
  getStorageSetting,
  getPublisherSetting,
} from '@/services/api/meta-cms';
import { requestStorageToken } from '@/services/api/meta-ucenter';

/**
 * 获取 Token
 */
export const fetchTokenAPI = async () => {
  try {
    const res = await requestStorageToken();
    if (res.statusCode === 201) {
      return res.data;
    }
    throw new Error(res.message);
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * image upload by url api
 * @param url
 * @returns
 */
export const imageUploadByUrlAPI = async (url: string) => {
  try {
    const res = await imageUploadByUrl(url);
    if (res.statusCode === 201) {
      return res.data;
    }
    throw new Error(res.message);
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * upload To Ipfs API
 * @param formData
 * @returns
 */
export const uploadToIpfsAPI = async (formData: FormData): Promise<Storage.Fleek | undefined> => {
  try {
    const token = await fetchTokenAPI();
    if (!token) {
      console.error('no token');
      return;
    }

    const res = await fileUploadToIpfs(formData, token);
    if (res.statusCode === 201) {
      return res.data;
    } else {
      throw new Error(res.message);
    }
  } catch (e) {
    console.log(e);
    return;
  }
};

/**
 * publish post as draft
 * @param id
 * @returns
 */
export const publishPostAsDraftAPI = async (id: number) => {
  try {
    const res = await publishPostAsDraft(id);
    if (res.statusCode === 201) {
      return res.data;
    }
    throw new Error(res.message);
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * get post by id
 * @param id
 * @returns
 */
export const postByIdAPI = async (id: number) => {
  try {
    const res = await postById(id);
    if (res.statusCode === 200) {
      return res.data;
    }
    throw new Error(res.message);
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * get default site config
 */
export const getDefaultSiteConfigAPI = async (): Promise<CMS.SiteConfiguration | undefined> => {
  try {
    const res = await getDefaultSiteConfig();
    if (res.statusCode === 200) {
      return res.data;
    }
    throw new Error(res.message);
  } catch (e) {
    console.log(e);
    return;
  }
};

/**
 * publish post
 * @param postId
 * @param configIds
 * @returns
 */
export const publishPendingPostAPI = async (postId: number, configIds: number[]) => {
  try {
    const res = await publishPostById(postId, configIds);
    if (res.statusCode === 201) {
      return res.data;
    }
    throw new Error(res.message);
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * publishPostAPI
 * @param data
 * @returns
 */
export const publishPostAPI = async (data: CMS.LocalDraft) => {
  try {
    const res = await publishPost(data);
    if (res.statusCode === 201) {
      return res.data;
    }
    throw new Error(res.message);
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * update draft
 */
export const updatePostAPI = async (id: number, data: CMS.LocalDraft) => {
  try {
    const res = await updatePost(id, data);
    if (res.statusCode === 200) {
      return res.data;
    }
    throw new Error(res.message);
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * get storage setting api
 * @param configId
 * @param platform
 * @returns
 */
export const getStorageSettingAPI = async (
  configId: number,
  platform: CMS.StoragePlatform,
): Promise<CMS.StoragePlatformSetting | undefined> => {
  const res = await getStorageSetting(configId, platform);
  if (res.statusCode === 200) {
    return res.data;
  } else {
    console.log(res.message);
    return;
  }
};

/**
 * get publisher setting api
 * @param configId
 * @param platform
 * @returns
 */
export const getPublisherSettingAPI = async (
  configId: number,
  platform: CMS.StoragePlatform,
): Promise<CMS.PublisherPlatformSetting | undefined> => {
  const res = await getPublisherSetting(configId, platform);
  if (res.statusCode === 200) {
    return res.data;
  } else {
    console.log(res.message);
    return;
  }
};
