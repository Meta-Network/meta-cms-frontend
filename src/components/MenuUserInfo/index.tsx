import { Menu } from 'antd';
import { useCallback } from 'react';
import { history, useModel } from 'umi';
import { outLogin } from '@/services/api/meta-ucenter';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuInfo } from 'rc-menu/lib/interface';
import styles from './index.less';

const logout = async () => {
  await outLogin();
  if (window.location.pathname !== '/user/login') {
    history.push('/user/login');
  }
};

export default () => {
  const { setInitialState } = useModel('@@initialState');

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        setInitialState((s) => ({
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
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      <Menu.Item key="info">
        <UserOutlined />
        个人中心
      </Menu.Item>
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );
};
