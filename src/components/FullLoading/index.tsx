import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Spin, Tooltip } from 'antd';
import React from 'react';
import { useIntl } from 'umi';
import styles from './index.less';

interface Props {
  readonly loading: boolean;
  readonly tip?: string;
  setLoading: (val: boolean) => void;
}

const FullLoading: React.FC<Props> = ({ loading, tip = 'Loading...', setLoading }) => {
  const intl = useIntl();
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <>
      {loading ? (
        <div className={styles.wrapper}>
          <Spin indicator={antIcon} tip={tip} />
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
