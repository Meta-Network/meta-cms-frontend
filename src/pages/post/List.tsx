import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Tag, Button } from 'antd';

export default () => {
  const columns = [
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'SENDS',
      dataIndex: 'sends',
      key: 'sends',
      width: 140,
    },
    {
      title: 'OPENS',
      dataIndex: 'opens',
      key: 'opens',
      width: 140,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (tag) => <Tag key={tag}>Draft</Tag>,
    },
  ];

  const data = [
    {
      key: '1',
      title: 'John Brown',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '2',
      title: 'Jim Green',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '3',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '4',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '5',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '6',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '7',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '8',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '9',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '10',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
    {
      key: '11',
      title: 'Joe Black',
      sends: '',
      opens: '',
      status: 'draft',
    },
  ];

  return (
    <PageContainer breadcrumb={{}} title="Post" content={<div className="text-info" />}>
      <Button onClick={() => history.push('/post/edit')}>Edit</Button>
      <Table columns={columns} dataSource={data} />
    </PageContainer>
  );
};
