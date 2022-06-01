import {
  pipelinesSiteOrdersPublishQueue,
  pipelinesSiteOrdersPublishQueueUrl,
} from '@/services/api/meta-cms';
import { Button } from 'antd';
import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useIntl } from 'umi';
import { postPolling } from '../../../../../config';

interface Props {
  readonly siteOrdersPublishState: boolean;
  siteOrdersPublish: () => Promise<void>;
}

const PublishQueue: React.FC<Props> = ({ siteOrdersPublishState, siteOrdersPublish }) => {
  const intl = useIntl();
  const { mutate } = useSWRConfig();

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
          {intl.formatMessage({ id: 'posts.publishing.queue.pending' })} #{data.data.pending.id}
        </Button>
      ) : data.data.doing ? (
        <Button key="button" disabled>
          {intl.formatMessage({ id: 'posts.publishing.queue.doing' })} #{data.data.doing.id}
        </Button>
      ) : (
        <Button key="button" loading={siteOrdersPublishState} onClick={() => siteOrdersPublishFn()}>
          {intl.formatMessage({ id: 'posts.publishing.queue.default' })}
        </Button>
      )}
    </>
  );
};

export default PublishQueue;
