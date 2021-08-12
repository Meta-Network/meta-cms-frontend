import { history, Link } from 'umi';
import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { getMyGrid } from './services/api/meta-network';
import { queryCurrentUser, refreshTokens } from './services/api/ucenter';
import { PageLoading } from '@ant-design/pro-layout';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
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
  currentUser?: API.CurrentUser;
  hasSite?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
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

  const hasSite = Boolean((await getMyGrid()).data?.meta_space_site_id);

  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      hasSite,
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
    rightContentRender: () => <RightContent />,
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }

      // 如果没有个人站点，重定向到 MetaNetwork
      /*
      if (initialState?.currentUser && !initialState?.hasSite) {
        setTimeout(() => {
          // @ts-ignore
          window.location = 'https://www.meta-network.io/';
        }, 5000);
        notification.error({
          message: '还未创建站点！',
          description: '您的 MetaSpace 还未创建完成，将返回 MetaNetwork 完成创建',
        });
      }
       */
    },
    links: [
      // TODO: next change these links
      <Link to="https://metaspace.federarks.xyz/" target="_blank">
        <LinkOutlined />
        <span>个人站点</span>
      </Link>,
      <Link to="https://meta-network.vercel.app/">
        <BookOutlined />
        <span>Meta Network</span>
      </Link>,
    ],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
