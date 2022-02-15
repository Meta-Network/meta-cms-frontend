import { Alert } from 'antd';
import { useModel, FormattedMessage } from 'umi';
import FormattedDescription from '../FormattedDescription';

export default () => {
  const { storageSetting } = useModel('localStorageHooks');

  const SelectedStorage = () => {
    return (
      <>
        <FormattedMessage id="messages.publish.currentStorage" />:{' '}
        <strong>
          {storageSetting?.storage || <FormattedMessage id="messages.publish.noStorageSelected" />}
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
          <SelectedStorage />
        </>
      }
    />
  );
};
