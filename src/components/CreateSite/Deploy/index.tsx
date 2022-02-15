import {
  deploySite,
  newSiteConfigSetting,
  newSiteInfoSetting,
  newSitePublishSetting,
  newSiteStorageSetting,
  updateSiteConfigSetting,
  updateSiteInfoSetting,
  updateSitePublishSetting,
  updateSiteStorageSetting,
} from '@/services/api/meta-cms';
import { useIntl, useModel } from 'umi';
import { useEffect, useState } from 'react';
import generateTaggedInfo from './generateTaggedInfo';
import { message, Button, Card, notification } from 'antd';
import styles from './index.less';

export default () => {
  const { refresh, initialState } = useModel('@@initialState');
  const validations = useModel('deploySiteValidation');

  const { siteSetting, storageSetting, domainSetting } = useModel('localStorageHooks');
  const { processing, processingMessage } = useModel('deploySiteProcessing');

  const intl = useIntl();
  const [ableToStart, setAbleToStart] = useState<boolean>(true);

  // set default message
  useEffect(() => {
    processingMessage.info(intl.formatMessage({ id: 'messages.deployment.readyToStart' }));
  }, [intl, processingMessage]);

  // step 1 - validate all settings
  const validate = async () => {
    if (Object.values(validations).every((r: any) => r?.success)) {
      processingMessage.success(intl.formatMessage({ id: 'messages.deployment.validateSuccess' }));
    } else {
      Object.values(validations).forEach((r: any) => {
        if (!r.success) {
          processingMessage.error(
            `${intl.formatMessage({ id: r.i18n })}：${intl.formatMessage({
              id: 'messages.deployment.notFinished',
            })}`,
          );
        }
      });
      throw new Error(intl.formatMessage({ id: 'messages.deployment.validateFailed' }));
    }
  };

  // step 2 - submit all settings
  const submit = async (): Promise<{ configId: number }> => {
    let createOrUpdateSiteInfo;
    let createOrUpdateSiteConfig;
    let createOrUpdateSiteStorage;
    let createOrUpdateSitePublish;

    if (initialState?.siteConfig) {
      createOrUpdateSiteInfo = (body: CMS.SiteInfoSettingRequest) =>
        updateSiteInfoSetting(initialState?.siteConfig?.siteInfo.id as number, body);
      createOrUpdateSiteConfig = (_: number, body: CMS.SiteConfigSettingRequest) =>
        updateSiteConfigSetting(initialState?.siteConfig?.id as number, body);
      createOrUpdateSiteStorage = updateSiteStorageSetting;
      createOrUpdateSitePublish = updateSitePublishSetting;
    } else {
      createOrUpdateSiteInfo = newSiteInfoSetting;
      createOrUpdateSiteConfig = newSiteConfigSetting;
      createOrUpdateSiteStorage = newSiteStorageSetting;
      createOrUpdateSitePublish = newSitePublishSetting;
    }

    const validatedSiteSettings = siteSetting as GLOBAL.SiteSetting;
    const infoSetting = await createOrUpdateSiteInfo({
      title: validatedSiteSettings.title,
      subtitle: validatedSiteSettings.subtitle,
      description: validatedSiteSettings.description,
      author: validatedSiteSettings.author,
      keywords: validatedSiteSettings.keywords,
      favicon: new URL(validatedSiteSettings.favicon).href,
    });

    if (infoSetting.message !== 'Ok') {
      throw new Error(intl.formatMessage({ id: 'messages.deployment.submitInfoFailed' }));
    }

    processingMessage.success(intl.formatMessage({ id: 'messages.deployment.submitInfoSuccess' }));

    const configSetting = await createOrUpdateSiteConfig(infoSetting.data.id, {
      language: validatedSiteSettings.language,
      timezone: validatedSiteSettings.timezone,
      templateId: 1,
      metaSpacePrefix: domainSetting as string,
      // domain: `${domainSetting}.${META_SPACE_BASE_DOMAIN}`,
    });

    if (configSetting.message !== 'Ok') {
      throw new Error(
        intl.formatMessage(
          { id: 'messages.deployment.submitConfigFailed' },
          { reason: configSetting.message },
        ),
      );
    }

    processingMessage.success(
      intl.formatMessage({ id: 'messages.deployment.submitConfigSuccess' }),
    );
    const configId = configSetting.data.id;

    const validatedStorageSettings = storageSetting as GLOBAL.StorageSetting;
    const newStorageSetting = await createOrUpdateSiteStorage(
      configId,
      validatedStorageSettings.storage.toLowerCase(),
      {
        userName: validatedStorageSettings.username,
        repoName: validatedStorageSettings.repos!.storageRepo,
        branchName: 'master',
        dataType: 'HEXO',
        useGitProvider: true,
      },
    );

    if (newStorageSetting.message !== 'Ok') {
      throw new Error(
        intl.formatMessage(
          { id: 'messages.deployment.submitStorageFailed' },
          { reason: newStorageSetting.message },
        ),
      );
    }

    processingMessage.success(
      intl.formatMessage({ id: 'messages.deployment.submitStorageSuccess' }),
    );

    const publishSetting = await createOrUpdateSitePublish(
      configId,
      storageSetting!.storage!.toLowerCase(),
      {
        userName: validatedStorageSettings.username,
        repoName: validatedStorageSettings.repos!.publishRepo,
        branchName: 'gh-pages',
        dataType: 'HEXO',
        useGitProvider: true,
        publishDir: 'public',
      },
    );

    if (publishSetting.message !== 'Ok') {
      throw new Error(
        intl.formatMessage(
          { id: 'messages.deployment.submitPublishFailed' },
          { reason: publishSetting.message },
        ),
      );
    }
    processingMessage.success(
      intl.formatMessage({ id: 'messages.deployment.submitPublishSuccess' }),
    );
    processingMessage.info(intl.formatMessage({ id: 'messages.deployment.awaitDeploying' }));
    processingMessage.info(
      intl.formatMessage({ id: 'messages.deployment.pleaseWaitDeployingForMinutes' }),
    );

    return { configId };
  };

  const deploy = async (configId: number) => {
    const done = message.loading(intl.formatMessage({ id: 'messages.deployment.deploying' }), 0);
    let deployAndPublish: GLOBAL.GeneralResponse<any> | Error;

    // ignore errors accord when deployed, to set the loading indicator as done
    try {
      deployAndPublish = await deploySite({
        siteConfigId: configId,
      });
    } catch (error) {
      deployAndPublish = error as Error;
    }
    done();

    if (deployAndPublish?.message !== 'Ok') {
      notification.error({
        message: intl.formatMessage({
          id: 'messages.deployment.taskFailed.title',
        }),
        description: intl.formatMessage({
          id: 'messages.deployment.taskFailed.description',
        }),
        duration: 0,
      });
      throw new Error(
        intl.formatMessage(
          { id: 'messages.deployment.deployAndPublishFailed' },
          { reason: deployAndPublish.message },
        ),
      );
    }
    processingMessage.success(
      intl.formatMessage({ id: 'messages.deployment.deployAndPublishSuccess' }),
    );
    processingMessage.success(
      intl.formatMessage({ id: 'messages.deployment.AccessMetaSpaceFromTheSidebar' }),
    );
    notification.success({
      message: intl.formatMessage({
        id: 'messages.deployment.taskFinished.title',
      }),
      description: intl.formatMessage({
        id: 'messages.deployment.taskFinished.description',
      }),
      duration: 0,
    });
    refresh().then();
  };

  const startDeploy = async () => {
    try {
      setAbleToStart(false);
      await validate();
      const { configId } = await submit();
      await deploy(configId);
    } catch (error) {
      let errMessage: any = (error as Error).message;
      if (typeof errMessage !== 'string') {
        // deal with the error object
        errMessage = errMessage.message;
      }
      processingMessage.error(errMessage);
      processingMessage.info(intl.formatMessage({ id: 'messages.deployment.readyToStart' }));
      setAbleToStart(true);
    }
  };
  return (
    <div className={styles.container}>
      <Card bordered className={styles.processing}>
        {processing.map(generateTaggedInfo)}
      </Card>

      <Button hidden={!ableToStart} onClick={startDeploy} type="primary">
        {intl.formatMessage({ id: 'component.button.submitSetting' })}
      </Button>
    </div>
  );
};
