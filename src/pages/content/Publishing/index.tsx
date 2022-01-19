import { useIntl } from 'umi';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
// import FormattedDescription from '@/components/FormattedDescription';
import { Typography, Space, Image } from 'antd';
import ProTable from '@ant-design/pro-table';
import { getDefaultSiteConfigAPI } from '@/helpers';
import { FetchPostsStorageParamsState } from '@/services/constants';
import { fetchPostsStorage } from '@/services/api/meta-cms';

const { Link } = Typography;

export default () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [siteConfigDefault, setSiteConfigDefault] = useState<CMS.SiteConfiguration | undefined>();

  const columns: ProColumns<CMS.Post>[] = [
    {
      dataIndex: 'cover',
      title: '封面图',
      render: (_, record) => (
        <Space>
          {record.cover ? (
            <Image width={100} src={record.cover} />
          ) : (
            intl.formatMessage({ id: 'messages.table.noCoverExists' })
          )}
        </Space>
      ),
    },
    {
      dataIndex: 'title',
      title: intl.formatMessage({ id: 'messages.published.table.title' }),
      ellipsis: true,
    },
    {
      dataIndex: 'submit',
      title: 'Submit 状态',
    },
    {
      dataIndex: 'publish',
      title: 'Publish 状态',
    },
    {
      dataIndex: 'date',
      title: '请求日期',
    },
    {
      dataIndex: 'certificate',
      title: '存证',
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
      <ProTable<CMS.Post>
        columns={columns}
        actionRef={actionRef}
        request={async ({ pageSize, current }) => {
          let _siteConfigDefault: CMS.SiteConfiguration | undefined;

          if (!siteConfigDefault?.id) {
            _siteConfigDefault = await getDefaultSiteConfigAPI();
            if (_siteConfigDefault) {
              setSiteConfigDefault(_siteConfigDefault);
            } else {
              return { success: false };
            }
          }

          const params = {
            page: current ?? 1,
            limit: pageSize ?? 10,
            state: FetchPostsStorageParamsState.Published,
          };
          const request = await fetchPostsStorage(
            siteConfigDefault?.id || _siteConfigDefault!.id,
            params,
          );
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
