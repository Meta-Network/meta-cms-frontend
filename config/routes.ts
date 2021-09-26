export default [
  {
    path: '/guide',
    component: './Guide',
    name: '创建 Meta Space',
    icon: 'dashboard',
  },
  {
    path: '/user',
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            layout: false,
            path: '/user/login',
            component: './user/Login',
          },
          {
            name: 'info',
            path: '/user/info',
            component: './user/Information',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/content',
    name: '内容',
    icon: 'edit',
    routes: [
      {
        path: '/content/sync-center',
        name: '同步中心',
        component: './content/SyncCenter',
      },
      {
        path: '/content/posted-content',
        name: '已发布',
        component: './content/PostedContent',
      },
    ],
  },
  {
    path: '/manage',
    name: '管理',
    icon: 'branches',
    routes: [
      {
        path: '/manage/source',
        name: '内容源',
        component: './manage/Source',
      },
      {
        path: '/manage/site-setting',
        name: '信息',
        component: './manage/Site',
        icon: 'setting',
      },
      {
        path: '/manage/store-setting',
        name: '存储',
        component: './manage/StoreSetting',
      },
      {
        path: '/manage/domain-setting',
        name: '域名',
        component: './manage/DomainSetting',
      },
    ],
  },
  {
    path: '/invitation',
    name: '邀请码',
    icon: 'apartment',
    component: './Invitation',
  },
  {
    path: '/result/store-setting-success',
    hideInMenu: true,
    component: './result/StoreSettingSuccess',
  },
  {
    path: '/',
    redirect: '/guide',
  },
  {
    component: './404',
  },
];
