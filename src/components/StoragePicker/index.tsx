import { useEffect, useState } from 'react';
import { Card, List, Avatar, message } from 'antd';
import { Storage, StorageKeys } from '@/services/constants';
import { getSocialAuthToken } from '@/services/api/meta-ucenter';
import PlatformModal from '@/components/StoragePicker/PlatformModal';
import styles from './index.less';

const storage = [
  {
    name: 'GitHub',
    description: '世界上最大的代码存放网站和开源社区',
    avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  },
  {
    name: 'Gitee',
    description: '提供中国本土化的代码仓库托管服务',
    avatar: 'https://gitee.com/static/images/logo_gitee_g_red.png',
  },
];

export default () => {
  const visibleState = useState(false);
  const confirmedState = useState(Storage.get('storeSetting'));

  const [, setModalVisible] = visibleState;
  const [storageConfirmed, setStorageConfirmed] = confirmedState;
  const [selectedStoreName, setSelectedStoreName] = useState('');

  useEffect(() => {
    if (storageConfirmed) {
      getSocialAuthToken(storageConfirmed.toLowerCase()).then((request) => {
        if (request.message === 'ok') {
          Storage.set(StorageKeys.StoreSetting, storageConfirmed);
          message.success(`已成功选择仓储为 ${storageConfirmed}`);
        } else {
          setStorageConfirmed('');
          Storage.delete(StorageKeys.StoreSetting);
          message.error('存储仓库选择失败。原因：未获取到校验结果(token)');
        }
      });
    }
  }, [setStorageConfirmed, storageConfirmed]);

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
        当前仓储： <strong>{storageConfirmed || '未选择'}</strong>
      </p>

      <PlatformModal
        visibleState={visibleState}
        confirmedState={confirmedState}
        name={selectedStoreName as GLOBAL.StoreProvider}
      />
    </div>
  );
};
