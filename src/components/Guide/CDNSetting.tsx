import { Alert } from 'antd';
import { FormattedMessage } from 'umi';
import styles from './styles.less';

export default () => (
  <div className={styles.container}>
    <div>
      <Alert
        message={<FormattedMessage id="guide.cdn.message" />}
        description={
          <FormattedMessage id="guide.cdn.info">
            {(msg: string) =>
              msg
                ?.trim()
                .split('\n')
                .map((e, index) => (
                  <div key={`cdninfo${index + 1}`}>
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
    </div>
  </div>
);
