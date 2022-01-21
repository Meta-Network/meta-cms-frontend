import type { FC } from 'react';
import { Space, Typography } from 'antd';
// import { useIntl } from 'umi';
import { StopOutlined, WarningFilled, CopyOutlined } from '@ant-design/icons';
import { ShareIcon } from '../Icon';
import styles from './index.less';

const { Text, Link } = Typography;

interface Props {}

const PostsCertificate: FC<Props> = ({}) => {
  // const intl = useIntl();

  /**
   * 无
   * IPFS 存证中
   * IPFS HASH
   * 存证失败
   */

  return (
    <>
      <Space style={{ color: 'black' }}>
        <StopOutlined />
      </Space>
      <Space style={{ color: 'gray' }}>
        <Text style={{ color: 'gray' }}>IPFS 存证中</Text>
        <CopyOutlined />
        <ShareIcon className={styles.icon} />
      </Space>

      <Space style={{ color: 'red' }}>
        <WarningFilled />
        <Text style={{ color: 'red' }}>存证失败</Text>
      </Space>
      <Space style={{ color: 'gray' }}>
        <Link underline style={{ color: 'gray' }}>
          xxxxxxxxxx
        </Link>
        <CopyOutlined />
        <ShareIcon className={styles.icon} />
      </Space>
    </>
  );
};

export default PostsCertificate;
