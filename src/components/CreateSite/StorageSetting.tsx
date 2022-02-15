/* eslint-disable react-hooks/exhaustive-deps */
import { useIntl, useModel } from 'umi';
import type { SetStateAction, Dispatch } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getGithubReposName } from '@/services/api/global';
import StoragePicker from '@/components/StoragePicker';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Divider, message } from 'antd';
import FormattedDescription from '../FormattedDescription';
import type { StoreValue } from 'antd/es/form/interface';
import type { RuleObject } from 'antd/lib/form';

export default () => {
  const intl = useIntl();
  const [userRepos, setUserRepos] = useState<string[]>([]);
  const [storageRepoIsValid, setStorageRepoIsValid] = useState<boolean>(false);
  const [publishRepoIsValid, setPublishRepoIsValid] = useState<boolean>(false);
  const { storageSetting, setStorageSetting } = useModel('localStorageHooks');

  useEffect(() => {
    if (storageSetting?.username && storageSetting.storage) {
      // TODO: This is for Github only
      getGithubReposName()
        .then((result) => {
          setUserRepos(result.map((name) => name.toLowerCase()));
        })
        .catch(() => {
          message.error(intl.formatMessage({ id: 'messages.storage.noRepoTokenReSelect' }));
          setStorageSetting((prev) => ({ ...prev, ...{ storage: '', username: '' } }));
        });
    }
  }, [setStorageSetting, storageSetting]);

  const validator = useCallback(
    (setState: Dispatch<SetStateAction<boolean>>) => (_: RuleObject, value: StoreValue) => {
      if (!userRepos) {
        setState(false);
        return Promise.reject(
          new Error(intl.formatMessage({ id: 'messages.storage.noRepoTokenFirstSelect' })),
        );
      }
      if (!value) {
        setState(false);
        return Promise.reject(
          new Error(intl.formatMessage({ id: 'messages.storage.repoNameCanNotBeEmpty' })),
        );
      }
      if (userRepos?.includes(value.toLowerCase())) {
        setState(false);
        return Promise.reject(
          new Error(intl.formatMessage({ id: 'messages.storage.repoNameAlreadyExists' })),
        );
      }
      setState(true);
      return Promise.resolve();
    },
    [userRepos],
  );

  const updateRepoSettings = useCallback(
    async (values: { storageRepo: string; publishRepo: string }) => {
      if (values.storageRepo !== values.publishRepo) {
        setStorageSetting((prev) => ({ ...prev, ...{ repos: values } }));
        message.success(intl.formatMessage({ id: 'messages.storage.setRepoName' }, values));
      } else {
        message.error(intl.formatMessage({ id: 'messages.storage.form.sameRepoName' }, values));
      }
    },
    [setStorageSetting],
  );

  return (
    <div>
      <StoragePicker />
      <Divider />
      <FormattedDescription id="guide.repo.description" />
      <ProForm
        style={{ width: 500 }}
        name="site-info"
        initialValues={{
          storageRepo: storageSetting?.repos?.storageRepo ?? 'meta-space',
          publishRepo: storageSetting?.repos?.publishRepo ?? 'meta-space-published',
        }}
        onFinish={updateRepoSettings}
      >
        <ProFormText
          label={intl.formatMessage({ id: 'guide.repo.storage' })}
          width="sm"
          name="storageRepo"
          placeholder={intl.formatMessage({ id: 'messages.storage.form.repoName' })}
          validateStatus={storageRepoIsValid ? 'success' : undefined}
          help={
            storageRepoIsValid
              ? intl.formatMessage({ id: 'messages.storage.form.repoNameAvailable' })
              : undefined
          }
          rules={[
            {
              validator: validator(setStorageRepoIsValid),
            },
          ]}
        />
        <ProFormText
          label={intl.formatMessage({ id: 'guide.repo.publish' })}
          width="sm"
          name="publishRepo"
          placeholder={intl.formatMessage({ id: 'messages.storage.form.repoName' })}
          validateStatus={publishRepoIsValid ? 'success' : undefined}
          help={
            publishRepoIsValid
              ? intl.formatMessage({ id: 'messages.storage.form.repoNameAvailable' })
              : undefined
          }
          rules={[
            {
              validator: validator(setPublishRepoIsValid),
            },
          ]}
        />
      </ProForm>
    </div>
  );
};
