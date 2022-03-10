import { useIntl, useModel } from 'umi';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import { Button, Popconfirm, message, List } from 'antd';
import {
  dbPostsDeleteAll,
  dbMetadatasDeleteAll,
  dbMetadatasDelete,
  dbPostsDeleteCurrent,
  dbPostsAll,
} from '@/db/db';
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

    // 删除当前用户的文章
    const draftsResult = (await dbPostsAll(initialState.currentUser.id)) || [];

    // 删除当前用户文章的 metadata 数据
    for (let i = 0; i < draftsResult.length; i++) {
      const ele = draftsResult[i];

      if (ele.id) {
        await dbMetadatasDelete(ele.id);
      }
    }

    // 删除当前用户的所有草稿数据
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

    message.success(
      intl.formatMessage({
        id: 'messages.success',
      }),
    );
  }, [intl]);

  const list = useMemo(
    () => [
      {
        name: 'deleteDraft',
        title: intl.formatMessage({
          id: 'setting.deleteLocalDraft.title',
        }),
        description: intl.formatMessage({
          id: 'setting.deleteLocalDraft.description',
        }),
        icon: <DeleteOutlined />,
        actions: [
          <Popconfirm
            key="deleteDraft-confirm"
            title={intl.formatMessage({
              id: 'setting.deleteLocalDraft.popconfirmTitle',
            })}
            onConfirm={handleDeleteAllLocalDraft}
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
        title: intl.formatMessage({
          id: 'setting.deleteLocalCache.title',
        }),
        description: intl.formatMessage({
          id: 'setting.deleteLocalCache.description',
        }),
        icon: <ExclamationCircleOutlined />,
        actions: [
          <Popconfirm
            key="clearCache-confirm"
            title={intl.formatMessage({
              id: 'setting.deleteLocalCache.popconfirmTitle',
            })}
            onConfirm={clearCache}
          >
            <Button type="primary" danger key="clearCache-clear" loading={deleteCacheLoading}>
              {intl.formatMessage({
                id: 'component.button.delete',
              })}
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
