import { message } from 'antd';
import { useState } from 'react';
import { useIntl, useModel } from 'umi';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { isDomainForbidden } from '@/services/api/meta-cms';

export default () => {
  const intl = useIntl();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { domainSetting, setDomainSetting } = useModel('storage');

  const updateDomainSettings = async (values: { domain: string }) => {
    const { domain } = values;
    setDomainSetting(domain);
    message.success(intl.formatMessage({ id: 'messages.domain.updated' }));
  };

  return (
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
          addonAfter: `.${META_SPACE_BASE_DOMAIN}`,
        }}
        name="domain"
        placeholder={intl.formatMessage({ id: 'messages.domain.enterPrefixDomain' })}
        validateStatus={isSuccess ? 'success' : undefined}
        help={isSuccess ? intl.formatMessage({ id: 'messages.domain.isValid' }) : undefined}
        rules={[
          {
            validator: async (_, value) => {
              if (!value) {
                setIsSuccess(false);
                return Promise.reject(
                  new Error(intl.formatMessage({ id: 'messages.domain.shouldNotBeEmpty' })),
                );
              }
              if (!value.match(/^\w{3,16}$/)) {
                setIsSuccess(false);
                return Promise.reject(
                  new Error(intl.formatMessage({ id: 'messages.domain.shouldMatchRegex' })),
                );
              }
              const isForbidden = await isDomainForbidden(value);
              if (isForbidden) {
                setIsSuccess(false);
                return Promise.reject(
                  new Error(intl.formatMessage({ id: 'messages.domain.isForbidden' })),
                );
              }
              setIsSuccess(true);
              return Promise.resolve();
            },
          },
        ]}
      />
    </ProForm>
  );
};
