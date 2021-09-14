import { PageContainer } from '@ant-design/pro-layout';
import { Image, Button, Space, Tag } from 'antd';
import { useState, useCallback } from 'react';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';

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

enum LoadingStates {
  Pending,
  Publishing,
  Discarding,
}

export default () => {
  const [loadings, setLoadings] = useState<LoadingStates[]>(
    Array(response.data.length).fill(LoadingStates.Pending),
  );

  const setLoading = useCallback((index, value: LoadingStates) => {
    setLoadings((prevLoadings: LoadingStates[]) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = value;
      return newLoadings;
    });
  }, []);

  const columns: ProColumns<HexoPostsInfo>[] = [
    {
      dataIndex: 'cover',
      title: '封面图片',
      search: false,
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
      dataIndex: 'categories',
      filters: true,
      onFilter: true,
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
    {
      title: '操作',
      key: 'option',
      width: 250,
      valueType: 'option',
      render: (_, record, index) => [
        <Button
          onClick={() => {
            setLoading(index, LoadingStates.Publishing);
            setTimeout(() => {
              setLoading(index, LoadingStates.Pending);
            }, 3000);
          }}
          loading={loadings[index] === LoadingStates.Publishing}
          disabled={loadings[index] === LoadingStates.Discarding}
          type="primary"
        >
          发布
        </Button>,
        <Button
          onClick={() => {
            setLoading(index, LoadingStates.Discarding);
            setTimeout(() => {
              setLoading(index, LoadingStates.Pending);
            }, 3000);
          }}
          loading={loadings[index] === LoadingStates.Discarding}
          disabled={loadings[index] === LoadingStates.Publishing}
          type="primary"
          danger
        >
          取消发布
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer
      breadcrumb={{}}
      title="同步中心"
      content="在这里来控制发布从其他源获取到的文章列表"
    >
      <ProTable<HexoPostsInfo>
        columns={columns}
        request={async (
          // 第一个参数 params 查询表单和 params 参数的结合
          // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
          params,
          sort,
          filter,
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          const msg = await myQuery({
            page: params.current,
            pageSize: params.pageSize,
          });
          return {
            data: msg.result,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: boolean,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: number,
          };
        }}
        rowKey={(record) => record.title}
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
        pagination={{}}
        expandable={{
          expandedRowRender: (record: HexoPostsInfo) => (
            <p dangerouslySetInnerHTML={{ __html: record.content }} />
          ),
        }}
        dateFormatter="string"
        options={false}
      />
    </PageContainer>
  );
};
