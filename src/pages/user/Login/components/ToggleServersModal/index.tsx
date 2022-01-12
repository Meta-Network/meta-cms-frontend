import React from 'react';
import { Button } from 'antd';
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
  const Content: React.FC = () => {
    return (
      <div>
        <p className={styles.contentTextTips}>
          {
            '通过自定义服务器选项，你可以自行指定并登录其他 META NETWORK 主服务器。此功能暂未对外开放。'
          }
        </p>
        <section className={styles.contentFooter}>
          <Button className="custom-primary" onClick={() => setIsModalVisible(false)}>
            {'忽略'}
          </Button>
        </section>
      </div>
    );
  };

  return (
    <CustomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
      <section className={styles.content}>
        <section className={styles.contentHead}>
          <span className={styles.contentHeadTitle}>{'服务器选项'}</span>
        </section>
        <Content />
      </section>
    </CustomModal>
  );
});

export default Occupied;
