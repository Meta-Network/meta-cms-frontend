import type { FC } from 'react';
import { Space, Typography } from 'antd';
// import { useIntl } from 'umi';
import { WarningFilled } from '@ant-design/icons';
import { PublishIcon } from '../Icon';
import styles from './index.less';

const { Text } = Typography;

interface Props {}

const PostsPublish: FC<Props> = ({}) => {
  // const intl = useIntl();

  /**
   * 发布中
   * 等待发布
   * 发布失败
   * 已发布
   */

  return (
    <>
      <Space style={{ color: 'gray' }}>
        <PublishIcon className={styles.icon} />
        <Text style={{ color: 'gray' }}>发布中</Text>
      </Space>
      <Space style={{ color: 'gray' }}>
        <PublishIcon className={styles.icon} />
        <Text style={{ color: 'gray' }}>等待发布</Text>
      </Space>
      <Space style={{ color: 'red' }}>
        <WarningFilled />
        <Text style={{ color: 'red' }}>发布失败</Text>
      </Space>
      <Space style={{ color: 'green' }}>
        <PublishIcon className={styles.icon} />
        <Text style={{ color: 'green' }}>
          已发布 <span>#1</span>
        </Text>
      </Space>
    </>
  );
};

export default PostsPublish;
