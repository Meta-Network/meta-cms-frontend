import { ColumnsIcon } from '@/components/Icon/index';
import { Drawer } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'umi';
import styles from './settings.less';

const Settings: React.FC = ({ children }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <span className={styles.wrapper}>
      <ColumnsIcon onClick={showDrawer} className={styles.toggleIcon} />
      <Drawer
        title={intl.formatMessage({
          id: 'editor.header.settings.title',
        })}
        placement="right"
        onClose={onClose}
        visible={visible}
        width={340}
      >
        {children}
      </Drawer>
    </span>
  );
};

export default Settings;
