import { useModel } from '@@/plugin-model/useModel';
import { useEffect, useState } from 'react';
import { getGithubReposName } from '@/services/api/global';
import StoragePicker from '@/components/StorePicker';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Divider, message } from 'antd';
import styles from './styles.less';
import FormattedInfo from '../FormattedInfo';

export default () => {
  const [userRepos, setUserRepos] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { storeSetting, setStoreSetting } = useModel('storage');

  useEffect(() => {
    if (storeSetting.username) {
      getGithubReposName()
        .then((result) => {
          setUserRepos(result.map((name) => name.toLowerCase()));
        })
        .catch(() => {
          setStoreSetting({ storage: '', username: '' });
        });
    }
  }, [setStoreSetting, storeSetting]);

  const updateRepoSettings = async (values: { repoName: string }) => {
    const repo = values.repoName;
    setStoreSetting((prev) => ({ ...prev, repo }));
    message.success(`已提交仓库名为 ${repo}`);
  };

  return (
    <div className={styles.container}>
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
          placeholder="请输入创建的仓库名称"
          validateStatus={isSuccess ? 'success' : undefined}
          help={isSuccess ? '此仓库名可用！' : undefined}
          rules={[
            {
              validator: (_, value) => {
                if (!userRepos) {
                  setIsSuccess(false);
                  return Promise.reject(new Error('未成功加载 token。请先选择一个仓库'));
                }
                if (!value) {
                  setIsSuccess(false);
                  return Promise.reject(new Error('仓库名不能为空。'));
                }
                if (userRepos?.includes(value.toLowerCase())) {
                  setIsSuccess(false);
                  return Promise.reject(new Error('此仓库名已存在，请选择一个未被占用的仓库名。'));
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
