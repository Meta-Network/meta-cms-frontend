import { message } from 'antd';
import ProCard from '@ant-design/pro-card';
import { useModel } from '@@/plugin-model/useModel';
import ProForm, {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-form';
import React from 'react';
import styles from './styles.less';

export default () => {
  const { initialState } = useModel('@@initialState');
  const {
    siteSetting,
    setSiteSetting,
  }: {
    siteSetting: Partial<GLOBAL.SiteSetting>;
    setSiteSetting: React.Dispatch<React.SetStateAction<GLOBAL.SiteSetting>>;
  } = useModel('storage');

  const author = initialState?.currentUser?.nickname || '';
  const initialValues = {
    language: 'zh',
    timezone: 'UTC+8',
    author,
    ...siteSetting,
  };

  const handleFinishing = async (values: GLOBAL.SiteSetting) => {
    setSiteSetting(values);
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
          initialValues={initialValues}
          onFinish={handleFinishing}
          requiredMark="optional"
        >
          <ProFormText
            width="md"
            name="title"
            label="标题"
            placeholder="你的 Meta Space 标题"
            rules={[{ required: true }]}
          />
          <ProFormText
            width="md"
            name="subtitle"
            label="副标题"
            placeholder="你的 Meta Space 副标题"
            rules={[{ required: true }]}
          />
          <ProFormText
            width="md"
            name="author"
            label="作者"
            placeholder="作为 Meta Space 拥有者的名称"
            rules={[{ required: true }]}
          />
          <ProFormTextArea
            width="md"
            name="description"
            label="描述"
            placeholder="你的 Meta Space 描述"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            mode="tags"
            width="md"
            name="keywords"
            fieldProps={{
              open: false,
            }}
            label="关键字"
            extra="其他人在搜索这些关键字时会更容易找到你的站点"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            width="md"
            name="language"
            label="语言"
            rules={[{ required: true, message: '请选择您的站点语言' }]}
            valueEnum={{
              zh: '中文',
              en: 'English',
              jp: '日本語',
              es: 'Español',
            }}
          />
          <ProFormText
            width="md"
            name="timezone"
            label="时区"
            placeholder="Meta Space 时区设置"
            rules={[{ required: true }]}
          />
          <ProFormUploadButton
            extra=".ico格式，展示在标签页上，可用工具从图片生成"
            label="网站图标"
            name="favicon"
            title="上传站点图标"
            rules={[{ required: true, message: '请上传一个站点图标' }]}
          />
        </ProForm>
      </ProCard>
    </div>
  );
};
