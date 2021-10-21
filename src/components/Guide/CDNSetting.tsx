import { Alert } from 'antd';
import { FormattedMessage } from 'umi';
import FormattedDescription from '../FormattedDescription';

export default () => (
  <Alert
    message={<FormattedMessage id="guide.cdn.message" />}
    description={<FormattedDescription id="guide.cdn.content" />}
    type="success"
    showIcon
  />
);
