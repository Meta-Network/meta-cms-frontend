import { setLocale } from 'umi';
import { useState } from 'react';
import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Typography } from 'antd';
import style from './index.less';

const languages = [
  {
    title: '中文',
    value: 'zh-CN',
  },
  {
    title: 'English',
    value: 'en-US',
  },
];

const menu = (
  <Menu>
    {languages.map((language) => (
      <Menu.Item
        key={language.value}
        onClick={() => {
          setLocale(language.value, true);
        }}
      >
        {<Typography.Text>{language.title}</Typography.Text>}
      </Menu.Item>
    ))}
  </Menu>
);

export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      onClick={() => {
        setVisible((v) => !v);
        return;
      }}
    >
      <Dropdown
        overlay={menu}
        placement="topLeft"
        visible={visible}
        onVisibleChange={(isVisible) => setVisible(isVisible)}
        overlayClassName={style.menuLanguageSwitch}
      >
        <GlobalOutlined />
      </Dropdown>
    </div>
  );
};
