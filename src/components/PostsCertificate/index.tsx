import type { FC } from 'react';
import { Space, Typography } from 'antd';
// import { useIntl } from 'umi';
import { StopOutlined, WarningFilled, CopyOutlined } from '@ant-design/icons';
import { ShareIcon } from '../Icon';
import styles from './index.less';
import { GatewayType, PipelineOrderTaskCommonState } from '@/services/constants';

const { Text, Link } = Typography;

interface Props {
  readonly state: PipelineOrderTaskCommonState;
  readonly certificateId: string;
  readonly certificateStorageType: GatewayType;
}

const PostsCertificate: FC<Props> = ({ state, certificateId, certificateStorageType }) => {
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
      ) : state === PipelineOrderTaskCommonState.DOING ? (
        <Space className={styles.gray}>
          <Text
            style={{ color: 'gray' }}
            copyable={{
              text: certificateId,
            }}
          >
            {certificateStorageType === GatewayType.Ipfs
              ? 'IPFS 存证中'
              : certificateStorageType === GatewayType.Arweave
              ? 'ARWEAVE 存证中'
              : ''}
          </Text>
          <Link
            href={
              certificateStorageType === GatewayType.Ipfs
                ? `${IPFS_FLEEK}/${certificateId}`
                : certificateStorageType === GatewayType.Arweave
                ? `${ARWEAVE_VIEWBLOCK}/tx/${certificateId}`
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <ShareIcon className={styles.icon} />
          </Link>
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
