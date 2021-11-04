import React from 'react';
import { ShareAltOutlined } from '@ant-design/icons';
import styles from './settings.less';

const SettingsLearnMore: React.FC = () => {
  return (
    <a
      href="https://www.matataki.io/p/10753"
      className={styles.learn}
      target="_blank"
      rel="noopener noreferrer"
    >
      快速学习 Meta Space 编辑器&nbsp;
      <ShareAltOutlined />
    </a>
  );
};

export default SettingsLearnMore;
