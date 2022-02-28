import type { FC } from 'react';
import { Tag } from 'antd';
import { useIntl } from 'umi';

const PostsStorage: FC = () => {
  const intl = useIntl();

  return <Tag>{intl.formatMessage({ id: 'posts.table.status.localStorage' })}</Tag>;
};

export default PostsStorage;
