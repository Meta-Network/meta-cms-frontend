import { extendWithErrorHandler } from '@/services/api/base-request';

const request = extendWithErrorHandler({
  headers: {},
});

/**
 * get space tags api
 * @param url
 * @returns
 */
export const spaceTagsAPI = async (url: string): Promise<Space.Tags[] | undefined> => {
  try {
    return await request(`https://${url}/api/tags.json`, {
      method: 'GET',
    });
  } catch (e) {
    console.log(e);
    return;
  }
};
