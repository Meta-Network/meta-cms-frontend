import { useState, useCallback } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { useMount } from 'ahooks';
import { Table, Tag, Button, Image, Space, Popconfirm, message } from 'antd';
import { db, dbPostsUpdate } from '../../models/db';
import type { Posts } from '../../models/Posts';

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
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (val: string) => <Tag key={val}>{val}</Tag>,
    },
    {
      title: 'ACTION',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (val: string, record: Posts) => (
        <Space>
          {val === 'pending' ? <Button type="primary">发布</Button> : null}
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
            <Button type="primary" danger onClick={(e) => e.stopPropagation()}>
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
        onRow={(record) => {
          return {
            onClick: () => {
              history.push({
                pathname: `/post/edit`,
                query: {
                  id: String(record.id),
                },
              });
            },
          };
        }}
        columns={columns}
        dataSource={postsList}
      />
    </PageContainer>
  );
};
