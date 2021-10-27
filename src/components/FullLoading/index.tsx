import React from 'react';
import { Spin, Tooltip } from 'antd';
import { useIntl } from 'umi';
import styles from './index.less';
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons';

interface Props {
  readonly loading: boolean;
  setLoading: (val: boolean) => void;
}

const FullLoading: React.FC<Props> = ({ loading, setLoading }) => {
  const intl = useIntl();
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <>
      {loading ? (
        <div className={styles.wrapper}>
          <Spin indicator={antIcon} tip="Loading..." />
          <Tooltip
            title={intl.formatMessage({
              id: 'component.full.tip',
            })}
          >
            <CloseOutlined className={styles.close} onClick={() => setLoading(false)} />
          </Tooltip>
        </div>
      ) : null}
    </>
  );
};

export default FullLoading;
