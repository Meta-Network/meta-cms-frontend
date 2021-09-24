import { Badge } from 'antd';
import { history, Link } from 'umi';
import Footer from '@/components/Footer';
import { queryCurrentUser, queryInvitations, refreshTokens } from './services/api/meta-ucenter';
import { PageLoading } from '@ant-design/pro-layout';
import { ExportOutlined } from '@ant-design/icons';
import type { RunTimeLayoutConfig } from 'umi';
import MenuMoreInfo from './components/MenuMoreInfo';

const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  currentUser?: GLOBAL.CurrentUser;
  invitationsCount: number;
  fetchUserInfo?: () => Promise<GLOBAL.CurrentUser | undefined>;
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
  const invitationsCount = invitationsCountRequest?.data?.filter(
    (e) => e.invitee_user_id === 0,
  )?.length;

  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();

    return {
      fetchUserInfo,
      currentUser,
      invitationsCount,
    };
  }
  return {
    fetchUserInfo,
    invitationsCount,
  };
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
        case '我的 Meta Space': {
          return (
            <>
              <Link className="my-site-link" to={menuItemProps.path as string}>
                {defaultDom}
              </Link>
              <ExportOutlined className="my-site-link-icon" />
            </>
          );
        }
        case '邀请码': {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Link to={menuItemProps.path as string}>{defaultDom}</Link>
              <Badge
                showZero
                style={{ backgroundColor: '#1890ff', marginTop: '7px' }}
                count={initialState?.invitationsCount || 0}
              />
            </div>
          );
        }
        default: {
          return <Link to={menuItemProps.path as string}>{defaultDom}</Link>;
        }
      }
    },
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
