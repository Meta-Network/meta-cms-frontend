import { deleteSourcePlatformToken } from '@/services/api/meta-ucenter';
import { Button, List, message, Tag } from 'antd';
import { Fragment, useEffect, useState } from 'react';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { getSourceStatus, syncPostsByPlatform } from '@/services/api/meta-cms';
import styles from './index.less';

const status: GLOBAL.SourcePlatforms = {
  matataki: {
    name: 'matataki',
    active: false,
  },
};

export default () => {
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
            const done = message.loading('文章同步中，请稍候…', 0);
            syncPostsByPlatform('matataki').then((result) => {
              if (result.statusCode === 201) {
                message.success('文章同步成功！');
              } else {
                message.error('文章同步失败，请重新同步或绑定账号。');
              }
              done();
              setSyncLoading(false);
            });
          }}
          type="primary"
        >
          立即同步
        </Button>
      ),
      bind: (
        <Button
          onClick={() => {
            window.open('https://developer.matataki.io/app/44ba10e59e954bf4/oauth');
          }}
          type="primary"
        >
          绑定
        </Button>
      ),
      unbind: (
        <Button
          loading={unbindLoading}
          onClick={() => {
            setUnbindLoading(true);
            const done = message.loading('解绑中，请稍候…', 0);
            deleteSourcePlatformToken('matataki').then((result) => {
              if (result.statusCode === 200) {
                message.success('解绑成功。请刷新页面。');
              } else {
                message.error('解绑失败，请检查网络或登录状态。');
              }
              done();
              setUnbindLoading(false);
            });
          }}
          type="primary"
          danger
        >
          解绑
        </Button>
      ),
    },
  };

  const getStatus = (platform: GLOBAL.SourcePlatformProperties) =>
    platform.active ? (
      <Tag key={`${platform.name}_bind`} className="status" color="blue">
        已绑定
      </Tag>
    ) : (
      <Tag key={`${platform.name}_not_bind`} className="status" color="red">
        未绑定
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
      description: '每一篇自由的创作都应该被永远记录',
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
      title="内容源绑定"
      content={
        <div className="text-info">
          <p>你可以在此将其他平台的文章同步至你的个人站点。</p>
        </div>
      }
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
