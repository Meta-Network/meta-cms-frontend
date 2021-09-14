import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, List, Tag } from 'antd';
import { Fragment, useState } from 'react';
import styles from './index.less';

const status = {
  matataki: {
    isBind: false,
    isSyncing: false,
  },
};

export default () => {
  const [sourceStatus, setSourceStatus] = useState<any>(status);

  const getData = () => [
    {
      title: [
        'Matataki',
        <Tag className="status" color="red">
          未绑定
        </Tag>,
      ],
      description: '每一篇自由的创作都应该被永远记录',
      actions: [<Button type="primary">绑定</Button>],
      avatar: (
        <img
          className="icon"
          src="https://cdn.frontenduse.top/prod/img/dapp_list_matataki.8bac289.png"
          alt="matataki icon"
        />
      ),
    },
    {
      title: [
        'Matataki',
        <Tag className="status" color="blue">
          已绑定
        </Tag>,
      ],
      description: '每一篇自由的创作都应该被永远记录',
      actions: [<Button type="primary">开启同步</Button>, <Button danger>解绑</Button>],
      avatar: (
        <img
          className="icon"
          src="https://cdn.frontenduse.top/prod/img/dapp_list_matataki.8bac289.png"
          alt="matataki icon"
        />
      ),
    },

    {
      title: [
        'Matataki',
        <Tag className="status" color="green">
          同步中
        </Tag>,
      ],
      description: '每一篇自由的创作都应该被永远记录',
      actions: [<Button>关闭同步</Button>, <Button danger>解绑</Button>],
      avatar: (
        <img
          className="icon"
          src="https://cdn.frontenduse.top/prod/img/dapp_list_matataki.8bac289.png"
          alt="matataki icon"
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="内容源绑定"
      content={<p>你可以在此将其他平台的文章同步至你的个人站点。</p>}
      breadcrumb={{}}
    >
      <GridContent>
        <div className={styles.main}>
          <Fragment>
            <List
              itemLayout="horizontal"
              dataSource={getData()}
              renderItem={(item) => (
                <List.Item actions={item.actions}>
                  <List.Item.Meta
                    avatar={item.avatar}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Fragment>
        </div>
      </GridContent>
    </PageContainer>
  );
};
