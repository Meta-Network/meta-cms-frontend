import React from 'react';
import { Spin, Tooltip } from 'antd';
import styles from './index.less';
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons';

interface Props {
  readonly loading: boolean;
  setLoading: (val: boolean) => void;
}

const FullLoading: React.FC<Props> = ({ loading, setLoading }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <>
      {loading ? (
        <div className={styles.wrapper}>
          <Spin indicator={antIcon} tip="Loading..." />
          <Tooltip title="如遇到页面失去反馈，可手动关闭！">
            <CloseOutlined className={styles.close} onClick={() => setLoading(false)} />
          </Tooltip>
        </div>
      ) : null}
    </>
  );
};

export default FullLoading;
