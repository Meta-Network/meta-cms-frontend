import styles from './index.less';
import ImgCrop from 'antd-img-crop';
import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, message, Card } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { uploadAvatar } from '@/services/api/global';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { requestStorageToken, updateUserInfo } from '@/services/api/meta-ucenter';

const BaseView: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [userAvatar, setUserAvatar] = useState(initialState?.currentUser?.avatar);

  useEffect(() => {
    updateUserInfo({ avatar: userAvatar }).then(() => '');
  }, [userAvatar]);

  const beforeUpload = async ({ file }: { file: File }): Promise<void> => {
    const done = message.loading('上传头像中...请稍候', 0);
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
      message.success('更新头像成功');
      setUserAvatar(result.data.publicUrl);
    } else {
      message.error('图像上传失败');
    }
  };

  const handleFinish = async (values: GLOBAL.UserInfo) => {
    await updateUserInfo(values);
    message.success('更新基本信息成功');
  };

  const AvatarView = ({ currentAvatar }: { currentAvatar: string }) => (
    <>
      <div className={styles.avatar_title}>头像</div>
      <div className={styles.avatar}>
        <img src={currentAvatar} alt="avatar" />
      </div>
      <ImgCrop rotate>
        {/* @ts-ignore */}
        <Upload customRequest={beforeUpload} showUploadList={false}>
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
          <AvatarView currentAvatar={userAvatar || ''} />
        </div>
      </div>
    </Card>
  );
};

export default BaseView;
