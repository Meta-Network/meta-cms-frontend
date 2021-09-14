import { getThemeTemplates } from '@/services/api/meta-cms';
import { useModel } from '@@/plugin-model/useModel';
import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import { Typography, Image, Card, List, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const { Paragraph } = Typography;

export default () => {
  const { themeSetting, setThemeSetting } = useModel('storage');
  const [themes, setThemes] = useState<CMS.ThemeTemplatesResponse[]>([]);

  useEffect(() => {
    getThemeTemplates('HEXO').then((response) => {
      setThemes(response.data);
    });
  }, []);

  useEffect(() => {
    if (themes?.length && themeSetting > 0) {
      // noinspection JSIgnoredPromiseFromCall
      message.success(`选择了主题 ${themes[themeSetting - 1]?.templateName}`);
    }
  }, [themes, themeSetting]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={styles.cardList}>
      <List
        rowKey="name"
        grid={{
          column: 4,
          gutter: 16,
        }}
        loading={!themes?.length}
        dataSource={themes}
        renderItem={(item, index) => (
          <List.Item key={item.templateName}>
            <Card
              hoverable
              bordered
              bodyStyle={{ padding: 16 }}
              cover={<Image src={item.previewImage} />}
              className={themeSetting === index + 1 ? styles.selectedTheme : ''}
              actions={[
                <a target="_blank" href={item.previewSite}>
                  <ArrowRightOutlined /> 预览
                </a>,
                <span onClick={() => setThemeSetting(index + 1)} className="clickable">
                  <CheckOutlined key="check" />
                  选用
                </span>,
              ]}
            >
              <Card.Meta
                title={item.templateName}
                description={
                  <Paragraph className={styles.description} ellipsis={{ rows: 2 }}>
                    {item.templateDescription}
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
