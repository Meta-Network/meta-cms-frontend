import { useIntl } from 'umi';
import { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
// import FormattedDescription from '@/components/FormattedDescription';
import { Typography, Button, Checkbox, Empty } from 'antd';
import ProTable from '@ant-design/pro-table';
import { pipelinesPostOrdersMinePublishing } from '@/services/api/meta-cms';
import PostsCover from '@/components/PostsCover';
import PostsSubmit from '@/components/PostsSubmit';
import PostsPublish from '@/components/PostsPublish';
import PostsDate from '@/components/PostsDate';
import PostsCertificate from '@/components/PostsCertificate';

const { Link } = Typography;

function onChange(e: any) {
  console.log(`checked = ${e.target.checked}`);
}

export default () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<CMS.PipelinesOrdersItem>[] = [
    {
      dataIndex: 'cover',
      title: '封面图',
      render: (_, record) => <PostsCover src={record.postMetadata.cover} />,
    },
    {
      dataIndex: ['postMetadata', 'title'],
      title: intl.formatMessage({ id: 'messages.published.table.title' }),
      ellipsis: true,
    },
    {
      dataIndex: 'submit',
      title: 'Submit 状态',
      render: (_, record) => <PostsSubmit state={record.submitState} />,
    },
    {
      dataIndex: 'publish',
      title: 'Publish 状态',
      render: (_, record) => <PostsPublish state={record.publishState} />,
    },
    {
      dataIndex: 'date',
      title: '请求日期',
      render: (_, record) => <PostsDate time={record.postMetadata.createdAt} />,
    },
    {
      dataIndex: 'certificate',
      title: '存证',
      render: (_, record) => (
        <PostsCertificate
          state={record.certificateState}
          certificateId={record.certificateId}
          certificateStorageType={record.certificateStorageType}
        />
      ),
    },
  ];

  return (
    <PageContainer
      className="custom-container"
      breadcrumb={{}}
      title={'发布中'}
      content={
        <p>
          检查和管理正在发布到 Meta Space 的作品{' '}
          <Link underline href={META_WIKI} target="_blank" rel="noopener noreferrer">
            了解更多
          </Link>
        </p>
      }
    >
      <ProTable<CMS.PipelinesOrdersItem>
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有可以发布的内容啦～" />
          ),
        }}
        columns={columns}
        actionRef={actionRef}
        request={async ({ pageSize, current }) => {
          const params = {
            page: current ?? 1,
            limit: pageSize ?? 10,
          };
          const result = await pipelinesPostOrdersMinePublishing(params);
          if (result.statusCode === 200) {
            return {
              data: result.data.items,
              success: true,
              total: result.data.meta.totalItems,
            };
          }
          return { success: false };
        }}
        rowKey={(record) => record.id}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
        search={false}
        options={false}
        size="middle"
        toolBarRender={() => [
          <Checkbox key="actionCheckbox" onChange={onChange}>
            全部提交后自动发布
          </Checkbox>,
          <Button key="button">立即开始发布 #1</Button>,
          <Button key="button" disabled>
            等待发布 #1
          </Button>,
          <Button key="button" disabled>
            正在发布 #1
          </Button>,
        ]}
      />
    </PageContainer>
  );
};
