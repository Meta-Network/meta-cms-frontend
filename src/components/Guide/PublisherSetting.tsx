import { Alert } from 'antd';
import { useModel, FormattedMessage } from 'umi';
import FormattedInfo from '../FormattedInfo';
import styles from './styles.less';

export default () => {
  const { storeSetting } = useModel('storage');

  const SelectedStore = () => {
    return (
      <>
        <FormattedMessage id="messages.publish.currentStore" />
        <strong>
          {storeSetting.storage || <FormattedMessage id="messages.publish.noStoreSelected" />}
        </strong>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Alert
        type="success"
        showIcon
        message={<FormattedMessage id="guide.publish.message" />}
        description={
          <>
            <FormattedInfo id="guide.publish.info" />
            <SelectedStore />
          </>
        }
      />
    </div>
  );
};
