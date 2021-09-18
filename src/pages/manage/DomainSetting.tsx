import { Button, Card } from 'antd';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';

export default () => {
  const [isPlatformEditable, setIsPlatformEditable] = useState<boolean>(false);

  return (
    <PageContainer
      breadcrumb={{}}
      title="域名配置"
      content={
        <div className="text-info">
          <p>可以在此配置你的域名，即别人访问到你的 Meta Space 的地址。</p>
        </div>
      }
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
                  修改部署平台
                </Button>,
              ];
            },
          }}
        >
          <ProForm.Group>
            <ProFormSelect
              width="md"
              name="platform"
              label="部署平台"
              valueEnum={{
                github: 'GitHub',
                gitee: 'Gitee',
              }}
              disabled={!isPlatformEditable}
            />
            <ProFormText width="md" name="domain" label="域名设置" placeholder="你的站点域名" />
          </ProForm.Group>
        </ProForm>
      </Card>
    </PageContainer>
  );
};
