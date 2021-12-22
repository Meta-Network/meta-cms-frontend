import { Alert } from 'antd';
import { useModel, FormattedMessage } from 'umi';
import FormattedDescription from '../FormattedDescription';

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
          <FormattedDescription id="guide.publish.content" />
          <SelectedStore />
        </>
      }
    />
  );
};