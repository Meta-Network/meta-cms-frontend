import { InfoCircleOutlined } from '@ant-design/icons';
import type { FC } from 'react';
import { useIntl } from 'umi';
import styles from './settings.less';

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
