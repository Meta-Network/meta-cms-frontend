import { message } from 'antd';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormText, ProFormTextArea, ProFormUploadButton } from '@ant-design/pro-form';
import { useModel } from '@@/plugin-model/useModel';
import styles from './styles.less';

export default () => {
  const { initialState } = useModel('@@initialState');
  let author = '';

  if (initialState && initialState.currentUser) {
    author = initialState.currentUser.nickname;
  }

  const handleFinishing = async (values: API.SiteInfo) => {
    window.localStorage.setItem('siteInfo', JSON.stringify(values));
    message.success('成功保存站点信息设置。');
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <p>为了定制个人站点，您需要为您的 Meta Space 填写下面的信息。</p>
        <p>数据会同步至 Meta Space，并在您的个人站点展示给访客。</p>
      </div>

      <ProCard>
        <ProForm
          style={{ width: 500 }}
          name="site-info"
          initialValues={{
            title: 'site title',
            timezone: 'UTC+8',
            language: 'zh-CN',
            author,
          }}
          onFinish={handleFinishing}
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
            extra="支持扩展名：.jpg .png"
            label="Meta Space 的网站图标"
            name="favicon"
            title="上传Favicon"
          />
        </ProForm>
      </ProCard>
    </div>
  );
};
