import { ConnectWallet } from '@/components/ConnectWallet';
import React, { useEffect, useState } from 'react';
import { Form, message } from 'antd';
import { history, useModel, useIntl } from 'umi';
import { login } from '@/services/api/meta-ucenter';
import { storeSet } from '@/utils/store';
import { KEY_IS_LOGIN } from '../../../../../config';
import styles from './index.less';
import { useWallet } from 'use-wallet';

interface Props {
  setWalletModeFn: (value: LoginType.WalletMode) => void;
}

const Wallet: React.FC<Props> = ({ setWalletModeFn }) => {
  const [formLogin] = Form.useForm();
  const { refresh } = useModel('@@initialState');
  const [hasStarted, setHasStarted] = useState(false);
  const intl = useIntl();
  const wallet = useWallet();
  const isConnected = wallet.isConnected();

  const startLogin = async (): Promise<void> => {
    try {
      const res = await login(wallet);

      if (res.statusCode === 200) {
        message.success({ content: intl.formatMessage({ id: 'messages.login.loginSuccessful' }) });
        // 记录登录
        storeSet(KEY_IS_LOGIN, 'true');
        await refresh();
        history.push('/');
      } else {
        message.warning({ content: intl.formatMessage({ id: 'messages.login.wrongCaptchaCode' }) });
      }
    } catch (e: any) {
      switch (e?.data?.statusCode) {
        case 400:
          message.warning({
            content: intl.formatMessage({ id: 'messages.login.wrongCaptchaCode' }),
          });
          break;
        case 401:
          message.warning({
            content: intl.formatMessage({ id: 'messages.login.accountNotExist' }),
          });
          break;
        case 403:
          message.warning({ content: intl.formatMessage({ id: 'messages.login.codeHasExpired' }) });
          break;
        default:
          message.warning({ content: intl.formatMessage({ id: 'messages.fail' }) });
          break;
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      if (!hasStarted) {
        setHasStarted(true);
        startLogin();
      } else {
        message.warn({
          content:
            "You've already started login. If your wallet is not responding, please refresh this page.",
        });
      }
    }
  }, [isConnected]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <Form form={formLogin} name="wallet-login" layout="vertical" className={styles.formWallet}>
      <ConnectWallet />

      <Form.Item className={styles.formWalletItem}>
        <section className={styles.formWalletAction}>
          <button
            type="button"
            onClick={() => setWalletModeFn('register')}
            className={styles.formWalletBtnText}
          >
            {intl.formatMessage({ id: 'login.signUp' })}
          </button>
        </section>
      </Form.Item>
    </Form>
  );
};

export default Wallet;
