import { useIntl } from 'umi';
import { useCallback, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { Typography, Button, message } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PipelineOrderTaskCommonState } from '@/services/constants';
import { pipelinesPostOrdersMine, pipelinesPostOrdersRetryById } from '@/services/api/meta-cms';
import PostsCover from '@/components/PostsCover';
import PostsSubmit from '@/components/PostsSubmit';
import PostsPublish from '@/components/PostsPublish';
import PostsCertificate from '@/components/PostsCertificate';
import PostsDate from '@/components/PostsDate';
import { postPolling } from '../../../../config';

const { Link } = Typography;

export default () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [postOrdersRetryLoading, setPostOrdersRetryLoading] = useState<string>();

  // post orders retry
  const postOrdersRetry = useCallback(async (id: string) => {
    setPostOrdersRetryLoading(id);
    const postOrdersRetryResult = await pipelinesPostOrdersRetryById(id);
    setPostOrdersRetryLoading('');

    if (postOrdersRetryResult.statusCode === 201) {
      message.success('success');
    } else if (postOrdersRetryResult.statusCode === 409) {
      message.warning(postOrdersRetryResult.message);
    } else if (postOrdersRetryResult.statusCode === 404) {
      message.warning(postOrdersRetryResult.message);
    } else {
      message.error('fail');
    }
  }, []);

  const columns: ProColumns<CMS.PipelinesOrdersItem>[] = [
    {
      dataIndex: 'cover',
      title: intl.formatMessage({ id: 'posts.table.cover' }),
      width: 130,
      render: (_, record) => <PostsCover src={record.postMetadata.cover} />,
    },
    {
      dataIndex: ['postMetadata', 'title'],
      title: intl.formatMessage({ id: 'posts.table.title' }),
      ellipsis: true,
    },
    {
      dataIndex: 'submit',
      title: intl.formatMessage({ id: 'posts.table.submitState' }),
      render: (_, record) => <PostsSubmit state={record.submitState} />,
    },
    {
      dataIndex: 'publish',
      title: intl.formatMessage({ id: 'posts.table.publishState' }),
      render: (_, record) => (
        <PostsPublish state={record.publishState} publishSiteOrderId={record.publishSiteOrderId} />
      ),
    },
    {
      dataIndex: 'date',
      title: intl.formatMessage({ id: 'posts.table.date' }),
      render: (_, record) => <PostsDate time={record.postMetadata.createdAt} />,
    },
    {
      dataIndex: 'certificate',
      title: intl.formatMessage({ id: 'posts.table.certificate' }),
      render: (_, record) => (
        <PostsCertificate
          state={record.certificateState}
          certificateId={record.certificateId}
          certificateStorageType={record.certificateStorageType}
        />
      ),
    },
    {
      dataIndex: 'action',
      width: 140,
      fixed: 'right',
      title: intl.formatMessage({ id: 'posts.table.action' }),
      render: (_, record) =>
        record.publishState === PipelineOrderTaskCommonState.FAILED ? (
          <Button
            loading={postOrdersRetryLoading === record.id}
            onClick={() => postOrdersRetry(record.id)}
          >
            {intl.formatMessage({ id: 'posts.action.button' })}
          </Button>
        ) : null,
    },
  ];

  return (
    <PageContainer
      className="custom-container"
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'posts.posts.title' })}
      content={
        <p>
          {intl.formatMessage({ id: 'posts.posts.tips' })}{' '}
          <Link underline href={META_WIKI} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({ id: 'posts.intro.learnMore' })}
          </Link>
        </p>
      }
    >
      <ProTable<CMS.PipelinesOrdersItem>
        polling={postPolling}
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
        scroll={{ x: 1300 }}
        search={false}
        options={false}
        size="middle"
      />
    </PageContainer>
  );
};
