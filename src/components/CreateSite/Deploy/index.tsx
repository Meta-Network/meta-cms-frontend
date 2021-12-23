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
import generateTaggedInfo from './generateTaggedInfo';
import { message, Button, Card, notification } from 'antd';
import { DeployStages, Storages } from '@/services/constants';
import { validator } from './validator';
import styles from './index.less';

export default () => {
  const { siteSetting, storeSetting, domainSetting } = useModel('storage');
  const { refresh, initialState } = useModel('@@initialState');
  const username = initialState!.currentUser!.username;
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

  // set default message
  useEffect(() => {
    updateProcessing({
      message: intl.formatMessage({ id: 'messages.deployment.readyToStart' }),
      state: 'info',
    });
  }, [updateProcessing]);

  // after the current stage work is done, continue to the next stage
  useEffect(() => {
    if (stageCompleted) {
      setStageCompleted(false);
      setCurrentStage(currentStage + 1);
    }
  }, [currentStage, stageCompleted]);

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

  // handle stage changes
  useEffect(() => {
    switch (currentStage) {
      case DeployStages.pending:
        break;
      case DeployStages.validating: {
        const validating = async () => {
          const validation = await Promise.all(
            Storages.map(async ({ title, key, value }) => {
              if (key === 'deploy') return null;
              let isSuccess: boolean;
              console.log({
                title,
                key,
                value,
              });
              if (value && username) {
                isSuccess = await validator(key, JSON.parse(value)[username]);
              } else {
                isSuccess = await validator(key, value);
              }
              return isSuccess
                ? null
                : `${intl.formatMessage({ id: title })}：${intl.formatMessage({
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
          const infoSetting = await newSiteInfoSetting({
            title: siteSetting.title!,
            subtitle: siteSetting.subtitle!,
            description: siteSetting.description!,
            author: siteSetting.author!,
            keywords: siteSetting.keywords!,
            favicon: new URL(siteSetting.favicon!).href,
          });

          if (infoSetting.message === 'Ok') {
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.submitInfoSuccess',
              }),
              state: 'success',
            });
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
            templateId: 1,
            metaSpacePrefix: domainSetting as string,
            // domain: `${domainSetting}.${META_SPACE_BASE_DOMAIN}`,
          });
          setConfigId(configSetting.data.id);

          if (configSetting.message === 'Ok') {
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.submitConfigSuccess',
              }),
              state: 'success',
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
            storeSetting!.storage!.toLowerCase(),
            {
              userName: storeSetting.username,
              repoName: storeSetting.repos!.storeRepo,
              branchName: 'master',
              dataType: 'HEXO',
              useGitProvider: true,
            },
          );

          if (storageSetting.message === 'Ok') {
            updateProcessing({
              message: intl.formatMessage({
                id: 'messages.deployment.submitStoreSuccess',
              }),
              state: 'success',
            });
          } else {
            updateProcessing({
              message: intl.formatMessage(
                {
                  id: 'messages.deployment.submitStoreFailed',
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
            storeSetting!.storage!.toLowerCase(),
            {
              userName: storeSetting.username,
              repoName: storeSetting.repos!.publishRepo,
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
          const done = message.loading(
            intl.formatMessage({ id: 'messages.deployment.deploying' }),
            0,
          );
          const deployAndPublish = await deployAndPublishSite({
            configId: configId as number,
            authorPublishMetaSpaceRequestMetadataStorageType: 'ipfs',
            authorPublishMetaSpaceRequestMetadataRefer: '',
          });

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
            throw new Error(deployAndPublish.message);
          }
          updateProcessing({
            message: intl.formatMessage({
              id: 'messages.deployment.AccessMetaSpaceFromTheSidebar',
            }),
            state: 'success',
          });
          done();
        };
        deploying()
          .then(() => {
            notification.success({
              message: intl.formatMessage({
                id: 'messages.deployment.taskFinished.title',
              }),
              description: intl.formatMessage({
                id: 'messages.deployment.taskFinished.description',
              }),
              duration: 0,
            });
            refresh();
          })
          .catch(() => {
            notification.error({
              message: intl.formatMessage({
                id: 'messages.deployment.taskFailed.title',
              }),
              description: intl.formatMessage({
                id: 'messages.deployment.taskFailed.description',
              }),
              duration: 0,
            });
          });
        break;
      }
      default:
        break;
    }
  }, [currentStage]);

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
