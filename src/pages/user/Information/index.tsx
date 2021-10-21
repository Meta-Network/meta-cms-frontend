import { useModel, useIntl } from 'umi';
import ImgCrop from 'antd-img-crop';
import React, { useEffect, useState } from 'react';
import { Button, Upload, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import FormattedInfo from '@/components/FormattedInfo';
import { updateUserInfo } from '@/services/api/meta-ucenter';
import uploadImageRequest from '@/utils/upload-image-request';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import styles from './index.less';

const BaseView: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [userAvatar, setUserAvatar] = useState(initialState?.currentUser?.avatar);

  useEffect(() => {
    updateUserInfo({ avatar: userAvatar }).then(() => '');
  }, [userAvatar]);

  const handleFinish = async (values: GLOBAL.UserInfo) => {
    await updateUserInfo(values);
    message.success(intl.formatMessage({ id: 'messages.general.updateSuccess' }));
  };

  const AvatarView = ({ currentAvatar }: { currentAvatar: string }) => (
    <>
      <div className={styles.avatarTitle}>
        {intl.formatMessage({ id: 'messages.profile.avatar' })}
      </div>
      <div className={styles.avatar}>
        <img src={currentAvatar} alt="avatar" />
      </div>
      <ImgCrop rotate>
        {/* @ts-ignore */}
        <Upload customRequest={uploadImageRequest(setUserAvatar)} showUploadList={false}>
          <div className={styles.buttonView}>
            <Button>
              <UploadOutlined />
              {intl.formatMessage({ id: 'messages.profile.changeAvatar' })}
            </Button>
          </div>
        </Upload>
      </ImgCrop>
    </>
  );

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.profile.personalInfo' })}
      content={<FormattedInfo id="messages.profile.editInfoHere" />}
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
                  children: intl.formatMessage({ id: 'messages.profile.updateBaseInfo' }),
                },
              }}
              initialValues={{ ...initialState?.currentUser }}
              hideRequiredMark
            >
              <ProFormText
                width="md"
                name="nickname"
                label={intl.formatMessage({ id: 'messages.profile.form.nickname' })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'messages.profile.form.pleaseEnterNickname',
                    }),
                  },
                ]}
              />
              <ProFormTextArea
                name="bio"
                label={intl.formatMessage({ id: 'messages.profile.form.bio' })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'messages.profile.form.pleaseEnterBio' }),
                  },
                ]}
                placeholder={intl.formatMessage({ id: 'messages.profile.form.bio' })}
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
