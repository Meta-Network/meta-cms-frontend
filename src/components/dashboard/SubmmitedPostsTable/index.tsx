import { getDefaultSiteConfigAPI } from '@/helpers';
import { fetchPostsStorage } from '@/services/api/meta-cms';
import { FetchPostsStorageParamsState } from '@/services/constants';
import { generateDataViewerLink } from '@/utils/editor';
import { LinkOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Image, Space, Typography } from 'antd';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';

export default () => {
  const intl = useIntl();
  const [siteConfigDefault, setSiteConfigDefault] = useState<CMS.SiteConfiguration | undefined>();

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
          ??????
        </Button>,
        <Button
          key="option-transfer"
          // onClick={() => transferDraft(record)}
        >
          ????????????
        </Button>,
      ],
    },
  ];

  return (
    <ProTable<CMS.Post>
      columns={columns}
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
          state: FetchPostsStorageParamsState.Posted,
        };
        const request = await fetchPostsStorage(
          siteConfigDefault?.id || _siteConfigDefault!.id,
          params,
        );

        // ???????????????????????? Promise,??????????????????????????????????????????
        // ???????????????????????????????????????????????????
        if (request?.data) {
          return {
            data: request.data.items,
            // success ????????? true???
            // ?????? table ???????????????????????????????????????
            success: true,
            // ??????????????? data ???????????????????????????????????????
            total: request.data.meta.totalItems,
          };
        }
        return { success: false };
      }}
      rowKey={(record) => record.id}
      search={false}
      form={{
        // ??????????????? transform????????????????????????????????????????????????????????????
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
