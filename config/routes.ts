export default [
  {
    path: '/guide',
    component: './Guide',
    name: 'guide',
    icon: 'dashboard',
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
    path: '/post/edit',
    component: './post/Edit',
    name: '创作',
    icon: 'plus',
    layout: false,
  },
  {
    path: '/content',
    name: 'content',
    icon: 'edit',
    routes: [
      {
        path: '/content/sync-center',
        name: 'syncCenter',
        component: './content/SyncCenter',
      },
      {
        path: '/content/published-posts',
        name: 'publishedPosts',
        component: './content/PublishedPosts',
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
    ],
  },
  {
    path: '/posts',
    name: 'localDraft',
    icon: 'edit',
    component: './post/List',
  },
  {
    path: '/invitation',
    name: 'invitation',
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
