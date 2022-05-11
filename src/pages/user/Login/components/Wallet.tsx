import { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { history, useIntl } from 'umi';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { UseWalletProvider } from 'use-wallet';
import WalletLogin from './WalletLogin';
import WalletRegister from './WalletRegister';
import ToggleServers from './ToggleServers';
import { storeGet } from '@/utils/store';
import { KEY_IS_LOGIN } from '../../../../../config';
import styles from './index.less';

const Wallet = () => {
  const intl = useIntl();

  // wallet 登录模式
  const [walletMode, setWalletMode] = useState<LoginType.WalletMode>('login');

  // 设置 wallet 登录模式
  const setWalletModeFn = (val: LoginType.WalletMode): void => {
    setWalletMode(val);
  };

  // 没有登录过
  useEffect(() => {
    const isLogin = storeGet(KEY_IS_LOGIN);
    if (!isLogin) {
      setWalletModeFn('register');
    }
  }, []);

  return (
    <UseWalletProvider
      connectors={{
        injected: {
          chainId: [1, 4],
        },
        walletconnect: {
          rpc: {
            1: 'https://mainnet.infura.io/v3/a0d8c94ba9a946daa5ee149e52fa5ff1',
            4: 'https://rinkeby.infura.io/v3/a0d8c94ba9a946daa5ee149e52fa5ff1',
          },
          bridge: 'https://bridge.walletconnect.org',
          pollingInterval: 12000,
        },
      }}
    >
      <Tooltip title={intl.formatMessage({ id: 'login.backToHomepage' })}>
        <Button
          className={styles.buttonBack}
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/')}
        />
      </Tooltip>
      <p className={styles.buttonMethods}>
        {walletMode === 'login'
          ? intl.formatMessage({ id: 'login.signIn' })
          : intl.formatMessage({ id: 'login.createAccount' })}
      </p>
      <ToggleServers />
      {walletMode === 'login' ? (
        <WalletLogin setWalletModeFn={setWalletModeFn} />
      ) : walletMode === 'register' ? (
        <WalletRegister setWalletModeFn={setWalletModeFn} />
      ) : null}
    </UseWalletProvider>
  );
};

export default Wallet;
