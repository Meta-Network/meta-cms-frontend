export enum StorageKeys {
  SiteInfo = 'siteInfo',
  StoreSetting = 'storeSetting',
  ThemeSetting = 'themeSetting',
}

export enum StorageNames {
  选择主题 = 'themeSetting',
  填写站点信息 = 'siteInfo',
  进行存储配置 = 'storeSetting',
  进行发布配置 = '',
  站点访问加速 = '',
  部署 = '',
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
