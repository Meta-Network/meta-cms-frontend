import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './settings.less';

// interface Props {}

const SettingsTips: React.FC = () => {
  return (
    <section className={styles.tips}>
      <InfoCircleOutlined />{' '}
      <span>
        当您提交文章并选择在 IPFS 直接存证您的元数据时，不会经过 Meta Network
        的任何后台或数据库，减少中间人攻击的可能性。若要让内容在您的 Meta Space
        中显示，则需要您在提交完成后返回 CMS 进行发布。
      </span>
    </section>
  );
};

export default SettingsTips;
