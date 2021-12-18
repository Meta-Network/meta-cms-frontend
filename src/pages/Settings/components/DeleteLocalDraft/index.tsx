import { useCallback, useMemo, useState } from 'react';
import { useIntl, useModel } from 'umi';
import { Typography, Button, Popconfirm, message, Space, Input, List } from 'antd';
import { dbPostsDeleteAll, dbMetadatasDeleteAll } from '@/db/db';
import { twoWaySync, deleteDraft } from '@/utils/gun';
import { storeGet, storeSet } from '@/utils/store';
import { KEY_META_CMS_GUN_SEED, KEY_META_CMS_GUN_PAIR } from '../../../../../config';

const { Text } = Typography;

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [seedAndPairInput, setSeedAndPairInput] = useState('');

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
    const gunDraftsResult = await twoWaySync(initialState.currentUser);

    for (let i = 0; i < gunDraftsResult.length; i++) {
      const ele = gunDraftsResult[i];
      if (ele.key) {
        deleteDraft({ userId: initialState.currentUser.id, key: ele.key });
      }
    }

    message.success(
      intl.formatMessage({
        id: 'messages.delete.success',
      }),
    );
  }, [intl, initialState]);

  // handle import
  const handleImport = useCallback(() => {
    const [seed, pair] = JSON.parse(seedAndPairInput);
    storeSet(KEY_META_CMS_GUN_SEED, seed);
    storeSet(KEY_META_CMS_GUN_PAIR, pair);

    message.success('导入成功');
  }, [seedAndPairInput]);

  const seedAndPair = useMemo(() => {
    const seed = storeGet(KEY_META_CMS_GUN_SEED);
    const pair = storeGet(KEY_META_CMS_GUN_PAIR);
    return JSON.stringify([seed, pair]);
  }, []);

  return (
    <List split={false}>
      <List.Item>
        <Space>
          <Text type="danger">
            {intl.formatMessage({
              id: 'setting.deleteLocalDraft.all',
            })}
          </Text>
          <Popconfirm
            title={intl.formatMessage({
              id: 'setting.deleteLocalDraft.all.tip',
            })}
            onConfirm={handleDeleteAllLocalDraft}
            // onCancel={}
            okText={intl.formatMessage({
              id: 'component.button.yes',
            })}
            cancelText={intl.formatMessage({
              id: 'component.button.no',
            })}
          >
            <Button type="primary" danger>
              {intl.formatMessage({
                id: 'component.button.delete',
              })}
            </Button>
          </Popconfirm>
        </Space>
      </List.Item>
      <List.Item>
        <Space>
          <Text copyable={{ text: seedAndPair }}>草稿同步 Seed & Pair</Text>
          <Input onChange={(e) => setSeedAndPairInput(e.target.value)} value={seedAndPairInput} />
          <Button onClick={handleImport}>导入</Button>
        </Space>
      </List.Item>
    </List>
  );
};
