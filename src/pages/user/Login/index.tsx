import React, { useState } from 'react';
import { Image } from 'antd';
import Email from './components/Email';
import LogoAuth from '../../../assets/svg/login_auth.svg';
import styles from './index.less';

const Login: React.FC = () => {
  const [mode] = useState<'email'>('email'); // email ...

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
