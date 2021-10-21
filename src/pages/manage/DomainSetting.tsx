import { useIntl } from 'umi';
import { useState } from 'react';
import { Button, Card } from 'antd';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import FormattedInfo from '@/components/FormattedInfo';

export default () => {
  const intl = useIntl();
  const [isPlatformEditable, setIsPlatformEditable] = useState<boolean>(false);

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.domain.title' })}
      content={<FormattedInfo id="messages.domain.info" />}
    >
      <Card>
        <ProForm
          name="domain-setting"
          labelAlign="left"
          initialValues={{ domain: 'metaspace.federarks.xyz', platform: 'github' }}
          onFinish={async (values) => console.log(values)}
          submitter={{
            render: (props, doms) => {
              doms.reverse();
              return [
                ...doms,
                <Button
                  key="change-platform"
                  type="primary"
                  danger
                  onClick={() => setIsPlatformEditable(true)}
                >
                  {intl.formatMessage({ id: 'messages.domain.form.edit' })}
                </Button>,
              ];
            },
          }}
        >
          <ProForm.Group>
            <ProFormSelect
              width="md"
              name="platform"
              label={intl.formatMessage({ id: 'messages.domain.form.label' })}
              valueEnum={{
                github: 'GitHub',
                gitee: 'Gitee',
              }}
              disabled={!isPlatformEditable}
            />
            <ProFormText
              width="md"
              name="domain"
              label={intl.formatMessage({ id: 'messages.domain.form.content' })}
              placeholder={intl.formatMessage({ id: 'messages.domain.form.placeholder' })}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
    </PageContainer>
  );
};
