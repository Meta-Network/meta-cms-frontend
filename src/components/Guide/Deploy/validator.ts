import { StorageKeys } from '@/services/constants';

type ValueOf<T> = T[keyof T];

const validator = (key: ValueOf<StorageKeys>, values: any) => {
  switch (key) {
    case StorageKeys.SiteInfo: {
      const keys: (keyof GLOBAL.SiteInfo)[] = [
        'title',
        'subtitle',
        'author',
        'description',
        'language',
        'keywords',
        'favicon',
      ];
      return keys.every((setting) => JSON.parse(values)[setting]);
    }
    case StorageKeys.ThemeSetting: {
      return JSON.parse(values) > 0;
    }
    case StorageKeys.StoreSetting: {
      const providers: GLOBAL.StoreProvider[] = ['GitHub', 'Gitee'];
      return providers.includes(values);
    }
    case '':
      return true;
    default:
      return false;
  }
};

export default validator;
