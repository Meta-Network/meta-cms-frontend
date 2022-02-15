import { getThemeTemplates } from '@/services/api/meta-cms';
import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { useIntl, useModel } from 'umi';
import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import { Typography, Image, Card, List, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './ThemeSetting.less';

const { Paragraph } = Typography;

export default () => {
  const intl = useIntl();
  // @ts-ignore
  const { themeSetting, setThemeSetting } = useModel('localStorageHooks');
  const [themes, setThemes] = useState<CMS.ThemeTemplatesResponse[]>([]);

  useEffect(() => {
    getThemeTemplates('HEXO').then((response) => {
      setThemes(response?.data ?? []);
    });
  }, []);

  useEffect(() => {
    if (themes?.length && themeSetting > 0) {
      // noinspection JSIgnoredPromiseFromCall
      message.success(
        intl.formatMessage(
          { id: 'guide.theme.selectedTheme' },
          { selectedTheme: themes[themeSetting - 1]?.templateName },
        ),
      );
    }
  }, [themes, themeSetting]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={styles.cardList}>
      <List
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
                <a target="_blank" href={item.previewSite} rel="noopener noreferrer">
                  <ArrowRightOutlined />
                  <FormattedMessage id="component.button.preview" />
                </a>,
                <span onClick={() => setThemeSetting(index + 1)} className="clickable">
                  <CheckOutlined key="check" />
                  <FormattedMessage id="component.button.select" />
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
