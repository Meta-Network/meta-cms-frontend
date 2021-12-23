import { useIntl } from 'umi';
import { useEffect, useState } from 'react';
import { Button, List, message, Spin, Tag } from 'antd';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { getSourceStatus } from '@/services/api/meta-cms';
import syncPostsRequest from '@/utils/sync-posts-request';
import FormattedDescription from '@/components/FormattedDescription';
import { deleteSourcePlatformToken } from '@/services/api/meta-ucenter';
import styles from './index.less';

/* The default status for every platform */
const status: GLOBAL.SourcePlatformStatus = {
  matataki: {
    name: 'matataki',
    active: false,
    username: '',
  },
};

export default () => {
  const intl = useIntl();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [unbindLoading, setUnbindLoading] = useState<boolean>(false);
  const [sourceStatus, setSourceStatus] = useState<GLOBAL.SourcePlatformStatus>(status);

  const getStatus = (platform: GLOBAL.SourcePlatformStatusProperties) =>
    platform.active ? (
      <Tag key={`${platform.name}_bind`} className="status" color="blue">
        {intl.formatMessage({ id: 'component.status.alreadyBound' })}
      </Tag>
    ) : (
      <Tag key={`${platform.name}_not_bind`} className="status" color="red">
        {intl.formatMessage({ id: 'component.status.notBound' })}
      </Tag>
    );

  const loadSourceStatus = async () => {
    const result = await getSourceStatus();
    setSourceStatus((source: GLOBAL.SourcePlatformStatus) => {
      const newStatus = { ...source };
      result.data.forEach((service: CMS.SourceStatusResponse) => {
        if (newStatus[service.platform]) {
          newStatus[service.platform].active = service.active;
          newStatus[service.platform].username = service.username;
        }
      });
      return newStatus;
    });
    setPageLoading(false);
  };

  useEffect(() => {
    loadSourceStatus();
  }, []);

  /* Actions on page for every platform */
  const actionsOnPage = {
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
          onClick={async () => {
            setUnbindLoading(true);
            const done = message.loading(
              intl.formatMessage({ id: 'messages.source.unbinding' }),
              0,
            );
            const result = await deleteSourcePlatformToken('matataki');
            if (result.statusCode === 200) {
              message.success(intl.formatMessage({ id: 'messages.source.unbindSuccess' }), 5);
            } else {
              message.error(intl.formatMessage({ id: 'messages.source.unbindFailed' }), 5);
            }
            await done();
            setUnbindLoading(false);
            setSourceStatus((source: GLOBAL.SourcePlatformStatus) => {
              const copy = { ...source };
              copy.matataki.active = false;
              return copy;
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

  const getActions = (platform: GLOBAL.SourcePlatformStatusProperties) =>
    platform.active
      ? [actionsOnPage[platform.name].sync, actionsOnPage[platform.name].unbind]
      : [actionsOnPage[platform.name].bind];

  const sourcePlatformsInformation = [
    {
      // Matataki [tag] (username)
      title: [
        'Matataki',
        getStatus(sourceStatus.matataki),
        sourceStatus.matataki.username ? `(${sourceStatus.matataki.username})` : '',
      ],
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
              dataSource={sourcePlatformsInformation}
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
