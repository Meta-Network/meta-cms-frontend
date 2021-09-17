export default [
  {
    path: '/guide',
    component: './Guide',
    name: '创建 Meta Space',
    icon: 'dashboard',
  },
  {
    name: '我的 Meta Space',
    icon: 'link',
    path: '/my-space',
    component: './Guide',
  },
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
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
    path: '/publish',
    name: '管理',
    icon: 'branches',
    routes: [
      {
        path: '/publish/source',
        name: '内容源',
        component: './account/Source',
      },
      {
        path: '/publish/site-setting',
        name: '信息',
        component: './Site',
        icon: 'setting',
      },
      {
        path: '/publish/store-setting',
        name: '存储',
        component: './publish/StoreSetting',
      },
      {
        path: '/publish/domain-setting',
        name: '域名',
        component: './publish/DomainSetting',
      },
    ],
  },
  {
    path: '/account',
    name: '账号',
    icon: 'user',
    routes: [
      {
        path: '/account/information',
        name: '设置',
        component: './account/Information',
      },
      {
        path: '/account/invitation',
        name: '邀请码',
        component: './account/Invitation',
      },
    ],
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
