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
    META_NETWORK_API: process.env.META_NETWORK_API,
    META_UCENTER_API: process.env.META_UCENTER_API || 'https://ucenter-test-api.mttk.net',
    META_CMS_API: process.env.META_CMS_API || 'https://meta-cms-api-dev.mttk.net',
    META_STORAGE_API:
      process.env.META_STORAGE_API || 'https://fleek-storage.vercel.mttk.net/fleek/storage',
    META_SPACE_BASE_DOMAIN: process.env.META_SPACE_BASE_DOMAIN || 'metaspaces.me',
    FLEEK_NAME: 'https://storageapi.fleek.co',
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
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
  mfsu: {},
  webpack5: {},
  exportStatic: {},
});
