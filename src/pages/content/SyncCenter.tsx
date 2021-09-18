import {
  ignorePendingPost,
  publishPendingPost,
  fetchPostsPendingSync,
} from '@/services/api/meta-cms';
import { EllipsisOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { Image, Button, Space, Tag, message, Dropdown, Menu } from 'antd';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import styles from './SyncCenter.less';

type HexoPostsInfo = {
  id: number;
  cover: string | null;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
};

enum LoadingStates {
  Pending,
  Publishing,
  Discarding,
}

export default () => {
  const [itemsNumbers, setItemsNumbers] = useState<number>(0);
  const [loadings, setLoadings] = useState<LoadingStates[]>([]);

  const ref = useRef<ActionType>();

  useEffect(() => {
    setLoadings(Array(itemsNumbers).fill(LoadingStates.Pending));
  }, [itemsNumbers]);

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
      dataIndex: 'category',
      filters: true,
      onFilter: true,
      render: (_, record) => (
        <Space>
          <Tag color="green" key={`${record.category}_cate`}>
            {record.category}
          </Tag>
        </Space>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      filters: true,
      onFilter: true,
      render: (_, record) => (
        <Dropdown
          key="menu_tags"
          trigger={['click', 'hover']}
          overlay={
            <Menu>
              {record.tags.map((name) => (
                <Menu.Item key={`${name}_menu`}>
                  <Tag color="blue" key={`${name}_tag`}>
                    {name}
                  </Tag>
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button key="tags_list" type="dashed" style={{ padding: '0 8px' }}>
            标签列表
          </Button>
        </Dropdown>
      ),
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'createdAt',
      valueType: 'date',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
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
      dataIndex: 'updatedAt',
      valueType: 'date',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
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
      width: 210,
      valueType: 'option',
      render: (_, record, index) => [
        <Button
          onClick={async () => {
            setLoading(index, LoadingStates.Publishing);
            await publishPendingPost(record.id);
            await ref.current?.reload();
            message.success('已成功发布此文章');
          }}
          loading={loadings[index] === LoadingStates.Publishing}
          disabled={loadings[index] === LoadingStates.Discarding}
        >
          发布
        </Button>,
        <Button
          onClick={async () => {
            setLoading(index, LoadingStates.Discarding);
            await ignorePendingPost(record.id);
            await ref.current?.reload();
            message.success('成功取消发布此文章');
          }}
          loading={loadings[index] === LoadingStates.Discarding}
          disabled={loadings[index] === LoadingStates.Publishing}
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
      content={[
        <div style={{ paddingTop: '11px', marginBottom: '4px' }}>
          <p>在这里来控制发布从其他源获取到的文章列表</p>
        </div>,
        <div className={styles.syncButtons}>
          <Button key="sync-button" style={{ marginRight: 10 }} type="primary">
            立即同步
          </Button>
          <Dropdown
            key="dropdown"
            trigger={['click']}
            overlay={
              <Menu>
                <Menu.Item key="1">下拉菜单</Menu.Item>
                <Menu.Item key="2">下拉菜单2</Menu.Item>
                <Menu.Item key="3">下拉菜单3</Menu.Item>
              </Menu>
            }
          >
            <Button key="4" style={{ padding: '0 8px' }}>
              <EllipsisOutlined />
            </Button>
          </Dropdown>
        </div>,
      ]}
      title="同步中心"
    >
      <ProTable<HexoPostsInfo>
        actionRef={ref}
        columns={columns}
        request={async () => {
          // TODO: 分页
          const request = await fetchPostsPendingSync();
          setItemsNumbers(request.data.items.length);
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          return {
            data: request.data.items,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: true,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: 10,
          };
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
        pagination={{}}
        expandable={{
          expandedRowRender: (record: HexoPostsInfo) => (
            <p dangerouslySetInnerHTML={{ __html: record.summary }} />
          ),
        }}
        dateFormatter="string"
        options={false}
      />
    </PageContainer>
  );
};
