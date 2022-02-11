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
  readonly publishSiteOrderId: number;
}

const PostsPublish: FC<Props> = ({ state, publishSiteOrderId }) => {
  // const intl = useIntl();

  /**
   * PENDING 等待发布
   * DOING 发布中
   * FINISHED 已发布
   * FAILED 发布失败
   */

  return (
    <>
      {state === PipelineOrderTaskCommonState.PENDING ? (
        <Space style={{ color: 'gray' }}>
          <PublishIcon className={styles.icon} />
          <Text style={{ color: 'gray' }}>等待发布</Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.DOING ? (
        <Space style={{ color: 'gray' }}>
          <PublishIcon className={styles.icon} />
          <Text style={{ color: 'gray' }}>发布中</Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FINISHED ? (
        <Space style={{ color: 'green' }}>
          <PublishIcon className={styles.icon} />
          <Text style={{ color: 'green' }}>
            已发布 {publishSiteOrderId && <span>#{publishSiteOrderId}</span>}
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
