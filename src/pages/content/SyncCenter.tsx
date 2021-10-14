import {
  ignorePendingPost,
  publishPendingPost,
  getDefaultSiteConfig,
  syncPostsByPlatform,
  getSourceStatus,
  waitUntilSyncFinish,
  fetchPostsPending,
} from '@/services/api/meta-cms';
import { useModel } from '@@/plugin-model/useModel';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { Image, Button, Space, Tag, message, Dropdown, Menu } from 'antd';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import styles from './SyncCenter.less';

type PostsInfo = CMS.ExistsPostsResponse['items'][number];

enum LoadingStates {
  Pending,
  Publishing,
  Discarding,
}

export default () => {
  const [siteConfigId, setSiteConfigId] = useState<number | null>(null);
  const [itemsNumbers, setItemsNumbers] = useState<number>(0);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [postsLoadings, setPostsLoading] = useState<LoadingStates[]>([]);
  const { setSiteNeedToDeploy } = useModel('storage');

  getDefaultSiteConfig().then((response) => {
    if (response.statusCode === 200) {
      setSiteConfigId(response.data.id);
    }
  });

  const ref = useRef<ActionType>();

  const syncPostsRequest = async () => {
    const done = message.loading('文章同步中…请稍候');
    setSyncLoading(true);

    const sources = await getSourceStatus();
    const syncQueue: Promise<any>[] = [];
    const syncStates: Promise<boolean>[] = [];

    sources.data.forEach((service: CMS.SourceStatusResponse) => {
      syncQueue.push(syncPostsByPlatform(service.platform));
      syncStates.push(waitUntilSyncFinish(service.platform));
    });

    await Promise.all(syncQueue);

    Promise.all(syncStates).then(() => {
      message.success('文章同步完成。');
      ref.current?.reload();
      setSyncLoading(false);
      done();
    });
  };

  useEffect(() => {
    setPostsLoading(Array(itemsNumbers).fill(LoadingStates.Pending));
  }, [itemsNumbers]);

  const setLoading = useCallback((index, value: LoadingStates) => {
    setPostsLoading((prevLoadings: LoadingStates[]) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = value;
      return newLoadings;
    });
  }, []);

  const columns: ProColumns<PostsInfo>[] = [
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
          {record.category && (
            <Tag color="green" key={`${record.category}_cate`}>
              {record.category}
            </Tag>
          )}
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
              {record?.tags?.map((name) => (
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
            if (siteConfigId === null) {
              message.error('未获取到站点信息，无法发布文章。请先创建站点');
              return;
            }
            setLoading(index, LoadingStates.Publishing);
            const done = message.loading('文章发布中…请稍候。', 0);
            await publishPendingPost(record.id, [siteConfigId]);
            if (ref.current?.reset) {
              await ref.current?.reset();
            }
            done();
            message.success('已成功发布此文章');
            setSiteNeedToDeploy(true);
            setLoading(index, LoadingStates.Pending);
          }}
          loading={postsLoadings[index] === LoadingStates.Publishing}
          disabled={postsLoadings[index] === LoadingStates.Discarding}
        >
          发布
        </Button>,
        <Button
          onClick={async () => {
            setLoading(index, LoadingStates.Discarding);
            const done = message.loading('取消发布中…请稍候。', 0);
            await ignorePendingPost(record.id);
            if (ref.current?.reset) {
              await ref.current?.reset();
            }
            done();
            message.success('成功取消发布此文章');
            setLoading(index, LoadingStates.Pending);
          }}
          loading={postsLoadings[index] === LoadingStates.Discarding}
          disabled={postsLoadings[index] === LoadingStates.Publishing}
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
        <div key="header-info" style={{ paddingTop: '11px', marginBottom: '4px' }}>
          <p>在这里来控制发布从其他源获取到的文章列表</p>
        </div>,
        <div key="header-actions" className={styles.syncButtons}>
          <Button
            key="sync-button"
            loading={syncLoading}
            onClick={syncPostsRequest}
            style={{ marginRight: 10 }}
          >
            立即同步
          </Button>
        </div>,
      ]}
      title="同步中心"
    >
      <ProTable<PostsInfo>
        actionRef={ref}
        columns={columns}
        request={async ({ pageSize, current }) => {
          // TODO: 分页
          const request = await fetchPostsPending(current ?? 1, pageSize ?? 10);
          setItemsNumbers(request.data.meta.totalItems);
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          return {
            data: request.data.items,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: true,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: request.data.meta.totalItems,
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
          expandedRowRender: (record: PostsInfo) => (
            <p dangerouslySetInnerHTML={{ __html: record.summary || '' }} />
          ),
        }}
        dateFormatter="string"
        options={false}
      />
    </PageContainer>
  );
};
