import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { Result } from 'antd';
import styles from './Mobile.less';

export default () => {
  return (
    <Result
      className={styles.antResult}
      icon={'🚧'}
      title={<FormattedMessage id="result.mobile.title" />}
      subTitle={<FormattedMessage id="result.mobile.description" />}
    />
  );
};
