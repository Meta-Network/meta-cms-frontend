import React from 'react';
import { useCountDown } from 'ahooks';
import type { FormInstance } from 'antd';
import { message } from 'antd';
import { trim } from 'lodash';
import { emailGetVerificationCode } from '@/services/api/meta-ucenter';
import styles from './index.less';

interface Props {
  form: FormInstance<any>;
}

const EmailCode: React.FC<Props> = ({ form }) => {
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
      message.warning({ content: '请输入邮箱' });
      return;
    }
    try {
      const res = await emailGetVerificationCode({
        key: trim(email),
        hcaptchaToken: 'hcaptcha_token_here',
      });
      if (res.statusCode === 201) {
        setTargetDate(Date.now() + 60 * 1000);
        message.success({ content: '发送成功' });
      } else {
        console.error(res.message);
        message.error({ content: '发送失败' });
      }
    } catch (e: any) {
      console.error(e);
      if (e?.data?.statusCode === 403) {
        const seconds = Math.ceil((Number(e?.data?.error) - Date.now()) / 1000) || 0;
        const _message = seconds
          ? `获取验证码次数过多，请 ${seconds} 秒后重试`
          : '获取验证码次数过多，请稍后重试';
        message.warning({ content: _message });
      } else if (e?.data?.statusCode === 400) {
        message.warning({ content: '邮箱地址无效' });
      } else {
        message.warning({ content: '发送失败' });
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
        {count === 0 ? '发送' : `${Math.round(count / 1000)}s`}
      </button>
    </>
  );
};

export default EmailCode;
