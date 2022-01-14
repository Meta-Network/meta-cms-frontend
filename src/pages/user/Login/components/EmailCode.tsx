import React from 'react';
import { useCountDown } from 'ahooks';
import type { FormInstance } from 'antd';
import { message } from 'antd';
import { trim } from 'lodash';
import { useIntl } from 'umi';
import { emailGetVerificationCode } from '@/services/api/meta-ucenter';
import styles from './index.less';

interface Props {
  form: FormInstance<any>;
}

const EmailCode: React.FC<Props> = ({ form }) => {
  const intl = useIntl();

  const onEnd = () => {
    console.log('onEnd of the time');
  };
  const [count, setTargetDate] = useCountDown({ onEnd: onEnd });

  /**
   * send email code
   * @param token
   */
  const sendEmailCode = async () => {
    const { email } = await form.getFieldsValue();
    if (!trim(email)) {
      message.warning({ content: intl.formatMessage({ id: 'messages.login.enterEmail' }) });
      return;
    }
    try {
      const res = await emailGetVerificationCode({
        key: trim(email),
        hcaptchaToken: 'hcaptcha_token_here',
      });
      if (res.statusCode === 201) {
        setTargetDate(Date.now() + 60 * 1000);
        message.success({ content: intl.formatMessage({ id: 'messages.login.sendSuccessfully' }) });
      } else {
        console.error(res.message);
        message.error({ content: intl.formatMessage({ id: 'messages.login.sendFailed' }) });
      }
    } catch (e: any) {
      console.error(e);
      if (e?.data?.statusCode === 403) {
        const seconds = Math.ceil((Number(e?.data?.error) - Date.now()) / 1000) || 0;
        const _message = seconds
          ? intl.formatMessage({ id: 'messages.login.getEmailCodeManySeconds' }, { seconds })
          : intl.formatMessage({ id: 'messages.login.getEmailCodeMany' });
        message.warning({ content: _message });
      } else if (e?.data?.statusCode === 400) {
        message.warning({
          content: intl.formatMessage({ id: 'messages.login.invalidEmailAddress' }),
        });
      } else {
        message.warning({ content: intl.formatMessage({ id: 'messages.login.sendFailed' }) });
        console.error(e);
      }
    }
  };

  return (
    <>
      <button
        className={`${styles.buttonCode} ${count !== 0 ? 'g-red' : ''}`}
        type="button"
        disabled={count !== 0}
        onClick={sendEmailCode}
      >
        {count === 0
          ? intl.formatMessage({ id: 'component.button.send' })
          : `${Math.round(count / 1000)}s`}
      </button>
    </>
  );
};

export default EmailCode;
