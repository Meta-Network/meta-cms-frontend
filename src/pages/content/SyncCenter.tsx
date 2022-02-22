import {
  ignorePendingPost,
  fetchPostSync,
  getSourceStatus,
  decryptMatatakiPost,
} from '@/services/api/meta-cms';
import { useIntl, useModel, history } from 'umi';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Space, Tag, message, Typography, Popconfirm } from 'antd';
import { useState, useCallback, useRef } from 'react';
import syncPostsRequest from '../../utils/sync-posts-request';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { dbPostsAdd, dbPostsWhereExistByTitle, PostTempData } from '@/db/db';
import { assign, cloneDeep } from 'lodash';
import { imageUploadByUrlAPI } from '@/helpers';
import { fetchIpfs } from '@/services/api/global';
import { OSS_MATATAKI, OSS_MATATAKI_FEUSE } from '../../../config';
import PostsCover from '@/components/PostsCover';
import PostsDate from '@/components/PostsDate';

const { Link } = Typography;

type PostInfo = CMS.ExistsPostsResponse['items'][number];

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [editCurrentId, setEditCurrentId] = useState<number>(0);
  const [deleteCurrentId, setDeleteEditCurrentId] = useState<number>(0);

  const actionRef = useRef<ActionType>();

  // handle delete
  const ignoreSinglePost = async (record: PostInfo) => {
    setDeleteEditCurrentId(record.id);
    const done = message.loading(intl.formatMessage({ id: 'messages.syncCenter.discardPost' }), 0);
    const ignorePostResult = await ignorePendingPost(record.id);

    setDeleteEditCurrentId(0);
    done();

    if (ignorePostResult.statusCode === 201) {
      message.success(intl.formatMessage({ id: 'messages.syncCenter.discardPostSuccess' }));
      if (actionRef.current?.reset) {
        await actionRef.current?.reset();
      }
    } else {
      message.error('移除此文章失败');
    }
  };

  // transfer draft
  const handleEditPost = useCallback(
    async (post: CMS.Post) => {
      if (!initialState?.currentUser?.id) {
        return;
      }

      // 1. 检查草稿标题是否同名
      // - 同名 标题增加一个后缀(时间戳)，获取内容保存到草稿
      // - 不同名 获取内容保存到草稿
      // 2. 获取封面
      // 3. 获取内容

      setEditCurrentId(post.id);

      const isExist = await dbPostsWhereExistByTitle({
        title: post.title,
        userId: initialState.currentUser.id,
      });
      // console.log('isExist', isExist);

      const _post = cloneDeep(post);

      // image transfer IPFS
      if (_post.cover && !_post.cover.includes(FLEEK_NAME)) {
        const done = message.loading('封面转存中', 0);

        const result = await imageUploadByUrlAPI(
          _post.cover.replace(OSS_MATATAKI_FEUSE, OSS_MATATAKI),
        );

        done();
        if (result) {
          message.success(intl.formatMessage({ id: 'messages.syncCenter.coverSavedSuccess' }));
          _post.cover = result.publicUrl;
        } else {
          message.error('封面转存失败');
        }
      }

      try {
        const done = message.loading('获取内容中', 0);

        let postResult = await fetchIpfs(_post.source);
        if (!postResult.content && postResult.iv && postResult.encryptedData) {
          postResult = await decryptMatatakiPost(postResult.iv, postResult.encryptedData);
        }

        done();

        if (postResult.content) {
          message.success(intl.formatMessage({ id: 'messages.syncCenter.getContentSuccess' }));
        } else {
          message.error(intl.formatMessage({ id: 'messages.syncCenter.getContentFail' }));
          return;
        }

        // send local
        const resultID = await dbPostsAdd(
          assign(PostTempData(), {
            cover: _post.cover,
            title: isExist ? `${_post.title} ${Date.now()}` : _post.title,
            summary: _post.summary || '',
            content: postResult.content,
            tags: _post.tags || [],
            license: '',
            sourceData: _post,
            userId: initialState.currentUser.id,
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
    [intl, initialState?.currentUser],
  );

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
            onClick={() => handleEditPost(record)}
            loading={editCurrentId === record.id}
            disabled={editCurrentId !== 0 && editCurrentId !== record.id}
          >
            {intl.formatMessage({ id: 'component.button.edit' })}
          </Button>

          <Popconfirm
            placement="top"
            title={'您确定要删除此文章吗？'}
            onConfirm={() => ignoreSinglePost(record)}
          >
            <Button
              key="option-discard"
              danger
              loading={deleteCurrentId === record.id}
              disabled={deleteCurrentId !== 0 && deleteCurrentId !== record.id}
            >
              {intl.formatMessage({ id: 'component.button.discard' })}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // handle sync
  const handleSync = useCallback(async () => {
    setSyncLoading(true);
    const done = message.loading(intl.formatMessage({ id: 'messages.source.syncing' }), 0);

    const sourceStatusResult = await getSourceStatus();
    if (sourceStatusResult.statusCode === 200) {
      //
    } else {
      done();
      setSyncLoading(false);
      message.success(intl.formatMessage({ id: 'messages.source.syncFailed' }));
      return;
    }

    // TODO: api http code 400
    await syncPostsRequest(sourceStatusResult.data);
    done();
    setSyncLoading(false);
    message.success(intl.formatMessage({ id: 'messages.source.syncSuccess' }));

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
        request={async ({ pageSize, current }) => {
          const params = {
            page: current ?? 1,
            limit: pageSize ?? 10,
            state: 'pending' as CMS.PostState,
          };
          const result = await fetchPostSync(params);
          if (result.statusCode === 200) {
            return {
              data: result.data.items,
              success: true,
              total: result.data.meta.totalItems,
            };
          } else {
            return { success: false };
          }
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
          <Button key="sync-button" loading={syncLoading} onClick={() => handleSync()}>
            {intl.formatMessage({ id: 'component.button.syncNow' })}
          </Button>,
        ]}
      />
    </PageContainer>
  );
};
