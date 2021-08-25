import { Alert } from 'antd';
import styles from './styles.less';

export default () => (
  <div className={styles.container}>
    <div className={styles.info}>
      <p>在此配置您的站点 CDN。</p>
    </div>

    <div>
      <Alert
        message="此功能为预留的高级功能"
        description={
          <span>
            为了建站流程简单直接，我们暂时对此配置项应用默认配置。
            <br />
            后期我们会加入高级设置，以供修改此配置。
          </span>
        }
        type="info"
        showIcon
      />
    </div>
  </div>
);
