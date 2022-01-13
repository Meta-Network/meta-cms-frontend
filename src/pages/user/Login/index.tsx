import React, { useState, useEffect } from 'react';
import { Image } from 'antd';
import { history, useModel } from 'umi';
import Email from './components/Email';
import LogoAuth from '../../../assets/svg/login_auth.svg';
import styles from './index.less';

const Login: React.FC = () => {
  const [mode] = useState<'email'>('email'); // email ...
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    if (initialState?.currentUser) {
      history.push('/');
    }
  }, [initialState]);

  return (
    <section className={styles.wrapper}>
      <section className={styles.wrapperInner}>
        <section className={styles.wrapperMain}>
          <section>{mode === 'email' ? <Email /> : null}</section>
        </section>
        <section className={styles.wrapperDecoration}>
          <Image preview={false} src={LogoAuth} alt={'Meta Network'} />
        </section>
      </section>
    </section>
  );
};

export default Login;
