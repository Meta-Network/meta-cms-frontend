import { useState, useCallback } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { useMount } from 'ahooks';
import { Table, Tag, Button, Image } from 'antd';
import { db } from '../../models/db';
import type { Posts } from '../../models/Posts';

export default () => {
  const [postsList, setPostsList] = useState<Posts[]>([]);
  const columns = [
    {
      title: 'COVER',
      dataIndex: 'cover',
      key: 'cover',
      width: 120,
      render: (val: string) => <Image width={120} src={val} />,
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
      render: (tag: string) => <Tag key={tag}>Draft</Tag>,
    },
  ];

  /**
   * fetch posts list
   */
  const fetchPosts = useCallback(async () => {
    const result = await db.posts.toArray();
    // console.log('result', result);
    setPostsList(result);
  }, []);

  useMount(() => {
    fetchPosts();
  });

  return (
    <PageContainer breadcrumb={{}} title="Post" content={<div className="text-info" />}>
      <Button onClick={() => history.push('/post/edit')}>创作</Button>
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
