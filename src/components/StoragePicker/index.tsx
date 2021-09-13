import { getGithubUsername } from '@/services/api/global';
import { useModel } from '@@/plugin-model/useModel';
import { useEffect, useState } from 'react';
import { Card, List, Avatar, message } from 'antd';
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
  const { storeSetting, setStoreSetting } = useModel('storage');
  const visibleState = useState(false);
  const [, setModalVisible] = visibleState;

  const confirmedState = useState<string>(storeSetting.storage);
  const [storeConfirmed, setStoreConfirmed] = confirmedState;

  const [selectedStoreName, setSelectedStoreName] = useState('');

  useEffect(() => {
    const validating = async () => {
      if (storeConfirmed) {
        switch (storeConfirmed) {
          case 'GitHub': {
            const username: string = await getGithubUsername();
            if (!username) {
              throw new Error('未成功获取到用户名');
            }
            setStoreSetting({ storage: storeConfirmed, username });
            message.success(`已成功选择仓储为 ${storeConfirmed}`);
            break;
          }
          // TODO: add 'Gitee'
          default: {
            throw new Error('未知的仓储');
          }
        }
      }
    };
    validating().catch((error) => {
      setStoreConfirmed('');
      setStoreSetting({ storage: '', username: '' });
      message.error(`存储仓库选择失败。原因：${error}`);
    });
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
        当前仓储： <strong>{storeConfirmed || '未选择'}</strong>
      </p>

      <PlatformModal
        visibleState={visibleState}
        confirmedState={confirmedState}
        name={selectedStoreName as GLOBAL.StoreProvider}
      />
    </div>
  );
};
