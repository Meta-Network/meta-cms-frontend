import { GatewayType, PipelineOrderTaskCommonState } from '@/services/constants';
import { hashSlice } from '@/utils';
import { StopOutlined, WarningFilled } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useIntl } from 'umi';
import { ShareIcon } from '../Icon';
import styles from './index.less';

const { Text, Link } = Typography;

interface Props {
  readonly state: PipelineOrderTaskCommonState;
  readonly certificateId: string;
  readonly certificateStorageType: GatewayType;
}

const PostsCertificate: FC<Props> = ({ state, certificateId, certificateStorageType }) => {
  const intl = useIntl();

  /**
   * 无
   * IPFS 存证中 | ARWEAVE 存证中
   * IPFS | ARWEAVE HASH
   * 存证失败
   */

  // 存证链接
  const certificateLink = useMemo(() => {
    return certificateStorageType === GatewayType.Ipfs
      ? `${IPFS_FLEEK}/${certificateId}`
      : certificateStorageType === GatewayType.Arweave
      ? `${ARWEAVE_VIEWBLOCK}/tx/${certificateId}`
      : '';
  }, [certificateId, certificateStorageType]);

  // 存证类型文字
  const certificateStorageTypeText = useMemo(() => {
    return certificateStorageType === GatewayType.Ipfs
      ? `IPFS ${intl.formatMessage({ id: 'posts.table.certificate.doing' })}`
      : certificateStorageType === GatewayType.Arweave
      ? `ARWEAVE ${intl.formatMessage({ id: 'posts.table.certificate.doing' })}`
      : '';
  }, [certificateStorageType, intl]);

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
            {certificateStorageTypeText}
          </Text>
          <Link href={certificateLink} target="_blank" rel="noopener noreferrer">
            <ShareIcon className={styles.icon} />
          </Link>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FINISHED ? (
        <Space style={{ color: 'gray' }}>
          <Text
            copyable={{
              text: certificateId,
            }}
          >
            <Link
              underline
              style={{ color: 'gray' }}
              href={certificateLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {hashSlice(certificateId)}
            </Link>
          </Text>
          <Link href={certificateLink} target="_blank" rel="noopener noreferrer">
            <ShareIcon className={styles.icon} />
          </Link>
        </Space>
      ) : state === PipelineOrderTaskCommonState.FAILED ? (
        <Space style={{ color: 'red' }}>
          <WarningFilled />
          <Text style={{ color: 'red' }}>
            {intl.formatMessage({ id: 'posts.table.certificate.failed' })}
          </Text>
        </Space>
      ) : null}
    </>
  );
};

export default PostsCertificate;
