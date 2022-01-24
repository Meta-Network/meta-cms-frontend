/* eslint-disable prettier/prettier */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { history, useIntl, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Tag, Button, Image, Space, Popconfirm, message } from 'antd';
import { dbPostsUpdate, dbMetadatasUpdateByPostId, dbPostsAllCount } from '@/db/db';
import { strSlice } from '@/utils';
import { fetchGunDraftsAndUpdateLocal, deleteDraft } from '@/utils/gun';
import moment from 'moment';
import { fetchPostsStorageState } from '@/services/api/meta-cms';
import { TaskCommonState } from '@/services/constants';

export default () => {
  const intl = useIntl();
  const [postsList, setPostsList] = useState<GunType.GunDraft[]>([]);
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
      const allHasStateIds = response.filter((i) => i?.post && i.post.stateId);
      const allStateIds = allHasStateIds.map((i) => i.post!.stateId) as number[];
      if (allStateIds.length) {
        const allStates = await fetchPostsStorageState({ stateIds: allStateIds });
        const allStatesMap = new Map();

        if (allStates.statusCode === 200) {
          allStates.data.map((i) => {
            allStatesMap.set(i.id, i);
          });
        }

        response.forEach((i) => {
          if (allStatesMap.get(i?.post?.stateId)) {
            i.post!.stateIdData = allStatesMap.get(i.post!.stateId);
          }
        });
      }

      const responseSort = response
        .filter((item) => {
          return item.post == null;
        })
        .sort((a, b) => Number(moment(a.updatedAt).isBefore(b.updatedAt)));

      setPostsList(responseSort);
    }
  }, [initialState]);

  const columns = useMemo(() => {
    return [
      {
        title: intl.formatMessage({
          id: 'posts.drafts.table.cover',
        }),
        dataIndex: 'cover',
        key: 'cover',
        width: 100,
        render: (val: string) => (
          <>
            {val ? (
              <Image
                onClick={(e) => e.stopPropagation()}
                width={100}
                height={50}
                src={val}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: 100, height: 50, backgroundColor: '#dcdcdc' }} />
            )}
          </>
        ),
      },
      {
        title: intl.formatMessage({
          id: 'posts.drafts.table.title',
        }),
        dataIndex: 'title',
        key: 'title',
        render: (val: string) => <span>{strSlice(val, 40)}</span>,
      },
      {
        title: intl.formatMessage({
          id: 'posts.drafts.table.createdAt',
        }),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (val: string) => (
          <span>
            {/* val - Current date and time expressed according to ISO 8601, example: 2022-01-24T06:54:40.738Z */}
            {val.split('T')[0]} {val.split('T')[1].split('.')[0]}
          </span>
        ),
      },
      {
        title: intl.formatMessage({
          id: 'posts.drafts.table.updatedAt',
        }),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (val: string) => (
          <span>
            {val.split('T')[0]} {val.split('T')[1].split('.')[0]}
          </span>
        ),
      },
      {
        title: intl.formatMessage({
          id: 'posts.drafts.table.status',
        }),
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (_: any, record: PostType.Posts) => (
          <Tag key={record.id}>
            {record.post
              ? record.post.stateId
                ? record.post.stateIdData.state === TaskCommonState.TODO
                  ? intl.formatMessage({
                      id: 'posts.table.status.todo',
                    })
                  : record.post.stateIdData.state === TaskCommonState.DOING
                  ? intl.formatMessage({
                      id: 'posts.table.status.doing',
                    })
                  : record.post.stateIdData.state === TaskCommonState.SUCCESS
                  ? intl.formatMessage({
                      id: 'posts.table.status.success',
                    })
                  : record.post.stateIdData.state === TaskCommonState.FAIL
                  ? intl.formatMessage({
                      id: 'posts.table.status.fail',
                    })
                  : intl.formatMessage({
                      id: 'posts.table.status.other',
                    })
                : intl.formatMessage({
                    id: 'posts.table.status.other',
                  })
              : intl.formatMessage({
                  id: 'posts.table.status.localDraft',
                })}
          </Tag>
        ),
      },
      {
        title: intl.formatMessage({
          id: 'posts.drafts.table.action',
        }),
        dataIndex: 'status',
        key: 'status',
        width: 180,
        render: (val: string, record: GunType.GunDraft) => (
          <Space>
            {val === 'pending' ? (
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
            ) : null}
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
                  const localDraftCount = await dbPostsAllCount(initialState?.currentUser?.id);

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
  }, [fetchPosts, handleDelete, intl, initialState, setInitialState]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({
        id: 'posts.intro.title',
      })}
      content={
        <div className="text-info">
          {intl.formatMessage({
            id: 'posts.intro.description',
          })}
          <a target="_blank" href="#">
            {' '}
            {intl.formatMessage({
              id: 'posts.intro.learnMore',
            })}
          </a>
        </div>
      }
    >
      <Table
        rowKey={(record: PostType.Posts) => `${String(record.id)}}`}
        onRow={() => {
          return {};
        }}
        columns={columns}
        dataSource={postsList}
      />
    </PageContainer>
  );
};
