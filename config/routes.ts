﻿export default [
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
    name: '内容后台',
    icon: 'edit',
    routes: [
      {
        path: '/content/sync-center',
        name: '同步中心',
        component: './content/SyncCenter',
      },
      {
        path: '/content/posted-content',
        name: '已发布内容',
        component: './content/PostedContent',
      },
    ],
  },
  {
    path: '/site',
    name: '站点信息设置',
    component: './Site',
    icon: 'setting',
  },
  {
    path: '/publish',
    name: '发布设置',
    icon: 'branches',
    routes: [
      {
        path: '/publish/domain-setting',
        name: '域名配置',
        component: './publish/DomainSetting',
      },
      {
        path: '/publish/store-setting',
        name: '存储配置',
        component: './publish/StoreSetting',
      }
    ]
  },
  {
    path: '/account',
    name: '账号设置',
    icon: 'user',
    routes: [
      {
        path: '/account/source',
        name: '内容源绑定',
        component: './account/Source',
      },
      {
        path: '/account/invitation',
        name: '邀请码管理',
        component: './account/Invitation',
      }
    ]
  },
  {
    path: '/',
    redirect: '/content/sync-center',
  },
  {
    component: './404',
  },
];
