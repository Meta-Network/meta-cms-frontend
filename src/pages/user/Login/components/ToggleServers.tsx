import React, { useState, useMemo } from 'react';
import { ExclamationOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useIntl } from 'umi';
import ToggleServersModal from './ToggleServersModal';
import styles from './index.less';

const ToggleServers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const intl = useIntl();

  const serverHost = useMemo(() => {
    const url = new URL(META_NETWORK_FE);
    return url.host;
  }, []);

  return (
    <section className={styles.toggleServersWrapper}>
      <section className={styles.toggleServersHead}>
        <span className={styles.toggleServersTitle}>
          {intl.formatMessage({ id: 'login.accountHosted' })}
        </span>
        <ExclamationOutlined
          className={styles.toggleServersHeadIcon}
          onClick={() => setIsModalVisible(true)}
        />
      </section>
      <section className={styles.toggleServersLine}>
        <div>
          <Tooltip placement="right" title={META_NETWORK_FE}>
            <span className={styles.toggleServersServer}>{serverHost}</span>
          </Tooltip>
          <p className={styles.toggleServersDescription}>
            {intl.formatMessage({ id: 'login.accountHostedTips' })}
          </p>
        </div>
        <section className={styles.toggleServersEdit}>
          {intl.formatMessage({ id: 'component.button.edit' })}
        </section>
      </section>
      <ToggleServersModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
    </section>
  );
};

export default ToggleServers;
