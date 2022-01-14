// 上传图片大小
export const UploadImageSize = 5;

// default license
export const License = '';

// local store key
export const KEY_META_CMS_METADATA_SEED = 'META_CMS_METADATA_SEED';
export const KEY_META_CMS_METADATA_PUBLIC_KEYS = 'META_CMS_METADATA_PUBLIC_KEYS';
export const KEY_META_CMS_GATEWAY_CHECKED = 'META_CMS_GATEWAY_CHECKED';

// Gun Store Key
export const KEY_META_CMS_GUN_SEED = 'META_CMS_GUN_SEED';
export const KEY_META_CMS_GUN_PAIR = 'META_CMS_GUN_PAIR';

export const GITHUB_URL = 'https://github.com';

// OSS link
export const OSS_MATATAKI_FEUSE = 'https://ssimg.frontenduse.top';
export const OSS_MATATAKI = 'https://smartsignature-img.oss-cn-hongkong.aliyuncs.com';

// Gun Config
export const KEY_GUN_ROOT = 'meta.io_v7';
export const KEY_GUN_ROOT_DRAFT = 'cms_draft';

export const EDITOR_LEARN =
  'https://meta-io.gitbook.io/meta-wiki/how-to-use/how-to-create-content-for-meta-space';

export const STORAGE_PLATFORM = 'github';

export const KEY_IS_LOGIN = 'META_CMS_IS_LOGIN';

// rules
export const rules = {
  usernameReg: '^[a-z0-9-]{3,15}$',
  username: {
    min: 3,
    max: 15,
  },
  nickname: {
    min: 1,
    max: 32,
  },
  bio: {
    min: 1,
    max: 200,
  },
};
