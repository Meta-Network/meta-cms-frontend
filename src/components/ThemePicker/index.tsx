import { Storage, StorageKeys } from '@/services/constants';
import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import { Typography, Image, Card, List, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const { Paragraph } = Typography;

const themes: GLOBAL.SiteTheme[] = [
  {
    templateName: 'Aero-Dual',
    description:
      'Minimal and responsive. Easy/automatic switch of dark and light theme style by simple configuration.',
    link: 'https://levblanc.github.io/',
    image:
      'https://d33wubrfki0l68.cloudfront.net/26525034c74d75b36c025d70e9c9a898bc7db183/74e9f/themes/screenshots/aero-dual.jpg',
  },
  {
    templateName: 'Toki',
    description: 'A simple but elegant theme. With pretty style.',
    link: 'https://vevlins.github.io/',
    image:
      'https://d33wubrfki0l68.cloudfront.net/aa0cebcc18c88d90b4aa23a9a35491698f352498/838e9/themes/screenshots/toki.jpg',
  },
  {
    templateName: 'Cupertino',
    description: 'The Hexo Blog Theme Cupertino.',
    link: 'https://mrwillcom.vercel.app/',
    image:
      'https://d33wubrfki0l68.cloudfront.net/87dea1105940b39359fd48623224b8d50ef79544/2711a/themes/screenshots/cupertino.jpg',
  },
];

export default () => {
  const savedThemeId = JSON.parse(Storage.get(StorageKeys.ThemeSetting) || '{}');
  const [selectedThemeId, setSelectedThemeId] = useState(savedThemeId || -1);

  useEffect(() => {
    if (selectedThemeId > 0) {
      message.success(`选择了主题 ${themes[selectedThemeId - 1]?.templateName}`);
      Storage.set(StorageKeys.ThemeSetting, selectedThemeId.toString());
    }
  }, [selectedThemeId]);

  return (
    <div className={styles.cardList}>
      <List
        rowKey="name"
        grid={{
          column: 4,
          gutter: 16,
        }}
        dataSource={themes}
        renderItem={(item, index) => (
          <List.Item key={item.templateName}>
            <Card
              hoverable
              bordered
              bodyStyle={{ padding: 16 }}
              cover={<Image src={item.image} />}
              className={selectedThemeId === index + 1 ? styles.selectedTheme : ''}
              actions={[
                <a target="_blank" href={item.link}>
                  <ArrowRightOutlined /> 预览
                </a>,
                <span onClick={() => setSelectedThemeId(index + 1)} className="clickable">
                  <CheckOutlined key="check" />
                  选用
                </span>,
              ]}
            >
              <Card.Meta
                title={item.templateName}
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
};
