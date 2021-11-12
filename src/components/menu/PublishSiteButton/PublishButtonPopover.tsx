import { Popover, Radio } from 'antd';
import React from 'react';
import styles from './index.less';

export default ({ children }: { children: React.ReactNode }) => {
  const title = '准备好发布到 Meta Space 了？';
  const content = (
    <div>
      <div className={styles.subheader}>主要存储</div>
      {/* TODO: GitHub should be user storage */}
      <Radio checked={true}>
        <strong>GitHub公开库</strong> - 存储已发布内容
      </Radio>
      <div>guanchao71 - thislink...</div>
    </div>
  );
  return (
    <Popover
      trigger="click"
      title={title}
      content={content}
      getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
    >
      {children}
    </Popover>
  );
};
