/* eslint-disable react-hooks/exhaustive-deps */
import { useIntl, useModel } from 'umi';
import { useEffect, useState } from 'react';
import { getGithubReposName } from '@/services/api/global';
import StoragePicker from '@/components/StorePicker';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Divider, message } from 'antd';
import FormattedInfo from '../FormattedInfo';

export default () => {
  const intl = useIntl();
  const [userRepos, setUserRepos] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { storeSetting, setStoreSetting } = useModel('storage');

  useEffect(() => {
    if (storeSetting.username) {
      // TODO: This is for Github only
      getGithubReposName()
        .then((result) => {
          setUserRepos(result.map((name) => name.toLowerCase()));
        })
        .catch(() => {
          message.error(intl.formatMessage({ id: 'messages.store.noRepoTokenReSelect' }));
          setStoreSetting({ storage: '', username: '' });
        });
    }
  }, [setStoreSetting, storeSetting]);

  const updateRepoSettings = async (values: { repoName: string }) => {
    const repo = values.repoName;
    setStoreSetting((prev) => ({ ...prev, repo }));
    message.success(intl.formatMessage({ id: 'messages.store.setRepoName' }, { repo }));
  };

  return (
    <div>
      <StoragePicker />

      <Divider />

      <FormattedInfo id="guide.repo.info" />
      <ProForm
        style={{ width: 500 }}
        name="site-info"
        initialValues={{ repoName: storeSetting?.repo ?? 'meta-space' }}
        onFinish={updateRepoSettings}
        requiredMark="optional"
      >
        <ProFormText
          width="md"
          name="repoName"
          placeholder={intl.formatMessage({ id: 'messages.store.form.repoName' })}
          validateStatus={isSuccess ? 'success' : undefined}
          help={
            isSuccess
              ? intl.formatMessage({ id: 'messages.store.form.repoNameAvailable' })
              : undefined
          }
          rules={[
            {
              validator: (_, value) => {
                if (!userRepos) {
                  setIsSuccess(false);
                  return Promise.reject(
                    new Error(intl.formatMessage({ id: 'messages.store.noRepoTokenFirstSelect' })),
                  );
                }
                if (!value) {
                  setIsSuccess(false);
                  return Promise.reject(
                    new Error(intl.formatMessage({ id: 'messages.store.repoNameCanNotBeEmpty' })),
                  );
                }
                if (userRepos?.includes(value.toLowerCase())) {
                  setIsSuccess(false);
                  return Promise.reject(
                    new Error(intl.formatMessage({ id: 'messages.store.repoNameAlreadyExists' })),
                  );
                }
                setIsSuccess(true);
                return Promise.resolve();
              },
            },
          ]}
        />
      </ProForm>
    </div>
  );
};
