import { useRef } from 'react';
import { Image, Tag, Space } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { fetchPostsPublished } from '@/services/api/meta-cms';
import type { ProColumns, ActionType } from '@ant-design/pro-table';

type PostsInfo = CMS.ExistsPostsResponse['items'][number];

const columns: ProColumns<PostsInfo>[] = [
  {
    dataIndex: 'cover',
    title: '封面图片',
    search: false,
    renderFormItem: (_, { defaultRender }) => {
      return defaultRender(_);
    },
    render: (_, record) => (
      <Space>{record.cover ? <Image width={100} src={record.cover} /> : '无封面图'}</Space>
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
    dataIndex: 'category',
    filters: true,
    onFilter: true,
    renderFormItem: (_, { defaultRender }) => {
      return defaultRender(_);
    },
    render: (_, record) => (
      <Tag color="yellow" key={`${record.category}_cate`}>
        {record.category}
      </Tag>
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
    render: (_, record) =>
      record?.tags?.map((tag) => (
        <Tag color="blue" key={`${tag}_tag`}>
          {tag}
        </Tag>
      )),
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
    <PageContainer
      breadcrumb={{}}
      title="已发布内容"
      content={
        <div key="header-info">
          <p>已发布的文章列表可以在这里查看</p>
        </div>
      }
    >
      <ProTable<PostsInfo>
        columns={columns}
        actionRef={actionRef}
        request={async ({ pageSize, current }) => {
          const request = await fetchPostsPublished(current ?? 1, pageSize ?? 10);
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          if (request?.data) {
            return {
              data: request.data.items,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: true,
              // 不传会使用 data 的长度，如果是分页一定要传
              total: request.data.meta.totalItems,
            };
          }
          return { success: false };
        }}
        rowKey={(record) => record.id}
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
        // pagination={{
        //   total: response.total,
        //   pageSize: response.pageSize,
        // }}
        expandable={{
          expandedRowRender: (record: PostsInfo) => (
            <p dangerouslySetInnerHTML={{ __html: record.summary }} />
          ),
        }}
        dateFormatter="string"
        options={false}
      />
    </PageContainer>
  );
};
