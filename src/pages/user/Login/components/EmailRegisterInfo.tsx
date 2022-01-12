import React, { useState, useCallback } from 'react';
import { Form, Input, message, Button } from 'antd';
import { trim } from 'lodash';
import { history } from 'umi';
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
  const [formResister] = Form.useForm();
  const [loading] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>(null as any);
  const [timerUsername, setTimerUsername] = useState<ReturnType<typeof setTimeout>>(null as any);

  // 更新用户名
  const updateUsername = useCallback(async (data: LoginType.UsersMeUsernameState) => {
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
      history.push('/');
    }
  }, []);

  // 注册
  const onFinishEmail = useCallback(
    async (values: any): Promise<void> => {
      console.log('Success:', values);

      const { email, code, username } = values;
      try {
        const resEmailSignup = await accountsEmailSignup(inviteCode, {
          account: trim(email),
          verifyCode: trim(code),
          hcaptchaToken: 'hcaptcha_token_here',
        });
        if (resEmailSignup.statusCode === 201) {
          message.success({ content: '注册成功' });

          // 记录登陆
          storeSet(KEY_IS_LOGIN, 'true');

          await updateUsername({
            username: username,
          });
        } else {
          message.warning({ content: resEmailSignup.message });
        }
      } catch (e: any) {
        if (e?.data?.statusCode === 403) {
          message.warning({ content: '频繁操作验证码已失效，请重新获取' });
        } else if (e?.data?.statusCode === 400) {
          message.warning({ content: '验证码不匹配' });
        } else {
          message.warning({ content: '失败' });
          console.error(e);
        }
      }
    },
    [updateUsername, inviteCode],
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
          reject('请输入邮箱');
          return;
        }
        try {
          const res = await accountsEmailVerify({ account: trim(values.email) });
          if (res.statusCode === 200) {
            if (res.data.isExists) {
              reject('邮箱已注册');
            } else {
              resolve();
            }
          } else {
            reject('验证失败');
          }
        } catch (e: any) {
          console.log('Failed:', e);
          reject('验证失败');
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
                reject('用户名已存在');
              } else {
                resolve();
              }
            } else {
              reject('验证失败');
            }
          } catch (e: any) {
            console.log('Failed:', e);
            let _message;
            if (e?.data?.message) {
              if (Array.isArray(e.data.message)) {
                _message =
                  '验证失败' +
                  ' ' +
                  e.data.message.reduce((a: string, b: string) => a + (a && '、') + b, '');
              } else {
                _message = '验证失败' + ' ' + e.data.message;
              }
            } else {
              _message = '验证失败';
            }
            reject(_message);
          }
        }, 500);

        setTimerUsername(_timer);
      } else {
        reject(`用户名仅允许 小写, 数字, "-" 且长度为 ${rules.username.min}-${rules.username.max}`);
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
        rules={[{ required: true, message: '请输入用户名' }, { validator: verifyUsernameRule }]}
      >
        <Input
          className="form-input"
          placeholder={`${'请输入用户名'}(${'不可修改'})`}
          autoComplete="new-text"
        />
      </Form.Item>

      <Form.Item
        className={styles.formEmailItem}
        label=""
        name="email"
        rules={[
          { required: true, type: 'email', message: '请输入有效邮箱' },
          { validator: verifyEmailRule },
        ]}
      >
        <Input className="form-input" placeholder={'请输入邮箱'} autoComplete="new-text" />
      </Form.Item>

      <section className={styles.formEmailCode}>
        <Form.Item
          className={styles.formEmailItem}
          label=""
          name="code"
          rules={[{ required: true, message: '请输入验证码' }]}
        >
          <Input
            className="form-input"
            placeholder={'请输入验证码'}
            autoComplete="off"
            maxLength={8}
          />
        </Form.Item>
        <EmailCode form={formResister} />
      </section>

      <Form.Item className={styles.formEmailItem}>
        <section className={styles.formEmailAction}>
          <Button htmlType="submit" loading={loading} className={styles.formEmailBtn}>
            注册
          </Button>
          <button
            type="button"
            onClick={() => setEmailModeFn('login')}
            className={styles.formEmailBtnText}
          >
            登录
          </button>
        </section>
      </Form.Item>
    </Form>
  );
};

export default EmailRegisterInfo;
