import { Dropdown, Menu } from 'antd';
import { Fragment, useState } from 'react';
import { FormattedMessage } from 'umi';
import {
  TwitterOutlined,
  MediumOutlined,
  LinkOutlined,
  QuestionOutlined,
  YoutubeOutlined,
} from '@ant-design/icons';
import {
  TelegramIcon,
  DiscordIcon,
  ElementIcon,
  MetaLogoIcon,
  MetaWikiIcon,
} from '../../Icon/index';
import style from './index.less';

const menuJson = [
  {
    title: <FormattedMessage id="menu.moreInfo.contactUs" />,
    item: [
      {
        url: 'https://matrix.to/#/!jrjmzTFiYYIuKnRpEg:matrix.org?via=matrix.org',
        icon: <ElementIcon />,
        name: 'Matrix Group',
      },
      {
        url: 'https://discord.com/invite/59cXXWCWUT',
        icon: <DiscordIcon />,
        name: 'Discord',
      },
      {
        url: 'https://t.me/metanetwork',
        icon: <TelegramIcon />,
        name: 'Telegram',
      },
      {
        url: 'https://twitter.com/realMetaNetwork',
        icon: <TwitterOutlined />,
        name: 'Twitter',
      },
      {
        url: 'https://medium.com/meta-network',
        icon: <MediumOutlined />,
        name: 'Medium',
      },
      {
        url: 'https://www.youtube.com/channel/UC-rNon6FUm3blTnSrXta2gw',
        icon: <YoutubeOutlined />,
        name: 'Youtube',
      },
    ],
  },
  {
    title: <FormattedMessage id="menu.moreInfo.links" />,
    item: [
      {
        url: 'https://www.meta.io',
        icon: <LinkOutlined />,
        name: 'Meta.io',
      },
      {
        url: 'https://www.matataki.io',
        icon: <LinkOutlined />,
        name: 'Matataki',
      },
      {
        url: 'https://home.metanetwork.online',
        icon: <MetaLogoIcon />,
        name: <FormattedMessage id="menu.moreInfo.home" />,
      },
      {
        url: META_WIKI,
        icon: <MetaWikiIcon />,
        name: 'Wiki',
      },
    ],
  },
  {
    title: <FormattedMessage id="menu.moreInfo.policy" />,
    item: [
      {
        url: 'https://metanetwork.online/terms',
        icon: <LinkOutlined />,
        name: <FormattedMessage id="menu.moreInfo.terms" />,
      },
      {
        url: 'https://metanetwork.online/privacy',
        icon: <LinkOutlined />,
        name: <FormattedMessage id="menu.moreInfo.privacyPolicy" />,
      },
    ],
  },
];

const menu = (
  <Menu>
    {menuJson.map((i, idx) => (
      <Fragment key={idx}>
        <span className="slider-title">{i.title}</span>
        {i.item.map((j, idxJ) => (
          <Menu.Item key={`item_${idxJ}`} icon={j.icon}>
            <a href={j.url} target="_blank" rel="noopener noreferrer">
              {j.name}
            </a>
          </Menu.Item>
        ))}
        {idx < menuJson.length - 1 ? <Menu.Divider /> : null}
      </Fragment>
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
        trigger={[]}
        visible={visible}
        placement="topLeft"
        onVisibleChange={(isVisible) => setVisible(isVisible)}
        overlayClassName={style.menuMoreInfo}
      >
        <QuestionOutlined />
      </Dropdown>
    </div>
  );
};
