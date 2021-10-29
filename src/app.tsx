import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIntl, useModel, history, Link } from 'umi';
import type { RunTimeLayoutConfig } from 'umi';
import { PageLoading } from '@ant-design/pro-layout';
import { Typography, Avatar, Card, Dropdown, Button, message, notification } from 'antd';
import { DownOutlined, ExportOutlined } from '@ant-design/icons';
import {
  deployAndPublishSite,
  fetchPostsPublished,
  getDefaultSiteConfig,
} from '@/services/api/meta-cms';
import MenuMoreInfo from './components/MenuMoreInfo';
import MenuUserInfo from './components/MenuUserInfo';
import MenuItemWithBadge from './components/MenuItemWithBadge';
import MenuLanguageSwitch from './components/MenuLanguageSwitch';
import { queryCurrentUser, queryInvitations, refreshTokens } from './services/api/meta-ucenter';
import type { SiderMenuProps } from '@ant-design/pro-layout/lib/components/SiderMenu/SiderMenu';
import { dbPostsAllCount } from './db/db';

const { Text } = Typography;

const loginPath = '/user/login';

function CustomSiderMenu({
  initialState,
  menuItemProps,
}: {
  initialState: any;
  menuItemProps: SiderMenuProps;
}) {
  const intl = useIntl();
  const [publishButtonDisplay, setPublishButtonDisplay] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const { deployedSite, setDeployedSite, siteNeedToDeploy, setSiteNeedToDeploy } =
    useModel('storage');
  const location = useLocation();

  useEffect(() => {
    getDefaultSiteConfig().then((response) => {
      if (response.statusCode === 200) {
        setDeployedSite({
          title: response.data.siteInfo.title,
          domain: response.data.domain,
          configId: response.data.id,
        });
      }
    });
  }, [setDeployedSite]);

  const publishSiteRequest = async () => {
    const done = message.loading(intl.formatMessage({ id: 'messages.redeployment.taskStart' }), 0);
    setPublishLoading(true);

    if (deployedSite.configId) {
      const response = await deployAndPublishSite(deployedSite.configId);
      if (response.statusCode === 201) {
        notification.success({
          message: intl.formatMessage({ id: 'messages.redeployment.taskSuccess.title' }),
          description: intl.formatMessage({ id: 'messages.redeployment.taskSuccess.description' }),
          duration: 0,
        });
        setSiteNeedToDeploy(false);
      } else {
        notification.error({
          message: intl.formatMessage({ id: 'messages.redeployment.taskFailed.title' }),
          description: intl.formatMessage({ id: 'messages.redeployment.taskFailed.description' }),
          duration: 0,
        });
      }
    } else {
      message.error(intl.formatMessage({ id: 'messages.redeployment.noSiteConfig' }));
    }

    done();
    setPublishLoading(false);
  };

  useEffect(() => {
    if (siteNeedToDeploy && window.innerHeight + window.scrollY >= document.body.scrollHeight) {
      setPublishButtonDisplay(true);
    }
  }, [location, siteNeedToDeploy]);

  useEffect(() => {
    const scrollListener = () => {
      if (!siteNeedToDeploy) {
        return setPublishButtonDisplay(false);
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        return setPublishButtonDisplay(false);
      }
      return setPublishButtonDisplay(true);
    };

    if (siteNeedToDeploy) {
      window.addEventListener('scroll', scrollListener);
    } else {
      window.removeEventListener('scroll', scrollListener);
    }
  }, [siteNeedToDeploy]);

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
      <div
        className={`global-publish-button-background ${
          publishButtonDisplay
            ? 'global-publish-button-background-visible'
            : 'global-publish-button-background-invisible'
        }`}
      >
        <Button
          key="publish-button"
          loading={publishLoading}
          onClick={publishSiteRequest}
          className="global-publish-button"
        >
          {intl.formatMessage({ id: 'messages.redeployment.button' })}
        </Button>
      </div>
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

  const publishedCountRequest = await fetchPostsPublished(1, 10);
  const publishedCount = publishedCountRequest?.data?.meta?.totalItems || 0;

  // local draft count
  const localDraftCount = await dbPostsAllCount();

  const states: any = {
    fetchUserInfo,
    invitationsCount,
    publishedCount,
    localDraftCount,
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
    headerRender: () => false,
    headerContentRender: () => false,
    menuItemRender: (menuItemProps, defaultDom) => {
      switch (menuItemProps.path) {
        // local draft counter
        case '/posts': {
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
    links: [<MenuLanguageSwitch key="MenuLanguageSwitch" />, <MenuMoreInfo key="MenuMoreInfo" />],
  };
};
