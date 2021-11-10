import { getGithubReposName } from '@/services/api/global';
import { isDomainForbidden } from '@/services/api/meta-cms';
import { StorageKeys } from '@/services/constants';

type ValueOf<T> = T[keyof T];

const cache = {};

export const validator = async (key: ValueOf<StorageKeys>, values: any) => {
  // return false when the key is not empty and no values
  // otherwise (whether there's value exists, or the key is empty) it's controlled by the following cases
  if (key !== '' && !values) return false;
  let result: boolean = false;

  // return cached result if the values are the same
  if (cache[key as string]?.value === values) {
    return cache[key as string].result;
  }

  switch (key) {
    case StorageKeys.DomainSetting: {
      result = !(await isDomainForbidden(JSON.parse(values)));
      break;
    }
    case StorageKeys.SiteSetting: {
      const keys: (keyof GLOBAL.SiteSetting)[] = [
        'title',
        'subtitle',
        'author',
        'description',
        'language',
        'keywords',
        'favicon',
      ];
      result = keys.every((setting) => JSON.parse(values || '{}')[setting]);
      break;
    }
    case StorageKeys.ThemeSetting: {
      result = JSON.parse(values) > 0;
      break;
    }
    case StorageKeys.StoreSetting: {
      const { storage, username, repos } = JSON.parse(values || '{}');
      const providers: GLOBAL.StoreProvider[] = ['GitHub', 'Gitee'];

      const repoNamesRequest = await getGithubReposName();
      const repoNames = repoNamesRequest.map((name) => name.toLowerCase());

      result =
        providers.includes(storage) &&
        username &&
        repos &&
        !repoNames.includes(repos.storeRepo) &&
        !repoNames.includes(repos.publishRepo);
      break;
    }
    case '': {
      result = true;
      break;
    }
    default: {
      result = false;
      break;
    }
  }
  if (key) {
    cache[key as string] = {
      value: values,
      result: result,
    };
  }
  return result;
};
