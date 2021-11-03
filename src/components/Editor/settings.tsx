import React, { useState } from 'react';
import { Drawer } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import styles from './settings.less';
import SettingsTags from './settingsTags';
import SettingsOriginalLink from './settingsOriginalLink';
import SettingsCopyrightNotice from './settingsCopyrightNotice';
import SettingsTips from './settingsTips';
import SettingsLearnMore from './settingsLearnMore';

interface Props {
  readonly tags: string[];
  handleChangeTags: (val: string[]) => void;
}

const Settings: React.FC<Props> = ({ tags, handleChangeTags }) => {
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
      <SettingOutlined onClick={showDrawer} className={styles.toggleIcon} />
      <Drawer
        title={intl.formatMessage({
          id: 'editor.header.settings.title',
        })}
        placement="right"
        onClose={onClose}
        visible={visible}
        width={340}
      >
        <section className={styles.container}>
          <SettingsTags tags={tags} handleChangeTags={handleChangeTags} />
          <SettingsOriginalLink />
          <SettingsCopyrightNotice />
          <SettingsTips />
          <SettingsLearnMore />
        </section>
      </Drawer>
    </span>
  );
};

export default Settings;
