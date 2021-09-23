import { history, Link } from 'umi';
import Footer from '@/components/Footer';
import { queryCurrentUser, refreshTokens } from './services/api/meta-ucenter';
import { PageLoading } from '@ant-design/pro-layout';
import { ExportOutlined } from '@ant-design/icons';
import type { RunTimeLayoutConfig } from 'umi';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';

const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: GLOBAL.CurrentUser;
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

  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      // hasSite,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    settings: {},
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
      return (
        <>
          <Link
            className={(menuItemProps.name === '我的 Meta Space' && 'my-site-link') || ''}
            to={menuItemProps.path as string}
          >
            {defaultDom}
          </Link>
          {menuItemProps.name === '我的 Meta Space' && (
            <ExportOutlined className="my-site-link-icon" />
          )}
        </>
      );
    },
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
