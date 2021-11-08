import { getUsernameOfStore } from '@/services/api/global';
import { requestSocialAuth } from '@/services/api/meta-ucenter';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { useIntl } from 'umi';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Spin, Button, List, Tag } from 'antd';
import styles from './index.less';

export default () => {
  const intl = useIntl();
  const storeNames: string[] = useMemo(() => ['GitHub'], []);
  const [stores, setStores] = useState<
    {
      name: string;
      description: string;
      actions: any[];
      title: any;
      avatar: any;
    }[]
  >([
    {
      name: 'GitHub',
      description: intl.formatMessage({ id: 'guide.storage.githubDescription' }),
      actions: [],
      title: [],
      avatar: (
        <img
          className="icon"
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="github icon"
        />
      ),
    },
  ]);

  const bindRequest = async (name: string) => {
    const request = await requestSocialAuth(name.toLowerCase(), window.location.href);
    window.open(request.data, '_blank');
  };

  const getActionsAndTitle = useMemo(
    () => (store: typeof storeNames[number], username: string) => {
      if (username) {
        return {
          title: [
            store,
            <Tag className="status" color="blue">
              {intl.formatMessage({ id: 'component.status.alreadyBound' })}
            </Tag>,
            `(${username})`,
          ],
          actions: [
            <Button danger>{intl.formatMessage({ id: 'component.button.unbind' })}</Button>,
          ],
        };
      }
      return {
        title: [
          store,
          <Tag className="status" color="red">
            {intl.formatMessage({ id: 'component.status.notBound' })}
          </Tag>,
        ],
        actions: [
          <Button onClick={() => bindRequest(store)} type="primary">
            {intl.formatMessage({ id: 'component.button.bind' })}
          </Button>,
        ],
      };
    },
    [intl],
  );

  useEffect(() => {
    storeNames.forEach((name) => {
      getUsernameOfStore(name)
        .then((username) => {
          const { actions, title } = getActionsAndTitle(name, username);
          setStores((previous) => {
            const store = previous.find((e) => e.name === name);
            if (!store) {
              return previous;
            }
            const copy = previous.slice();
            const index = previous.findIndex((e) => e.name === name);
            store.actions = actions;
            store.title = title;

            copy[index] = store;
            return copy;
          });
        })
        .catch(() => null);
    });
  }, [getActionsAndTitle, storeNames]);

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'messages.storeSetting.title' })}
      content={<p>{intl.formatMessage({ id: 'messages.storeSetting.description' })}</p>}
      breadcrumb={{}}
    >
      <GridContent>
        <div className={styles.main}>
          <Fragment>
            <List
              itemLayout="horizontal"
              dataSource={stores}
              renderItem={(store) => {
                if (store.actions.length && store.title.length) {
                  return (
                    <List.Item actions={store.actions}>
                      <List.Item.Meta
                        avatar={store.avatar}
                        title={store.title}
                        description={store.description}
                      />
                    </List.Item>
                  );
                }
                return <Spin />;
              }}
            />
          </Fragment>
        </div>
      </GridContent>
    </PageContainer>
  );
};
