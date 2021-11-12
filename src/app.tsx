import { useEffect } from 'react';
import { isMobile } from 'is-mobile';
import { useModel, history, Link } from 'umi';
import type { RunTimeLayoutConfig } from 'umi';
import { PageLoading } from '@ant-design/pro-layout';
import { Typography, Avatar, Card, Dropdown, message } from 'antd';
import { DownOutlined, ExportOutlined } from '@ant-design/icons';
import { fetchPostsPublished, getDefaultSiteConfig } from '@/services/api/meta-cms';
import MenuMoreInfo from './components/MenuMoreInfo';
import MenuUserInfo from './components/MenuUserInfo';
import MenuItemWithBadge from './components/MenuItemWithBadge';
import MenuLanguageSwitch from './components/MenuLanguageSwitch';
import PublishSiteButton from './components/app/PublishSiteButton';
import { queryCurrentUser, queryInvitations, refreshTokens } from './services/api/meta-ucenter';
import type { SiderMenuProps } from '@ant-design/pro-layout/lib/components/SiderMenu/SiderMenu';
import { dbPostsAllCount } from './db/db';
import { getDefaultSiteConfigAPI } from './helpers/index';

const { Text } = Typography;

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
      if (response?.data) {
        setDeployedSite({
          title: response.data.siteInfo.title,
          domain: response.data.domain,
          configId: response.data.id,
        });
      } else {
        setDeployedSite({});
      }
    });
  }, [setDeployedSite]);

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
      {deployedSite.domain && (
        <a href={`https://${deployedSite.domain}`} target="__blank">
          <Card
            className={menuItemProps.collapsed ? 'menu-card-collapsed' : 'menu-card my-site-link'}
          >
            <Card.Meta
              className="menu-site-card-meta"
              avatar={<Avatar src="/icons/custom/meta-space-icon.svg" />}
              title={deployedSite.title}
              description={
                <Text type="secondary" ellipsis={deployedSite.domain.length > 20}>
                  {deployedSite.domain}
                </Text>
              }
            />
            <ExportOutlined className="my-site-link-icon menu-extra-icons" />
          </Card>
        </a>
      )}
      {/* Button to redeploy the Meta Space */}
      <PublishSiteButton />
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
  localDraftCount?: number;
  siteConfig?: CMS.SiteConfiguration;
}> {
  const fetchUserInfo = async () => {
    try {
      await refreshTokens();
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push('/user/login');
    }
    return undefined;
  };

  const invitationsCountRequest = await queryInvitations();
  const invitationsCount =
    invitationsCountRequest?.data?.filter((e) => e.invitee_user_id === 0)?.length || 0;

  const publishedCountRequest = await fetchPostsPublished(1, 10);
  const publishedCount = publishedCountRequest?.data?.meta?.totalItems || 0;

  // local draft count
  const localDraftCount = await dbPostsAllCount();

  // get site config
  const siteConfig = await getDefaultSiteConfigAPI();

  const states: any = {
    fetchUserInfo,
    invitationsCount,
    publishedCount,
    localDraftCount,
    siteConfig,
  };

  if (history.location.pathname !== '/user/login') {
    const currentUser = await fetchUserInfo();
    if (currentUser) states.currentUser = currentUser;
  }

  if (isMobile()) {
    history.push('/result/mobile');
  }
  return states;
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    disableContentMargin: false,
    siderWidth: 300,
    layout: 'side',
    headerRender: () => false,
    headerContentRender: () => false,
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
                  message.warning('请先创建 Meta Space');
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
      if (!initialState?.currentUser && location.pathname !== '/user/login') {
        history.push('/user/login');
      }
    },
    links: [<MenuLanguageSwitch key="MenuLanguageSwitch" />, <MenuMoreInfo key="MenuMoreInfo" />],
  };
};
