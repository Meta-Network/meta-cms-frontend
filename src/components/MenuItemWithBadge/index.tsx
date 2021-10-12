import { Link } from 'umi';
import { Badge } from 'antd';
import type { ReactNode } from 'react';
import style from './index.less';

export default ({ path, dom, count }: { path: string; dom: ReactNode; count: number }) => (
  <div className={style.container}>
    <Link to={path}>{dom}</Link>
    <Badge showZero className="menuCounterBadge" count={count} />
  </div>
);