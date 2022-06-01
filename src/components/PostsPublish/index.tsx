import { PipelineOrderTaskCommonState } from '@/services/constants';
import { WarningFilled } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import type { FC } from 'react';
import { useIntl } from 'umi';
import { PublishIcon } from '../Icon';
import styles from './index.less';

const { Text } = Typography;

interface Props {
  readonly state: PipelineOrderTaskCommonState;
  readonly publishSiteOrderId: number;
}

const PostsPublish: FC<Props> = ({ state, publishSiteOrderId }) => {
  const intl = useIntl();

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
          <Text style={{ color: 'gray' }}>
            {intl.formatMessage({ id: 'posts.table.publishState.pending' })}
          </Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.DOING ? (
        <Space style={{ color: 'gray' }}>
          <PublishIcon className={styles.icon} />
          <Text style={{ color: 'gray' }}>
            {intl.formatMessage({ id: 'posts.table.publishState.doing' })}
          </Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FINISHED ? (
        <Space style={{ color: 'green' }}>
          <PublishIcon className={styles.icon} />
          <Text style={{ color: 'green' }}>
            {intl.formatMessage({ id: 'posts.table.publishState.finished' })}{' '}
            {publishSiteOrderId >= 0 ? <span>#{publishSiteOrderId}</span> : null}
          </Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FAILED ? (
        <Space style={{ color: 'red' }}>
          <WarningFilled />
          <Text style={{ color: 'red' }}>
            {intl.formatMessage({ id: 'posts.table.publishState.failed' })}
          </Text>
        </Space>
      ) : null}
    </>
  );
};

export default PostsPublish;
