import React, { useState } from 'react';
import { message, Upload } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { uploadAvatar } from '@/services/api/global';
import { requestStorageToken } from '@/services/api/meta-ucenter';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ProForm, { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
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

  const [uploading, setUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>(siteSetting.favicon || '');

  const author = initialState?.currentUser?.nickname || '';
  const initialValues = {
    language: 'zh',
    timezone: 'UTC+8',
    author,
    ...siteSetting,
  };

  const customRequest = async ({ file }: { file: File }): Promise<void> => {
    const done = message.loading('文件上传中...请稍候', 0);
    setUploading(true);
    const tokenRequest = await requestStorageToken();
    const token = tokenRequest.data;

    if (!token) {
      if (tokenRequest.statusCode === 401) {
        message.error('图像上传失败，请重新登录。');
      }
      message.error('图像上传失败。内部错误或无网络。');
    }

    const form = new FormData();
    form.append('file', file);

    const result = await uploadAvatar(form, token);
    done();

    if (result.statusCode === 201) {
      setImageUrl(result.data.publicUrl);
      message.success('上传成功，请提交您的站点信息设置。');
    } else {
      message.error('图像上传失败。');
    }
    setUploading(false);
  };

  const handleFinishing = async (values: GLOBAL.SiteSetting) => {
    values.favicon = imageUrl; // eslint-disable-line no-param-reassign
    setSiteSetting(values);
    message.success('成功保存站点信息设置。');
  };

  return (
    <div className={styles.container}>
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
        <ProForm.Item
          name="favicon"
          getValueProps={(value) => [value]}
          valuePropName={'fileList'}
          label="网站图标"
          extra=".ico格式，展示在标签页上，可用工具从图片生成"
          rules={[{ required: true, message: '请上传一个站点图标' }]}
        >
          <Upload
            title="上传站点图标"
            listType="picture-card"
            /*
              // @ts-ignore */
            customRequest={customRequest}
            showUploadList={false}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="favicon preview" style={{ width: '80%', height: '80%' }} />
            ) : (
              <div>
                {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </ProForm.Item>
      </ProForm>
    </div>
  );
};
