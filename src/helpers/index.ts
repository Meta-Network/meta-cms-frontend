import { requestStorageToken } from '@/services/api/meta-ucenter';

/**
 * 获取 Token
 */
export const fetchTokenAPI = async () => {
  try {
    const res = await requestStorageToken();
    if (res.statusCode === 201) {
      return res.data;
    } else {
      throw new Error(res.message);
    }
  } catch (e) {
    console.log(e);
    return '';
  }
};
