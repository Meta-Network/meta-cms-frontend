/**
 * string slice
 * @param val
 * @param len
 * @returns
 */
export const strSlice = (val: string, len: number) => {
  return val.length >= len ? `${val.slice(0, len - 3)}...` : val;
};
