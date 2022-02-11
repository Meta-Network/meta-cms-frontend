import { getDefaultSiteConfig } from '@/services/api/meta-cms';
import { Card, Form } from 'antd';
import { useEffect } from 'react';
import { useIntl } from 'umi';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import FormattedDescription from '@/components/FormattedDescription';

const platformsAliases = {
  GITHUB: 'GitHub',
  GITEE: 'Gitee',
};

export default () => {
  const intl = useIntl();
  const [form] = Form.useForm();

  useEffect(() => {
    getDefaultSiteConfig().then((config) => {
      form.setFieldsValue({
        domain: config?.data?.domain,
        platform: platformsAliases[config?.data?.storageType],
      });
    });
  }, [form]);

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.domain.title' })}
      content={<FormattedDescription id="messages.domain.description" />}
    >
      <Card>
        <ProForm
          form={form}
          name="domain-setting"
          labelAlign="left"
          submitter={{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render: (props, doms) => {
              return null;
            },
          }}
        >
          <ProForm.Group>
            <ProFormText
              width="sm"
              name="platform"
              readonly={true}
              label={intl.formatMessage({ id: 'messages.domain.form.label' })}
            />
            <ProFormText
              width="md"
              name="domain"
              readonly={true}
              label={intl.formatMessage({ id: 'messages.domain.form.content' })}
              placeholder={intl.formatMessage({ id: 'messages.domain.form.placeholder' })}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
    </PageContainer>
  );
};
