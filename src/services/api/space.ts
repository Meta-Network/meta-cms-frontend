/**
 * get space tags api
 * @param url
 * @returns
 */
export const spaceTagsAPI = async (url: string): Promise<Space.Tags[] | undefined> => {
  try {
    const response = await fetch(`https://${url}/api/tags.json`);
    return await response.json();
  } catch (e) {
    console.log(e);
    return;
  }
};
