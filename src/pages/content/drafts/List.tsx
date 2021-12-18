import { useState, useCallback, useEffect } from 'react';
import { history, useIntl, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Tag, Button, Image, Space, Popconfirm, message } from 'antd';
import { dbPostsUpdate, dbMetadatasUpdateByPostId } from '@/db/db';
import type { Posts } from '@/db/Posts';
import { strSlice } from '@/utils';
import { twoWaySync, deleteDraft } from '@/utils/gun';
import type { GunDraft } from '@/utils/gun';

export default () => {
  const intl = useIntl();
  const [postsList, setPostsList] = useState<GunDraft[]>([]);
  const { initialState } = useModel('@@initialState');

  /** handle delete */
  const handleDelete = useCallback(
    async (id: number, key?: string) => {
      await dbPostsUpdate(id, { delete: 1 });
      await dbMetadatasUpdateByPostId(id, { delete: 1 });

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
      const response = await twoWaySync(initialState.currentUser);
      setPostsList(response);
    }
  }, [initialState]);

  const columns = [
    {
      title: 'COVER',
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
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
      render: (val: string) => <span>{val}</span>,
    },
    {
      title: 'SUMMARY',
      dataIndex: 'summary',
      key: 'summary',
      render: (val: string) => <span>{strSlice(val, 40)}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_: any, record: Posts) => (
        <Tag key={record.id}>
          {record.post
            ? record.post.state === 'drafted'
              ? intl.formatMessage({
                  id: 'posts.table.status.cloudDraft',
                })
              : record.post.state === 'pending'
              ? intl.formatMessage({
                  id: 'posts.table.status.pending',
                })
              : record.post.state === 'published'
              ? intl.formatMessage({
                  id: 'posts.table.status.published',
                })
              : intl.formatMessage({
                  id: 'posts.table.status.localDraft',
                })
            : intl.formatMessage({
                id: 'posts.table.status.localDraft',
              })}
        </Tag>
      ),
    },
    {
      title: 'ACTION',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (val: string, record: GunDraft) => (
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
      breadcrumb={{}}
      title={intl.formatMessage({
        id: 'posts.intro.title',
      })}
      content={
        <div className="text-info">
          {intl.formatMessage({
            id: 'posts.intro.description',
          })}
        </div>
      }
    >
      <Table
        rowKey={(record: Posts) => String(record.id)}
        onRow={() => {
          return {};
        }}
        columns={columns}
        dataSource={postsList}
      />
    </PageContainer>
  );
};
