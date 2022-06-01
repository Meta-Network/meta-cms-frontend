import { Modal } from 'antd';
import React from 'react';
// import { isBrowser, isMobile } from 'react-device-detect';
import { CloseModalIcon } from '../Icon/index';
import styles from './index.less';

interface Props {
  mode?: 'full' | 'half-code' | 'half-occupied' | '';
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
}

const CustomModal: React.FC<Props> = ({ children, mode, isModalVisible, setIsModalVisible }) => {
  const handleOk = (): void => {
    setIsModalVisible(false);
  };

  const handleCancel = (): void => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      width={408}
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      className={`custom-modal${mode ? ' ' + mode : ''}`}
      footer={null}
      closable={false}
      centered={true}
      // transitionName={isBrowser ? undefined : isMobile ? '' : undefined}
    >
      {children}
      {mode === 'full' || mode === 'half-code' || mode === 'half-occupied' ? (
        <CloseModalIcon className={styles.close} onClick={() => handleCancel()} />
      ) : null}
    </Modal>
  );
};

export default CustomModal;
