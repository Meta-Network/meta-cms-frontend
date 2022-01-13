import React, { useState, useEffect } from 'react';
import { Image } from 'antd';
import { history, useModel } from 'umi';
import { useSpring, animated } from 'react-spring';
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
