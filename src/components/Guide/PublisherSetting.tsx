import { Alert } from 'antd';
import { useModel, FormattedMessage } from 'umi';
import FormattedInfo from '../FormattedDescription';

export default () => {
  const { storeSetting } = useModel('storage');

  const SelectedStore = () => {
    return (
      <>
        <FormattedMessage id="messages.publish.currentStore" />:{' '}
        <strong>
          {storeSetting.storage || <FormattedMessage id="messages.publish.noStoreSelected" />}
        </strong>
      </>
    );
  };

  return (
    <Alert
      type="success"
      showIcon
      message={<FormattedMessage id="guide.publish.message" />}
      description={
        <>
          <FormattedInfo id="guide.publish.content" />
          <SelectedStore />
        </>
      }
    />
  );
};
