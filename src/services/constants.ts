export enum DraftMode {
  Default,
  Saving,
  Saved,
}

export enum FetchPostsStorageParamsState {
  Drafted = 'drafted',
  Posted = 'posted',
  Published = 'published',
}

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

export enum MetadataStorageType {
  IPFS = 'ipfs',
  ARWEAVE = 'arweave',
}

export enum RealTimeNotificationEvent {
  POST_COUNT_UPDATED = 'post.count.updated',
  SPACE_COUNT_UPDATED = 'space.count.updated',
  INVITATION_COUNT_UPDATED = 'invitation.count.updated',
  POST_PUBLISHING_STATE_UPDATED = 'post.publishing.state.updated',
}

export enum SyncPlatform {
  MATATAKI = 'matataki',
}
