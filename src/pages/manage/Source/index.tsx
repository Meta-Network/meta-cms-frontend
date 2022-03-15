import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import { useCallback, useEffect, useState } from 'react';
import { Button, List, message, notification, Spin, Tag } from 'antd';
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
  const { initialState } = useModel('@@initialState');
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [unbindLoading, setUnbindLoading] = useState<boolean>(false);
  const [sourceStatus, setSourceStatus] = useState<GLOBAL.SourcePlatformStatus>(status);

  const getUsername = useCallback(
    (platform: keyof GLOBAL.SourcePlatformStatus) => {
      if (sourceStatus[platform].username) {
        return `(${sourceStatus[platform].username})`;
      }
      return '';
    },
    [sourceStatus],
  );

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
          key="matataki_sync"
          onClick={async () => {
            setSyncLoading(true);
            const done = message.loading(intl.formatMessage({ id: 'messages.source.syncing' }), 0);
            try {
              await syncPostsRequest([{ platform: 'matataki' } as CMS.SourceStatusResponse]);
              message.success(intl.formatMessage({ id: 'messages.source.syncSuccess' }));
            } catch {
              message.error(intl.formatMessage({ id: 'messages.source.syncFailed' }));
            }
            done();
            setSyncLoading(false);
          }}
          type="primary"
        >
          {intl.formatMessage({ id: 'component.button.syncNow' })}
        </Button>
      ),
      bind: (
        <Button
          key="matataki_bind"
          onClick={() => {
            window.location.href = MATATAKI_DEVELOPER;
          }}
          type="primary"
        >
          {intl.formatMessage({ id: 'component.button.bind' })}
        </Button>
      ),
      unbind: (
        <Button
          loading={unbindLoading}
          key="matataki_unbind"
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
              copy.matataki.username = '';
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

  const getActions = (platform: GLOBAL.SourcePlatformStatusProperties) => {
    if (platform.active) {
      return [actionsOnPage[platform.name].sync, actionsOnPage[platform.name].unbind];
    } else {
      if (initialState?.siteConfig?.status === 'PUBLISHED') {
        return [actionsOnPage[platform.name].bind];
      } else {
        return [
          <Button
            key={`${platform.name}_bind_disabled`}
            onClick={() => {
              notification.warn({
                message: intl.formatMessage({ id: 'messages.syncCenter.noSiteConfig.title' }),
                description: intl.formatMessage({
                  id: 'messages.syncCenter.noSiteConfig.description',
                }),
              });
            }}
            type="primary"
          >
            {intl.formatMessage({ id: 'component.button.bind' })}
          </Button>,
        ];
      }
    }
  };

  const sourcePlatformsInformation = [
    {
      // Matataki [tag] (username)
      title: ['Matataki', getStatus(sourceStatus.matataki), getUsername('matataki')],
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
