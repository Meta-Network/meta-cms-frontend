import type { FC } from 'react';
import { Typography } from 'antd';
import moment from 'moment';
const { Text } = Typography;

interface Props {
  readonly time: Date;
}

const PostsDate: FC<Props> = ({ time }) => {
  return (
    <>
      <Text>{moment(time).format('YYYY-MM-DD HH:mm')}</Text>
    </>
  );
};

export default PostsDate;
