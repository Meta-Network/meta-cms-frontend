import { useState, useCallback } from 'react';
import { history, useIntl } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { useMount } from 'ahooks';
import { Table, Tag, Button, Image, Space, Popconfirm, message } from 'antd';
import { CopyOutlined, EditOutlined } from '@ant-design/icons';
import { dbPostsUpdate, dbPostsAll } from '@/db/db';
import type { Posts } from '@/db/Posts.d';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { strSlice } from '@/utils';

export default () => {
  const intl = useIntl();
  const [postsList, setPostsList] = useState<Posts[]>([]);

  /**
   * handle delete
   */
  const handleDelete = useCallback(
    async (id: number) => {
      await dbPostsUpdate(id, { delete: 1 });
      message.success(
        intl.formatMessage({
          id: 'posts.table.action.delete.success',
        }),
      );
    },
    [intl],
  );

  /**
   * fetch posts list
   */
  const fetchPosts = useCallback(async () => {
    const result = await dbPostsAll();
    // console.log('result', result);
    if (result) {
      setPostsList(result);
    }
  }, []);

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
      title: 'HASH',
      dataIndex: 'hash',
      key: 'hash',
      width: 140,
      render: (_: any, record: Posts) => (
        <span>
          {(isNaN(Number(record.post?.source)) && record.post?.source && (
            <>
              <span>{strSlice(record.post?.source, 10)}</span>
              <CopyToClipboard
                text={record.post?.source}
                onCopy={() =>
                  message.info(
                    intl.formatMessage({
                      id: 'messages.copy.success',
                    }),
                  )
                }
              >
                <CopyOutlined />
              </CopyToClipboard>
            </>
          )) ||
            ''}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 140,
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
      render: (val: string, record: Posts) => (
        <Space>
          {val === 'pending' ? (
            <Button
              onClick={() => {
                history.push({
                  pathname: '/post/edit',
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
              await handleDelete(Number(record.id));
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

  useMount(() => {
    fetchPosts();
  });

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
      <Button
        style={{ marginBottom: 10 }}
        icon={<EditOutlined />}
        onClick={() => history.push('/post/edit')}
      >
        {intl.formatMessage({
          id: 'component.button.create',
        })}
      </Button>
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
