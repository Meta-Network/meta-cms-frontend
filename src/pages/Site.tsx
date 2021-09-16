import { Card } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, { ProFormText, ProFormUploadButton, ProFormTextArea } from '@ant-design/pro-form';

export default () => {
  return (
    <PageContainer title="站点信息设置" content={<p>在这里对个人站点的信息进行设置</p>}>
      <Card>
        <ProForm
          name="site-info"
          // initialValues={initialValues}
          // onFinish={handleFinishing}
        >
          <ProFormText width="md" name="title" label="标题" placeholder="你的 Meta Space 标题" />
          <ProFormText
            width="md"
            name="subtitle"
            label="副标题"
            placeholder="你的 Meta Space 副标题"
          />
          <ProFormText
            width="md"
            name="author"
            label="作者"
            placeholder="作为 Meta Space 拥有者的名称"
          />
          <ProFormTextArea
            width="md"
            name="description"
            label="描述"
            placeholder="你的 Meta Space 描述"
          />
          <ProFormText width="md" name="keywords" label="设置关键字" />
          <ProFormText width="md" name="language" label="语言" placeholder="Meta Space 语言设置" />
          <ProFormText width="md" name="timezone" label="时区" placeholder="Meta Space 时区设置" />
          <ProFormUploadButton
            extra={<p style={{ paddingTop: 5 }}>展示在标签页上，可用工具从图片生成</p>}
            label="Meta Space 的网站图标"
            name="favicon"
            title="上传Favicon"
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};
