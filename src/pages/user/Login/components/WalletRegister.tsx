import { ConnectWallet } from '@/components/ConnectWallet';
import { setUsername, signup, usersUsernameValidate } from '@/services/api/meta-ucenter';
import { storeSet } from '@/utils/store';
import { Button, Form, Input, message } from 'antd';
import { trim } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { history, useIntl, useModel } from 'umi';
import { useWallet } from 'use-wallet';
import { KEY_IS_LOGIN, rules } from '../../../../../config';
import styles from './index.less';

interface Props {
  setWalletModeFn: (value: LoginType.WalletMode) => void;
}

const WalletRegister: React.FC<Props> = ({ setWalletModeFn }) => {
  const intl = useIntl();
  const [formResister] = Form.useForm();
  const [hasStarted, setHasStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timerUsername, setTimerUsername] = useState<ReturnType<typeof setTimeout>>(null as any);
  const { refresh } = useModel('@@initialState');
  const wallet = useWallet();
  const isConnected = wallet.isConnected();

  // 更新用户名
  const updateUsername = useCallback(
    async (data: LoginType.UsersMeUsernameState) => {
      const res = await setUsername(data);
      if (res.statusCode === 200) {
        await refresh();
        setLoading(false);

        history.push('/user/info');
      } else {
        message.error(res.message);
      }
    },
    [refresh],
  );

  const startSignup = async (): Promise<void> => {
    const res = await signup(wallet);
    try {
      if (res.statusCode === 201) {
        message.success({
          content: intl.formatMessage({ id: 'messages.login.signUpSuccessfully' }),
        });

        // 记录登陆
        storeSet(KEY_IS_LOGIN, 'true');
      } else {
        message.warning({ content: res.message });
      }
    } catch (e: any) {
      setLoading(false);
      if (e?.data?.statusCode === 403) {
        message.warning({ content: intl.formatMessage({ id: 'messages.login.codeHasExpired' }) });
      } else if (e?.data?.statusCode === 400) {
        message.warning({
          content: intl.formatMessage({ id: 'messages.login.wrongCaptchaCode' }),
        });
      } else {
        message.warning({ content: intl.formatMessage({ id: 'messages.fail' }) });
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      if (!hasStarted) {
        setHasStarted(true);
        startSignup();
      } else {
        message.warn({
          content:
            "You've already started signup. If your wallet is not responding, please refresh this page.",
        });
        return;
      }
    }
  }, [isConnected]); /* eslint-disable-line react-hooks/exhaustive-deps */

  /**
   * verify username rules
   * 验证用户名是否存在
   * @return {*}  {Promise<void>}
   */
  const verifyUsernameRule = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reg = new RegExp(rules.usernameReg);
      const values = formResister.getFieldsValue();
      const result = reg.test(trim(values.username));
      if (result) {
        clearTimeout(timerUsername);
        const _timer = setTimeout(async () => {
          try {
            const res = await usersUsernameValidate({ username: trim(values.username) });
            if (res.statusCode === 200) {
              if (res.data.isExists) {
                reject(intl.formatMessage({ id: 'messages.login.usernameExist' }));
              } else {
                resolve();
              }
            } else {
              reject(intl.formatMessage({ id: 'messages.login.verificationFailed' }));
            }
          } catch (e: any) {
            console.log('Failed:', e);
            let _message;
            if (e?.data?.message) {
              if (Array.isArray(e.data.message)) {
                _message =
                  intl.formatMessage({ id: 'messages.login.verificationFailed' }) +
                  ' ' +
                  e.data.message.reduce((a: string, b: string) => a + (a && '、') + b, '');
              } else {
                _message =
                  intl.formatMessage({ id: 'messages.login.verificationFailed' }) +
                  ' ' +
                  e.data.message;
              }
            } else {
              _message = intl.formatMessage({ id: 'messages.login.verificationFailed' });
            }
            reject(_message);
          }
        }, 500);

        setTimerUsername(_timer);
      } else {
        reject(
          intl.formatMessage(
            { id: 'messages.login.usernameRules' },
            { min: rules.username.min, max: rules.username.max },
          ),
        );
      }
    });
  };

  return (
    <Form
      form={formResister}
      className={styles.formWallet}
      name="wallet-register"
      layout="vertical"
      initialValues={{ remember: false }}
      onFinish={updateUsername}
    >
      <ConnectWallet />

      <Form.Item
        className={styles.formWalletItem}
        label=""
        name="username"
        rules={[
          { required: true, message: intl.formatMessage({ id: 'messages.login.enterUsername' }) },
          { validator: verifyUsernameRule },
        ]}
      >
        <Input
          className="form-input"
          placeholder={`${intl.formatMessage({
            id: 'messages.login.enterUsername',
          })}(${intl.formatMessage({ id: 'messages.login.cannotBeModified' })})`}
          autoComplete="new-text"
        />
      </Form.Item>

      <Form.Item className={styles.formWalletItem}>
        <section className={styles.formWalletAction}>
          <Button htmlType="submit" loading={loading} className={styles.formWalletBtn}>
            {intl.formatMessage({ id: 'login.setUsername' })}
          </Button>
          <button
            type="button"
            onClick={() => setWalletModeFn('login')}
            className={styles.formWalletBtnText}
          >
            {intl.formatMessage({ id: 'login.signIn' })}
          </button>
        </section>
      </Form.Item>
    </Form>
  );
};

export default WalletRegister;
