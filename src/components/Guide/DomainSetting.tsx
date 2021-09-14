import { isDomainForbidden } from '@/services/api/meta-cms';
import { useModel } from '@@/plugin-model/useModel';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { message } from 'antd';
import { useState } from 'react';
import styles from './styles.less';

export default () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { domainSetting, setDomainSetting } = useModel('storage');

  const updateDomainSettings = async (values: { domain: string }) => {
    const { domain } = values;
    setDomainSetting(domain);
    message.success('已成功更新域名。');
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <p>在此为您的站点选择一个域名，可以在之后被访问到的地址。</p>
        <p>您可以随后为其配置您的个人域名。</p>
      </div>
      <ProForm
        style={{ width: 500 }}
        name="site-info"
        initialValues={{ domain: domainSetting }}
        onFinish={updateDomainSettings}
        requiredMark="optional"
      >
        <ProFormText
          width="md"
          fieldProps={{
            addonAfter: '.metaspaces.me',
          }}
          name="domain"
          placeholder="输入前缀域名"
          validateStatus={isSuccess ? 'success' : undefined}
          help={isSuccess ? '此域名可用！' : undefined}
          rules={[
            {
              validator: async (_, value) => {
                if (!value) {
                  setIsSuccess(false);
                  return Promise.reject(new Error('域名不能为空。'));
                }
                const isForbidden = await isDomainForbidden(value);
                if (isForbidden) {
                  setIsSuccess(false);
                  return Promise.reject(new Error('此域名被禁用或已存在，请另选一个。'));
                }
                setIsSuccess(true);
                return Promise.resolve();
              },
            },
          ]}
        />
      </ProForm>
    </div>
  );
};
