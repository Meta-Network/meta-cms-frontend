import type React from 'react';
import { message } from 'antd';
import { uploadImageIPFS } from '@/services/api/global';
import { requestStorageToken } from '@/services/api/meta-ucenter';

export default (
  setImageUrl: React.Dispatch<React.SetStateAction<string | undefined>>,
  setUploading: React.Dispatch<React.SetStateAction<boolean | undefined>> = () => {},
) => {
  return async ({ file }: { file: File }): Promise<void> => {
    setUploading(true);
    const done = message.loading('上传文件中...请稍候', 0);
    const tokenRequest = await requestStorageToken();
    const token = tokenRequest.data;

    if (!token) {
      if (tokenRequest.statusCode === 401) {
        message.error('文件上传失败，请重新登录。');
      }
      message.error('文件上传失败，内部错误或无网络。');
    }

    const form = new FormData();
    form.append('file', file);

    const result = await uploadImageIPFS(form, token);
    done();
    setUploading(false);

    if (result?.statusCode === 201) {
      message.success('文件上传成功。');
      setImageUrl(result.data.publicUrl);
    } else {
      message.error('文件上传失败。');
    }
  };
};
