import { isDomainForbidden } from '@/services/api/meta-cms';
import { useModel } from '@@/plugin-model/useModel';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { message } from 'antd';
import { useState } from 'react';
import { useIntl } from 'umi';
import styles from './styles.less';

export default () => {
  const intl = useIntl();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { domainSetting, setDomainSetting } = useModel('storage');

  const updateDomainSettings = async (values: { domain: string }) => {
    const { domain } = values;
    setDomainSetting(domain);
    message.success(intl.formatMessage({ id: 'notifications.domain.updated' }));
  };

  return (
    <div className={styles.container}>
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
            addonAfter: `.${META_SPACE_BASE_DOMAIN || 'metaspaces.me'}`,
          }}
          name="domain"
          placeholder={intl.formatMessage({ id: 'messages.domain.enterPrefixDomain' })}
          validateStatus={isSuccess ? 'success' : undefined}
          help={isSuccess ? intl.formatMessage({ id: 'notifications.domain.isValid' }) : undefined}
          rules={[
            {
              validator: async (_, value) => {
                if (!value) {
                  setIsSuccess(false);
                  return Promise.reject(
                    new Error(intl.formatMessage({ id: 'notifications.domain.shouldNotBeEmpty' })),
                  );
                }
                const isForbidden = await isDomainForbidden(value);
                if (isForbidden) {
                  setIsSuccess(false);
                  return Promise.reject(
                    new Error(intl.formatMessage({ id: 'notifications.domain.isForbidden' })),
                  );
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
