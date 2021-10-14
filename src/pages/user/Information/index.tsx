import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import ImgCrop from 'antd-img-crop';
import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, message, Card } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { updateUserInfo } from '@/services/api/meta-ucenter';
import uploadImageRequest from '@/utils/upload-image-request';

const BaseView: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [userAvatar, setUserAvatar] = useState(initialState?.currentUser?.avatar);

  useEffect(() => {
    updateUserInfo({ avatar: userAvatar }).then(() => '');
  }, [userAvatar]);

  const handleFinish = async (values: GLOBAL.UserInfo) => {
    await updateUserInfo(values);
    message.success('更新成功。');
  };

  const AvatarView = ({ currentAvatar }: { currentAvatar: string }) => (
    <>
      <div className={styles.avatar_title}>头像</div>
      <div className={styles.avatar}>
        <img src={currentAvatar} alt="avatar" />
      </div>
      <ImgCrop rotate>
        {/* @ts-ignore */}
        <Upload customRequest={uploadImageRequest(setUserAvatar)} showUploadList={false}>
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
    <PageContainer
      breadcrumb={{}}
      title="个人信息"
      content={
        <div className="text-info">
          <p>您可以在这里编辑您的个人信息。</p>
        </div>
      }
    >
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
    </PageContainer>
  );
};

export default BaseView;
