import FormattedDescription from '@/components/FormattedDescription';
import useUser from '@/hooks/useUser';
import { uploadFileToIpfs } from '@/services/api/global';
import { updateUserInfo } from '@/services/api/meta-ucenter';
import { UploadOutlined } from '@ant-design/icons';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, message, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import React, { useState } from 'react';
import { useIntl, useModel } from 'umi';
import { rules } from '../../../../config/index';
import styles from './index.less';

const BaseView: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { refreshUserInfo } = useUser();
  const [userAvatar, setUserAvatar] = useState(initialState?.currentUser?.avatar);
  const [updateUserAvatarLoading, setUpdateUserAvatarLoading] = useState<boolean>(false);
  const [updateUserInfoLoading, setUpdateUserInfoLoading] = useState<boolean>(false);

  /**
   * upload Image
   * 因为特性 如果上传过一次的图片使用裁剪是无效的
   * @param param0
   */
  const uploadImageRequest = async ({ file }: { file: File }) => {
    const done = message.loading(intl.formatMessage({ id: 'messages.profile.uploadImageWait' }), 0);
    setUpdateUserAvatarLoading(true);
    const result = await uploadFileToIpfs(file);
    done();

    if (result?.statusCode === 201) {
      const url = result.data.publicUrl;
      const updateUserAvatarResult = await updateUserInfo({ avatar: url });
      if (updateUserAvatarResult.statusCode === 200) {
        message.success(intl.formatMessage({ id: 'messages.profile.updateSuccess' }));
        setUserAvatar(url);
        await refreshUserInfo();
      } else {
        message.error(intl.formatMessage({ id: 'messages.profile.updateFailed' }));
      }
    } else {
      message.error(intl.formatMessage({ id: 'messages.profile.updateFailed' }));
    }

    setUpdateUserAvatarLoading(false);
  };

  const handleFinish = async (values: GLOBAL.UserInfo) => {
    const done = message.loading(
      intl.formatMessage({ id: 'messages.profile.updateUserInfoWait' }),
      0,
    );
    setUpdateUserInfoLoading(true);
    const updateUserInfoResult = await updateUserInfo(values);
    done();

    if (updateUserInfoResult.statusCode === 200) {
      message.success(intl.formatMessage({ id: 'messages.profile.updateSuccess' }));

      await refreshUserInfo();
    } else {
      message.success(intl.formatMessage({ id: 'messages.profile.updateFailed' }));
    }

    setUpdateUserInfoLoading(false);
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
        <Upload customRequest={uploadImageRequest} showUploadList={false}>
          <div className={styles.buttonView}>
            <Button loading={updateUserAvatarLoading}>
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
      content={<FormattedDescription id="messages.profile.editInfoHere" />}
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
                submitButtonProps: {},
                render: () => {
                  return [
                    <Button
                      type="primary"
                      htmlType="submit"
                      key="submit"
                      loading={updateUserInfoLoading}
                    >
                      {intl.formatMessage({ id: 'component.button.update' })}
                    </Button>,
                  ];
                },
              }}
              initialValues={{ ...initialState?.currentUser }}
              hideRequiredMark
            >
              <ProFormText
                name="nickname"
                label={intl.formatMessage({ id: 'messages.profile.form.nickname' })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'messages.profile.form.pleaseEnterNickname',
                    }),
                  },
                  {
                    min: rules.nickname.min,
                    max: rules.nickname.max,
                    message: intl.formatMessage(
                      { id: 'messages.profile.form.lengthMinAndMax' },
                      {
                        min: rules.nickname.min,
                        max: rules.nickname.max,
                      },
                    ),
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
                  {
                    min: rules.bio.min,
                    max: rules.bio.max,
                    message: intl.formatMessage(
                      { id: 'messages.profile.form.lengthMinAndMax' },
                      {
                        min: rules.bio.min,
                        max: rules.bio.max,
                      },
                    ),
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
