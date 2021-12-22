declare namespace GunType {
  type GunDraft = PostType.Posts & { key?: string };
  type FetchGunDraftsArgs = {
    gunDraft: any;
    scope: string;
    userId: number;
  };
  type SyncLocalDraftsArgs = {
    drafts: PostType.Posts[];
    gunDrafts: GunDraft[];
  };
  type SyncGunDraftsArgs = {
    drafts: GunDraft[];
    userId: number;
  };
  type SyncNewDraftArgs = {
    id: number;
    userId: number;
  };
  type SyncDraftArgs = {
    userId: number;
    key: string;
    data: any;
  };
  type DeleteDraftArgs = {
    userId: number;
    key: string;
  };

  type GunAuthSuccess = {
    ack: number;
    back: unknown;
    get: string;
    gun: unknown;
    id: number;
    on: unknown;
    opt: unknown;
    put: unknown;
    root: unknown;
    sea: unknown;
    soul: string;
    tag: unknown;
  };
  type GunAuthFailure = {
    err: 'Wrong user or password.';
  };
  type GunAuthCb = GunAuthSuccess & GunAuthFailure;
  type GunCreateSuccess = {
    ok: 0;
    pub: string;
  };
  type GunCreateFailure = {
    err: 'User is already being created or authenticated!' | 'User already created!';
  };
  type GunCreateCb = GunCreateSuccess & GunCreateFailure;
}
