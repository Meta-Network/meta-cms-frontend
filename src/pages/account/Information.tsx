import { saveImageCloud } from '@/services/api/global';
import { updateUserInfo } from '@/services/api/ucenter';
import React, { useState } from 'react';
import ImgCrop from 'antd-img-crop';
import styles from './Information.less';
import { useModel } from '@@/plugin-model/useModel';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, message, Card } from 'antd';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';

const convertFileToBase64 = (file: Blob): Promise<any> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', (err) => reject(err));

    reader.readAsBinaryString(file);
  });

const BaseView: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newAvatarSrc, setNewAvatarSrc] = useState('');
  const { initialState } = useModel('@@initialState');

  const handleChange = async (info: any) => {
    if (info.file.status === 'done') {
      const file = await convertFileToBase64(info.file.originFileObj);
      const result = await saveImageCloud({
        file,
        name: info.file.name,
      });
      if (result.message === 'ok') {
        console.log(result.data);
      } else {
        message.success('图像上传失败');
      }
    }
  };

  const handleFinish = async (values: API.UserInfo) => {
    if (newAvatarSrc !== '') {
      // eslint-disable-next-line no-param-reassign
      values.avatar = newAvatarSrc;
    }
    await updateUserInfo(values);
    message.success('更新基本信息成功');
  };

  const AvatarView = ({ avatar }: { avatar: string }) => (
    <>
      <div className={styles.avatar_title}>头像</div>
      <div className={styles.avatar}>
        <img src={avatar} alt="avatar" />
      </div>
      <ImgCrop rotate>
        <Upload onChange={handleChange} showUploadList={false}>
          <div className={styles.button_view}>
            <Button>
              <UploadOutlined />
              更换头像
            </Button>
          </div>
        </Upload>
      </ImgCrop>
    </>
  );

  return (
    <Card>
      <div className={styles.information}>
        <div className={styles.left}>
          <ProForm
            layout="vertical"
            onFinish={handleFinish}
            submitter={{
              resetButtonProps: {
                style: {
                  display: 'none',
                },
              },
              submitButtonProps: {
                children: '更新基本信息',
              },
            }}
            initialValues={{ ...initialState?.currentUser }}
            hideRequiredMark
          >
            <ProFormText
              width="md"
              name="name"
              label="昵称"
              rules={[
                {
                  required: true,
                  message: '请输入您的昵称!',
                },
              ]}
            />
            <ProFormTextArea
              name="profile"
              label="个人简介"
              rules={[
                {
                  required: true,
                  message: '请输入个人简介!',
                },
              ]}
              placeholder="个人简介"
            />
          </ProForm>
        </div>
        <div className={styles.right}>
          <AvatarView avatar={initialState?.currentUser?.avatar || ''} />
        </div>
      </div>
    </Card>
  );
};

export default BaseView;
