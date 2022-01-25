import { useCallback, useEffect, useRef } from 'react';
import { history, useIntl, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Space, Popconfirm, message, Typography } from 'antd';
import { dbPostsUpdate, dbMetadatasUpdateByPostId, dbDraftsAllCount } from '@/db/db';
import { fetchGunDraftsAndUpdateLocal, deleteDraft } from '@/utils/gun';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import PostsCover from '@/components/PostsCover';
import PostsDate from '@/components/PostsDate';
import PostsStorage from '@/components/PostsStorage';

const { Link } = Typography;

export default () => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const { initialState, setInitialState } = useModel('@@initialState');

  /** handle delete */
  const handleDelete = useCallback(
    async (id: number, key?: string) => {
      await dbPostsUpdate(id, { delete: true });
      await dbMetadatasUpdateByPostId(id, { delete: true });

      if (key) {
        deleteDraft({
          userId: initialState!.currentUser!.id,
          key: key,
        });
      }

      message.success(
        intl.formatMessage({
          id: 'posts.table.action.delete.success',
        }),
      );
    },
    [intl, initialState],
  );

  /** fetch posts list */
  const fetchPosts = useCallback(async () => {
    if (initialState?.currentUser) {
      // 获取草稿
      const response = await fetchGunDraftsAndUpdateLocal(initialState.currentUser);

      // 获取草稿状态
      // const allHasStateIds = response.filter((i) => i?.post && i.post.stateId);
      // const allStateIds = allHasStateIds.map((i) => i.post!.stateId) as number[];
      // if (allStateIds.length) {
      //   const allStates = await fetchPostsStorageState({ stateIds: allStateIds });
      //   const allStatesMap = new Map();

      //   if (allStates.statusCode === 200) {
      //     allStates.data.map((i) => {
      //       allStatesMap.set(i.id, i);
      //     });
      //   }

      //   response.forEach((i) => {
      //     if (allStatesMap.get(i?.post?.stateId)) {
      //       i.post!.stateIdData = allStatesMap.get(i.post!.stateId);
      //     }
      //   });
      // }

      // 过滤 排序
      const responseSort = response
        .filter((item) => {
          return item.post == null;
        })
        .sort((a, b) => Number(moment(a.updatedAt).isBefore(b.updatedAt)));

      return responseSort;
    } else {
      return [];
    }
  }, [initialState]);

  const columns: ProColumns<GunType.GunDraft>[] = [
    {
      dataIndex: 'cover',
      title: intl.formatMessage({
        id: 'posts.drafts.table.cover',
      }),
      render: (_, record) => <PostsCover src={record.cover} />,
    },
    {
      dataIndex: 'title',
      title: intl.formatMessage({ id: 'posts.drafts.table.title' }),
      ellipsis: true,
    },
    {
      dataIndex: 'createdAt',
      title: intl.formatMessage({
        id: 'posts.drafts.table.createdAt',
      }),
      render: (_, record) => <PostsDate time={record.createdAt} />,
    },
    {
      dataIndex: 'updatedAt',
      title: intl.formatMessage({
        id: 'posts.drafts.table.updatedAt',
      }),
      render: (_, record) => <PostsDate time={record.updatedAt} />,
    },
    {
      dataIndex: 'status',
      title: intl.formatMessage({
        id: 'posts.drafts.table.status',
      }),
      width: 100,
      render: () => (
        // <Tag key={record.id}>
        //   {record.post
        //     ? record.post.stateId
        //       ? record.post.stateIdData.state === TaskCommonState.TODO
        //         ? intl.formatMessage({
        //             id: 'posts.table.status.todo',
        //           })
        //         : record.post.stateIdData.state === TaskCommonState.DOING
        //         ? intl.formatMessage({
        //             id: 'posts.table.status.doing',
        //           })
        //         : record.post.stateIdData.state === TaskCommonState.SUCCESS
        //         ? intl.formatMessage({
        //             id: 'posts.table.status.success',
        //           })
        //         : record.post.stateIdData.state === TaskCommonState.FAIL
        //         ? intl.formatMessage({
        //             id: 'posts.table.status.fail',
        //           })
        //         : intl.formatMessage({
        //             id: 'posts.table.status.other',
        //           })
        //       : intl.formatMessage({
        //           id: 'posts.table.status.other',
        //         })
        //     : intl.formatMessage({
        //         id: 'posts.table.status.localDraft',
        //       })}
        // </Tag>
        <PostsStorage />
      ),
    },
    {
      title: intl.formatMessage({
        id: 'posts.drafts.table.action',
      }),
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (_, record: GunType.GunDraft) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              onClick={() => {
                history.push({
                  pathname: '/content/drafts/edit',
                  query: {
                    id: String(record.id),
                  },
                });
              }}
            >
              {intl.formatMessage({
                id: 'component.button.edit',
              })}
            </Button>
          )}
          <Popconfirm
            title={intl.formatMessage({
              id: 'posts.table.action.delete.confirm',
            })}
            onConfirm={async (e) => {
              e?.stopPropagation();
              console.log(record);
              await handleDelete(Number(record.id), record?.key);
              await fetchPosts();

              /**
               * 同步草稿数量
               * 增加、更新、删除、页面切换
               */
              if (initialState?.currentUser?.id) {
                const localDraftCount = await dbDraftsAllCount(initialState?.currentUser?.id);

                setInitialState((s) => ({
                  ...s,
                  localDraftCount: localDraftCount,
                }));
              }
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText={intl.formatMessage({
              id: 'component.button.yes',
            })}
            cancelText={intl.formatMessage({
              id: 'component.button.no',
            })}
          >
            <Button danger onClick={(e) => e.stopPropagation()}>
              {intl.formatMessage({
                id: 'component.button.delete',
              })}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <PageContainer
      className="custom-container"
      breadcrumb={{}}
      title={intl.formatMessage({
        id: 'posts.intro.title',
      })}
      content={
        <p>
          {intl.formatMessage({
            id: 'posts.intro.description',
          })}
          <Link underline href={META_WIKI} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({
              id: 'posts.intro.learnMore',
            })}
          </Link>
        </p>
      }
    >
      <ProTable<GunType.GunDraft>
        columns={columns}
        actionRef={actionRef}
        request={async () => {
          const data = await fetchPosts();
          if (data) {
            return {
              data: data,
              success: true,
            };
          }
          return { success: false };
        }}
        rowKey={(record) => record.id!}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
        search={false}
        options={false}
        size="middle"
      />
    </PageContainer>
  );
};
