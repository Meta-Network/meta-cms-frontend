export enum DeployStages {
  pending,
  validating,
  submitting,
  deploying,
}

export enum DraftMode {
  Default,
  Saving,
  Saved,
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
  // ThemeSetting = 'themeSetting',
}

export enum FetchPostsStorageParamsState {
  Drafted = 'drafted',
  Posted = 'posted',
  Published = 'published',
}

export const Storages = [
  {
    title: 'guide.domain.title',
    key: 'domainSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  // {
  //   title: 'guide.theme.title',
  //   key: 'themeSetting',
  //   get value() {
  //     return Storage.get(this.key);
  //   },
  // },
  {
    title: 'guide.config.title',
    key: 'siteSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    title: 'guide.storage.title',
    key: 'storeSetting',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    title: 'guide.publish.title',
    key: '',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    title: 'guide.cdn.title',
    key: '',
    get value() {
      return Storage.get(this.key);
    },
  },
  {
    title: 'guide.deploy.title',
    key: 'deploy',
    get value() {
      return Storage.get(this.key);
    },
  },
];

export enum TaskCommonState {
  TODO = 'TODO',
  DOING = 'DOING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export enum GatewayType {
  Default = '',
  Ipfs = 'ipfs',
  Arweave = 'arweave',
}

export enum SubmitStatusEnum {
  WAIT = 'wait',
  DOING = 'doing',
  DONE = 'done',
  ERROR = 'error',
}
export enum PublishStatusEnum {
  WAIT = 'wait',
  DOING = 'doing',
  DONE = 'done',
  ERROR = 'error',
}
export enum AuthorisationStatusEnum {
  DOING = 'doing',
  DONE = 'done',
  ERROR = 'error',
  NONE = 'none',
}
export enum PublishingTipStepStateType {
  Loading = 'loading',
  Finish = 'finish',
}

export enum PipelineOrderTaskCommonState {
  NONE = '',
  PENDING = 'pending',
  DOING = 'doing',
  FINISHED = 'finished',
  FAILED = 'failed',
}
