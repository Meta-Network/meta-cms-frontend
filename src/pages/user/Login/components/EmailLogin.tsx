import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { trim } from 'lodash';
import { history, useModel, useIntl } from 'umi';
import { emailLogin } from '@/services/api/meta-ucenter';
import EmailCode from './EmailCode';
import { storeSet } from '../../../../utils/store';
import { KEY_IS_LOGIN } from '../../../../../config/index';
import styles from './index.less';

interface Props {
  setEmailModeFn: (value: LoginType.EmailMode) => void;
}

const Email: React.FC<Props> = ({ setEmailModeFn }) => {
  const [formLogin] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { refresh } = useModel('@@initialState');
  const intl = useIntl();

  /**
   * 用户登录
   * @param values
   */
  const onFinishEmail = async (values: any): Promise<void> => {
    // console.log('Success:', values);

    const { email, code } = values;
    try {
      setLoading(true);
      const res = await emailLogin({
        account: trim(email),
        verifyCode: trim(code),
        hcaptchaToken: 'hcaptcha_token_here',
      });

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
      if (e?.data?.statusCode === 401) {
        message.warning({ content: intl.formatMessage({ id: 'messages.login.accountNotExist' }) });
      } else if (e?.data?.statusCode === 403) {
        message.warning({ content: intl.formatMessage({ id: 'messages.login.codeHasExpired' }) });
      } else if (e?.data?.statusCode === 400) {
        message.warning({ content: intl.formatMessage({ id: 'messages.login.wrongCaptchaCode' }) });
      } else {
        message.warning({ content: intl.formatMessage({ id: 'messages.fail' }) });
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailedEmail = (errorInfo: any): void => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      form={formLogin}
      name="email-login"
      layout="vertical"
      onFinish={onFinishEmail}
      onFinishFailed={onFinishFailedEmail}
      className={styles.formEmail}
    >
      <Form.Item
        label=""
        name="email"
        rules={[
          { required: true, message: intl.formatMessage({ id: 'messages.login.enterEmail' }) },
          {
            required: true,
            type: 'email',
            message: intl.formatMessage({ id: 'messages.login.enterValidEmail' }),
          },
        ]}
        className={styles.formEmailItem}
      >
        <Input
          className="form-input"
          placeholder={intl.formatMessage({ id: 'messages.login.enterEmail' })}
          autoComplete="on"
        />
      </Form.Item>

      <section className={styles.formEmailCode}>
        <Form.Item
          label=""
          name="code"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'messages.login.enterVerificationCode' }),
            },
          ]}
          className={styles.formEmailItem}
        >
          <Input
            className="form-input"
            placeholder={intl.formatMessage({ id: 'messages.login.enterVerificationCode' })}
            autoComplete="off"
            maxLength={8}
          />
        </Form.Item>
        <EmailCode form={formLogin} />
      </section>

      <Form.Item className={styles.formEmailItem}>
        <section className={styles.formEmailAction}>
          <Button htmlType="submit" loading={loading} className={styles.formEmailBtn}>
            {intl.formatMessage({ id: 'login.signIn' })}
          </Button>
          <button
            type="button"
            onClick={() => setEmailModeFn('register')}
            className={styles.formEmailBtnText}
          >
            {intl.formatMessage({ id: 'login.signUp' })}
          </button>
        </section>
      </Form.Item>
    </Form>
  );
};

export default Email;
