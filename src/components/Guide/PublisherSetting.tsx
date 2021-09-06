import { Alert } from 'antd';
import styles from './styles.less';
import { StorageKeys, Storage } from '@/services/constants';

const SelectedStore = () => {
  const store = Storage.get(StorageKeys.StoreSetting);
  return (
    <span>
      当前选择的存储服务：<strong>{store || '还未选择存储'}</strong>
    </span>
  );
};

export default () => (
  <div className={styles.container}>
    <div className={styles.info}>
      <p>在此管理站点的发布配置。</p>
      <p>即您的站点会以何种形式，发布到何处。</p>
    </div>

    <div>
      <Alert
        message="此功能暂为默认配置"
        description={
          <span>
            为了建站流程简单直接，我们暂时对此配置项应用默认配置。
            <br />
            暂时会根据您选择的存储服务提供其对应的发布方式。
            <br />
            后期我们会加入高级设置，以供修改此配置。
            <br />
            <SelectedStore />
          </span>
        }
        type="success"
        showIcon
      />
    </div>
  </div>
);
