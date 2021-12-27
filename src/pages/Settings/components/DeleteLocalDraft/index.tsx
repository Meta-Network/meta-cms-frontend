import { useIntl, useModel } from 'umi';
import Publish from '@/components/Submit/publish';
import { DeleteOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import PublishSiteButton from '@/components/menu/PublishSiteButton';
import { Button, Popconfirm, message, List, Dropdown } from 'antd';
import { dbPostsDeleteAll, dbMetadatasDeleteAll } from '@/db/db';
import { fetchGunDraftsAndUpdateLocal, deleteDraft } from '@/utils/gun';
import styles from './index.less';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const publishSiteRequest = PublishSiteButton().func;

  /**
   * handle delete all local draft
   */
  const handleDeleteAllLocalDraft = useCallback(async () => {
    if (!initialState?.currentUser) {
      return;
    }

    // 删除本地所有文章 metadata 数据
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
    ],
    [dropdownVisible, handleDeleteAllLocalDraft, intl, publishLoading, publishSiteRequest],
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
