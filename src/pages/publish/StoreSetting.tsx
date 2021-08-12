import { List, Card, Avatar } from 'antd';
// import styles from './StoreSetting.less';
import { GridContent } from '@ant-design/pro-layout';

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
    <Card>
      <GridContent>
        <List
          itemLayout="horizontal"
          dataSource={getData()}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} shape="circle" size={50} />}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </GridContent>
    </Card>
  );
};
