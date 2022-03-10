import request from 'umi-request';

/**
 * get space tags api
 * @param url
 * @returns
 */
export const spaceTagsAPI = async (url: string): Promise<Space.Tags[]> => {
  try {
    return await request(`https://${url}/api/tags.json`, {
      method: 'GET',
    });
  } catch (e) {
    console.log(e);
    return [];
  }
};
