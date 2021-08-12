import { useRef } from 'react';
import { Image, Tag, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import request from 'umi-request';
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';

type HexoPostsInfo = {
  cover: string | null;
  title: string;
  content: string;
  keywords: string;
  tags: { name: string; path: string }[];
  categories: { name: string; path: string }[];
  date: string;
  updated: string;
};

type RequestResponse = {
  total: number;
  pageSize: number;
  pageCount: number;
  data: HexoPostsInfo[];
};

const baseUrl = 'https://metaspace.federarks.xyz';
const response = await request<RequestResponse>(`${baseUrl}/api/posts.json`);

const columns: ProColumns<HexoPostsInfo>[] = [
  {
    dataIndex: 'cover',
    title: '封面图片',
    search: false,
    renderFormItem: (_, { defaultRender }) => {
      return defaultRender(_);
    },
    render: (_, record) => (
      <Space>
        {record.cover ? (
          <Image
            width={100}
            src={record.cover.startsWith('/') ? baseUrl + record.cover : record.cover}
          />
        ) : (
          '无封面图'
        )}
      </Space>
    ),
  },
  {
    dataIndex: 'title',
    title: '标题',
    width: 200,
    copyable: true,
    ellipsis: true,
    tip: '标题过长会自动收缩',
  },
  {
    title: '分类',
    dataIndex: 'categories',
    filters: true,
    onFilter: true,
    renderFormItem: (_, { defaultRender }) => {
      return defaultRender(_);
    },
    render: (_, record) => (
      <Space>
        {record.categories.map(({ name, path }) => (
          <Tag color="yellow" key={`${name}_cate`}>
            <a href={path}>{name}</a>
          </Tag>
        ))}
      </Space>
    ),
  },
  {
    title: '标签',
    dataIndex: 'tags',
    filters: true,
    onFilter: true,
    renderFormItem: (_, { defaultRender }) => {
      return defaultRender(_);
    },
    render: (_, record) => (
      <Space>
        {record.tags.map(({ name, path }) => (
          <Tag color="blue" key={`${name}_tag`}>
            <a href={path}>{name}</a>
          </Tag>
        ))}
      </Space>
    ),
  },
  {
    title: '创建时间',
    key: 'showTime',
    dataIndex: 'date',
    valueType: 'date',
    sorter: true,
    hideInSearch: true,
  },
  {
    title: '创建时间',
    dataIndex: 'date',
    valueType: 'dateRange',
    hideInTable: true,
    search: {
      transform: (value) => {
        return {
          startTime: value[0],
          endTime: value[1],
        };
      },
    },
  },
  {
    title: '更新时间',
    key: 'showTime',
    dataIndex: 'updated',
    valueType: 'date',
    sorter: true,
    hideInSearch: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updated',
    valueType: 'dateRange',
    hideInTable: true,
    search: {
      transform: (value) => {
        return {
          startTime: value[0],
          endTime: value[1],
        };
      },
    },
  },
];

export default () => {
  const actionRef = useRef<ActionType>();
  return (
    <PageContainer breadcrumb={{}} title="已发布内容" content="已发布的文章列表可以在这里查看">
      {/* <Skeleton loading active> */}
      <ProTable<HexoPostsInfo>
        columns={columns}
        actionRef={actionRef}
        dataSource={response.data}
        rowKey={(record, index) => index!.toString()}
        search={{
          labelWidth: 'auto',
        }}
        form={{
          // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
          syncToUrl: (values, type) => {
            if (type === 'get') {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        pagination={{
          total: response.total,
          pageSize: response.pageSize,
        }}
        expandable={{
          expandedRowRender: (record: HexoPostsInfo) => (
            <p dangerouslySetInnerHTML={{ __html: record.content }} />
          ),
        }}
        dateFormatter="string"
        options={false}
      />
      {/* </Skeleton> */}
    </PageContainer>
  );
};
