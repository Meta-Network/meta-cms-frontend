import { deleteSourcePlatformToken } from '@/services/api/meta-ucenter';
import { Button, List, message, Tag } from 'antd';
import { Fragment, useEffect, useState } from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { getSourceStatus, syncPostsByPlatform } from '@/services/api/meta-cms';
import styles from './index.less';
import { useIntl } from 'umi';
import FormattedInfo from '@/components/FormattedDescription';

const status: GLOBAL.SourcePlatforms = {
  matataki: {
    name: 'matataki',
    active: false,
  },
};

export default () => {
  const intl = useIntl();
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [unbindLoading, setUnbindLoading] = useState<boolean>(false);
  const [sourceStatus, setSourceStatus] = useState<GLOBAL.SourcePlatforms>(status);

  const actions = {
    matataki: {
      sync: (
        <Button
          loading={syncLoading}
          onClick={() => {
            setSyncLoading(true);
            const done = message.loading(intl.formatMessage({ id: 'messages.source.syncing' }), 0);
            syncPostsByPlatform('matataki').then((result) => {
              if (result.statusCode === 201) {
                message.success(intl.formatMessage({ id: 'messages.source.syncSuccess' }), 0);
              } else {
                message.error(intl.formatMessage({ id: 'messages.source.syncFailed' }), 0);
              }
              done();
              setSyncLoading(false);
            });
          }}
          type="primary"
        >
          {intl.formatMessage({ id: 'component.button.syncNow' })}
        </Button>
      ),
      bind: (
        <Button
          onClick={() => {
            window.open('https://developer.matataki.io/app/44ba10e59e954bf4/oauth');
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
    });
  }, []);

  const sourcePlatforms = [
    {
      title: ['Matataki', getStatus(sourceStatus.matataki)],
      description: intl.formatMessage({ id: 'messages.source.matatakiDescription' }),
      actions: getActions(sourceStatus.matataki),
      avatar: (
        <img
          className="icon"
          src="https://cdn.frontenduse.top/prod/img/dapp_list_matataki.8bac289.png"
          alt="matataki icon"
        />
      ),
    },
  ];

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'messages.source.title' })}
      content={<FormattedInfo id="messages.source.description" />}
      breadcrumb={{}}
    >
      <GridContent>
        <div className={styles.main}>
          <Fragment>
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
          </Fragment>
        </div>
      </GridContent>
    </PageContainer>
  );
};
