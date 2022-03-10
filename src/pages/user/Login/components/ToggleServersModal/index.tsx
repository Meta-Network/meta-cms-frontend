import React from 'react';
import { Button } from 'antd';
import { useIntl } from 'umi';
import CustomModal from '../../../../../components/CustomModal';
import styles from './index.less';

interface Props {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
}

const Occupied: React.FC<Props> = React.memo(function Occupied({
  isModalVisible,
  setIsModalVisible,
}) {
  const intl = useIntl();

  const Content: React.FC = () => {
    return (
      <div>
        <p className={styles.contentTextTips}>
          {intl.formatMessage({ id: 'login.serverOptionsDescription' })}
        </p>
        <section className={styles.contentFooter}>
          <Button className="custom-primary" onClick={() => setIsModalVisible(false)}>
            {intl.formatMessage({ id: 'component.button.ignore' })}
          </Button>
        </section>
      </div>
    );
  };

  return (
    <CustomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <section className={styles.content}>
        <section className={styles.contentHead}>
          <span className={styles.contentHeadTitle}>
            {intl.formatMessage({ id: 'login.serverOptions' })}
          </span>
        </section>
        <Content />
      </section>
    </CustomModal>
  );
});

export default Occupied;
