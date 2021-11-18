import { fetchPostsPublished } from '@/services/api/meta-cms';
import { FormattedMessage, useIntl } from 'umi';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Image, Space, Typography } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { generateDataViewerLink } from '@/utils/editor';

export default () => {
  const intl = useIntl();

  const columns: ProColumns<CMS.Post>[] = [
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
            <FormattedMessage id="messages.table.noCoverExists" />
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
      title: intl.formatMessage({ id: 'messages.published.table.updateTime' }),
      key: 'showTime',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
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
    {
      dataIndex: 'serverVerificationMetadataRefer',
      title: intl.formatMessage({ id: 'messages.published.table.ipfsSignatureMetadata' }),
      width: 200,
      search: false,
      copyable: true,
      render: (_, record) => (
        <Space>
          {record.serverVerificationMetadataRefer ? (
            <>
              <Typography.Text copyable={{ text: record.serverVerificationMetadataRefer }}>
                <FormattedMessage id="messages.published.table.hasIPFSSignature" />
              </Typography.Text>
              <Button
                type="link"
                href={generateDataViewerLink(
                  record.serverVerificationMetadataStorageType,
                  record.serverVerificationMetadataRefer,
                )}
                target="_blank"
                icon={<LinkOutlined />}
                style={{ height: 'auto', width: 'auto' }}
              />
            </>
          ) : (
            <FormattedMessage id="messages.published.table.noIPFSSignature" />
          )}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'messages.syncCenter.table.actions' }),
      key: 'option',
      width: 290,
      valueType: 'option',
      render: () => [
        <Button
          key="option-publish"
          // onClick={() => publishSinglePost(record)}
        >
          编辑
        </Button>,
        <Button
          key="option-transfer"
          // onClick={() => transferDraft(record)}
        >
          移到草稿
        </Button>,
      ],
    },
  ];

  async function fetchPostsSubmitted(page: number, limit: number) {
    return await fetchPostsPublished(page, limit);
  }

  return (
    <ProTable<CMS.Post>
      columns={columns}
      request={async ({ pageSize, current }) => {
        const request = await fetchPostsSubmitted(current ?? 1, pageSize ?? 10);
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
      search={false}
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
      expandable={{
        expandedRowRender: (record: CMS.Post) => (
          <p dangerouslySetInnerHTML={{ __html: record.summary }} />
        ),
      }}
      dateFormatter="string"
      options={false}
    />
  );
};
