import React from 'react';
import { Tooltip } from 'antd';
import { useIntl } from 'umi';
import { WechatOutlined, GithubOutlined, TwitterOutlined } from '@ant-design/icons';
import { EmailIcon } from '../../../../components/Icon';
import styles from './index.less';

// Toggle 登录方式
const ToggleMode: React.FC = () => {
  const intl = useIntl();

  return (
    <>
      <p className={styles.toggleModeTitle}>
        {intl.formatMessage({ id: 'login.otherLoginMethod' })}
      </p>
      <ul className={styles.toggleModeList}>
        <li className={styles.toggleModeItem}>
          <Tooltip placement="bottom" title={`Email ${intl.formatMessage({ id: 'login.signIn' })}`}>
            <button className={styles.toggleModeBtn}>
              <EmailIcon />
            </button>
          </Tooltip>
        </li>
        <li className={styles.toggleModeItem}>
          <Tooltip
            placement="bottom"
            title={intl.formatMessage({ id: 'login.weChatScanCodeLogin' })}
          >
            <button className={styles.toggleModeBtn}>
              <WechatOutlined className="icon" />
            </button>
          </Tooltip>
        </li>
        <li className={styles.toggleModeItem}>
          <Tooltip
            placement="bottom"
            title={`GitHub ${intl.formatMessage({ id: 'login.signIn' })}`}
          >
            <button className={styles.toggleModeBtn}>
              <GithubOutlined className="icon" />
            </button>
          </Tooltip>
        </li>
        <li className={styles.toggleModeItem}>
          <Tooltip
            placement="bottom"
            title={`Twitter ${intl.formatMessage({ id: 'login.signIn' })}`}
          >
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
