import { Menu } from 'antd';
import { useCallback } from 'react';
import { history, useIntl, useModel } from 'umi';
import { logoutAccount } from '@/services/api/meta-ucenter';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuInfo } from 'rc-menu/lib/interface';

const logout = async () => {
  await logoutAccount();
  if (window.location.pathname !== '/user/login') {
    history.push('/user/login');
  }
};

export default () => {
  const intl = useIntl();
  const { setInitialState } = useModel('@@initialState');

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        setInitialState((s: any) => ({
          ...s,
          currentUser: undefined,
        }));
        logout();
        return;
      }
      history.push(`/user/${key}`);
    },
    [setInitialState],
  );

  return (
    <Menu className="custom-user-menu" selectedKeys={[]} onClick={onMenuClick}>
      <Menu.Item className="user-menu-item" key="info">
        <UserOutlined />
        {intl.formatMessage({ id: 'menu.user.profile' })}
      </Menu.Item>
      <Menu.Item className="user-menu-item" key="logout">
        <LogoutOutlined />
        {intl.formatMessage({ id: 'menu.user.logout' })}
      </Menu.Item>
    </Menu>
  );
};
