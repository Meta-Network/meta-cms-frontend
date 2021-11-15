import type { FC } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './settings.less';
import { useIntl } from 'umi';

// interface Props {}

const SettingsTips: FC = () => {
  const intl = useIntl();

  return (
    <section className={styles.tips}>
      <InfoCircleOutlined /> <span>{intl.formatMessage({ id: 'editor.tips.content' })}</span>
    </section>
  );
};

export default SettingsTips;
