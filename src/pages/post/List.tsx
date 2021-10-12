import { useState, useCallback } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { useMount } from 'ahooks';
import { Table, Tag, Button } from 'antd';
import { db } from '../../models/db';

export default () => {
  const columns = [
    {
      title: 'COVER',
      dataIndex: 'cover',
      key: 'cover',
      width: 100,
      render: (val: string) => <img src={val} width={60} />,
    },
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
      render: (val: string) => <a>{val}</a>,
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

  const [postsList, setPostsList] = useState<any[]>([]);

  // const allPosts = useLiveQuery(() => db.posts.toArray(), []);
  // console.log('allPosts', allPosts);

  const fetchPosts = useCallback(async () => {
    const result = await db.posts.toArray();
    console.log('result', result);
    setPostsList(result);
  }, []);

  useMount(() => {
    fetchPosts();
  });

  return (
    <PageContainer breadcrumb={{}} title="Post" content={<div className="text-info" />}>
      <Button onClick={() => history.push('/post/edit')}>+</Button>
      <Table columns={columns} dataSource={postsList} />
    </PageContainer>
  );
};
