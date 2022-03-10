import { getUsernameOfStorage } from '@/services/api/global';
import { requestSocialAuth } from '@/services/api/meta-ucenter';
import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import { useIntl } from 'umi';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Spin, Button, List, Tag } from 'antd';
import styles from './index.less';

export default () => {
  const intl = useIntl();
  const storageNames: string[] = useMemo(() => ['GitHub'], []);
  const [storages, setStorages] = useState<
    {
      name: string;
      description: JSX.Element;
      actions: JSX.Element[];
      title: (string | JSX.Element)[];
      avatar: JSX.Element;
    }[]
  >([
    {
      name: 'GitHub',
      description: <FormattedMessage id="guide.storage.githubDescription" />,
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
    () => (storage: typeof storageNames[number], username: string) => {
      if (username !== '') {
        return {
          title: [
            storage,
            <Tag key="alreadyBoundStatus" className="status" color="blue">
              <FormattedMessage id="component.status.alreadyBound" />
            </Tag>,
            `(${username})`,
          ],
          actions: [
            <Button key="unbindButton" disabled>
              <FormattedMessage id="component.button.unbind" />
            </Button>,
          ],
        };
      }
      return {
        title: [
          storage,
          <Tag key="notBindStatus" className="status" color="red">
            <FormattedMessage id="component.status.notBound" />
          </Tag>,
        ],
        actions: [
          <Button key="bindButton" disabled onClick={() => bindRequest(storage)} type="primary">
            <FormattedMessage id="component.button.bind" />
          </Button>,
        ],
      };
    },
    [],
  );

  useEffect(() => {
    storageNames.forEach((name) => {
      getUsernameOfStorage(name)
        .then((username) => {
          const { actions, title } = getActionsAndTitle(name, username);
          setStorages((previous) => {
            const storage = previous.find((e) => e.name === name);
            if (!storage) {
              return previous;
            }
            const copy = previous.slice();
            const index = previous.findIndex((e) => e.name === name);
            storage.actions = actions;
            storage.title = title;

            copy[index] = storage;
            return copy;
          });
        })
        .catch(() => {
          const { actions, title } = getActionsAndTitle(name, '');
          setStorages((previous) => {
            const storage = previous.find((e) => e.name === name);
            if (!storage) {
              return previous;
            }
            const copy = previous.slice();
            const index = previous.findIndex((e) => e.name === name);
            storage.actions = actions;
            storage.title = title;

            copy[index] = storage;
            return copy;
          });
        });
    });
  }, [getActionsAndTitle, storageNames]);

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'messages.storageSetting.title' })}
      content={<p>{intl.formatMessage({ id: 'messages.storageSetting.description' })}</p>}
      breadcrumb={{}}
    >
      <GridContent>
        <div className={styles.main}>
          <Fragment>
            <List
              itemLayout="horizontal"
              rowKey={(record) => record.name}
              dataSource={storages}
              renderItem={(storage) => {
                if (storage.title.length) {
                  return (
                    // <List.Item actions={storage.actions}>
                    // TODO: no actions are supported now
                    <List.Item>
                      <List.Item.Meta
                        avatar={storage.avatar}
                        title={storage.title}
                        description={storage.description}
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
