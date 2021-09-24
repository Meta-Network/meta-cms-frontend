import {
  GithubOutlined,
  LinkOutlined,
  MediumOutlined,
  QuestionOutlined,
  TwitterOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import style from './index.less';

const menu = (
  <Menu>
    <span className="slider-title">联络我们</span>
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
    <span className="slider-title">资源</span>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/Meta-Network">
        版本记录
      </a>
    </Menu.Item>
    <Menu.Divider />
    <span className="slider-title">友情链接</span>
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
    <span className="slider-title">政策</span>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://meta-network.mttk.net">
        条款
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://meta-network.mttk.net">
        隐私政策
      </a>
    </Menu.Item>
  </Menu>
);

export default (
  <Dropdown
    overlay={menu}
    placement="topLeft"
    overlayClassName={style.menuMoreInfo}
    trigger={['click', 'hover']}
  >
    <QuestionOutlined />
  </Dropdown>
);
