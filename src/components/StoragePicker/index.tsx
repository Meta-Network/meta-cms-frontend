import PlatformModal from '@/components/StoragePicker/PlatformModal';
import { getUsernameOfStorage } from '@/services/api/global';
import { Avatar, Card, List, message } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl, useModel } from 'umi';
import styles from './index.less';

export default () => {
  const intl = useIntl();
  const { storageSetting, setStorageSetting } = useModel('localStorageHooks');
  const visibleState = useState(false);
  const [, setModalVisible] = visibleState;

  const confirmedState = useState<string>(storageSetting?.storage ?? '');
  const [storageConfirmed, setStorageConfirmed] = confirmedState;

  const [selectedStorageName, setSelectedStorageName] = useState('');

  const storage = [
    {
      name: 'GitHub',
      description: intl.formatMessage({ id: 'guide.storage.githubDescription' }),
      avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    },
    // {
    //   name: 'Gitee',
    //   description: intl.formatMessage({ id: 'guide.storage.giteeDescription' }),
    //   avatar: 'https://gitee.com/static/images/logo_gitee_g_red.png',
    // },
  ];

  useEffect(() => {
    const validating = async () => {
      if (storageConfirmed) {
        if (storageSetting?.storage && storageSetting?.username) return;

        switch (storageConfirmed) {
          case 'GitHub': {
            let username: string;
            try {
              username = await getUsernameOfStorage('GitHub');
            } catch {
              throw new Error(intl.formatMessage({ id: 'guide.storage.noAuthToken' }));
            }
            if (!username) {
              throw new Error(intl.formatMessage({ id: 'guide.storage.canNotGetUsername' }));
            }
            setStorageSetting((prev) => ({ ...prev, ...{ storage: storageConfirmed, username } }));
            message.success(
              intl.formatMessage(
                { id: 'guide.storage.setStorageAs' },
                { storage: storageConfirmed },
              ),
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
      setStorageConfirmed('');
      setStorageSetting((prev) => ({ ...prev, ...{ storage: '', username: '' } }));
      message
        .error(
          intl.formatMessage(
            { id: 'guide.storage.selectStorageFailed' },
            { reason: error.message },
          ),
        )
        .then();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStorageConfirmed, setStorageSetting, storageConfirmed]);

  const handleSelectStorage = async (name: GLOBAL.StorageProvider) => {
    setSelectedStorageName(name);
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
              onClick={() => handleSelectStorage(item.name as GLOBAL.StorageProvider)}
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
          {storageConfirmed && storageSetting?.username
            ? `${storageConfirmed} (${storageSetting.username})`
            : intl.formatMessage({ id: 'guide.storage.unselected' })}
        </strong>
      </p>

      <PlatformModal
        visibleState={visibleState}
        confirmedState={confirmedState}
        name={selectedStorageName as GLOBAL.StorageProvider}
      />
    </div>
  );
};
