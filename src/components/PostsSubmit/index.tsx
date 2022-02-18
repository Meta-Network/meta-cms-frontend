import type { FC } from 'react';
import { Space, Typography } from 'antd';
import { useIntl } from 'umi';
import { ClockCircleOutlined, WarningFilled, CheckCircleFilled } from '@ant-design/icons';
import { PipelineOrderTaskCommonState } from '@/services/constants';
const { Text } = Typography;

interface Props {
  readonly state: PipelineOrderTaskCommonState;
}

const PostsSubmit: FC<Props> = ({ state }) => {
  const intl = useIntl();

  /**
   * PENDING 等待提交
   * DOING 正在提交
   * FINISHED 已提交
   * FAILED 提交失败
   */

  return (
    <>
      {state === PipelineOrderTaskCommonState.PENDING ? (
        <Space style={{ color: 'gray' }}>
          <ClockCircleOutlined />
          <Text style={{ color: 'gray' }}>
            {intl.formatMessage({ id: 'posts.table.submitState.pending' })}
          </Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.DOING ? (
        <Space style={{ color: 'gray' }}>
          <ClockCircleOutlined />
          <Text style={{ color: 'gray' }}>
            {intl.formatMessage({ id: 'posts.table.submitState.doing' })}
          </Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FINISHED ? (
        <Space style={{ color: 'green' }}>
          <CheckCircleFilled />
          <Text style={{ color: 'green' }}>
            {intl.formatMessage({ id: 'posts.table.submitState.finished' })}
          </Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FAILED ? (
        <Space style={{ color: 'red' }}>
          <WarningFilled />
          <Text style={{ color: 'red' }}>
            {intl.formatMessage({ id: 'posts.table.submitState.failed' })}
          </Text>
        </Space>
      ) : null}
    </>
  );
};

export default PostsSubmit;
