import { getUsernameOfStore } from '@/services/api/global';
import { useModel, useIntl, FormattedMessage } from 'umi';
import { useEffect, useState } from 'react';
import { Card, List, Avatar, message } from 'antd';
import PlatformModal from '@/components/StorePicker/PlatformModal';
import styles from './index.less';

export default () => {
  const intl = useIntl();
  const { storeSetting, setStoreSetting } = useModel('storage');
  const visibleState = useState(false);
  const [, setModalVisible] = visibleState;

  const confirmedState = useState<string>(storeSetting.storage);
  const [storeConfirmed, setStoreConfirmed] = confirmedState;

  const [selectedStoreName, setSelectedStoreName] = useState('');

  const storage = [
    {
      name: 'GitHub',
      description: intl.formatMessage({ id: 'guide.storage.githubDescription' }),
      avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    },
    {
      name: 'Gitee',
      description: intl.formatMessage({ id: 'guide.storage.giteeDescription' }),
      avatar: 'https://gitee.com/static/images/logo_gitee_g_red.png',
    },
  ];

  useEffect(() => {
    const validating = async () => {
      if (storeConfirmed) {
        if (storeSetting.storage && storeSetting.username) return;

        switch (storeConfirmed) {
          case 'GitHub': {
            let username: string;
            try {
              username = await getUsernameOfStore('GitHub');
            } catch {
              throw new Error(intl.formatMessage({ id: 'guide.storage.noAuthToken' }));
            }
            if (!username) {
              throw new Error(intl.formatMessage({ id: 'guide.storage.canNotGetUsername' }));
            }
            setStoreSetting({ storage: storeConfirmed, username });
            message.success(
              intl.formatMessage({ id: 'guide.storage.setStorageAs' }, { storage: storeConfirmed }),
            );
            break;
          }
          // TODO: Only works for Github
          default: {
            throw new Error(intl.formatMessage({ id: 'guide.storage.unknownStorage' }));
          }
        }
      }
    };
    validating().catch((error) => {
      setStoreConfirmed('');
      setStoreSetting({ storage: '', username: '' });
      message.error(
        intl.formatMessage({ id: 'guide.storage.selectStorageFailed' }, { reason: error }),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStoreConfirmed, setStoreSetting, storeConfirmed]);

  const handleSelectStore = async (name: GLOBAL.StoreProvider) => {
    setSelectedStoreName(name);
    setModalVisible(true);
  };

  return (
    <div className={styles.cardList}>
      <List
        rowKey="name"
        grid={{
          column: 2,
          gutter: 30,
        }}
        dataSource={storage}
        renderItem={(item) => (
          <List.Item key={item.name}>
            <Card
              onClick={() => handleSelectStore(item.name as GLOBAL.StoreProvider)}
              hoverable
              bordered
              className={styles.card}
            >
              <Card.Meta
                avatar={<Avatar src={item.avatar} />}
                title={item.name}
                description={item.description}
              />
            </Card>
          </List.Item>
        )}
      />
      <p>
        <FormattedMessage id="guide.storage.currentStorage" />
        <strong>
          {storeConfirmed && storeSetting.username
            ? `${storeConfirmed} (${storeSetting.username})`
            : intl.formatMessage({ id: 'guide.storage.unselected' })}
        </strong>
      </p>

      <PlatformModal
        visibleState={visibleState}
        confirmedState={confirmedState}
        name={selectedStoreName as GLOBAL.StoreProvider}
      />
    </div>
  );
};
