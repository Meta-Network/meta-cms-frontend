import { useIntl, useModel } from 'umi';
import { useEffect, useState } from 'react';
// import { UpOutlined } from '@ant-design/icons';
import { Button, message, notification, Dropdown } from 'antd';
import { deployAndPublishSite } from '@/services/api/meta-cms';
// import PublishButtonPopover from '@/components/menu/PublishSiteButton/PublishButtonPopover';
import styles from './index.less';
import Publish from '@/components/Submit/publish';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [publishButtonDisplay, setPublishButtonDisplay] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const { siteNeedToDeploy, setSiteNeedToDeploy } = useModel('storage');

  // If publishButtonDisplay is true, display the button when scrolling
  // but hide it if scrolled to the bottom
  useEffect(() => {
    if (siteNeedToDeploy) {
      setPublishButtonDisplay(true);
    }
  }, [siteNeedToDeploy]);

  useEffect(() => {
    const scrollListener = () => {
      if (window.innerHeight + window.scrollY < document.body.scrollHeight) {
        return setPublishButtonDisplay(true);
      }
      return setPublishButtonDisplay(false);
    };

    if (siteNeedToDeploy) {
      window.addEventListener('scroll', scrollListener);
    } else {
      window.removeEventListener('scroll', scrollListener);
    }
  }, [siteNeedToDeploy]);

  const publishSiteRequest = async () => {
    const done = message.loading(intl.formatMessage({ id: 'messages.redeployment.taskStart' }), 0);
    setPublishLoading(true);

    if (initialState?.siteConfig?.id) {
      const response = await deployAndPublishSite(initialState?.siteConfig?.id);
      if (response.statusCode === 201) {
        notification.success({
          message: intl.formatMessage({ id: 'messages.redeployment.taskSuccess.title' }),
          description: intl.formatMessage({ id: 'messages.redeployment.taskSuccess.description' }),
          duration: 0,
        });
        setSiteNeedToDeploy(false);
      } else {
        notification.error({
          message: intl.formatMessage({ id: 'messages.redeployment.taskFailed.title' }),
          description: intl.formatMessage({ id: 'messages.redeployment.taskFailed.description' }),
          duration: 0,
        });
      }
    } else {
      message.error(intl.formatMessage({ id: 'messages.redeployment.noSiteConfig' }));
    }

    done();
    setPublishLoading(false);
  };

  return (
    <div
      className={`${styles.publishButtonBackground}
        ${
          publishButtonDisplay
            ? styles.publishButtonBackgroundVisible
            : styles.publishButtonBackgroundInvisible
        }`}
    >
      {/*<PublishButtonPopover>*/}
      <Dropdown
        overlay={<Publish handlePublish={publishSiteRequest} />}
        trigger={['click']}
        placement="topCenter"
      >
        <Button
          key="publish-button"
          loading={publishLoading}
          className={styles.publishButton}
          type="primary"
        >
          {intl.formatMessage({ id: 'messages.redeployment.button' })}
          {/*<UpOutlined />*/}
        </Button>
      </Dropdown>
      {/*</PublishButtonPopover>*/}
    </div>
  );
};
