import { useModel } from '@@/plugin-model/useModel';
import { useEffect, useState } from 'react';
import { getGithubReposName } from '@/services/api/global';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { message } from 'antd';
import styles from './styles.less';

export default () => {
  const { storeSetting, setStoreSetting } = useModel('storage');

  const updateRepoSettings = async (values: { repoName: string }) => {
    const repo = values.repoName;
    setStoreSetting((prev) => ({ ...prev, repo }));
    message.success(`已提交仓库名为 ${repo}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <p>在此为您的站点选择一个域名，可以在之后被访问到的地址。</p>
        <p>您可以随后为其配置您的个人域名。</p>
      </div>
      <ProForm
        style={{ width: 500 }}
        name="site-info"
        initialValues={{ repoName: 'meta-space' }}
        onFinish={updateRepoSettings}
        requiredMark="optional"
      >
        <ProFormText
          width="md"
          fieldProps={{
            addonAfter: '.metaspaces.me',
          }}
          name="domain"
          placeholder="输入前缀域名"
          // validateStatus={isSuccess ? 'success' : undefined}
          // help={isSuccess ? '此仓库名可用！' : undefined}
          // rules={[
          //   {
          //     validator: (_, value) => {
          //       if (!userRepos) {
          //         setIsSuccess(false);
          //         return Promise.reject(new Error('未成功加载 token。请先选择一个仓储。'));
          //       }
          //       if (!value) {
          //         setIsSuccess(false);
          //         return Promise.reject(new Error('仓库名不能为空。'));
          //       }
          //       if (userRepos?.includes(value.toLowerCase())) {
          //         setIsSuccess(false);
          //         return Promise.reject(new Error('此仓库名已存在，请选择一个未被占用的仓库名。'));
          //       }
          //       setIsSuccess(true);
          //       return Promise.resolve();
          //     },
          //   },
          // ]}
        />
      </ProForm>
    </div>
  );
};
