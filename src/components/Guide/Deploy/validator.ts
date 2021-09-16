import { isDomainForbidden } from '@/services/api/meta-cms';
import { StorageKeys, Storages } from '@/services/constants';

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
      return providers.includes(storage) && username && repo;
    }
    case '': {
      return true;
    }
    default:
      return false;
  }
};

export const validating = async ({ setStageCompleted, setOnError, updateProcessing }: any) => {
  const validation = await Promise.all(
    Storages.map(async ({ name, key, value }) => {
      if (name !== '部署') {
        const isSuccess = await validator(key || '', value);
        return isSuccess ? null : `${name}：未完成`;
      }
      return null;
    }),
  );

  const validated = validation.every((e) => e === null);

  if (validated) {
    updateProcessing({ message: '校验设置成功。', state: 'success' });
    setStageCompleted(true);
  } else {
    updateProcessing({
      message: '校验设置失败。请检查以下您没有配置的设置。',
      state: 'error',
    });
    validation
      .filter((e) => e)
      .forEach((e) => {
        updateProcessing({ message: e as string, state: 'error' });
      });
    setOnError(true);
  }
};
