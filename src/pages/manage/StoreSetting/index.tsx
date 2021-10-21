import { useIntl } from 'umi';
import { Fragment } from 'react';
import { Button, List, Tag } from 'antd';
import { GridContent, PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';

export default () => {
  const intl = useIntl();
  const stores = [
    {
      title: [
        'GitHub',
        <Tag className="status" color="red">
          {intl.formatMessage({ id: 'component.status.notBound' })}
        </Tag>,
      ],
      description: intl.formatMessage({ id: 'guide.storage.githubDescription' }),
      actions: [
        <Button type="primary">{intl.formatMessage({ id: 'component.button.bind' })}</Button>,
      ],
      avatar: (
        <img
          className="icon"
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="github icon"
        />
      ),
    },
    {
      title: [
        'Gitee',
        <Tag className="status" color="blue">
          {intl.formatMessage({ id: 'component.status.alreadyBound' })}
        </Tag>,
      ],
      actions: [<Button danger>{intl.formatMessage({ id: 'component.button.unbind' })}</Button>],
      description: intl.formatMessage({ id: 'guide.storage.giteeDescription' }),
      avatar: (
        <img
          className="icon"
          src="https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/9357cf7a0529738c587b"
          alt="gitee icon"
        />
      ),
    },
  ];
  return (
    <PageContainer
      title={intl.formatMessage({ id: 'messages.storeSetting.title' })}
      content={<p>{intl.formatMessage({ id: 'messages.storeSetting.info' })}</p>}
      breadcrumb={{}}
    >
      <GridContent>
        <div className={styles.main}>
          <Fragment>
            <List
              itemLayout="horizontal"
              dataSource={stores}
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
