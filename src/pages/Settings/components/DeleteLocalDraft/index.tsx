import { useCallback, useMemo, useState } from 'react';
import { useIntl, useModel } from 'umi';
import { Typography, Button, Popconfirm, message, Space, Input, List, Dropdown } from 'antd';
import { DeleteOutlined, CloudSyncOutlined } from '@ant-design/icons';
import { dbPostsDeleteAll, dbMetadatasDeleteAll } from '@/db/db';
import {
  fetchGunDraftsAndUpdateLocal,
  deleteDraft,
  twoWaySyncDrafts,
  generateSeedAndPair,
  getSeedAndPair,
  saveSeedAndPair,
} from '@/utils/gun';
import styles from './index.less';
import type { KeyPair } from '@metaio/meta-signature-util';
import { generateKeys } from '@metaio/meta-signature-util';
import { useMount } from 'ahooks';

const { Text } = Typography;

interface ImportSeedAndPairComponentsState {
  getSeedAndPairFn: () => void;
}

const ImportSeedAndPairComponents: React.FC<ImportSeedAndPairComponentsState> = ({
  getSeedAndPairFn,
}) => {
  const [seedAndPairInput, setSeedAndPairInput] = useState('');
  // handle import
  const handleImport = useCallback(() => {
    saveSeedAndPair(seedAndPairInput);
    getSeedAndPairFn();

    message.success('导入成功');
  }, [seedAndPairInput, getSeedAndPairFn]);
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
  const [syncDraftsLoading, setSyncDraftsLoading] = useState<boolean>(false);
  const [seedAndPair, setSeedAndPair] = useState<string>('');

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
  const getSeedAndPairFn = useCallback(() => {
    const result = getSeedAndPair();
    setSeedAndPair(result);
  }, []);

  // sync seed public key
  const seedPublicKey = useMemo(() => {
    const _seedAndPair = JSON.parse(seedAndPair || '[]');
    if (!_seedAndPair.length) {
      return '';
    }
    const seed = JSON.parse(_seedAndPair[0] || '[]');
    const keys: KeyPair = generateKeys(seed);
    return keys.public;
  }, [seedAndPair]);

  // generate seed pair fn
  const generateSeedAndPairFn = useCallback(async () => {
    await generateSeedAndPair();
    getSeedAndPairFn();
    message.success('生成成功');
  }, [getSeedAndPairFn]);

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
          <Dropdown
            overlay={<ImportSeedAndPairComponents getSeedAndPairFn={getSeedAndPairFn} />}
            trigger={['click']}
          >
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
          <Popconfirm
            title={'您确定要重新生成 Seed & Pair 吗？'}
            onConfirm={generateSeedAndPairFn}
            okText={intl.formatMessage({
              id: 'component.button.yes',
            })}
            cancelText={intl.formatMessage({
              id: 'component.button.no',
            })}
          >
            <Button key="syncDraft-sync">重新生成</Button>
          </Popconfirm>,
        ],
      },
    ],
    [
      handleDeleteAllLocalDraft,
      twoWaySyncDraftsFn,
      generateSeedAndPairFn,
      intl,
      seedAndPair,
      seedPublicKey,
      syncDraftsLoading,
    ],
  );

  useMount(() => {
    getSeedAndPairFn();
  });

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
