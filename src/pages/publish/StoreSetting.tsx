import { List, Card, Avatar, Tag } from 'antd';
import styles from './StoreSetting.less';

import { GridContent, PageContainer } from '@ant-design/pro-layout';

const ListContent = ({ status }: { status: any }) => {
  const AccountStatus = () =>
    status.account === 1 ? (
      <Tag color="#87d068">账号已绑定</Tag>
    ) : (
      <Tag color="#f50">账号未绑定</Tag>
    );

  const StoreStatus = () =>
    status.store === 1 ? <Tag color="#87d068">存储已配置</Tag> : <Tag color="#f50">存储未配置</Tag>;

  return (
    <div className={styles.listContent}>
      <div className={styles.listContentItem}>
        <span>当前状态：</span>
        <AccountStatus />
        <StoreStatus />
      </div>
      <div className={styles.listContentItem}>
        <span>当前状态：</span>
        <AccountStatus />
        <StoreStatus />
      </div>
    </div>
  );
};

export default () => {
  const getData = () => [
    {
      title: 'GitHub',
      description: '世界上最大的代码存放网站和开源社区',
      avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    },
    {
      title: 'Gitee',
      description: '提供中国本土化的代码仓库托管服务',
      avatar: 'https://gitee.com/static/images/logo_gitee_g_red.png',
    },
  ];

  return (
    <PageContainer>
      <div className={styles.standardList}>
        <Card className={styles.listCard} bordered={false}>
          <GridContent>
            <List
              itemLayout="horizontal"
              dataSource={getData()}
              renderItem={(item) => (
                <Card>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} shape="circle" size={50} />}
                      title={item.title}
                      description={item.description}
                    />
                    <ListContent status={{ account: 1, store: 0 }} />
                  </List.Item>
                </Card>
              )}
            />
          </GridContent>
        </Card>
      </div>
    </PageContainer>
  );
};
