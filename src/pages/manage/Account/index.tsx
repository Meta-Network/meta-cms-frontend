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
      return (
        <Button onClick={generateKeys}>
          {intl.formatMessage({
            id: 'manage.account.item.sign.content.button.generateKeys',
          })}
        </Button>
      );
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
          <Button onClick={generateKeys}>
            {intl.formatMessage({
              id: 'manage.account.item.sign.content.button.regenerate',
            })}
          </Button>
          <Tooltip
            placement="bottomLeft"
            title={intl.formatMessage({
              id: 'manage.account.item.sign.content.button.regenerateTooltipTitle',
            })}
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
      title: intl.formatMessage({ id: 'manage.account.item.email.title' }),
      icon: <MailOutlined />,
      description: intl.formatMessage({ id: 'manage.account.item.email.description' }),
      content: <Paragraph>{userEmail}</Paragraph>,
    },
    {
      name: 'wallet',
      title: intl.formatMessage({ id: 'manage.account.item.wallet.description' }),
      icon: <WalletOutlined />,
      description: intl.formatMessage({ id: 'manage.account.item.wallet.description' }),
      content: <></>,
    },
    {
      name: 'biometrics',
      title: intl.formatMessage({ id: 'manage.account.item.biometrics.description' }),
      icon: <ScanOutlined />,
      description: intl.formatMessage({ id: 'manage.account.item.biometrics.description' }),
      content: <></>,
    },
    {
      name: 'sign',
      title: intl.formatMessage({ id: 'manage.account.item.sign.description' }),
      icon: <KeyOutlined />,
      description: intl.formatMessage({ id: 'manage.account.item.sign.description' }),
      content: <DisplayUserPublicKey />,
    },
  ];

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'manage.account.title' })}
      content={<FormattedDescription id="manage.account.description" />}
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
