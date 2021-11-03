import React from 'react';
import { Input } from 'antd';
import styles from './settings.less';

const settingsOriginalLink: React.FC = () => {
  return (
    <section className={styles.item}>
      <p className={styles.itemTitle}>原文链接</p>
      <section className={styles.itemContent}>
        <Input />
      </section>
    </section>
  );
};

export default settingsOriginalLink;
