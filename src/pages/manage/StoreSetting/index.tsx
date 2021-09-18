import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, List, Tag } from 'antd';
import { Fragment } from 'react';
import styles from './index.less';

export default () => {
  const getData = () => [
    {
      title: [
        'GitHub',
        <Tag className="status" color="red">
          未绑定
        </Tag>,
      ],
      description: '世界上最大的代码存放网站和开源社区',
      actions: [<Button type="primary">绑定</Button>],
      avatar: (
        <img
          className="icon"
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="github icon"
        />
      ),
    },
    {
      title: [
        'Gitee',
        <Tag className="status" color="blue">
          已绑定
        </Tag>,
      ],
      actions: [<Button danger>解绑</Button>],
      description: '提供中国本土化的代码仓库托管服务',
      avatar: (
        <img
          className="icon"
          src="https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/9357cf7a0529738c587b"
          alt="gitee icon"
        />
      ),
    },
  ];
  return (
    <PageContainer title="存储配置" content={<p>你可以在此配置站点存储源。</p>} breadcrumb={{}}>
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
