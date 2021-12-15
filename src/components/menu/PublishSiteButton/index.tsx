import { useIntl, useModel } from 'umi';
import { useEffect, useState } from 'react';
// import { UpOutlined } from '@ant-design/icons';
import { Button, message, notification, Dropdown } from 'antd';
import { deployAndPublishSite } from '@/services/api/meta-cms';
import styles from './index.less';
import Publish from '@/components/Submit/publish';
import { publishMetaSpaceRequest } from '@/utils/editor';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [publishButtonDisplay, setPublishButtonDisplay] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const { siteNeedToDeploy, setSiteNeedToDeploy } = useModel('storage');

  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

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

  const publishSiteRequest = async (gateway: boolean) => {
    const done = message.loading(intl.formatMessage({ id: 'messages.redeployment.taskStart' }), 0);
    setPublishLoading(true);

    if (initialState?.siteConfig?.id) {
      try {
        const metadataData = {
          authorPublishMetaSpaceRequestMetadataStorageType: 'ipfs' as CMS.MetadataStorageType,
          authorPublishMetaSpaceRequestMetadataRefer: '',
        };

        if (gateway) {
          if (!initialState?.siteConfig?.domain) {
            message.error(intl.formatMessage({ id: 'messages.redeployment.noSiteConfig' }));
            done();
            setPublishLoading(false);
            return;
          }

          const { metadataIpfs } = await publishMetaSpaceRequest({
            serverDomain: initialState?.siteConfig?.domain,
          });

          metadataData.authorPublishMetaSpaceRequestMetadataRefer = metadataIpfs.hash;
        }

        const response = await deployAndPublishSite({
          configId: initialState?.siteConfig?.id,
          ...metadataData,
        });
        if (response.statusCode === 201) {
          notification.success({
            message: intl.formatMessage({ id: 'messages.redeployment.taskSuccess.title' }),
            description: intl.formatMessage({
              id: 'messages.redeployment.taskSuccess.description',
            }),
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
      } catch (e: any) {
        if (e?.message) {
          if ((e.message as string).includes('empty seed')) {
            message.error('没有种子');
          } else if ((e.message as string).includes('upload fail')) {
            message.error('ipfs 上传失败');
          } else {
            message.error('失败');
          }
        } else {
          console.error(e);
          message.error('失败');
        }
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
      <Dropdown
        overlay={
          <Publish
            loading={publishLoading}
            setDropdownVisible={setDropdownVisible}
            handlePublish={publishSiteRequest}
          />
        }
        trigger={['click']}
        placement="topCenter"
        visible={dropdownVisible}
        onVisibleChange={(visible: boolean) => setDropdownVisible(visible)}
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
    </div>
  );
};
