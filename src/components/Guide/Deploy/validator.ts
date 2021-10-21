import { getGithubReposName } from '@/services/api/global';
import { isDomainForbidden } from '@/services/api/meta-cms';
import { StorageKeys } from '@/services/constants';

type ValueOf<T> = T[keyof T];

export const validator = async (key: ValueOf<StorageKeys>, values: any) => {
  // only if key is not empty and no values return false
  // otherwise (whether there's value exist, or key is just empty)
  // gives true (controlled by case down blow)
  if (!values && key !== '') return false;

  switch (key) {
    case StorageKeys.DomainSetting: {
      return !(await isDomainForbidden(JSON.parse(values)));
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
      return keys.every((setting) => JSON.parse(values || '{}')[setting]);
    }
    case StorageKeys.ThemeSetting: {
      return JSON.parse(values) > 0;
    }
    case StorageKeys.StoreSetting: {
      const { storage, username, repo } = JSON.parse(values || '{}');
      const providers: GLOBAL.StoreProvider[] = ['GitHub', 'Gitee'];

      const repoNamesRequest = await getGithubReposName();
      const repoNames = repoNamesRequest.map((name) => name.toLowerCase());

      return providers.includes(storage) && username && repo && !repoNames.includes(repo);
    }
    case '': {
      return true;
    }
    default:
      return false;
  }
};
