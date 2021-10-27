import React, { useMemo, useState } from 'react';
import { Upload, message, notification } from 'antd';
import { PlusOutlined, DeleteOutlined, FileImageOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import styles from './uploadImage.less';
import { UploadImageSize } from '../../../config/index';
import { fetchTokenAPI } from '@/helpers';

const keyUploadAvatar = 'keyUploadAvatar';

interface FileData extends File {
  response: GLOBAL.GeneralResponse<Storage.Fleek>;
  status: 'done' | 'uploading' | 'error';
}

interface UploadAvatar {
  file: FileData;
  fileList: File[];
}

interface Props {
  readonly cover: string;
  asyncCoverToDB: (url: string) => Promise<void>;
}

const UploadImage: React.FC<Props> = ({ cover, asyncCoverToDB }) => {
  const intl = useIntl();
  // const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');

  // upload props
  const props: any = useMemo(
    () => ({
      accept: '.jpg,.jpeg,.png',
      name: 'file',
      action: META_STORAGE_API,
      maxCount: 1,
      headers: {
        authorization: `Bearer ${token}`,
      },
      async beforeUpload(file: File) {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        const type = 'JPG/PNG';
        if (!isJpgOrPng) {
          message.info({
            content: intl.formatMessage(
              {
                id: 'messages.editor.upload.image.type',
              },
              {
                type,
              },
            ),
          });
        }
        const isLtMB = file.size / 1024 / 1024 < UploadImageSize;
        if (!isLtMB) {
          message.warning({
            content: intl.formatMessage(
              {
                id: 'messages.editor.upload.image.size',
              },
              {
                size: UploadImageSize,
              },
            ),
          });
        }

        const res = isJpgOrPng && isLtMB;

        if (res) {
          const result = await fetchTokenAPI();
          setToken(result);

          if (!result) {
            message.info(
              intl.formatMessage({
                id: 'messages.editor.upload.image.token.not',
              }),
            );
            return false;
          }

          notification.open({
            key: keyUploadAvatar,
            className: 'custom-notification',
            message: intl.formatMessage({
              id: 'messages.editor.upload.image.notification.title',
            }),
            description: intl.formatMessage({
              id: 'messages.editor.upload.image.notification.description',
            }),
          });
        }

        return res;
      },
      onChange(info: UploadAvatar) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          console.log('info', info);
          if (info.file.response.statusCode === 201) {
            message.info({
              content: intl.formatMessage({
                id: 'messages.editor.upload.image.success',
              }),
            });
            asyncCoverToDB(info.file.response.data.publicUrl);
          }
          notification.close(keyUploadAvatar);
          // (`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          // (`${info.file.name} file upload failed.`);
          message.info({
            content: intl.formatMessage({
              id: 'messages.editor.upload.image.fail',
            }),
          });
          notification.close(keyUploadAvatar);
        }
      },
    }),
    [token, asyncCoverToDB, intl],
  );

  return (
    <section className={styles.feature}>
      <Upload
        {...props}
        className={
          cover ? `custom-feature-upload ${styles.featureUpload}` : 'custom-feature-upload'
        }
      >
        {cover ? (
          <FileImageOutlined className={styles.featureIconUpload} />
        ) : (
          <section className={styles.featureTextUpload}>
            <PlusOutlined />
            <span className={styles.featureText}>
              {intl.formatMessage({
                id: 'editor.upload.cover.description',
              })}
            </span>
          </section>
        )}
      </Upload>
      {cover ? (
        <>
          <div className={styles.cover}>
            <img src={cover} alt="Cover" />
          </div>
          <div className={styles.featureRemove} onClick={() => asyncCoverToDB('')}>
            <DeleteOutlined />
          </div>
        </>
      ) : null}
    </section>
  );
};

export default UploadImage;
