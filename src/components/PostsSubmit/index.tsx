import type { FC } from 'react';
import { Space, Typography } from 'antd';
// import { useIntl } from 'umi';
import { ClockCircleOutlined, WarningFilled, CheckCircleFilled } from '@ant-design/icons';
import { PipelineOrderTaskCommonState } from '@/services/constants';
const { Text } = Typography;

interface Props {
  readonly state: PipelineOrderTaskCommonState;
}

const PostsSubmit: FC<Props> = ({ state }) => {
  // const intl = useIntl();

  /**
   * 正在提交
   * 等待提交
   * 提交失败
   * 已提交
   */

  return (
    <>
      {state === PipelineOrderTaskCommonState.DOING ? (
        <Space style={{ color: 'gray' }}>
          <ClockCircleOutlined />
          <Text style={{ color: 'gray' }}>等待提交</Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.PENDING ? (
        <Space style={{ color: 'gray' }}>
          <ClockCircleOutlined />
          <Text style={{ color: 'gray' }}>正在提交</Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FINISHED ? (
        <Space style={{ color: 'green' }}>
          <CheckCircleFilled />
          <Text style={{ color: 'green' }}>已提交</Text>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FAILED ? (
        <Space style={{ color: 'red' }}>
          <WarningFilled />
          <Text style={{ color: 'red' }}>提交失败</Text>
        </Space>
      ) : null}
    </>
  );
};

export default PostsSubmit;
