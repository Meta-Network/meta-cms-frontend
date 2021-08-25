import PlatformModal from '@/components/StoragePicker/PlatformModal';
import { Card, List, Avatar } from 'antd';
import { useState } from 'react';
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
  const [, setModalVisible] = visibleState;
  const [selectedStoreName, setSelectedStoreName] = useState('');

  const handleSelectStore = async (name: API.StoreProvider) => {
    setSelectedStoreName(name);
    window.localStorage.setItem('storeSetting', name);

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
              onClick={() => handleSelectStore(item.name as API.StoreProvider)}
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
      <PlatformModal name={selectedStoreName as API.StoreProvider} visibleState={visibleState} />
    </div>
  );
};
