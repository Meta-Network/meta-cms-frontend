import React from 'react';
import { Tooltip } from 'antd';
import { WechatOutlined, GithubOutlined, TwitterOutlined } from '@ant-design/icons';
// import { EmailIcon } from '../../Icon/Index';
import styles from './index.less';

// Toggle 登录方式
const ToggleMode: React.FC = () => {
  return (
    <>
      <p className={styles.toggleModeTitle}>{'其他方式登录'}</p>
      <ul className={styles.toggleModeList}>
        <li className={styles.toggleModeItem}>
          <Tooltip placement="bottom" title={`Email ${'登录'}`}>
            <button className={styles.toggleModeBtn}>
              {/* <EmailIcon /> */}
              <WechatOutlined className="icon" />
            </button>
          </Tooltip>
        </li>
        <li className={styles.toggleModeItem}>
          <Tooltip placement="bottom" title={'微信扫码登录'}>
            <button className={styles.toggleModeBtn}>
              <WechatOutlined className="icon" />
            </button>
          </Tooltip>
        </li>
        <li className={styles.toggleModeItem}>
          <Tooltip placement="bottom" title={`GitHub ${'登录'}`}>
            <button className={styles.toggleModeBtn}>
              <GithubOutlined className="icon" />
            </button>
          </Tooltip>
        </li>
        <li className={styles.toggleModeItem}>
          <Tooltip placement="bottom" title={`Twitter ${'登录'}`}>
            <button className={styles.toggleModeBtn}>
              <TwitterOutlined className="icon" />
            </button>
          </Tooltip>
        </li>
      </ul>
    </>
  );
};

export default ToggleMode;
