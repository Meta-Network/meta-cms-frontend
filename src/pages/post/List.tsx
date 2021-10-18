import { useState, useCallback } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { useMount } from 'ahooks';
import { Table, Tag, Button, Image, Space, Popconfirm, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { db, dbPostsUpdate } from '../../models/db';
import type { Posts } from '../../models/Posts';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default () => {
  const [postsList, setPostsList] = useState<Posts[]>([]);

  /**
   * handle delete
   */
  const handleDelete = useCallback(async (id: number) => {
    await dbPostsUpdate(id, { delete: 1 });
    message.success('删除成功');
  }, []);

  /**
   * fetch posts list
   */
  const fetchPosts = useCallback(async () => {
    const result = await db.posts.where('delete').equals(0).reverse().sortBy('id');
    // console.log('result', result);
    setPostsList(result);
  }, []);

  const columns = [
    {
      title: 'COVER',
      dataIndex: 'cover',
      key: 'cover',
      width: 100,
      render: (val: string) => <Image onClick={(e) => e.stopPropagation()} width={100} src={val} />,
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
              <span>{record.post?.source?.slice(0, 6)}...</span>
              <CopyToClipboard
                text={record.post?.source}
                onCopy={() => message.info('已粘贴到剪切板')}
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
              ? '云端草稿'
              : record.post.state === 'pending'
              ? '待发布'
              : '本地草稿'
            : '本地草稿'}
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
              编辑
            </Button>
          ) : null}
          <Popconfirm
            title="确定删除?"
            onConfirm={async (e) => {
              e?.stopPropagation();
              console.log(record);
              await handleDelete(Number(record.id));
              await fetchPosts();
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Yes"
            cancelText="No"
          >
            <Button danger onClick={(e) => e.stopPropagation()}>
              删除
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
    <PageContainer breadcrumb={{}} title="Post" content={<div className="text-info" />}>
      <Button onClick={() => history.push('/post/edit')}>创作</Button>
      <br />
      <br />
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
