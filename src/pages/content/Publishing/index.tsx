import PostsCertificate from '@/components/PostsCertificate';
import PostsCover from '@/components/PostsCover';
import PostsDate from '@/components/PostsDate';
import PostsPublish from '@/components/PostsPublish';
import PostsSubmit from '@/components/PostsSubmit';
import {
  pipelinesPostOrdersMinePublishing,
  pipelinesSiteOrdersPublish,
} from '@/services/api/meta-cms';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Empty, message, Typography } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { useIntl } from 'umi';
import { postPolling } from '../../../../config';
import PublishQueue from './components/publishQueue';

const { Link } = Typography;

export default () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [siteOrdersPublishState, setSiteOrdersPublishState] = useState<boolean>(false);

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
  ];

  const siteOrdersPublish = useCallback(async () => {
    setSiteOrdersPublishState(true);
    const siteOrdersPublishResult = await pipelinesSiteOrdersPublish();

    setSiteOrdersPublishState(false);
    if (siteOrdersPublishResult.statusCode === 201) {
      message.success(intl.formatMessage({ id: 'messages.success' }));
    } else {
      message.error(intl.formatMessage({ id: 'messages.fail' }));
    }
  }, [intl]);

  return (
    <PageContainer
      className="custom-container"
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'posts.publishing.title' })}
      content={
        <p>
          {intl.formatMessage({ id: 'posts.publishing.intro' })}{' '}
          <Link underline href={META_WIKI} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({ id: 'posts.intro.learnMore' })}
          </Link>
        </p>
      }
    >
      <ProTable<CMS.PipelinesOrdersItem>
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({ id: 'posts.publishing.empty' })}
            />
          ),
        }}
        polling={postPolling}
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
        scroll={{ x: 1100 }}
        search={false}
        options={false}
        size="middle"
        toolBarRender={() => [
          <PublishQueue
            key="publishQueue"
            siteOrdersPublishState={siteOrdersPublishState}
            siteOrdersPublish={siteOrdersPublish}
          />,
        ]}
      />
    </PageContainer>
  );
};
