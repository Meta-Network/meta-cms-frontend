import ProForm, { ProFormText, ProFormUploadButton, ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';

export default () => {
  return (
    <PageContainer title="站点信息设置" content="在这里对个人站点的信息进行设置">
      <Card>
        <ProForm
          name="site-info"
          initialValues={{ title: 'site title' }}
          onFinish={async (values) => console.log(values)}
        >
          <ProForm.Group>
            <ProFormText width="md" name="title" label="标题" placeholder="你的 Meta Space 标题" />
            <ProFormText
              width="md"
              name="subtitle"
              label="副标题"
              placeholder="你的 Meta Space 副标题"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              width="md"
              name="author"
              label="作者"
              placeholder="作为 Meta Space 拥有者的名称"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormTextArea
              width="xl"
              name="description"
              label="描述"
              placeholder="你的 Meta Space 描述"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText name="seo" label="SEO 信息" />
            <ProFormText name="timezone" label="时区设置" />
          </ProForm.Group>
          <ProFormUploadButton
            extra="支持扩展名：.jpg .png"
            label="Meta Space 的网站图标"
            name="favicon"
            title="上传Logo"
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};
