import { extendWithErrorHandler } from '@/services/api/base-request';
import { getSocialAuthToken, requestStorageToken } from '@/services/api/meta-ucenter';

const request = extendWithErrorHandler();

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

/** 上传文件到 IPFS */
export async function uploadToIpfs(form: FormData, token: string) {
  return request<GLOBAL.GeneralResponse<Storage.Fleek>>(META_STORAGE_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: form,
  });
}

/** 上传文件到 IPFS */
export async function uploadFileToIpfs(file: File) {
  const tokenRequest = await requestStorageToken();
  const token = tokenRequest.data;

  const form = new FormData();
  form.append('file', file);

  return request<GLOBAL.GeneralResponse<Storage.Fleek>>(META_STORAGE_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: form,
  });
}

/**
 * file upload to ipfs
 */
export async function fileUploadToIpfs(file: FormData, token: string) {
  return request<GLOBAL.GeneralResponse<Storage.Fleek>>(META_STORAGE_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: file,
  });
}
