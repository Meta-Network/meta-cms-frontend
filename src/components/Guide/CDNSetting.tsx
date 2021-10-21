import { Alert } from 'antd';
import { FormattedMessage } from 'umi';

export default () => (
  <Alert
    message={<FormattedMessage id="guide.cdn.message" />}
    description={
      <FormattedMessage id="guide.cdn.info">
        {(msg: string) =>
          msg
            ?.trim()
            .split('\n')
            .map((e, index) => (
              <div key={`cdn-info${index + 1}`}>
                {e}
                <br />
              </div>
            ))
        }
      </FormattedMessage>
    }
    type="success"
    showIcon
  />
);
