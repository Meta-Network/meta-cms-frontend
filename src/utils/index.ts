/**
 * string slice
 * @param val
 * @param len
 * @returns
 */
export const strSlice = (val: string, len: number) => {
  return val.length >= len ? `${val.slice(0, len - 3)}...` : val;
};

export const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

/**
 * merged message
 * @param message
 * @returns
 */
export const mergedMessage = (messages: string[]): string =>
  messages.reduce((a: string, b: string) => a + (a && '、') + b, '');
