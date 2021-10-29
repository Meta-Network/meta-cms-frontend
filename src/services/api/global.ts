import { getSocialAuthToken } from '@/services/api/meta-ucenter';
import { notification } from 'antd';
import { extend } from 'umi-request';

const request = extend({
  errorHandler: (error: any) => {
    // eslint-disable-next-line no-console
    console.log(error.data);
    const { data, response } = error;
    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    return data;
  },
});

/** 获取本用户 GitHub 的所有 repo 名称  */
export async function getGithubReposName(): Promise<string[]> {
  const token = (await getSocialAuthToken('github'))?.data?.token;
  if (!token) {
    throw new ReferenceError('Unable to get GitHub OAuth token.');
  }

  const res = await request<{ repo: { name: string } }[]>('https://api.github.com/user/repos', {
    method: 'GET',
    headers: {
      accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`,
    },
    params: {
      // max is 100, so user who has more than 100 repos, this doesn't work
      per_page: 100,
    },
  });
  console.log(res);

  // return repos name
  return res.map((repo: any) => repo.name);
}

/** 获取 GitHub 用户名 */
export async function getUsernameOfStore(name: string): Promise<string> {
  switch (name.toLowerCase()) {
    case 'github': {
      const token = (await getSocialAuthToken('github'))?.data?.token;
      if (!token) {
        throw new ReferenceError('Unable to get GitHub OAuth token.');
      }

      const res = await request<{ login: string }>('https://api.github.com/user', {
        method: 'GET',
        headers: {
          Authorization: `token ${token}`,
        },
      });

      return res.login;
    }
    default: {
      throw new ReferenceError('Name is not supported.');
    }
  }
}

/** 上传并更新用户头像 */
export async function uploadImageIPFS(file: FormData, token: string) {
  return request<GLOBAL.GeneralResponse<any>>(META_STORAGE_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: file,
  });
}
