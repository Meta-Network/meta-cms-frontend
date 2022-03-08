/**
 * string slice
 * @param val
 * @param len
 * @returns
 */
export const strSlice = (val: string, len: number) => {
  return val.length >= len ? `${val.slice(0, len - 3)}...` : val;
};

/**
 * hash slice
 * @param val
 * @param start
 * @param end
 * @returns
 */
export const hashSlice = (val: string, start: number = 6, end: number = 6) => {
  return val.slice(0, start) + '......' + val.slice(-end);
};

export const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

/**
 * merged message
 * @param message
 * @returns
 */
export const mergedMessage = (messages: string[]): string =>
  messages.reduce((a: string, b: string) => a + (a && '、') + b, '');

export const userHasSite = (initialState: GLOBAL.InitialState | undefined) =>
  initialState?.siteConfig &&
  initialState.siteConfig.status !== 'CONFIGURED' &&
  initialState.siteConfig.status !== 'DEPLOY_FAILED';

/**
 * 有效 url
 * @param url
 * @returns
 */
export const isValidUrl = (url: string) => {
  try {
    return !!new URL(url);
  } catch (e) {
    console.log(e);
    return false;
  }
};
