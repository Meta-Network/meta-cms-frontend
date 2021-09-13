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
  domainSetting = 'domainSetting',
  SiteSetting = 'siteSetting',
  StoreSetting = 'storeSetting',
  ThemeSetting = 'themeSetting',
}

export const Storages = [
  {
    name: '设置域名',
    key: 'domainSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '选择主题',
    key: 'themeSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '填写站点信息',
    key: 'siteInfo',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '进行存储配置',
    key: 'storeSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '进行发布配置',
    key: '',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: '站点访问加速',
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
