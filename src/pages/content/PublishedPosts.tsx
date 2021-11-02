import { useIntl } from 'umi';
import { useRef } from 'react';
import { Image, Tag, Space } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { fetchPostsPublished } from '@/services/api/meta-cms';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import FormattedDescription from '@/components/FormattedDescription';

type PostsInfo = CMS.ExistsPostsResponse['items'][number];

export default () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<PostsInfo>[] = [
    {
      dataIndex: 'cover',
      title: intl.formatMessage({ id: 'messages.published.table.cover' }),
      search: false,
      renderFormItem: (_, { defaultRender }) => {
        return defaultRender(_);
      },
      render: (_, record) => (
        <Space>
          {record.cover ? (
            <Image width={100} src={record.cover} />
          ) : (
            intl.formatMessage({ id: 'messages.published.table.noCoverExists' })
          )}
        </Space>
      ),
    },
    {
      dataIndex: 'title',
      title: intl.formatMessage({ id: 'messages.published.table.title' }),
      width: 200,
      copyable: true,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'messages.published.table.category' }),
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
      title: intl.formatMessage({ id: 'messages.published.table.tags' }),
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
      title: intl.formatMessage({ id: 'messages.published.table.createTime' }),
      key: 'showTime',
      dataIndex: 'date',
      valueType: 'date',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'messages.published.table.createTime' }),
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
      title: intl.formatMessage({ id: 'messages.published.table.updateTime' }),
      key: 'showTime',
      dataIndex: 'updated',
      valueType: 'date',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'messages.published.table.updateTime' }),
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

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.published.table.title' })}
      content={<FormattedDescription id="messages.published.description" />}
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
