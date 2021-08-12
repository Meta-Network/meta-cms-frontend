// eslint-disable-next-line max-classes-per-file
import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import { Typography, Image, Card, List } from 'antd';
import React from 'react';
import styles from './index.less';

const { Paragraph, Title } = Typography;

const themes = [
  {
    name: 'Aero-Dual',
    description:
      'Minimal and responsive. Easy/automatic switch of dark and light theme style by simple configuration.',
    link: 'https://levblanc.github.io/',
    image:
      'https://d33wubrfki0l68.cloudfront.net/26525034c74d75b36c025d70e9c9a898bc7db183/74e9f/themes/screenshots/aero-dual.jpg',
  },
  {
    name: 'Toki',
    description: 'A simple but elegant theme.',
    link: 'https://vevlins.github.io/',
    image:
      'https://d33wubrfki0l68.cloudfront.net/aa0cebcc18c88d90b4aa23a9a35491698f352498/838e9/themes/screenshots/toki.jpg',
  },
  {
    name: 'Cupertino',
    description: 'The Hexo Blog Theme Cupertino.',
    link: 'https://mrwillcom.vercel.app/',
    image:
      'https://d33wubrfki0l68.cloudfront.net/87dea1105940b39359fd48623224b8d50ef79544/2711a/themes/screenshots/cupertino.jpg',
  },
];

export class TabsCard extends React.Component {
  themesName = themes.map((theme) => theme.name);
  tabList = this.themesName.map((name) => ({ key: name, tab: name }));

  state = {
    tab: this.themesName[0],
    theme: themes[0],
  };

  onTabChange = (key: string) => {
    this.setState({ tab: key, theme: themes.find((theme) => theme.name === key) });
  };

  render() {
    return (
      <Card
        style={{ width: '100%' }}
        tabList={this.tabList}
        activeTabKey={this.state.tab}
        onTabChange={(key) => {
          this.onTabChange(key);
        }}
      >
        <Image
          className={styles.displayImage}
          src={this.state.theme.image}
          width={400}
          height={260}
        />
        <Title level={3}>h3. Ant Design</Title>
        <h1>{this.state.theme.name}</h1>
        <p>{this.state.theme.description}</p>

        <p>
          因为用到了标签页的形式，这边的空位会很大。
          <br />
          可以给用户描述许多东西。
          <br />
          <br />
          比如这里继续写很长的介绍……
        </p>
        <a className={styles.link} href={this.state.theme.link}>
          站点效果预览
        </a>
      </Card>
    );
  }
}

class ListCard extends React.Component {
  render() {
    return (
      <div className={styles.cardList}>
        <List
          rowKey="name"
          grid={{
            column: 4,
            gutter: 16,
          }}
          dataSource={themes}
          renderItem={(item) => (
            <List.Item key={item.name}>
              <Card
                hoverable
                bordered
                cover={<Image src={item.image} />}
                className={styles.card}
                actions={[
                  <a target="_blank" href={item.link}>
                    <ArrowRightOutlined /> 预览
                  </a>,
                  <span>
                    <CheckOutlined key="check" /> 选用
                  </span>,
                ]}
              >
                <Card.Meta
                  title={item.name}
                  description={
                    <Paragraph className={styles.description} ellipsis={{ rows: 2 }}>
                      {item.description}
                    </Paragraph>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

// export default TabsCard;
export default ListCard;
