export enum DeployStages {
  pending,
  validating,
  submitting,
  deploying,
}

export class Storage {
  static get(target: string) {
    return window.localStorage.getItem(target);
  }

  static set(target: any, value: any) {
    return window.localStorage.setItem(target, value);
  }

  static delete(target: any) {
    return window.localStorage.removeItem(target);
  }
}

export enum StorageKeys {
  DomainSetting = 'domainSetting',
  SiteSetting = 'siteSetting',
  StoreSetting = 'storeSetting',
  ThemeSetting = 'themeSetting',
}

export const Storages = [
  {
    name: '域名',
    key: 'domainSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '主题',
    key: 'themeSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '信息',
    key: 'siteSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '存储',
    key: 'storeSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '发布',
    key: '',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: 'CDN',
    key: '',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '部署',
    key: 'hasSite',
    get value() {
      return Storage.get(this.key);
    },
  },
];
