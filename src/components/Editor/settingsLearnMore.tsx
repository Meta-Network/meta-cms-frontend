import React from 'react';
import { ShareAltOutlined } from '@ant-design/icons';
import styles from './settings.less';
import { useIntl } from 'umi';

const SettingsLearnMore: React.FC = () => {
  const intl = useIntl();

  return (
    <a
      href={META_WIKI_EDITOR_LEARN}
      className={styles.learn}
      target="_blank"
      rel="noopener noreferrer"
    >
      {intl.formatMessage({ id: 'editor.learn.content' })}&nbsp;
      <ShareAltOutlined />
    </a>
  );
};

export default SettingsLearnMore;
