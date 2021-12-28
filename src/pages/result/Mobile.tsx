import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { Result } from 'antd';
import styles from './Mobile.less';

export default () => {
  return (
    <Result
      className={styles.antResult}
      icon={'🚧'}
      title={<FormattedMessage id="手机端正在施工中" />}
      subTitle={<FormattedMessage id="敬请使用电脑端体验本页面" />}
    />
  );
};
