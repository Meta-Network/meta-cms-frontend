/* eslint-disable no-underscore-dangle */
import {
  ignorePendingPost,
  getDefaultSiteConfig,
  fetchPostSync,
  getSourceStatus,
  publishPosts,
} from '@/services/api/meta-cms';
import { useIntl, useModel, history } from 'umi';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { Image, Button, Space, Tag, message, Modal, notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useState, useCallback, useRef } from 'react';
import syncPostsRequest from '../../utils/sync-posts-request';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { dbPostsAdd, dbPostsWhereByID, dbPostsWhereExist, PostTempData } from '@/db/db';
import { assign, cloneDeep } from 'lodash';
import { imageUploadByUrlAPI } from '@/helpers';
import styles from './SyncCenter.less';
import { fetchIpfs } from '@/services/api/global';
import { OSS_MATATAKI, OSS_MATATAKI_FEUSE } from '../../../config';
import { useMount } from 'ahooks';
import { queryCurrentUser } from '@/services/api/meta-ucenter';

const { confirm } = Modal;

type PostInfo = CMS.ExistsPostsResponse['items'][number];

export default () => {
  const intl = useIntl();
  const [siteConfigId, setSiteConfigId] = useState<number | null>(null);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  // transfer draft loading
  const [transferDraftLoading, setTransferDraftLoading] = useState<boolean>(false);
  const { getLockedConfigState, setLockedConfig } = useModel('global');
  const { setSiteNeedToDeploy } = useModel('storage');
  const [currentUser, setCurrentUser] = useState<GLOBAL.CurrentUser | undefined>();

  getDefaultSiteConfig().then((response) => {
    if (response.statusCode === 200) {
      setSiteConfigId(response.data.id);
    }
  });

  const ref = useRef<ActionType>();

  const publishMultiplePosts = async (selectedKeys: number[]) => {
    if (siteConfigId === null) {
      notification.error({
        message: intl.formatMessage({ id: 'messages.syncCenter.noSiteConfig.title' }),
        description: intl.formatMessage({ id: 'messages.syncCenter.noSiteConfig.description' }),
      });
      return;
    }
    if (getLockedConfigState(siteConfigId)) {
      notification.error({
        message: intl.formatMessage({ id: 'messages.syncCenter.taskInProgress.title' }),
        description: intl.formatMessage({ id: 'messages.syncCenter.taskInProgress.description' }),
      });
      return;
    }
    setLockedConfig(siteConfigId, true);
    const done = message.loading(
      intl.formatMessage({ id: 'messages.syncCenter.publishMultiPosts' }),
      0,
    );
    await publishPosts(selectedKeys, [siteConfigId]);
    setLockedConfig(siteConfigId, false);
    done();
    message.success(intl.formatMessage({ id: 'messages.syncCenter.publishMultiPostsSuccess' }));
    setSiteNeedToDeploy(true);
    if (ref.current?.reset) {
      await ref.current?.reset();
    }
  };

  const ignoreSinglePost = async (record: PostInfo) => {
    const done = message.loading(intl.formatMessage({ id: 'messages.syncCenter.discardPost' }), 0);
    await ignorePendingPost(record.id);
    done();
    message.success(intl.formatMessage({ id: 'messages.syncCenter.discardPostSuccess' }));
    if (ref.current?.reset) {
      await ref.current?.reset();
    }
  };

  /**
   * transfer draft
   */
  const transferDraft = useCallback(
    async (post: CMS.Post) => {
      if (!currentUser?.id) {
        return;
      }

      setTransferDraftLoading(true);

      // check save as draft
      const isExist = await dbPostsWhereExist(post.id);
      if (isExist) {
        setTransferDraftLoading(false);

        const currentDraft = await dbPostsWhereByID(post.id);
        const _url = currentDraft
          ? `/content/drafts/edit?id=${currentDraft.id}`
          : '/content/drafts';
        confirm({
          icon: <ExclamationCircleOutlined />,
          content: intl.formatMessage({ id: 'messages.syncCenter.draftSavedTips' }),
          async onOk() {
            history.push(_url);
          },
          onCancel() {},
        });
        return;
      }

      const _post = cloneDeep(post);

      // image transfer ipfs
      if (_post.cover && !_post.cover.includes(FLEEK_NAME)) {
        const result = await imageUploadByUrlAPI(
          _post.cover.replace(OSS_MATATAKI_FEUSE, OSS_MATATAKI),
        );
        if (result) {
          message.success(intl.formatMessage({ id: 'messages.syncCenter.coverSavedSuccess' }));
          _post.cover = result.publicUrl;
        }
      }

      try {
        const postResult: { content: string } = await fetchIpfs(_post.source);
        if (!postResult.content) {
          message.success(intl.formatMessage({ id: 'messages.syncCenter.getContentFail' }));
          return;
        }

        // send local
        const resultID = await dbPostsAdd(
          assign(PostTempData(), {
            cover: _post.cover,
            title: _post.title,
            summary: _post.summary || '',
            content: postResult.content,
            post: _post,
            tags: _post.tags || [],
            license: '',
            userId: currentUser?.id,
          }),
        );

        history.push(`/content/drafts/edit?id=${resultID}`);
      } catch (e) {
        console.error(e);
        message.success(intl.formatMessage({ id: 'messages.syncCenter.savedFail' }));
      } finally {
        setTransferDraftLoading(false);
      }
    },
    [intl, currentUser],
  );

  /** fetch current user */
  const fetchCurrentUser = useCallback(async () => {
    const result = await queryCurrentUser();
    if (result.statusCode === 200) {
      setCurrentUser(result.data);
    }
  }, []);

  useMount(() => {
    fetchCurrentUser();
  });

  const columns: ProColumns<PostInfo>[] = [
    {
      dataIndex: 'cover',
      title: intl.formatMessage({ id: 'messages.syncCenter.table.cover' }),
      search: false,
      render: (_, record) => (
        <Space>
          {record.cover ? (
            <Image width={100} src={record.cover.replace(OSS_MATATAKI_FEUSE, OSS_MATATAKI)} />
          ) : (
            intl.formatMessage({ id: 'messages.table.noCoverExists' })
          )}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'messages.syncCenter.table.title' }),
      dataIndex: 'title',
      width: 200,
      copyable: true,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'messages.syncCenter.table.platform' }),
      dataIndex: 'platform',
      width: 100,
      filters: true,
      onFilter: true,
      render: (_, record) => (
        <Space>
          {record.platform && (
            <Tag color="blue" key={`source-platform-${record.id}`}>
              {record.platform}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'messages.syncCenter.table.createTime' }),
      key: 'showTime',
      dataIndex: 'createdAt',
      valueType: 'date',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'messages.syncCenter.table.createTime' }),
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: intl.formatMessage({ id: 'messages.syncCenter.table.updateTime' }),
      key: 'showTime',
      dataIndex: 'updatedAt',
      valueType: 'date',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'messages.syncCenter.table.updateTime' }),
      dataIndex: 'updatedAt',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: intl.formatMessage({ id: 'messages.syncCenter.table.actions' }),
      key: 'option',
      width: 290,
      valueType: 'option',
      render: (_, record) => [
        <Button
          onClick={() => transferDraft(record)}
          loading={transferDraftLoading}
          ghost
          type="primary"
        >
          {intl.formatMessage({ id: 'component.button.edit' })}
        </Button>,
        <Button
          key="option-ignore"
          onClick={() => ignoreSinglePost(record)}
          // loading={postsLoadings[index] === LoadingStates.Discarding}
          // disabled={postsLoadings[index] === LoadingStates.Publishing}
          danger
        >
          {intl.formatMessage({ id: 'component.button.discard' })}
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.syncCenter.title' })}
      content={[
        <div key="header-description" style={{ paddingTop: '11px', marginBottom: '4px' }}>
          <p>{intl.formatMessage({ id: 'messages.syncCenter.description' })}</p>
        </div>,
        <div key="header-actions" className={styles.syncButtons}>
          <Button
            key="sync-button"
            loading={syncLoading}
            onClick={async () => {
              setSyncLoading(true);
              const done = message.loading(
                intl.formatMessage({ id: 'messages.source.syncing' }),
                0,
              );
              await syncPostsRequest((await getSourceStatus()).data);
              done();
              message.success(intl.formatMessage({ id: 'messages.source.syncSuccess' }));
              setSyncLoading(false);
              if (ref.current?.reset) {
                ref.current.reset();
              }
            }}
            style={{ marginRight: 10 }}
          >
            {intl.formatMessage({ id: 'component.button.syncNow' })}
          </Button>
        </div>,
      ]}
    >
      <ProTable<PostInfo>
        actionRef={ref}
        columns={columns}
        rowSelection={{}}
        tableAlertOptionRender={({ selectedRowKeys }) => {
          return (
            <Space size={16}>
              <Button onClick={() => publishMultiplePosts(selectedRowKeys as number[])}>
                {intl.formatMessage({ id: 'messages.syncCenter.button.publishMultiPosts' })}
              </Button>
              <Button danger>
                {intl.formatMessage({ id: 'messages.syncCenter.button.discardMultiPosts' })}
              </Button>
            </Space>
          );
        }}
        request={async ({ pageSize, current }) => {
          // TODO: 分页
          const params = {
            page: current ?? 1,
            limit: pageSize ?? 10,
            state: 'pending' as CMS.PostState,
          };
          const request = await fetchPostSync(params);
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          return {
            data: request.data.items,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: true,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: request.data.meta.totalItems,
          };
        }}
        rowKey={(record) => record.id}
        search={{
          labelWidth: 'auto',
        }}
        form={{
          // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
          syncToUrl: (values, type) => {
            if (type === 'get') {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        dateFormatter="string"
        options={false}
      />
    </PageContainer>
  );
};
