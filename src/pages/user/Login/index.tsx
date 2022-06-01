import { Image } from 'antd';
import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { history, useModel } from 'umi';
import LogoAuth from '../../../assets/svg/login_auth.svg';
import Email from './components/Wallet';
import styles from './index.less';

const Login: React.FC = () => {
  const [mode] = useState<'email'>('email'); // email ...
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    if (initialState?.currentUser) {
      history.push('/');
    }
  }, [initialState]);

  // animated
  const animatedDecoration = useSpring({
    from: { x: 40, opacity: 0 },
    to: { x: 0, opacity: 1 },
  });
  const animatedMain = useSpring({
    from: { x: -40, opacity: 0 },
    to: { x: 0, opacity: 1 },
  });

  return (
    <section className={styles.wrapper}>
      <section className={styles.wrapperInner}>
        <animated.section style={{ ...animatedMain }} className={styles.wrapperMain}>
          <section>{mode === 'email' ? <Email /> : null}</section>
        </animated.section>
        <animated.section style={{ ...animatedDecoration }} className={styles.wrapperDecoration}>
          <Image
            preview={false}
            src={LogoAuth}
            alt={'Meta Network'}
            width={'100%'}
            height={'100%'}
          />
        </animated.section>
      </section>
    </section>
  );
};

export default Login;
