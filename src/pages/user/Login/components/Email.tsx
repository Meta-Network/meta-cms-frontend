import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { history } from 'umi';
import { ArrowLeftOutlined } from '@ant-design/icons';
import EmailLogin from './EmailLogin';
import EmailRegister from './EmailRegister';
import ToggleServers from './ToggleServers';
import { storeGet } from '../../../../utils/store';
import { KEY_IS_LOGIN } from '../../../../../config/index';
import styles from './index.less';

interface Props {}

const Email: React.FC<Props> = () => {
  // email 登录模式
  const [emailMode, setEmailMode] = useState<LoginType.EmailMode>('login');

  // 设置 email 登录模式
  const setEmailModeFn = (val: LoginType.EmailMode): void => {
    setEmailMode(val);
  };

  // 没有登录过
  useEffect(() => {
    const isLogin = storeGet(KEY_IS_LOGIN);
    if (!isLogin) {
      setEmailModeFn('register');
    }
  }, []);

  return (
    <>
      <Tooltip title={'返回首页'}>
        <Button
          className={styles.buttonBack}
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/')}
        />
      </Tooltip>
      <p className={styles.buttonMethods}>{emailMode === 'login' ? '登录' : '创建账号'}</p>
      <ToggleServers />
      {emailMode === 'login' ? (
        <EmailLogin setEmailModeFn={setEmailModeFn} />
      ) : emailMode === 'register' ? (
        <EmailRegister setEmailModeFn={setEmailModeFn} />
      ) : null}
    </>
  );
};

export default Email;
