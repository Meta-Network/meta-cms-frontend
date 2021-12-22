/* eslint-disable react-hooks/exhaustive-deps */
import { useIntl, useModel } from 'umi';
import type { SetStateAction, Dispatch } from 'react';
import { useEffect, useState } from 'react';
import { getGithubReposName } from '@/services/api/global';
import StoragePicker from '@/components/StorePicker';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Divider, message } from 'antd';
import FormattedDescription from '../FormattedDescription';
import type { StoreValue } from 'antd/es/form/interface';
import type { RuleObject } from 'antd/lib/form';

export default () => {
  const intl = useIntl();
  const [userRepos, setUserRepos] = useState<string[]>([]);
  const [storeRepoIsValid, setStoreRepoIsValid] = useState<boolean>(false);
  const [publishRepoIsValid, setPublishRepoIsValid] = useState<boolean>(false);
  const { storeSetting, setStoreSetting } = useModel('storage');

  useEffect(() => {
    if (userRepos.length !== 0) return;
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

  const validator =
    (setState: Dispatch<SetStateAction<boolean>>) => (_: RuleObject, value: StoreValue) => {
      if (!userRepos) {
        setState(false);
        return Promise.reject(
          new Error(intl.formatMessage({ id: 'messages.store.noRepoTokenFirstSelect' })),
        );
      }
      if (!value) {
        setState(false);
        return Promise.reject(
          new Error(intl.formatMessage({ id: 'messages.store.repoNameCanNotBeEmpty' })),
        );
      }
      if (userRepos?.includes(value.toLowerCase())) {
        setState(false);
        return Promise.reject(
          new Error(intl.formatMessage({ id: 'messages.store.repoNameAlreadyExists' })),
        );
      }
      setState(true);
      return Promise.resolve();
    };
  const updateRepoSettings = async (values: { storeRepo: string; publishRepo: string }) => {
    if (values.storeRepo !== values.publishRepo) {
      setStoreSetting((prev) => ({ ...prev, repos: values }));
      message.success(intl.formatMessage({ id: 'messages.store.setRepoName' }, values));
    } else {
      message.error(intl.formatMessage({ id: 'messages.store.form.sameRepoName' }, values));
    }
  };

  return (
    <div>
      <StoragePicker />
      <Divider />
      <FormattedDescription id="guide.repo.description" />
      <ProForm
        style={{ width: 500 }}
        name="site-info"
        initialValues={{
          storeRepo: storeSetting?.repos?.storeRepo ?? 'meta-space',
          publishRepo: storeSetting?.repos?.publishRepo ?? 'meta-space-published',
        }}
        onFinish={updateRepoSettings}
      >
        <ProFormText
          label={intl.formatMessage({ id: 'guide.repo.store' })}
          width="sm"
          name="storeRepo"
          placeholder={intl.formatMessage({ id: 'messages.store.form.repoName' })}
          validateStatus={storeRepoIsValid ? 'success' : undefined}
          help={
            storeRepoIsValid
              ? intl.formatMessage({ id: 'messages.store.form.repoNameAvailable' })
              : undefined
          }
          rules={[
            {
              validator: validator(setStoreRepoIsValid),
            },
          ]}
        />
        <ProFormText
          label={intl.formatMessage({ id: 'guide.repo.publish' })}
          width="sm"
          name="publishRepo"
          placeholder={intl.formatMessage({ id: 'messages.store.form.repoName' })}
          validateStatus={publishRepoIsValid ? 'success' : undefined}
          help={
            publishRepoIsValid
              ? intl.formatMessage({ id: 'messages.store.form.repoNameAvailable' })
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
