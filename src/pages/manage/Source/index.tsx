import FormattedDescription from '@/components/FormattedDescription';
import { getSourceStatus } from '@/services/api/meta-cms';
import { deleteSourcePlatformToken } from '@/services/api/meta-ucenter';
import syncPostsRequest from '@/utils/sync-posts-request';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { Button, List, message, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useIntl } from 'umi';
import styles from './index.less';

const status: GLOBAL.SourcePlatforms = {
  matataki: {
    name: 'matataki',
    active: false,
  },
};

export default () => {
  const intl = useIntl();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [unbindLoading, setUnbindLoading] = useState<boolean>(false);
  const [sourceStatus, setSourceStatus] = useState<GLOBAL.SourcePlatforms>(status);

  const actions = {
    matataki: {
      sync: (
        <Button
          loading={syncLoading}
          onClick={async () => {
            setSyncLoading(true);
            const done = message.loading(intl.formatMessage({ id: 'messages.source.syncing' }), 0);
            await syncPostsRequest((await getSourceStatus()).data);
            done();
            message.success(intl.formatMessage({ id: 'messages.source.syncSuccess' }));
            setSyncLoading(false);
          }}
          type="primary"
        >
          {intl.formatMessage({ id: 'component.button.syncNow' })}
        </Button>
      ),
      bind: (
        <Button
          onClick={() => {
            window.location.href = 'https://developer.matataki.io/app/44ba10e59e954bf4/oauth';
          }}
          type="primary"
        >
          {intl.formatMessage({ id: 'component.button.bind' })}
        </Button>
      ),
      unbind: (
        <Button
          loading={unbindLoading}
          onClick={() => {
            setUnbindLoading(true);
            const done = message.loading(
              intl.formatMessage({ id: 'messages.source.unbinding' }),
              0,
            );
            deleteSourcePlatformToken('matataki').then((result) => {
              if (result.statusCode === 200) {
                message.success(intl.formatMessage({ id: 'messages.source.unbindSuccess' }), 0);
              } else {
                message.error(intl.formatMessage({ id: 'messages.source.unbindFailed' }), 0);
              }
              done();
              setUnbindLoading(false);
            });
          }}
          type="primary"
          danger
        >
          {intl.formatMessage({ id: 'component.button.unbind' })}
        </Button>
      ),
    },
  };

  const getStatus = (platform: GLOBAL.SourcePlatformProperties) =>
    platform.active ? (
      <Tag key={`${platform.name}_bind`} className="status" color="blue">
        {intl.formatMessage({ id: 'component.status.alreadyBound' })}
      </Tag>
    ) : (
      <Tag key={`${platform.name}_not_bind`} className="status" color="red">
        {intl.formatMessage({ id: 'component.status.notBound' })}
      </Tag>
    );

  const getActions = (platform: GLOBAL.SourcePlatformProperties) =>
    platform.active
      ? [actions[platform.name].sync, actions[platform.name].unbind]
      : [actions[platform.name].bind];

  useEffect(() => {
    getSourceStatus().then((result) => {
      setSourceStatus((source: GLOBAL.SourcePlatforms) => {
        const copy = { ...source };
        result.data.forEach((service: CMS.SourceStatusResponse) => {
          if (copy[service.platform]) {
            copy[service.platform].active = service.active;
          }
        });
        return copy;
      });
      setPageLoading(false);
    });
  }, []);

  const sourcePlatforms = [
    {
      title: ['Matataki', getStatus(sourceStatus.matataki)],
      description: intl.formatMessage({ id: 'messages.source.matatakiDescription' }),
      actions: getActions(sourceStatus.matataki),
      avatar: <img className="icon" src="/icons/custom/matataki.png" alt="matataki icon" />,
    },
  ];

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'messages.source.title' })}
      content={<FormattedDescription id="messages.source.description" />}
      breadcrumb={{}}
    >
      <GridContent>
        <div className={styles.main}>
          {pageLoading ? (
            <Spin />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={sourcePlatforms}
              renderItem={(item) => (
                <List.Item actions={item.actions}>
                  <List.Item.Meta
                    avatar={item.avatar}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </GridContent>
    </PageContainer>
  );
};
