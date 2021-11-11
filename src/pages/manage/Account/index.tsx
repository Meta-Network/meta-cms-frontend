import FormattedDescription from '@/components/FormattedDescription';
import { queryMyAccounts } from '@/services/api/meta-ucenter';
import { generateSeedAndKey, verifySeedAndKey } from '@/utils/editor';
import {
  KeyOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  ScanOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import Paragraph from 'antd/es/typography/Paragraph';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'umi';
import { Button, List, Tooltip } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';

export default () => {
  const [userPublicKey, setUserPublicKey] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const intl = useIntl();

  useEffect(() => {
    const verification = verifySeedAndKey();
    if (verification) {
      setUserPublicKey(verification.publicKey);
    }
  }, []);

  useEffect(() => {
    queryMyAccounts().then((result) => {
      setUserEmail(result.data?.find((e) => e?.platform === 'email')?.account_id ?? '');
    });
  }, [setUserEmail]);

  const generateKeys = () => {
    const { keys } = generateSeedAndKey();
    setUserPublicKey(keys.public);
  };

  const DisplayUserPublicKey = () => {
    if (!userPublicKey) {
      return <Button onClick={generateKeys}>生成非金融Keys</Button>;
    }
    return (
      <>
        <div>
          <Paragraph
            style={{ display: 'inline', marginRight: 10 }}
            copyable={{ text: userPublicKey }}
          >
            {userPublicKey.slice(0, 6)}****{userPublicKey.slice(-4)}
          </Paragraph>
          <Button onClick={generateKeys}>重新生成</Button>
          <Tooltip
            placement="bottomLeft"
            title="若发现非金融签名的私钥可能存在泄漏，可以通过重新生成来保护个人权益"
          >
            <QuestionCircleOutlined style={{ paddingLeft: 10, fontSize: 20 }} />
          </Tooltip>
        </div>
      </>
    );
  };

  const data: {
    icon: React.ReactNode;
    name: string;
    title: string;
    description: string;
    content: React.ReactNode;
  }[] = [
    {
      name: 'email',
      title: '邮箱账号',
      icon: <MailOutlined />,
      description: '用于登入时的验证',
      content: <Paragraph>{userEmail}</Paragraph>,
    },
    {
      name: 'wallet',
      title: '钱包金融Key',
      icon: <WalletOutlined />,
      description: '用于进行金融活动验证\n若要使用此功能，需先开启您的浏览器钱包',
      content: <></>,
    },
    {
      name: 'biometrics',
      title: '生物认证Key',
      icon: <ScanOutlined />,
      description: '用于辅助登入和非金融场景以外的行为验证\n若要使用该功能，须您的设备支持',
      content: <></>,
    },
    {
      name: 'sign',
      title: '非金融Key',
      icon: <KeyOutlined />,
      description: '用于对非金融场景以外的行为验证',
      content: <DisplayUserPublicKey />,
    },
  ];

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: '账号' })}
      content={<FormattedDescription id="用来管理与您 Meta Space 相关联的账号和签名" />}
    >
      <List
        size="large"
        split={false}
        rowKey={(item) => item.name}
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item /*actions={[<Button>Actions!</Button>]}*/ className={styles.listItem}>
            <List.Item.Meta
              className={styles.listItemMeta}
              avatar={item.icon}
              title={item.title}
              description={
                <FormattedDescription customClass={styles.description} id={item.description} />
              }
            />
            <div className={styles.listContent}>{item.content}</div>
          </List.Item>
        )}
      />
    </PageContainer>
  );
};
