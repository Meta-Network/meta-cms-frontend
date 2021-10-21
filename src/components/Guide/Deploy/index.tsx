/* eslint-disable react-hooks/exhaustive-deps */
import {
  deployAndPublishSite,
  newSiteConfigSetting,
  newSiteInfoSetting,
  newSitePublishSetting,
  newSiteStorageSetting,
} from '@/services/api/meta-cms';
import { useIntl, useModel } from 'umi';
import { useEffect, useState } from 'react';
import type { MessageType } from 'antd/lib/message';
import generateTaggedInfo from './generateTaggedInfo';
import { message, Button, Card, notification } from 'antd';
import { DeployStages, Storages } from '@/services/constants';
import { validator } from './validator';
import styles from './index.less';

export default () => {
  let processDone: MessageType;

  const { siteSetting, storeSetting, themeSetting, domainSetting, setDeployedSite } =
    useModel('storage');
  const {
    onError,
    setOnError,
    processing,
    currentStage,
    setCurrentStage,
    stageCompleted,
    updateProcessing,
    setStageCompleted,
  } = useModel('guideStatus') as any;

  const intl = useIntl();
  const [configId, setConfigId] = useState<number>();

  // after the current stage work is done, continue to the next stage
  useEffect(() => {
    if (stageCompleted) {
      setStageCompleted(false);
      setCurrentStage(currentStage + 1);
    }
  }, [currentStage, stageCompleted]);

  // handle stage changes
  useEffect(() => {
    switch (currentStage) {
      case DeployStages.pending:
        break;
      case DeployStages.validating: {
        const validating = async () => {
          const validation = await Promise.all(
            Storages.map(async ({ name, key, value }) => {
              if (key === 'deploy') return null;
              const isSuccess = await validator(key || '', value);
              return isSuccess
                ? null
                : `${intl.formatMessage({ id: name })}：${intl.formatMessage({
                    id: 'messages.deployment.notFinished',
                  })}`;
            }),
          );

          const validated = validation.every((e) => e === null);

          if (validated) {
            updateProcessing({
              message: intl.formatMessage({ id: 'messages.deployment.validateSuccess' }),
              state: 'success',
            });
            setStageCompleted(true);
          } else {
            updateProcessing({
              message: intl.formatMessage({ id: 'messages.deployment.validateFailed' }),
              state: 'error',
            });
            validation
              .filter((e) => e)
              .forEach((e) => {
                updateProcessing({ message: e as string, state: 'error' });
              });
            setOnError(true);
          }
        };
        validating();
        break;
      }
      case DeployStages.submitting: {
        const submitting = async () => {
          processDone = message.loading(
            intl.formatMessage({ id: 'messages.deployment.deploying' }),
            0,
          );

          const infoSetting = await newSiteInfoSetting({
            title: siteSetting.title,
            subtitle: siteSetting.subtitle,
            description: siteSetting.description,
            author: siteSetting.author,
            keywords: siteSetting.keywords,
            favicon: siteSetting.favicon,
          });

          if (infoSetting.message === 'Ok') {
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.submitInfoSuccess',
              }),
              state: 'success',
            });
            // TODO: only for testing, delete this line if release
            updateProcessing({ message: `SiteInfoId: ${infoSetting.data.id}`, state: 'info' });
          } else {
            updateProcessing({
              info: intl.formatMessage(
                {
                  id: 'messages.deployment.submitInfoFailed',
                },
                { reason: infoSetting.message },
              ),
              state: 'error',
            });
            setOnError(true);
            return;
          }

          const configSetting = await newSiteConfigSetting(infoSetting.data.id, {
            language: siteSetting.language,
            timezone: siteSetting.timezone,
            templateId: themeSetting,
            metaSpacePrefix: domainSetting as string,
            domain: `${domainSetting}.${META_SPACE_BASE_DOMAIN}`,
          });
          setConfigId(configSetting.data.id);

          if (configSetting.message === 'Ok') {
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.submitConfigSuccess',
              }),
              state: 'success',
            });
            // TODO: only for testing, delete this line if release
            updateProcessing({
              message: `SiteConfigId: ${configSetting.data.id}。`,
              state: 'info',
            });
          } else {
            updateProcessing({
              message: intl.formatMessage(
                {
                  id: 'messages.deployment.submitConfigFailed',
                },
                {
                  reason: configSetting.message,
                },
              ),
              state: 'error',
            });
            setOnError(true);
            return;
          }

          const storageSetting = await newSiteStorageSetting(
            configSetting.data.id,
            storeSetting.storage.toLowerCase(),
            {
              userName: storeSetting.username,
              repoName: storeSetting.repo,
              branchName: 'master',
              dataType: 'HEXO',
              useGitProvider: true,
            },
          );

          if (storageSetting.message === 'Ok') {
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.submitSettingSuccess',
              }),
              state: 'success',
            });
            // TODO: only for testing, delete this line if release
            updateProcessing({
              message: `StorageSettingId: ${storageSetting.data.id}。`,
              state: 'info',
            });
          } else {
            updateProcessing({
              message: intl.formatMessage(
                {
                  id: 'messages.deployment.submitSettingFailed',
                },
                {
                  reason: storageSetting.message,
                },
              ),
              state: 'error',
            });
            setOnError(true);
            return;
          }

          const publishSetting = await newSitePublishSetting(
            configSetting.data.id,
            storeSetting.storage.toLowerCase(),
            {
              userName: storeSetting.username,
              repoName: storeSetting.repo,
              branchName: 'gh-pages',
              dataType: 'HEXO',
              useGitProvider: true,
              publishDir: 'public',
            },
          );

          if (publishSetting.message === 'Ok') {
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.submitPublishSuccess',
              }),
              state: 'success',
            });
            updateProcessing({
              message: `PublishSettingId: ${publishSetting.data.id}。`,
              state: 'info',
            });
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.awaitDeploying',
              }),
              state: 'info',
            });
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.pleaseWaitDeployingForMinutes',
              }),
              state: 'info',
            });
          } else {
            updateProcessing({
              message: intl.formatMessage(
                {
                  id: 'messages.deployment.submitPublishFailed',
                },
                {
                  reason: storageSetting.message,
                },
              ),
              state: 'error',
            });
            setOnError(true);
          }
        };
        submitting().then(() => {
          if (!onError) {
            setStageCompleted(true);
          }
        });
        break;
      }
      case DeployStages.deploying: {
        const deploying = async () => {
          const deployAndPublish = await deployAndPublishSite(configId as number);

          if (deployAndPublish.message === 'Ok') {
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.deployAndPublishSuccess',
              }),
              state: 'success',
            });
          } else {
            updateProcessing({
              message: intl.formatMessage(
                {
                  id: 'messages.deployment.deployAndPublishFailed',
                },
                {
                  reason: deployAndPublish.message,
                },
              ),
              state: 'error',
            });
            setOnError(true);
            return;
          }
          updateProcessing({
            message: intl.formatMessage({
              id: 'messages.deployment.AccessMetaSpaceFromTheSidebar',
            }),
            state: 'success',
          });
        };
        deploying().then(() => {
          processDone();
          notification.success({
            message: intl.formatMessage({
              id: 'notifications.deployment.taskFinished.title',
            }),
            description: intl.formatMessage({
              id: 'notifications.deployment.taskFinished.content',
            }),
            duration: 0,
          });
          setDeployedSite({
            title: siteSetting.title,
            domain: `${domainSetting}.${META_SPACE_BASE_DOMAIN}`,
          });
        });
        break;
      }
      default:
        break;
    }
  }, [currentStage]);

  // if facing into an error, prepare for the next run
  useEffect(() => {
    if (onError) {
      setCurrentStage(DeployStages.pending);
      updateProcessing({
        message: intl.formatMessage({
          id: 'messages.deployment.readyToStart',
        }),
        state: 'info',
      });
    }
  }, [onError]);

  return (
    <div className={styles.container}>
      <Card bordered className={styles.processing}>
        {processing.map(generateTaggedInfo)}
      </Card>

      {onError && (
        <p>
          {intl.formatMessage({
            id: 'messages.deployment.errorEncountered',
          })}
        </p>
      )}

      {currentStage === DeployStages.pending && (
        <>
          <Button
            onClick={() => {
              setOnError(false);
              setCurrentStage(DeployStages.validating);
            }}
            type="primary"
          >
            {intl.formatMessage({ id: 'component.button.submitSetting' })}
          </Button>
        </>
      )}
    </div>
  );
};
