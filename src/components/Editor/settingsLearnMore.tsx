import React from 'react';
import { ShareAltOutlined } from '@ant-design/icons';
import styles from './settings.less';
import { useIntl } from 'umi';
import { EDITOR_LEARN } from '../../../config';

const SettingsLearnMore: React.FC = () => {
  const intl = useIntl();

  return (
    <a href={EDITOR_LEARN} className={styles.learn} target="_blank" rel="noopener noreferrer">
      {intl.formatMessage({ id: 'editor.learn.content' })}&nbsp;
      <ShareAltOutlined />
    </a>
  );
};

export default SettingsLearnMore;
