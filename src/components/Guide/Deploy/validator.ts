import { StorageKeys, Storages } from '@/services/constants';

type ValueOf<T> = T[keyof T];

export const validator = (key: ValueOf<StorageKeys>, values: any) => {
  // only if key is not empty and no values return false
  // otherwise (whether there's value exist, or key is just empty)
  // gives true (controlled by case down blow)
  if (!values && key !== '') return false;

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
      const { storage, username } = JSON.parse(values || '{}');
      const providers: GLOBAL.StoreProvider[] = ['GitHub', 'Gitee'];
      return providers.includes(storage) && username;
    }
    case '': {
      return true;
    }
    default:
      return false;
  }
};

export const validating = ({ setStageCompleted, setOnError, updateProcessing }: any) => {
  const validation = Storages.map(({ name, key, value }) => {
    if (name !== '部署') {
      return !validator(key || '', value) ? `${name}：未完成` : null;
    }

    return null;
  });

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
