import type { FC } from 'react';
import { Space, Typography } from 'antd';
// import { useIntl } from 'umi';
import { ClockCircleOutlined, WarningFilled, CheckCircleFilled } from '@ant-design/icons';
const { Text } = Typography;

interface Props {}

const PostsSubmit: FC<Props> = ({}) => {
  // const intl = useIntl();

  /**
   * 正在提交
   * 等待提交
   * 提交失败
   * 已提交
   */

  return (
    <>
      <Space style={{ color: 'gray' }}>
        <ClockCircleOutlined />
        <Text style={{ color: 'gray' }}>正在提交</Text>
      </Space>
      <Space style={{ color: 'gray' }}>
        <ClockCircleOutlined />
        <Text style={{ color: 'gray' }}>等待提交</Text>
      </Space>
      <Space style={{ color: 'red' }}>
        <WarningFilled />
        <Text style={{ color: 'red' }}>提交失败</Text>
      </Space>
      <Space style={{ color: 'green' }}>
        <CheckCircleFilled />
        <Text style={{ color: 'green' }}>已提交</Text>
      </Space>
    </>
  );
};

export default PostsSubmit;
