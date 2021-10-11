import { fetchPublishedPosts, getDefaultSiteConfig } from '@/services/api/meta-cms';
import { useModel } from '@@/plugin-model/useModel';
import type { SiderMenuProps } from '@ant-design/pro-layout/lib/components/SiderMenu/SiderMenu';
import { Avatar, Card, Dropdown } from 'antd';
import { history, Link } from 'umi';
import Footer from '@/components/Footer';
import { queryCurrentUser, queryInvitations, refreshTokens } from './services/api/meta-ucenter';
import { PageLoading } from '@ant-design/pro-layout';
import { DownOutlined, ExportOutlined } from '@ant-design/icons';
import type { RunTimeLayoutConfig } from 'umi';
import MenuMoreInfo from './components/MenuMoreInfo';
import MenuUserInfo from './components/MenuUserInfo';
import MenuItemWithBadge from './components/MenuItemWithBadge';
import { useEffect } from 'react';

const loginPath = '/user/login';

function CustomSiderMenu({
  initialState,
  menuItemProps,
}: {
  initialState: any;
  menuItemProps: SiderMenuProps;
}) {
  const { deployedSite, setDeployedSite } = useModel('storage');
  useEffect(() => {
    getDefaultSiteConfig().then((response) => {
      if (response.statusCode === 200) {
        setDeployedSite({
          title: response.data.siteInfo.title,
          domain: response.data.domain,
        });
      }
    });
  }, [setDeployedSite]);
  return (
    <div className="menu-extra-cards">
      <Dropdown overlay={<MenuUserInfo />} placement="bottomCenter" trigger={['click', 'hover']}>
        <Card className={menuItemProps.collapsed ? 'menu-card-collapsed' : 'menu-card'}>
          <Card.Meta
            className="menu-user-card-meta"
            avatar={<Avatar src={initialState?.currentUser?.avatar} />}
            title={initialState?.currentUser?.nickname}
          />
          <DownOutlined className="menu-extra-icons" />
        </Card>
      </Dropdown>
      {deployedSite.domain && (
        <a href={`https://${deployedSite.domain}`} target="__blank">
          <Card
            className={menuItemProps.collapsed ? 'menu-card-collapsed' : 'menu-card my-site-link'}
          >
            <Card.Meta
              className="menu-site-card-meta"
              avatar={<Avatar src="/icons/custom/meta-space-icon.svg" />}
              title={deployedSite.title}
              description={deployedSite.domain}
            />
            <ExportOutlined className="my-site-link-icon menu-extra-icons" />
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
export async function getInitialState(): Promise<{
  currentUser?: GLOBAL.CurrentUser | undefined;
  fetchUserInfo?: () => Promise<GLOBAL.CurrentUser | undefined>;
  invitationsCount?: number;
  publishedCount?: number;
}> {
  const fetchUserInfo = async () => {
    try {
      await refreshTokens();
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  const invitationsCountRequest = await queryInvitations();
  const invitationsCount =
    invitationsCountRequest?.data?.filter((e) => e.invitee_user_id === 0)?.length || 0;

  const publishedCountRequest = await fetchPublishedPosts();
  const publishedCount = publishedCountRequest?.data?.items?.length || 0;

  const states: any = {
    fetchUserInfo,
    invitationsCount,
    publishedCount,
  };

  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    if (currentUser) states.currentUser = currentUser;
  }
  return states;
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    disableContentMargin: false,
    siderWidth: 300,
    layout: 'side',
    // rightContentRender: () => <RightContent />,
    headerRender: () => false,
    headerContentRender: () => false,
    footerRender: () => <Footer />,
    menuItemRender: (menuItemProps, defaultDom) => {
      switch (menuItemProps.name) {
        case '邀请码': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.invitationsCount || 0}
            />
          );
        }
        case '已发布': {
          return (
            <MenuItemWithBadge
              path={menuItemProps.path as string}
              dom={defaultDom}
              count={initialState?.publishedCount || 0}
            />
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
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: [MenuMoreInfo],
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
  };
};
