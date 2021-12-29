/* eslint-disable */
import { UserOutlined } from '@ant-design/icons';
import Footer from '@/components/Footer';
import { startAssertion, startAttestation } from '@simplewebauthn/browser';
import { Alert, message } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useIntl, Link, history, FormattedMessage, SelectLang, useModel } from 'umi';
import {
  webauthnGetAssertion,
  webauthnGetAttestation,
  webauthnLogin,
  webauthnSignup,
} from '@/services/api/meta-ucenter';

import styles from './index.less';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setInitialState } = useModel('@@initialState');

  const intl = useIntl();

  const setUserInfo = async (user: GLOBAL.UserResponse) => {
    const userInfo = user;
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const handleLogin = async (values: any) => {
    setSubmitting(true);
    try {
      // 登录
      const options = await webauthnGetAssertion(values.account);
      console.log(options);
      const assertion = await startAssertion(options.data);
      console.log(assertion);

      const result = await webauthnLogin({ account: values.account, credential: assertion });
      if (result.message === 'ok') {
        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          }),
        );
        await setUserInfo(result.data.user);
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
        return;
      }
    } catch (error) {
      console.log(error);
      // @ts-ignore
      message.error(error.message);
    }
    setSubmitting(false);
  };

  const handleSignup = async (values: any) => {
    setSubmitting(true);
    try {
      // 登录
      const options = await webauthnGetAttestation(values.account);
      const attestation = await startAttestation(options.data);

      const result = await webauthnSignup(
        { account: values.account, credential: attestation },
        values.invitation,
      );
      if (result.message === 'ok') {
        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          }),
        );
        await setUserInfo(result.data.user);
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
        return;
      }
    } catch (error) {
      console.log(error);
      // @ts-ignore
      message.error(error.message);
    }
    setSubmitting(false);
  };

  const SignupForm = () => (
    <div className={styles.main}>
      <ProForm
        submitter={{
          searchConfig: {
            submitText: intl.formatMessage({
              id: 'pages.login.submit',
              defaultMessage: '注册用户',
            }),
          },
          render: (_, dom) => dom.pop(),
          submitButtonProps: {
            loading: submitting,
            size: 'large',
            style: {
              width: '100%',
            },
          },
        }}
        onFinish={async (values) => {
          await handleSignup(values as GLOBAL.EmailLoginParams);
        }}
      >
        {/* eslint-disable-next-line no-restricted-globals */}
        {status === 'error' && (
          <LoginMessage
            content={intl.formatMessage({
              id: 'pages.login.accountLogin.errorMessage',
              defaultMessage: '登陆错误',
            })}
          />
        )}
        {
          <>
            <ProFormText
              name="account"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.account.placeholder',
                defaultMessage: '注册的用户名',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.account.required"
                      defaultMessage="请输入用户名"
                    />
                  ),
                },
              ]}
            />
            <ProFormText
              name="invitation"
              fieldProps={{
                size: 'large',
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.account.placeholder',
                defaultMessage: '邀请码',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.account.required"
                      defaultMessage="请输入邀请码"
                    />
                  ),
                },
              ]}
            />
          </>
        }
      </ProForm>

      <div style={{ padding: '20px', textAlign: 'center' }}>
        <a onClick={() => setIsSignup(false)}>请点这里返回登录</a>
      </div>
    </div>
  );

  const LoginForm = () => (
    <div className={styles.main}>
      <ProForm
        submitter={{
          searchConfig: {
            submitText: intl.formatMessage({
              id: 'pages.login.submit',
              defaultMessage: '登录',
            }),
          },
          render: (_, dom) => dom.pop(),
          submitButtonProps: {
            loading: submitting,
            size: 'large',
            style: {
              width: '100%',
            },
          },
        }}
        onFinish={async (values) => {
          await handleLogin(values as GLOBAL.EmailLoginParams);
        }}
      >
        {/* eslint-disable-next-line no-restricted-globals */}
        {status === 'error' && (
          <LoginMessage
            content={intl.formatMessage({
              id: 'pages.login.accountLogin.errorMessage',
              defaultMessage: '登陆错误',
            })}
          />
        )}
        {
          <>
            <ProFormText
              name="account"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.account.placeholder',
                defaultMessage: '登录的用户名',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.account.required"
                      defaultMessage="请输入用户名"
                    />
                  ),
                },
              ]}
            />
          </>
        }
      </ProForm>

      <div style={{ padding: '20px', textAlign: 'center' }}>
        <a onClick={() => setIsSignup(true)}>还没有账号？请点这里注册哦</a>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src="/logo.svg" />
              <span className={styles.title}>Meta CMS</span>
            </Link>
          </div>
          <div className={styles.desc}>
            {intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          </div>
        </div>

        {isSignup ? <SignupForm /> : <LoginForm />}
      </div>
      <Footer />
    </div>
  );
};

export default Login;
