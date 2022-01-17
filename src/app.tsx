import { isMobile } from 'is-mobile';
import { history, Link } from 'umi';
import type { RunTimeLayoutConfig } from 'umi';
import { PageLoading } from '@ant-design/pro-layout';
import { Typography, Avatar, Card, Dropdown } from 'antd';
import { DownOutlined, ExportOutlined } from '@ant-design/icons';
import { fetchPostsStorage } from '@/services/api/meta-cms';
import { dbPostsAllCount } from './db/db';
import { getDefaultSiteConfigAPI } from '@/helpers';
import MenuMoreInfo from './components/menu/MenuMoreInfo';
import MenuUserInfo from './components/menu/MenuUserInfo';
import MenuItemWithBadge from './components/menu/MenuItemWithBadge';
import MenuLanguageSwitch from './components/menu/MenuLanguageSwitch';
import MenuFeedbackButton from './components/menu/MenuFeedbackButton';
import PublishSiteButton from './components/menu/PublishSiteButton';
import { FetchPostsStorageParamsState } from './services/constants';
import { queryCurrentUser, queryInvitations, refreshTokens } from './services/api/meta-ucenter';
import type { SiderMenuProps } from '@ant-design/pro-layout/lib/components/SiderMenu/SiderMenu';

const { Text } = Typography;

function CustomSiderMenu({
  initialState,
  menuItemProps,
}: {
  initialState: GLOBAL.InitialState | undefined;
  menuItemProps: SiderMenuProps;
}) {
  return (
    <div className="menu-extra-cards">
      <Dropdown overlay={<MenuUserInfo />} placement="bottomCenter" trigger={['click']}>
        <Card className={menuItemProps.collapsed ? 'menu-card-collapsed' : 'menu-card'}>
          <Card.Meta
            className="menu-user-card-meta"
            avatar={<Avatar src={initialState?.currentUser?.avatar} />}
            title={initialState?.currentUser?.nickname}
          />
          <DownOutlined className="menu-extra-icons" />
        </Card>
      </Dropdown>
      {initialState?.siteConfig?.domain && (
        <a href={`https://${initialState.siteConfig.domain}`} target="__blank">
          <Card
            className={menuItemProps.collapsed ? 'menu-card-collapsed' : 'menu-card my-site-link'}
          >
            <Card.Meta
              className="menu-site-card-meta"
              avatar={<Avatar src="/icons/custom/meta-space-icon.svg" />}
              title={initialState.siteConfig.siteInfo.title}
              description={
                <Text type="secondary" ellipsis={initialState.siteConfig.domain.length > 20}>
                  {initialState.siteConfig.domain}
                </Text>
              }
            />
            <ExportOutlined className="my-site-link-icon menu-extra-icons" />
          </Card>
        </a>
      )}
      {/* Button to redeploy the Meta Space */}
      {PublishSiteButton().node}
    </div>
  );
}

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<GLOBAL.InitialState> {
  // don't log in if this page is a result
  if (history.location.pathname.startsWith('/result')) {
    return {};
  }

  if (isMobile()) {
    history.push('/result/mobile');
  }

  const fetchUserInfo = async () => {
    try {
      await refreshTokens();
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      console.log('getInitialState error: ', error);
      history.push('/user/login');
    }
    return undefined;
  };

  const state: GLOBAL.InitialState = {
    fetchUserInfo,
    currentUser: undefined,
    siteConfig: undefined,
    invitationsCount: 0,
    publishedCount: 0,
    localDraftCount: 0,
  };

  const currentUser = await fetchUserInfo();
  if (currentUser) {
    state.currentUser = currentUser;

    // local draft count
    state.localDraftCount = await dbPostsAllCount(currentUser!.id);

    const invitationsCountRequest = await queryInvitations();
    state.invitationsCount =
      invitationsCountRequest?.data?.filter((e) => e.invitee_user_id === 0)?.length || 0;

    // get site config
    const siteConfig = await getDefaultSiteConfigAPI();
    state.siteConfig = siteConfig;

    state.publishedCount = 0;
    if (siteConfig?.id) {
      const publishedCountRequest = await fetchPostsStorage(siteConfig?.id, {
        page: 1,
        limit: 1,
        state: FetchPostsStorageParamsState.Published,
      });
      state.publishedCount = publishedCountRequest?.data?.meta?.totalItems ?? 0;
    }
  }

  return state;
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    disableContentMargin: false,
    siderWidth: 300,
    layout: 'side',
    headerRender: () => false,
    headerContentRender: () => false,
    menuDataRender: (menuData) => {
      return menuData.map((menuDataItem) => {
        switch (menuDataItem.path as string) {
          case '/create': {
            const hasSite = initialState?.siteConfig?.domain;
            if (hasSite) {
              return null;
            } else {
              return menuDataItem;
            }
          }
        }
        return menuDataItem;
      });
    },
    menuItemRender: (menuItemProps, defaultDom) => {
      switch (menuItemProps.path) {
        // local draft counter
        case '/content/drafts': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.localDraftCount || 0}
            />
          );
        }
        // 邀请码数量
        case '/invitation': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.invitationsCount || 0}
            />
          );
        }
        // 已发布文章
        case '/content/published-posts': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.publishedCount || 0}
            />
          );
        }
        // create post
        case '/content/drafts/edit': {
          const _status = !(initialState?.siteConfig && initialState?.siteConfig?.domain);
          return (
            <Link
              to={menuItemProps.path as string}
              onClick={(e) => {
                if (_status) {
                  e.preventDefault();
                  // message.warning('请先创建 Meta Space');
                }
              }}
            >
              <Text disabled={_status}>{defaultDom}</Text>
            </Link>
          );
        }
        default: {
          return <Link to={menuItemProps.path as string}>{defaultDom}</Link>;
        }
      }
    },
    menuExtraRender: (menuItemProps) => (
      <CustomSiderMenu initialState={initialState} menuItemProps={menuItemProps} />
    ),
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (
        !initialState?.currentUser &&
        !['/user/login', /^\/result.*$/].some((patten) => location.pathname.match(patten))
      ) {
        history.push('/user/login');
      }
    },
    links: [
      <MenuLanguageSwitch key="MenuLanguageSwitch" />,
      <MenuMoreInfo key="MenuMoreInfo" />,
      <MenuFeedbackButton key="MenuFeedbackButton" />,
    ],
  };
};
