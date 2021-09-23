import { useModel } from '@@/plugin-model/useModel';
import { Alert } from 'antd';
import { FormattedMessage } from 'umi';
import styles from './styles.less';

export default () => {
  const { storeSetting } = useModel('storage');

  const SelectedStore = () => {
    return (
      <span>
        当前选择的存储服务：<strong>{storeSetting.storage || '还未选择存储'}</strong>
      </span>
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
            {/* below code replaces string with every line-break to <br> tag */}
            <FormattedMessage id="guide.publish.info">
              {(msg: string) =>
                msg
                  ?.trim()
                  .split('\n')
                  .map((e, index) => (
                    <div key={`publishinfo_${index + 1}`}>
                      {e}
                      <br />
                    </div>
                  ))
              }
            </FormattedMessage>
            <SelectedStore />
          </>
        }
      />
    </div>
  );
};
