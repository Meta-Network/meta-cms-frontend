import { isMobile } from 'is-mobile';
import { io } from 'socket.io-client';
import { userHasSite } from '@/utils';
import React, { useEffect } from 'react';
import { useModel, history, Link } from 'umi';
import type { RunTimeLayoutConfig } from 'umi';
import { PageLoading } from '@ant-design/pro-layout';
import { Typography, Avatar, Card, Dropdown } from 'antd';
import { DownOutlined, ExportOutlined } from '@ant-design/icons';
import { fetchPostCount } from '@/services/api/meta-cms';
import { dbDraftsAllCount } from './db/db';
import { getDefaultSiteConfigAPI } from '@/helpers';
import MenuMoreInfo from './components/menu/MenuMoreInfo';
import MenuUserInfo from './components/menu/MenuUserInfo';
import MenuItemWithBadge from './components/menu/MenuItemWithBadge';
import MenuLanguageSwitch from './components/menu/MenuLanguageSwitch';
import MenuFeedbackButton from './components/menu/MenuFeedbackButton';
import { RealTimeNotificationEvent } from './services/constants';
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
      <Dropdown
        overlayStyle={{ position: 'fixed' }}
        overlay={<MenuUserInfo />}
        placement="bottomCenter"
        trigger={['click']}
      >
        <Card className={menuItemProps.collapsed ? 'menu-card-collapsed' : 'menu-card'}>
          <Card.Meta
            className="menu-user-card-meta"
            avatar={<Avatar src={initialState?.currentUser?.avatar} />}
            title={initialState?.currentUser?.nickname}
          />
          <DownOutlined className="menu-extra-icons" />
        </Card>
      </Dropdown>
      {initialState?.siteConfig && userHasSite(initialState) && (
        <a href={`https://${initialState.siteConfig.domain}`} target="__blank">
          <Card
            className={
              menuItemProps.collapsed ? 'menu-card-collapsed' : 'menu-card default-site-link'
            }
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
            <ExportOutlined className="default-site-link-icon menu-extra-icons" />
          </Card>
        </a>
      )}
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
    return {} as GLOBAL.InitialState;
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

  let state: GLOBAL.InitialState = {
    fetchUserInfo,
    currentUser: undefined,
    siteConfig: undefined,
    allPostCount: 0,
    publishingCount: 0,
    invitationsCount: 0,
    publishedCount: 0,
    localDraftCount: 0,
    publishingAlertFlag: false,
  };

  const currentUser = await fetchUserInfo();
  if (currentUser) {
    state.currentUser = currentUser;

    // local draft count
    state.localDraftCount = await dbDraftsAllCount(currentUser!.id);

    const invitationsCountRequest = await queryInvitations();
    state.invitationsCount =
      invitationsCountRequest?.data?.filter((e) => e.invitee_user_id === 0)?.length || 0;

    // get site config
    state.siteConfig = await getDefaultSiteConfigAPI();

    if (userHasSite(state)) {
      // update post count
      const newPostCount = (await fetchPostCount())?.data ?? {};
      state = { ...state, ...newPostCount };
    }
  }

  return state;
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}: {
  initialState: GLOBAL.InitialState;
  setInitialState: (state: any) => GLOBAL.InitialState;
}) => {
  return {
    disableContentMargin: false,
    siderWidth: 300,
    layout: 'side',
    disableMobile: true,
    headerRender: () => false,
    headerContentRender: () => false,
    menuDataRender: (menuData) => {
      return menuData.map((menuDataItem) => {
        switch (menuDataItem.path as string) {
          case '/create': {
            if (userHasSite(initialState)) {
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
              count={initialState?.localDraftCount}
            />
          );
        }
        case '/content/posts': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.allPostCount}
              onAlert={initialState?.publishingAlertFlag}
            />
          );
        }
        case '/content/publishing': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.publishingCount}
            />
          );
        }
        case '/content/published': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.publishedCount}
            />
          );
        }
        // 邀请码数量
        case '/invitation': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.invitationsCount}
            />
          );
        }
        // create post
        case '/content/drafts/edit': {
          const _status = !userHasSite(initialState);

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
    onPageChange: async () => {
      /**
       * 同步草稿数量
       * 增加、更新、删除、页面切换
       */
      if (initialState?.currentUser?.id) {
        const localDraftCount = await dbDraftsAllCount(initialState?.currentUser?.id);
        await setInitialState((s: GLOBAL.InitialState) => ({
          ...s,
          localDraftCount: localDraftCount,
        }));
      }

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

const ReactStartup = (root: any) => {
  const { setInitialState } = useModel('@@initialState');

  useEffect(() => {
    const setCounts = (count: Partial<Record<keyof GLOBAL.InitialState, any>>) => {
      setInitialState(
        (prevData: GLOBAL.InitialState | undefined) =>
          ({
            ...prevData,
            ...count,
          } as GLOBAL.InitialState),
      ).then(); // ignore void return value
    };

    // connect to Meta CMS backend with socket.io
    const client = io(META_CMS_API, {
      withCredentials: true,
    });

    client.on('connect', () => {
      console.log('Socket.io has been connected to the backend successfully. Id:', client.id);
    });

    client.on(
      RealTimeNotificationEvent.POST_COUNT_UPDATED,
      (notification: { data: CMS.PostCount }) => {
        setCounts({
          ...notification.data,
        });
      },
    );

    client.on(
      RealTimeNotificationEvent.INVITATION_COUNT_UPDATED,
      (notification: { data: number }) => {
        setCounts({
          invitationsCount: notification.data,
        });
      },
    );
  }, [setInitialState]);

  return root.children;
};

export function rootContainer(container: any) {
  return React.createElement(ReactStartup, null, container);
}
