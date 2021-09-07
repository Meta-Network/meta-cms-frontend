/* eslint-disable react-hooks/exhaustive-deps */
import { Storage, StorageKeys, StorageNames } from '@/services/constants';
import { postSiteConfig, postSiteInfo } from '@/services/api/meta-cms';
import { useCallback, useEffect, useState } from 'react';
import validator from '@/components/Guide/Deploy/validator';
import { Button, Tag } from 'antd';
import styles from '../styles.less';

enum Stages {
  pending,
  validating,
  submitting,
  deploying,
}

const getStorages = () =>
  // [ {name, key, value: 'valueHere'}, ... ]
  Object.entries(StorageNames).map(([name, key]) => ({
    name,
    key,
    value: key ? Storage.get(key) : key,
  }));

const generateTaggedInfo = (info: GLOBAL.LogMessagesTemplate) => {
  let color: string;

  switch (info.state) {
    case 'error':
      color = '#f50';
      break;
    case 'info':
      color = '#2db7f5';
      break;
    case 'success':
      color = '#87d068';
      break;
    default:
      color = '';
  }

  return color ? (
    <p>
      <Tag color={color}>{info.state}</Tag>
      {info.message}
    </p>
  ) : (
    info.message
  );
};

export default () => {
  const [currentStage, setCurrentStage] = useState<Stages>(Stages.pending);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [onError, setOnError] = useState<boolean | string>(false);
  const [processing, setProcessing] = useState<GLOBAL.LogMessagesTemplate[]>([
    { message: '准备开始...', state: 'info' },
  ]);

  const validating = useCallback(() => {
    // doesn't action when onError isn't false
    if (onError) {
      return;
    }

    const validation = getStorages().map(({ name, key, value }) =>
      !validator(key || '', value) ? `${name}：未完成` : null,
    );

    const validated = validation.every((e) => e === null);
    const processingCopy = [...processing];

    if (validated) {
      processingCopy.push({ message: '校验设置成功。', state: 'success' });
      setStageCompleted(true);
    } else {
      processingCopy.push({
        message: '校验设置失败。请检查以下您没有配置的设置。',
        state: 'error',
      });
      validation
        .filter((e) => e)
        .forEach((e) => {
          processingCopy.push({ message: e as string, state: 'error' });
        });
      setOnError(true);
    }

    setProcessing(processingCopy);
  }, [onError]);

  const submitting = useCallback(async () => {
    // doesn't action when onError isn't false
    if (onError) {
      return;
    }

    const siteForm = JSON.parse(Storage.get(StorageKeys.SiteInfo) as string);

    const processingCopy = [...processing];
    const submitSiteInfo = await postSiteInfo({
      title: siteForm.title,
      subtitle: siteForm.subtitle,
      description: siteForm.description,
      author: siteForm.author,
      keywords: siteForm.keywords,
      favicon: 'https://github.com/favicon.ico', // TODO: change this
    });

    if (submitSiteInfo.message === 'ok') {
      processingCopy.push({ message: '提交站点信息成功。', state: 'success' });
    } else {
      processingCopy.push({
        message: `提交站点信息失败，原因：${submitSiteInfo.message}`,
        state: 'error',
      });
      setOnError(true);
      return;
    }

    const submitSiteConfig = await postSiteConfig({
      // language: siteForm.language,
      // timezone: siteForm.timezone,
      // templateId: parseInt(Storage.get(StorageKeys.ThemeSetting) as string, 10),
      // domain: '',
    });

    if (submitSiteConfig.message === 'ok') {
      processingCopy.push({ message: '提交站点配置成功。', state: 'success' });
    } else {
      processingCopy.push({
        message: `提交站点配置失败，原因：${submitSiteConfig.message}`,
        state: 'error',
      });
      setOnError(true);
      return;
    }

    setProcessing(processingCopy);
    setStageCompleted(true);
  }, [onError]);

  const deploying = useCallback(async () => {
    // doesn't action when onError isn't false
    if (onError) {
      return;
    }

    const siteForm = JSON.parse(Storage.get(StorageKeys.SiteInfo) as string);

    const processingCopy = [...processing];
    const submitSiteInfo = await postSiteInfo({
      title: siteForm.title,
      subtitle: siteForm.subtitle,
      description: siteForm.description,
      author: siteForm.author,
      keywords: siteForm.keywords,
      favicon: 'https://github.com/favicon.ico', // TODO: change this
    });

    if (submitSiteInfo.message === 'ok') {
      processingCopy.push({ message: '提交站点信息成功。', state: 'success' });
    } else {
      processingCopy.push({
        message: `提交站点信息失败，原因：${submitSiteInfo.message}`,
        state: 'error',
      });
      setOnError(true);
      return;
    }

    const submitSiteConfig = await postSiteConfig({
      // language: siteForm.language,
      // timezone: siteForm.timezone,
      // templateId: parseInt(Storage.get(StorageKeys.ThemeSetting) as string, 10),
      // domain: '',
    });

    if (submitSiteConfig.message === 'ok') {
      processingCopy.push({ message: '提交站点配置成功。', state: 'success' });
    } else {
      processingCopy.push({
        message: `提交站点配置失败，原因：${submitSiteConfig.message}`,
        state: 'error',
      });
      setOnError(true);
      return;
    }

    setProcessing(processingCopy);
    setStageCompleted(true);
  }, [onError]);

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
      case Stages.pending:
        break;
      case Stages.validating: {
        validating();
        break;
      }
      case Stages.submitting: {
        submitting();
        break;
      }
      case Stages.deploying: {
        deploying();
        break;
      }
      default:
        break;
    }
  }, [currentStage, validating, deploying]);

  // when facing into error, prepare for next run
  useEffect(() => {
    if (onError) {
      setCurrentStage(Stages.pending);
      const processingCopy = [...processing];
      processingCopy.push({ message: '准备开始...', state: 'info' });
      setProcessing(processingCopy);
    }
  }, [onError]);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <p>完成设置后，请点击下方的按钮开始部署您的站点。</p>
        <p>你可以在下方看到部署的的进度。</p>
      </div>

      <pre>{processing.map(generateTaggedInfo)}</pre>

      {onError && <p>看起来你好像遇到了一个错误。别担心。按照提示来修改配置并重试就好。</p>}

      {currentStage === Stages.pending && (
        <>
          <Button
            onClick={() => {
              setOnError(false);
              setCurrentStage(Stages.validating);
            }}
            type="primary"
          >
            提交设置
          </Button>
        </>
      )}
    </div>
  );
};
