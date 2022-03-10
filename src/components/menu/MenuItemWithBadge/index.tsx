import { Link } from 'umi';
import { Badge } from 'antd';
import type { ReactNode } from 'react';
import styles from './index.less';
import { WarningFilled } from '@ant-design/icons';

export default ({
  path,
  dom,
  count,
  onAlert = false,
}: {
  path: string;
  dom: ReactNode;
  count: number;
  onAlert?: boolean;
}) => {
  const classNames = [styles.count, ...(onAlert ? [styles.countWithAlert] : [])].join(' ');
  return (
    <>
      <div className={styles.wrapper}>
        <Link to={path}>{dom}</Link>
        <Badge showZero className={classNames} count={count} />
        {onAlert && <WarningFilled className={styles.alert} />}
      </div>
    </>
  );
};
