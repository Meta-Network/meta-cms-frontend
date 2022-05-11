declare namespace LoginType {
  type WalletMode = 'login' | 'register';
  type UsersMeUsernameState = {
    username: string;
  };

  type UsersUsernameValidate = {
    isExists: string;
  };

  type AccountsEmailVerifyData = {
    account: string;
  };
  type AccountsEmailVerify = {
    isExists: boolean;
  };

  type AccountsEmailSignupResult = {
    user: {
      id: number;
      username: string;
      nickname: string;
      bio: string;
      avatar: string;
      created_at: string;
      updated_at: string;
    };
    account: {
      account_id: string;
      platform: string;
      user_id: number;
      id: number;
      created_at: string;
      updated_at: string;
    };
  };
}
