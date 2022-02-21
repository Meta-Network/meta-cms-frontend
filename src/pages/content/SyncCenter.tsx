import {
  ignorePendingPost,
  getDefaultSiteConfig,
  fetchPostSync,
  getSourceStatus,
  publishPosts,
  decryptMatatakiPost,
} from '@/services/api/meta-cms';
import { useIntl, useModel, history } from 'umi';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Space, Tag, message, Modal, notification, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useState, useCallback, useRef } from 'react';
import syncPostsRequest from '../../utils/sync-posts-request';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { dbPostsAdd, dbPostsWhereByID, dbPostsWhereExist, PostTempData } from '@/db/db';
import { assign, cloneDeep } from 'lodash';
import { imageUploadByUrlAPI } from '@/helpers';
import { fetchIpfs } from '@/services/api/global';
import { OSS_MATATAKI, OSS_MATATAKI_FEUSE } from '../../../config';
import { useMount } from 'ahooks';
import { queryCurrentUser } from '@/services/api/meta-ucenter';
import PostsCover from '@/components/PostsCover';
import PostsDate from '@/components/PostsDate';

const { confirm } = Modal;
const { Link } = Typography;

type PostInfo = CMS.ExistsPostsResponse['items'][number];

export default () => {
  const intl = useIntl();
  const [siteConfigId, setSiteConfigId] = useState<number | null>(null);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [editCurrentId, setEditCurrentId] = useState<number>(0);
  const { getLockedConfigState, setLockedConfig } = useModel('global');
  const [currentUser, setCurrentUser] = useState<GLOBAL.CurrentUser | undefined>();

  getDefaultSiteConfig().then((response) => {
    if (response.data) {
      setSiteConfigId(response.data.id);
    }
  });

  const actionRef = useRef<ActionType>();

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
    if (actionRef.current?.reset) {
      await actionRef.current?.reset();
    }
  };

  // handle delete
  const ignoreSinglePost = async (record: PostInfo) => {
    const done = message.loading(intl.formatMessage({ id: 'messages.syncCenter.discardPost' }), 0);
    await ignorePendingPost(record.id);
    done();
    message.success(intl.formatMessage({ id: 'messages.syncCenter.discardPostSuccess' }));
    if (actionRef.current?.reset) {
      await actionRef.current?.reset();
    }
  };

  // transfer draft
  const transferDraft = useCallback(
    async (post: CMS.Post) => {
      if (!currentUser?.id) {
        return;
      }

      setEditCurrentId(post.id);

      // check save as draft
      const isExist = await dbPostsWhereExist(post.id);
      if (isExist) {
        setEditCurrentId(0);

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
        let postResult = await fetchIpfs(_post.source);
        if (!postResult.content && postResult.iv && postResult.encryptedData) {
          postResult = await decryptMatatakiPost(postResult.iv, postResult.encryptedData);
        }

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
        setEditCurrentId(0);
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
      title: intl.formatMessage({ id: 'posts.table.cover' }),
      width: 130,
      render: (_, record) => (
        <PostsCover src={record.cover.replace(OSS_MATATAKI_FEUSE, OSS_MATATAKI)} />
      ),
    },
    {
      dataIndex: 'title',
      title: intl.formatMessage({ id: 'posts.table.title' }),
      ellipsis: true,
    },
    {
      dataIndex: 'platform',
      title: intl.formatMessage({ id: 'messages.syncCenter.table.platform' }),
      width: 100,
      render: (_, record) => (
        <>
          {record.platform && (
            <Tag color="blue" key={`source-platform-${record.id}`}>
              {record.platform}
            </Tag>
          )}
        </>
      ),
    },
    {
      dataIndex: 'createdAt',
      title: intl.formatMessage({ id: 'messages.syncCenter.table.createTime' }),
      render: (_, record) => <PostsDate time={record.createdAt} />,
    },
    {
      dataIndex: 'updatedAt',
      title: intl.formatMessage({ id: 'messages.syncCenter.table.updateTime' }),
      render: (_, record) => <PostsDate time={record.updatedAt} />,
    },
    {
      dataIndex: 'action',
      title: intl.formatMessage({ id: 'messages.syncCenter.table.actions' }),
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            ghost
            key="option-edit"
            type="primary"
            onClick={() => transferDraft(record)}
            loading={editCurrentId === record.id}
            disabled={editCurrentId !== 0 && editCurrentId !== record.id}
          >
            {intl.formatMessage({ id: 'component.button.edit' })}
          </Button>
          <Button
            key="option-discard"
            onClick={() => ignoreSinglePost(record)}
            // loading={postsLoadings[index] === LoadingStates.Discarding}
            // disabled={postsLoadings[index] === LoadingStates.Publishing}
            danger
          >
            {intl.formatMessage({ id: 'component.button.discard' })}
          </Button>
        </Space>
      ),
    },
  ];

  // handle sync
  const handleSync = useCallback(async () => {
    setSyncLoading(true);
    const done = message.loading(intl.formatMessage({ id: 'messages.source.syncing' }), 0);
    await syncPostsRequest((await getSourceStatus()).data);
    done();
    message.success(intl.formatMessage({ id: 'messages.source.syncSuccess' }));
    setSyncLoading(false);
    if (actionRef.current?.reset) {
      actionRef.current.reset();
    }
  }, [intl]);

  return (
    <PageContainer
      className="custom-container"
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.syncCenter.title' })}
      content={
        <p>
          {intl.formatMessage({ id: 'messages.syncCenter.description' })}{' '}
          <Link underline href={META_WIKI} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({ id: 'posts.intro.learnMore' })}
          </Link>
        </p>
      }
    >
      <ProTable<PostInfo>
        columns={columns}
        actionRef={actionRef}
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
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
        search={false}
        options={false}
        size="middle"
        toolBarRender={() => [
          <Button key="sync-button" loading={syncLoading} onClick={() => handleSync}>
            {intl.formatMessage({ id: 'component.button.syncNow' })}
          </Button>,
        ]}
      />
    </PageContainer>
  );
};
