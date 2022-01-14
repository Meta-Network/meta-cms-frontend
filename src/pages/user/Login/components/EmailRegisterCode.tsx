import React, { useState, useCallback } from 'react';
import { Form, Input, message, Button } from 'antd';
import { trim } from 'lodash';
import { useIntl } from 'umi';
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
  const intl = useIntl();

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
            message.warning({
              content: intl.formatMessage({ id: 'messages.login.enterInvitationCodeError' }),
            });
          }

          if (res.data.available) {
            setStep(1);
            setInviteCode(inviteCode);
          } else {
            message.warning({
              content: intl.formatMessage({ id: 'messages.login.enterInvitationCodeInvalid' }),
            });
          }
        } else {
          console.error(res.message);
          message.warning({
            content: intl.formatMessage({ id: 'messages.login.enterInvitationCodeError' }),
          });
        }
      } catch (e: any) {
        console.error(e);
        message.warning({
          content: intl.formatMessage({ id: 'messages.login.enterInvitationCodeError' }),
        });
      } finally {
        setLoading(false);
      }
    },
    [setStep, setInviteCode, intl],
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
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'messages.login.enterInvitationCode' }),
          },
        ]}
      >
        <Input
          className="form-input"
          placeholder={intl.formatMessage({ id: 'messages.login.enterInvitationCode' })}
          autoComplete="new-text"
        />
      </Form.Item>
      <section>
        <p className={styles.formEmailRegisterCodeDescriptionTitle}>
          {intl.formatMessage({ id: 'login.invitationCodeHelpTitle' })}
        </p>
        <section className={styles.formEmailRegisterCodeDescriptionText}>
          {intl.formatMessage({ id: 'login.invitationCodeHelpRule.one' })}
        </section>
        <section className={styles.formEmailRegisterCodeDescriptionText}>
          {intl.formatMessage({ id: 'login.invitationCodeHelpRule.two' })}
        </section>
      </section>

      <Form.Item className={styles.formEmailItem}>
        <section className={styles.formEmailAction}>
          <Button htmlType="submit" loading={loading} className={styles.formEmailBtn}>
            {intl.formatMessage({ id: 'login.next' })}
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

export default EmailRegisterCode;
