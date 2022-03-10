import React, { useState, useCallback } from 'react';
import { Form, Input, message, Button } from 'antd';
import { trim } from 'lodash';
import { history, useModel, useIntl } from 'umi';
import styles from './index.less';
import EmailCode from './EmailCode';
import { KEY_IS_LOGIN, rules } from '../../../../../config/index';
import { storeSet } from '../../../../utils/store';
import {
  accountsEmailSignup,
  accountsEmailVerify,
  usersMeUsername,
  usersUsernameValidate,
} from '@/services/api/meta-ucenter';

interface Props {
  readonly inviteCode: string;
  setEmailModeFn: (value: LoginType.EmailMode) => void;
}

const EmailRegisterInfo: React.FC<Props> = ({ inviteCode, setEmailModeFn }) => {
  const intl = useIntl();
  const [formResister] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>(null as any);
  const [timerUsername, setTimerUsername] = useState<ReturnType<typeof setTimeout>>(null as any);
  const { refresh } = useModel('@@initialState');

  // 更新用户名
  const updateUsername = useCallback(
    async (data: LoginType.UsersMeUsernameState) => {
      try {
        const res = await usersMeUsername(data);
        if (res.statusCode === 200) {
          // console.log(res.message)
        } else {
          console.error(res.message);
        }
      } catch (e) {
        console.error(e);
      } finally {
        await refresh();
        setLoading(false);

        history.push('/user/info');
      }
    },
    [refresh],
  );

  // 注册
  const onFinishEmail = useCallback(
    async (values: any): Promise<void> => {
      // console.log('Success:', values);

      setLoading(true);

      const { email, code, username } = values;
      try {
        const resEmailSignup = await accountsEmailSignup(inviteCode, {
          account: trim(email),
          verifyCode: trim(code),
          hcaptchaToken: 'hcaptcha_token_here',
        });
        if (resEmailSignup.statusCode === 201) {
          message.success({
            content: intl.formatMessage({ id: 'messages.login.signUpSuccessfully' }),
          });

          // 记录登陆
          storeSet(KEY_IS_LOGIN, 'true');

          await updateUsername({
            username: username,
          });
        } else {
          message.warning({ content: resEmailSignup.message });
          setLoading(false);
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
    },
    [updateUsername, inviteCode, intl],
  );

  const onFinishFailedEmail = (errorInfo: any): void => {
    console.log('Failed:', errorInfo);
  };

  /**
   *校验邮箱是否存在
   *
   * @return {*}  {Promise<void>}
   */
  const verifyEmailRule = async (): Promise<void> => {
    // https://github.com/ant-design/ant-design/issues/23077
    return new Promise((resolve, reject) => {
      clearTimeout(timer);
      const _timer = setTimeout(async () => {
        const values = await formResister.getFieldsValue();
        if (!trim(values.email)) {
          reject(intl.formatMessage({ id: 'messages.login.enterEmail' }));
          return;
        }
        try {
          const res = await accountsEmailVerify({ account: trim(values.email) });
          if (res.statusCode === 200) {
            if (res.data.isExists) {
              reject(intl.formatMessage({ id: 'messages.login.emailHasBeenSignUp' }));
            } else {
              resolve();
            }
          } else {
            reject(intl.formatMessage({ id: 'messages.login.verificationFailed' }));
          }
        } catch (e: any) {
          console.log('Failed:', e);
          reject(intl.formatMessage({ id: 'messages.login.verificationFailed' }));
        } finally {
        }
      }, 500);

      setTimer(_timer);
    });
  };
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
      className={styles.formEmail}
      name="email-register"
      layout="vertical"
      initialValues={{ remember: false }}
      onFinish={onFinishEmail}
      onFinishFailed={onFinishFailedEmail}
    >
      <Form.Item
        className={styles.formEmailItem}
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

      <Form.Item
        className={styles.formEmailItem}
        label=""
        name="email"
        rules={[
          {
            required: true,
            type: 'email',
            message: intl.formatMessage({ id: 'messages.login.enterValidEmail' }),
          },
          { validator: verifyEmailRule },
        ]}
      >
        <Input
          className="form-input"
          placeholder={intl.formatMessage({ id: 'messages.login.enterEmail' })}
          autoComplete="new-text"
        />
      </Form.Item>

      <section className={styles.formEmailCode}>
        <Form.Item
          className={styles.formEmailItem}
          label=""
          name="code"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'messages.login.enterVerificationCode' }),
            },
          ]}
        >
          <Input
            className="form-input"
            placeholder={intl.formatMessage({ id: 'messages.login.enterVerificationCode' })}
            autoComplete="off"
            maxLength={8}
          />
        </Form.Item>
        <EmailCode form={formResister} />
      </section>

      <Form.Item className={styles.formEmailItem}>
        <section className={styles.formEmailAction}>
          <Button htmlType="submit" loading={loading} className={styles.formEmailBtn}>
            {intl.formatMessage({ id: 'login.signUp' })}
          </Button>
          <button
            type="button"
            onClick={() => setEmailModeFn('login')}
            className={styles.formEmailBtnText}
          >
            {intl.formatMessage({ id: 'login.signIn' })}
          </button>
        </section>
      </Form.Item>
    </Form>
  );
};

export default EmailRegisterInfo;
