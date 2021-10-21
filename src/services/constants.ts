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
    name: 'guide.domain.name',
    key: 'domainSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: 'guide.theme.name',
    key: 'themeSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: 'guide.config.name',
    key: 'siteSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: 'guide.storage.name',
    key: 'storeSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: 'guide.publish.name',
    key: '',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: 'guide.cdn.name',
    key: '',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    name: 'guide.deploy.name',
    key: 'deploy',
    get value() {
      return Storage.get(this.key);
    },
  },
];
