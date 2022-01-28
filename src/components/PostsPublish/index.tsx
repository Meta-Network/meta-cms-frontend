import type { FC } from 'react';
import { Space, Typography } from 'antd';
// import { useIntl } from 'umi';
import { WarningFilled } from '@ant-design/icons';
import { PublishIcon } from '../Icon';
import styles from './index.less';
import { PipelineOrderTaskCommonState } from '@/services/constants';

const { Text } = Typography;

interface Props {
  readonly state: PipelineOrderTaskCommonState;
}

const PostsPublish: FC<Props> = ({ state }) => {
  // const intl = useIntl();

  /**
   * 发布中
   * 等待发布
   * 发布失败
   * 已发布
   */

  return (
    <>
      {state === PipelineOrderTaskCommonState.DOING ? (
        <Space style={{ color: 'gray' }}>
          <PublishIcon className={styles.icon} />
          <Text style={{ color: 'gray' }}>等待发布</Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.PENDING ? (
        <Space style={{ color: 'gray' }}>
          <PublishIcon className={styles.icon} />
          <Text style={{ color: 'gray' }}>发布中</Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FINISHED ? (
        <Space style={{ color: 'green' }}>
          <PublishIcon className={styles.icon} />
          <Text style={{ color: 'green' }}>
            已发布 <span>#1</span>
          </Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FAILED ? (
        <Space style={{ color: 'red' }}>
          <WarningFilled />
          <Text style={{ color: 'red' }}>发布失败</Text>
        </Space>
      ) : null}
    </>
  );
};

export default PostsPublish;
