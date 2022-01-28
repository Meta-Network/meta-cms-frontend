import type { FC } from 'react';
import { Space, Typography } from 'antd';
// import { useIntl } from 'umi';
import { StopOutlined, WarningFilled, CopyOutlined } from '@ant-design/icons';
import { ShareIcon } from '../Icon';
import styles from './index.less';
import { PipelineOrderTaskCommonState } from '@/services/constants';

const { Text, Link } = Typography;

interface Props {
  readonly state: PipelineOrderTaskCommonState;
}

const PostsCertificate: FC<Props> = ({ state }) => {
  // const intl = useIntl();

  /**
   * 无
   * IPFS 存证中
   * IPFS HASH
   * 存证失败
   */

  return (
    <>
      {state === PipelineOrderTaskCommonState.NONE ? (
        <Space style={{ color: 'black' }}>
          <StopOutlined />
        </Space>
      ) : state === PipelineOrderTaskCommonState.PENDING ? (
        <Space style={{ color: 'gray' }}>
          <Text style={{ color: 'gray' }}>IPFS 存证中</Text>
          <CopyOutlined />
          <ShareIcon className={styles.icon} />
        </Space>
      ) : state === PipelineOrderTaskCommonState.FINISHED ? (
        <Space style={{ color: 'gray' }}>
          <Link underline style={{ color: 'gray' }}>
            xxxxxxxxxx
          </Link>
          <CopyOutlined />
          <ShareIcon className={styles.icon} />
        </Space>
      ) : state === PipelineOrderTaskCommonState.FAILED ? (
        <Space style={{ color: 'red' }}>
          <WarningFilled />
          <Text style={{ color: 'red' }}>存证失败</Text>
        </Space>
      ) : null}
    </>
  );
};

export default PostsCertificate;
