export default [
  {
    path: '/create',
    component: './CreateSite',
    name: 'create',
    icon: 'PlusSquare',
  },
  {
    path: '/user',
    routes: [
      {
        path: '/user',
        routes: [
          {
            layout: false,
            path: '/user/login',
            component: './user/Login',
          },
          {
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
    path: '/content/drafts/edit',
    component: './content/drafts/Edit',
    name: 'post.create',
    icon: 'plus',
    layout: false,
  },
  {
    path: '/content',
    name: 'content',
    icon: 'edit',
    routes: [
      {
        path: '/content/drafts',
        name: 'drafts',
        icon: 'edit',
        component: './content/drafts/List',
      },
      {
        path: '/content/posts',
        name: '全部作品',
        component: './content/Posts/index',
      },
      {
        path: '/content/publishing',
        name: '发布中',
        component: './content/Publishing/index',
      },
      {
        path: '/content/published',
        name: 'publishedPosts',
        component: './content/Published/index',
      },
      {
        path: '/content/sync-center',
        name: 'syncCenter',
        component: './content/SyncCenter',
      },
      {
        path: '/content/drafts/edit',
        component: './content/drafts/Edit',
        layout: false,
      },
    ],
  },
  {
    path: '/manage',
    name: 'manage',
    icon: 'branches',
    routes: [
      {
        path: '/manage/source',
        name: 'source',
        component: './manage/Source',
      },
      {
        path: '/manage/site-setting',
        name: 'siteSetting',
        component: './manage/SiteSetting',
        icon: 'setting',
      },
      {
        path: '/manage/store-setting',
        name: 'storeSetting',
        component: './manage/StoreSetting',
      },
      {
        path: '/manage/domain-setting',
        name: 'domainSetting',
        component: './manage/DomainSetting',
      },
      {
        path: '/manage/account',
        name: 'account',
        component: './manage/Account',
      },
    ],
  },
  {
    path: '/invitation',
    name: 'invitation',
    icon: 'apartment',
    component: './Invitation',
  },
  {
    path: '/settings',
    name: 'settings',
    icon: 'setting',
    component: './Settings',
  },
  {
    path: '/result/store-setting-success',
    hideInMenu: true,
    layout: false,
    component: './result/StoreSettingSuccess',
  },
  {
    path: '/result/mobile',
    hideInMenu: true,
    layout: false,
    component: './result/Mobile',
  },
  {
    path: '/',
    hideInMenu: true,
    layout: false,
    component: './Index',
  },
  {
    component: './404',
  },
];
