import { updateUserInfo, uploadAvatar } from '@/services/api/ucenter';
import React, { useState } from 'react';
import ImgCrop from 'antd-img-crop';
import styles from './Information.less';
import { useModel } from '@@/plugin-model/useModel';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, message, Card } from 'antd';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';

const getBinaryFile = (file: Blob): Promise<any> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', (err) => reject(err));
    reader.readAsArrayBuffer(file);
  });

const BaseView: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [userAvatar, setUserAvatar] = useState(initialState?.currentUser?.avatar);

  const beforeUpload = async (file: File) => {
    const done = message.loading('上传头像中...请稍候', 0);
    const binary: ArrayBuffer = await getBinaryFile(file);

    const result = await uploadAvatar({
      file: binary,
      name: file.name,
    });
    done();

    if (result.message === 'ok') {
      message.success('更新头像成功');
      setUserAvatar(result.data.avatar);
    } else {
      message.error('图像上传失败');
    }

    // disable auto AJAX uploading
    return false;
  };

  const handleFinish = async (values: API.UserInfo) => {
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
        <Upload
          // action="https://meta-storage-koa-gateway-mrwbongev-meta-summer.vercel.app/fleek/storage"
          beforeUpload={beforeUpload}
          showUploadList={false}
        >
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
              name="nickname"
              label="昵称"
              rules={[
                {
                  required: true,
                  message: '请输入您的昵称!',
                },
              ]}
            />
            <ProFormTextArea
              name="bio"
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
          <AvatarView avatar={userAvatar || ''} />
        </div>
      </div>
    </Card>
  );
};

export default BaseView;
