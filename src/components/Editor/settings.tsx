import React, { useState } from 'react';
import { Drawer, Tag } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import styles from './settings.less';

interface Props {
  readonly post: CMS.Post | CMS.Draft | null;
}

const Settings: React.FC<Props> = ({ post }) => {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <span className={styles.wrapper}>
      <SettingOutlined onClick={showDrawer} />
      <Drawer title="Post settings" placement="right" onClose={onClose} visible={visible}>
        <section className={styles.item}>
          <p className={styles.itemTitle}>Tags</p>
          <section className={styles.itemContent}>
            {post?.tags.map((i) => (
              <Tag key={i}>{i}</Tag>
            ))}
            {!post?.tags || post?.tags.length <= 0 ? (
              <span className={styles.itemEmpty}>暂无</span>
            ) : null}
          </section>
        </section>
      </Drawer>
    </span>
  );
};

export default Settings;
