import React from 'react';
import { Typography, Menu, Dropdown } from 'antd';
import styles from './settings.less';
import { useIntl } from 'umi';

const { Text, Link } = Typography;

interface Props {
  readonly hash: string;
}

const SettingsOriginalLink: React.FC<Props> = ({ hash }) => {
  const intl = useIntl();

  const menu = (
    <Menu style={{ width: 300 }}>
      <Menu.Item className={styles.originalMenuItem}>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={`https://ipfs.io/ipfs/${hash}`}
          style={{
            overflow: 'hidden',
          }}
        >
          <Text ellipsis>{`https://ipfs.io/ipfs/${hash}`}</Text>
        </Link>
      </Menu.Item>
      <Menu.Item className={styles.originalMenuItem}>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={`https://ipfs.infura.io/ipfs/${hash}`}
        >
          <Text ellipsis>{`https://ipfs.infura.io/ipfs/${hash}`}</Text>
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <section className={styles.item}>
      <p className={styles.itemTitle}>
        {intl.formatMessage({
          id: 'editor.originalLink.title',
        })}
      </p>
      <section className={styles.itemContent}>
        {Number.isNaN(Number(hash)) && hash ? (
          <Dropdown overlay={menu} trigger={['hover']}>
            <Text ellipsis underline copyable>
              {hash}
            </Text>
          </Dropdown>
        ) : (
          <span className={styles.itemEmpty}>
            {intl.formatMessage({
              id: 'editor.originalLink.noOriginalLink',
            })}
          </span>
        )}
      </section>
    </section>
  );
};

export default SettingsOriginalLink;
