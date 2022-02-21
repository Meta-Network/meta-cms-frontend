import { useIntl, useModel } from 'umi';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import { Button, Popconfirm, message, List } from 'antd';
import {
  dbPostsDeleteAll,
  dbMetadatasDeleteAll,
  dbPostsDelete,
  dbMetadatasDelete,
  dbPostsDeleteCurrent,
} from '@/db/db';
import { fetchGunDraftsAndUpdateLocal, deleteDraft } from '@/utils/gun';
import styles from './index.less';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  const [deleteDraftLoading, setDeleteDraftLoading] = useState<boolean>(false);
  const [deleteCacheLoading, setDeleteCacheLoading] = useState<boolean>(false);

  /**
   * handle delete all local draft
   */
  const handleDeleteAllLocalDraft = useCallback(async () => {
    if (!initialState?.currentUser) {
      return;
    }

    setDeleteDraftLoading(true);

    // 删除用户的文章
    const gunDraftsResult = await fetchGunDraftsAndUpdateLocal(initialState.currentUser);

    for (let i = 0; i < gunDraftsResult.length; i++) {
      const ele = gunDraftsResult[i];
      console.log('ele', ele);

      if (ele.userId !== initialState.currentUser.id) {
        continue;
      }

      if (ele.id) {
        await dbPostsDelete(ele.id);
        await dbMetadatasDelete(ele.id);
      }
      if (ele.key) {
        await deleteDraft({ userId: initialState.currentUser.id, key: ele.key });
      }
    }

    // 删除当前用户的所有草稿（清理 delete 为 true 的本地草稿）
    await dbPostsDeleteCurrent(initialState.currentUser.id);

    setDeleteDraftLoading(false);

    message.success(
      intl.formatMessage({
        id: 'messages.delete.success',
      }),
    );
  }, [intl, initialState]);

  const clearCache = useCallback(async () => {
    setDeleteCacheLoading(true);
    // 清除 IndexedDB
    // 删除本地所有文章 metadata 数据
    await dbPostsDeleteAll();
    await dbMetadatasDeleteAll();
    // LocalStorage Cookies SessionStorage 因为里面存了一些别的数据，暂时不清理

    setDeleteCacheLoading(false);
    message.success('成功');
  }, []);

  const list = useMemo(
    () => [
      {
        name: 'deleteDraft',
        title: '删除本地草稿',
        description: intl.formatMessage({
          id: 'setting.deleteLocalDraft.all',
        }),
        icon: <DeleteOutlined />,
        actions: [
          <Popconfirm
            key="deleteDraft-confirm"
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
            <Button type="primary" danger key="deleteDraft-delete" loading={deleteDraftLoading}>
              {intl.formatMessage({
                id: 'component.button.delete',
              })}
            </Button>
          </Popconfirm>,
        ],
      },
      {
        name: 'clearCache',
        title: '清空本地缓存',
        description: '清空本地缓存',
        icon: <ExclamationCircleOutlined />,
        actions: [
          <Popconfirm
            key="clearCache-confirm"
            title={'您确定要清空本地缓存吗？'}
            onConfirm={clearCache}
            okText={intl.formatMessage({
              id: 'component.button.yes',
            })}
            cancelText={intl.formatMessage({
              id: 'component.button.no',
            })}
          >
            <Button type="primary" danger key="clearCache-clear" loading={deleteCacheLoading}>
              清空
            </Button>
          </Popconfirm>,
        ],
      },
    ],
    [handleDeleteAllLocalDraft, clearCache, intl, deleteDraftLoading, deleteCacheLoading],
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
