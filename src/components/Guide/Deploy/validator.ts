import { Storage, StorageKeys, StorageNames } from '@/services/constants';

type ValueOf<T> = T[keyof T];

const getStorages = () =>
  // [ {name, key, value: 'valueHere'}, ... ]
  Object.entries(StorageNames).map(([name, key]) => ({
    name,
    key,
    value: key ? Storage.get(key) : key,
  }));

const validator = (key: ValueOf<StorageKeys>, values: any) => {
  switch (key) {
    case StorageKeys.SiteInfo: {
      if (!values) return false;
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

export default ({ setStageCompleted, onError, setOnError, updateProcessing }: any) => {
  if (onError) {
    return;
  }

  const validation = getStorages().map(({ name, key, value }) =>
    !validator(key || '', value) ? `${name}：未完成` : null,
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
