import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Typography } from 'antd';
import style from './index.less';
import { setLocale } from 'umi';

const languages = [
  {
    name: '中文',
    value: 'zh-CN',
  },
  {
    name: 'English',
    value: 'en-US',
  },
];

const menu = (
  <Menu>
    {languages.map((language) => (
      <Menu.Item key={language.value}>
        {
          <Typography.Text onClick={() => setLocale(language.value, true)}>
            {language.name}
          </Typography.Text>
        }
      </Menu.Item>
    ))}
  </Menu>
);

export default () => (
  <Dropdown
    overlay={menu}
    placement="topLeft"
    overlayClassName={style.menuLanguageSwitch}
    trigger={['click']}
  >
    <GlobalOutlined />
  </Dropdown>
);