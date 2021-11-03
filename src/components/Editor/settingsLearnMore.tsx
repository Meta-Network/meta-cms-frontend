import React from 'react';
import { ShareAltOutlined } from '@ant-design/icons';
import styles from './settings.less';

const SettingsLearnMore: React.FC = () => {
  return (
    <a href="#" className={styles.learn}>
      快速学习 Meta Space 编辑器&nbsp;
      <ShareAltOutlined />
    </a>
  );
};

export default SettingsLearnMore;
