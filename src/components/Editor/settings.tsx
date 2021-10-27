import React, { useState } from 'react';
import { Drawer, Select } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import styles from './settings.less';

const { Option } = Select;

interface Props {
  readonly tags: string[];
  handleChangeTags: (val: string[]) => void;
}

const tagsList = [
  { name: 'Meta' },
  { name: 'MetaNetwork' },
  { name: 'MetaCMS' },
  { name: 'BTC' },
  { name: 'ETH' },
  { name: '区块链' },
  { name: '虚拟货币' },
  { name: '数字货币' },
  { name: '加密货币' },
  { name: '比特币' },
  { name: '以太坊' },
  { name: '空投' },
];

const Settings: React.FC<Props> = ({ tags, handleChangeTags }) => {
  const intl = useIntl();

  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <span className={styles.wrapper}>
      <SettingOutlined onClick={showDrawer} />
      <Drawer
        title={intl.formatMessage({
          id: 'editor.header.settings.title',
        })}
        placement="right"
        onClose={onClose}
        visible={visible}
        width={300}
      >
        <section className={styles.item}>
          <p className={styles.itemTitle}>
            {intl.formatMessage({
              id: 'editor.header.settings.tags',
            })}
          </p>
          <section className={styles.itemContent}>
            <Select
              mode="tags"
              allowClear
              style={{ width: '100%' }}
              value={tags}
              onChange={handleChangeTags}
            >
              {tagsList.map((i) => (
                <Option key={i.name} value={i.name}>
                  {i.name}
                </Option>
              ))}
            </Select>
          </section>
        </section>
      </Drawer>
    </span>
  );
};

export default Settings;
