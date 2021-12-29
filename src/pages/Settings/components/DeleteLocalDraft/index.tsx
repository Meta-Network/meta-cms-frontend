import { useIntl, useModel } from 'umi';
import Publish from '@/components/Submit/publish';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import PublishSiteButton from '@/components/menu/PublishSiteButton';
import { Button, Popconfirm, message, List, Dropdown } from 'antd';
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

  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [deleteDraftLoading, setDeleteDraftLoading] = useState<boolean>(false);
  const [deleteCacheLoading, setDeleteCacheLoading] = useState<boolean>(false);

  const publishSiteRequest = PublishSiteButton().func;

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
        name: 'publishSite',
        title: intl.formatMessage({
          id: 'messages.redeployment.button',
        }),
        description: intl.formatMessage({
          id: 'messages.redeployment.description',
        }),
        icon: null,
        actions: [
          <Dropdown
            overlay={
              <Publish
                loading={publishLoading}
                setDropdownVisible={setDropdownVisible}
                handlePublish={(gateway) => {
                  setPublishLoading(true);
                  publishSiteRequest(gateway).then(() => setPublishLoading(false));
                }}
              />
            }
            trigger={['click']}
            placement="topCenter"
            visible={dropdownVisible}
            onVisibleChange={(visible: boolean) => setDropdownVisible(visible)}
          >
            <Button
              key="publish-button"
              loading={publishLoading}
              className={styles.publishButton}
              type="primary"
            >
              {intl.formatMessage({ id: 'messages.redeployment.button' })}
            </Button>
          </Dropdown>,
        ],
      },
      {
        name: 'deleteDraft',
        title: '清空本地缓存',
        description: '清空本地缓存',
        icon: <ExclamationCircleOutlined />,
        actions: [
          <Popconfirm
            title={'您确定要清空本地缓存吗？'}
            onConfirm={clearCache}
            okText={intl.formatMessage({
              id: 'component.button.yes',
            })}
            cancelText={intl.formatMessage({
              id: 'component.button.no',
            })}
          >
            <Button type="primary" danger key="deleteDraft-delete" loading={deleteCacheLoading}>
              清空
            </Button>
          </Popconfirm>,
        ],
      },
    ],
    [
      dropdownVisible,
      handleDeleteAllLocalDraft,
      clearCache,
      intl,
      publishLoading,
      publishSiteRequest,
      deleteDraftLoading,
      deleteCacheLoading,
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
