import { useIntl } from 'umi';
import { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
// import FormattedDescription from '@/components/FormattedDescription';
import { Typography, Button } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PipelineOrderTaskCommonState } from '@/services/constants';
import { pipelinesPostOrdersMine } from '@/services/api/meta-cms';
import PostsCover from '@/components/PostsCover';
import PostsSubmit from '@/components/PostsSubmit';
import PostsPublish from '@/components/PostsPublish';
import PostsCertificate from '@/components/PostsCertificate';
import PostsDate from '@/components/PostsDate';

const { Link } = Typography;

export default () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<CMS.PipelinesOrdersMineItem>[] = [
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
      render: (_, record) => <PostsCertificate state={record.certificateState} />,
    },
    {
      dataIndex: 'action',
      title: '操作',
      render: (_, record) =>
        record.publishState === PipelineOrderTaskCommonState.FAILED ? (
          <Button>{intl.formatMessage({ id: 'posts.action.button' })}</Button>
        ) : null,
    },
  ];

  return (
    <PageContainer
      className="custom-container"
      breadcrumb={{}}
      title={'全部作品'}
      content={
        <p>
          检查和管理您的全部作品{' '}
          <Link underline href={META_WIKI} target="_blank" rel="noopener noreferrer">
            了解更多
          </Link>
        </p>
      }
    >
      <ProTable<CMS.PipelinesOrdersMineItem>
        columns={columns}
        actionRef={actionRef}
        request={async ({ pageSize, current }) => {
          const params = {
            page: current ?? 1,
            limit: pageSize ?? 10,
          };
          const result = await pipelinesPostOrdersMine(params);
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
      />
    </PageContainer>
  );
};
