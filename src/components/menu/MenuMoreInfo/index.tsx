import {
  GithubOutlined,
  LinkOutlined,
  MediumOutlined,
  QuestionOutlined,
  TwitterOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { FormattedMessage } from 'umi';
import style from './index.less';

const menu = (
  <Menu>
    <span className="slider-title">
      <FormattedMessage id="menu.moreInfo.contactUs" />
    </span>
    <Menu.Item icon={<TwitterOutlined />}>
      <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/realMetaNetwork">
        Twitter
      </a>
    </Menu.Item>
    <Menu.Item icon={<LinkOutlined />}>
      <a target="_blank" rel="noopener noreferrer" href="https://t.me/metanetwork">
        Telegram
      </a>
    </Menu.Item>
    <Menu.Item icon={<LinkOutlined />}>
      <a target="_blank" rel="noopener noreferrer" href="https://discord.com/invite/59cXXWCWUT">
        Discord
      </a>
    </Menu.Item>
    <Menu.Item icon={<MediumOutlined />}>
      <a target="_blank" rel="noopener noreferrer" href="https://medium.com/meta-network">
        Medium
      </a>
    </Menu.Item>
    <Menu.Item icon={<GithubOutlined />}>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/Meta-Network">
        Github
      </a>
    </Menu.Item>
    <Menu.Divider />
    <span className="slider-title">
      <FormattedMessage id="menu.moreInfo.resources" />
    </span>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/Meta-Network">
        <FormattedMessage id="menu.moreInfo.versions" />
      </a>
    </Menu.Item>
    <Menu.Divider />
    <span className="slider-title">
      <FormattedMessage id="menu.moreInfo.links" />
    </span>
    <Menu.Item>
      <a href="https://www.meta.io" target="_blank" rel="noopener noreferrer">
        Meta.io
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://meta-space.vercel.app">
        Meta Space
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://meta-network.mttk.net/">
        Meta Network
      </a>
    </Menu.Item>
    <Menu.Divider />
    <span className="slider-title">
      <FormattedMessage id="menu.moreInfo.policy" />
    </span>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://meta-network.mttk.net">
        <FormattedMessage id="menu.moreInfo.terms" />
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://meta-network.mttk.net">
        <FormattedMessage id="menu.moreInfo.privacyPolicy" />
      </a>
    </Menu.Item>
  </Menu>
);

export default () => (
  <Dropdown
    overlay={menu}
    placement="topLeft"
    overlayClassName={style.menuMoreInfo}
    trigger={['click']}
  >
    <QuestionOutlined />
  </Dropdown>
);
