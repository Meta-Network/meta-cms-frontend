import { WarningFilled } from '@ant-design/icons';
import { Badge } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'umi';
import styles from './index.less';

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
