import { queryCurrentUser } from '@/services/api/meta-ucenter';
import { useCallback } from 'react';
import { useModel } from 'umi';

export default function useUser() {
  const { setInitialState } = useModel('@@initialState');

  /**
   * refresh User Info
   * 仅重新获取用户信息
   */
  const refreshUserInfo = useCallback(async () => {
    const currentUserResult = await queryCurrentUser();
    if (currentUserResult.statusCode === 200) {
      await setInitialState(
        (s) =>
          ({
            ...s,
            currentUser: currentUserResult.data,
          } as GLOBAL.InitialState),
      );
    }
  }, [setInitialState]);

  return {
    refreshUserInfo,
  };
}
