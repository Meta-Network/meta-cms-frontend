import React, { useState, useCallback } from 'react';
import { Form, Input, message, Button } from 'antd';
import { trim } from 'lodash';
import { invitationsValidate } from '@/services/api/meta-ucenter';
import styles from './index.less';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInviteCode: React.Dispatch<React.SetStateAction<string>>;
  setEmailModeFn: (value: LoginType.EmailMode) => void;
}

const EmailRegisterCode: React.FC<Props> = ({ setStep, setInviteCode, setEmailModeFn }) => {
  const [formResister] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 注册
  const onFinishEmail = useCallback(
    async (values: any): Promise<void> => {
      console.log('Success:', values);

      setLoading(true);
      const { inviteCode } = values;
      try {
        const res = await invitationsValidate({
          invitation: trim(inviteCode),
        });
        if (res.statusCode === 200) {
          if (!res.data.exists) {
            message.warning({ content: '邀请码不正确' });
          }

          if (res.data.available) {
            setStep(1);
            setInviteCode(inviteCode);
          } else {
            message.warning({ content: '邀请码已失效' });
          }
        } else {
          console.error(res.message);
          message.warning({ content: '邀请码不正确' });
        }
      } catch (e: any) {
        console.error(e);
        message.warning({ content: '邀请码不正确' });
      } finally {
        setLoading(false);
      }
    },
    [setStep, setInviteCode],
  );

  const onFinishFailedEmail = (errorInfo: any): void => {
    console.log('Failed:', errorInfo);
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
        label=""
        className={styles.formEmailItem}
        name="inviteCode"
        rules={[{ required: true, message: '请输入邀请码' }]}
      >
        <Input className="form-input" placeholder={'请输入邀请码'} autoComplete="new-text" />
      </Form.Item>
      <section>
        <p className={styles.formEmailRegisterCodeDescriptionTitle}>{'如何获取邀请码?'}</p>
        <section className={styles.formEmailRegisterCodeDescriptionText}>
          1.如果您是 Matataki 用户请在官网中登录后查看 消息通知，我们已经向您发送了邀请码
        </section>
        <section className={styles.formEmailRegisterCodeDescriptionText}>
          2.如果您是新用户请向已经登入的用户请求获得邀请码（每个新用户完成建站后可获得3个邀请码）
        </section>
      </section>

      <Form.Item className={styles.formEmailItem}>
        <section className={styles.formEmailAction}>
          <Button htmlType="submit" loading={loading} className={styles.formEmailBtn}>
            下一步
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

export default EmailRegisterCode;
