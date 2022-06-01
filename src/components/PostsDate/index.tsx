import { Typography } from 'antd';
import moment from 'moment';
import type { FC } from 'react';
const { Text } = Typography;

interface Props {
  readonly time: Date | string;
}

const PostsDate: FC<Props> = ({ time }) => <Text>{moment(time).format('YYYY-MM-DD HH:mm')}</Text>;

export default PostsDate;
