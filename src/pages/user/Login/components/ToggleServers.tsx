import React, { useState } from 'react';
import { ExclamationOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import ToggleServersModal from './ToggleServersModal';
import styles from './index.less';

const ToggleServers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  return (
    <section className={styles.toggleServersWrapper}>
      <section className={styles.toggleServersHead}>
        <span className={styles.toggleServersTitle}>{'账号托管于'}</span>
        <ExclamationOutlined
          className={styles.toggleServersHeadIcon}
          onClick={() => setIsModalVisible(true)}
        />
      </section>
      <section className={styles.toggleServersLine}>
        <div>
          <Tooltip placement="right" title={process.env.NEXT_PUBLIC_META_NETWORK_URL}>
            <span className={styles.toggleServersServer}>metanetwork.online</span>
          </Tooltip>
          <p className={styles.toggleServersDescription}>
            {'免费加入最大的公共服务器，得到最新的服务'}
          </p>
        </div>
        <section className={styles.toggleServersEdit}>{'编辑'}</section>
      </section>
      <ToggleServersModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
    </section>
  );
};

export default ToggleServers;
