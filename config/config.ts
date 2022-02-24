// https://umijs.org/config/
import { defineConfig } from 'umi';

import defaultSettings from './defaultSettings';
import routes from './routes';

export default defineConfig({
  hash: true,
  dva: {
    hmr: true,
  },
  define: {
    META_NETWORK_API: process.env.META_NETWORK_API || 'https://meta-network-api.testenv.mttk.net',
    META_NETWORK_FE: process.env.META_NETWORK_FE || 'https://meta-network.mttk.net',
    META_UCENTER_API: process.env.META_UCENTER_API || 'https://ucenter-test-api.mttk.net',
    META_CMS_API: process.env.META_CMS_API || 'https://meta-cms-api-dev.mttk.net',
    META_STORAGE_API:
      process.env.META_STORAGE_API || 'https://fleek-storage.vercel.mttk.net/fleek/storage',
    META_SPACE_BASE_DOMAIN: process.env.META_SPACE_BASE_DOMAIN || 'metaspaces.life',
    META_SPACE_DEFAULT_FAVICON_URL:
      process.env.META_SPACE_DEFAULT_FAVICON_URL ||
      'https://storageapi.fleek.co/casimir-crystal-team-bucket/metanetwork/users/metaio-storage/favicon.ico',
    FLEEK_NAME: 'https://storageapi.fleek.co',
    META_NETWORK_DATA_VIEWER_URL:
      process.env.META_NETWORK_DATA_VIEWER_URL || 'https://meta-network-data-viewer.vercel.app',
    META_GUN_PEERS: process.env.META_GUN_PEERS!.split(','),
    META_WIKI: process.env.META_WIKI,
    META_WIKI_EDITOR_LEARN: process.env.META_WIKI_EDITOR_LEARN,
    ARWEAVE_VIEWBLOCK: process.env.ARWEAVE_VIEWBLOCK,
    IPFS_FLEEK: process.env.IPFS_FLEEK,
    MATATAKI_DEVELOPER: process.env.MATATAKI_DEVELOPER,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default en-US
    default: 'en-US',
    antd: true,
    baseNavigator: false,
    useLocalStorage: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  nodeModulesTransform: { type: 'none' },
  // mfsu: {},
  webpack5: {},
  exportStatic: {},
});
