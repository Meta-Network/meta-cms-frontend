import { useCallback, useMemo, useState } from 'react';
import { useIntl, useModel } from 'umi';
import { Typography, Button, Popconfirm, message, Space, Input, List, Dropdown } from 'antd';
import { DeleteOutlined, CloudSyncOutlined } from '@ant-design/icons';
import { dbPostsDeleteAll, dbMetadatasDeleteAll } from '@/db/db';
import { fetchGunDraftsAndUpdateLocal, deleteDraft, twoWaySyncDrafts } from '@/utils/gun';
import { storeGet, storeSet } from '@/utils/store';
import { KEY_META_CMS_GUN_SEED, KEY_META_CMS_GUN_PAIR } from '../../../../../config';
import styles from './index.less';
import type { KeyPair } from '@metaio/meta-signature-util';
import { generateKeys } from '@metaio/meta-signature-util';

const { Text } = Typography;

const ImportSeedAndPairComponents = () => {
  const [seedAndPairInput, setSeedAndPairInput] = useState('');
  // handle import
  const handleImport = useCallback(() => {
    if (!seedAndPairInput) {
      return;
    }

    const [seed, pair] = JSON.parse(seedAndPairInput);
    storeSet(KEY_META_CMS_GUN_SEED, seed);
    storeSet(KEY_META_CMS_GUN_PAIR, pair);

    message.success('导入成功');
  }, [seedAndPairInput]);
  return (
    <Space>
      <Input onChange={(e) => setSeedAndPairInput(e.target.value)} value={seedAndPairInput} />
      <Button onClick={handleImport}>确定</Button>
    </Space>
  );
};

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [syncDraftsLoading, setSyncDraftsLoading] = useState(false);

  /**
   * handle delete all local draft
   */
  const handleDeleteAllLocalDraft = useCallback(async () => {
    if (!initialState?.currentUser) {
      return;
    }

    // 删除本地所有文章 mettadata 数据
    await dbPostsDeleteAll();
    await dbMetadatasDeleteAll();

    // 删除用户的 gun 文章
    const gunDraftsResult = await fetchGunDraftsAndUpdateLocal(initialState.currentUser);

    for (let i = 0; i < gunDraftsResult.length; i++) {
      const ele = gunDraftsResult[i];
      if (ele.key) {
        await deleteDraft({ userId: initialState.currentUser.id, key: ele.key });
      }
    }

    message.success(
      intl.formatMessage({
        id: 'messages.delete.success',
      }),
    );
  }, [intl, initialState]);

  // two way sync drafts
  const twoWaySyncDraftsFn = useCallback(async () => {
    if (!initialState?.currentUser) {
      return;
    }

    setSyncDraftsLoading(true);
    await twoWaySyncDrafts(initialState.currentUser);
    setSyncDraftsLoading(false);
  }, [initialState]);

  // sync seed and pair
  const seedAndPair = useMemo(() => {
    // TODO: 复制出来的格式并不好看，可以考虑加密成一串字符然后导入再解密 待考虑
    const seed = storeGet(KEY_META_CMS_GUN_SEED);
    const pair = storeGet(KEY_META_CMS_GUN_PAIR);
    return JSON.stringify([seed, pair]);
  }, []);

  // sync seed public key
  const seedPublicKey = useMemo(() => {
    const seed = JSON.parse(storeGet(KEY_META_CMS_GUN_SEED) || '[]');
    if (!seed.length) {
      return '';
    }
    const keys: KeyPair = generateKeys(seed);
    return keys.public;
  }, []);

  const list = useMemo(
    () => [
      {
        name: 'deleteDraft',
        title: '删除本地草稿',
        description: '删除本地所有草稿，包含本地其他用户的草稿。',
        icon: <DeleteOutlined />,
        actions: [
          <Popconfirm
            title={intl.formatMessage({
              id: 'setting.deleteLocalDraft.all.tip',
            })}
            onConfirm={handleDeleteAllLocalDraft}
            okText={intl.formatMessage({
              id: 'component.button.yes',
            })}
            cancelText={intl.formatMessage({
              id: 'component.button.no',
            })}
          >
            <Button type="primary" danger key="deleteDraft-delete">
              {intl.formatMessage({
                id: 'component.button.delete',
              })}
            </Button>
          </Popconfirm>,
        ],
      },
      {
        name: 'syncDraft',
        title: '草稿同步',
        description: '可以复制 Seed & Pair 到其他需要同步的设备使用。',
        icon: <CloudSyncOutlined />,
        actions: [
          <Text key="syncDraft-copy" copyable={{ text: seedAndPair }}>
            {seedPublicKey.slice(0, 6)}****{seedPublicKey.slice(-4)}
          </Text>,
          <Dropdown overlay={<ImportSeedAndPairComponents />} trigger={['click']}>
            <Button key="syncDraft-import">导入</Button>
          </Dropdown>,
          <Popconfirm
            title={'您确定要双向同步草稿内容吗？'}
            onConfirm={twoWaySyncDraftsFn}
            okButtonProps={{
              loading: syncDraftsLoading,
            }}
            okText={intl.formatMessage({
              id: 'component.button.yes',
            })}
            cancelText={intl.formatMessage({
              id: 'component.button.no',
            })}
          >
            <Button key="syncDraft-sync" loading={syncDraftsLoading}>
              同步
            </Button>
          </Popconfirm>,
        ],
      },
    ],
    [
      handleDeleteAllLocalDraft,
      twoWaySyncDraftsFn,
      intl,
      seedAndPair,
      seedPublicKey,
      syncDraftsLoading,
    ],
  );

  return (
    <List
      className={styles.list}
      split={false}
      itemLayout="horizontal"
      dataSource={list}
      renderItem={(item) => (
        <List.Item actions={item.actions}>
          <List.Item.Meta avatar={item.icon} title={item.title} description={item.description} />
        </List.Item>
      )}
    />
  );
};
