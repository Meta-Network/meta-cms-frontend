import React from 'react';
import { Button } from 'antd';
// import { useIntl } from 'umi';
import useSWR, { useSWRConfig } from 'swr';
import {
  pipelinesSiteOrdersPublishQueue,
  pipelinesSiteOrdersPublishQueueUrl,
} from '@/services/api/meta-cms';
import { postPolling } from '../../../../../config';

interface Props {
  readonly siteOrdersPublishState: boolean;
  siteOrdersPublish: () => Promise<void>;
}

const PublishQueue: React.FC<Props> = ({ siteOrdersPublishState, siteOrdersPublish }) => {
  const { mutate } = useSWRConfig();
  // const intl = useIntl();

  const { data, error } = useSWR(
    pipelinesSiteOrdersPublishQueueUrl,
    pipelinesSiteOrdersPublishQueue,
    {
      refreshInterval: postPolling,
    },
  );
  if (error) return null;
  if (!data) return <Button key="button">Loading</Button>;
  if (data && data.statusCode !== 200) return null;

  const siteOrdersPublishFn = async () => {
    await siteOrdersPublish();
    // 手动触发一次
    mutate(pipelinesSiteOrdersPublishQueueUrl);
  };

  return (
    <>
      {data.data.pending ? (
        <Button key="button" disabled>
          等待发布 #{data.data.pending.id}
        </Button>
      ) : data.data.doing ? (
        <Button key="button" disabled>
          正在发布 #{data.data.doing.id}
        </Button>
      ) : (
        <Button key="button" loading={siteOrdersPublishState} onClick={() => siteOrdersPublishFn()}>
          立即开始发布
        </Button>
      )}
    </>
  );
};

export default PublishQueue;
