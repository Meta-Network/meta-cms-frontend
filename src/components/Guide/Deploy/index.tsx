/* eslint-disable react-hooks/exhaustive-deps */
import { DeployStages } from '@/services/constants';
import { useModel } from '@@/plugin-model/useModel';
import { useCallback, useEffect } from 'react';
import { Button, Card } from 'antd';
import { validating } from './validator';
import submitting from './submitter';
import generateTaggedInfo from './generateTaggedInfo';
import styles from './index.less';

export default () => {
  const { siteSetting, storeSetting, themeSetting, domainSetting } = useModel('storage');
  const {
    currentStage,
    setCurrentStage,
    stageCompleted,
    setStageCompleted,
    onError,
    setOnError,
    processing,
    updateProcessing,
  } = useModel('guideStatus') as any;

  // after the current stage work is done, continue to the next stage
  useEffect(() => {
    if (stageCompleted) {
      setStageCompleted(false);
      setCurrentStage(currentStage + 1);
    }
  }, [currentStage, stageCompleted]);

  const deploying = useCallback(async () => {}, [onError]);

  // handle stage changes
  useEffect(() => {
    switch (currentStage) {
      case DeployStages.pending:
        break;
      case DeployStages.validating: {
        validating({
          setStageCompleted,
          setOnError,
          updateProcessing,
        });
        break;
      }
      case DeployStages.submitting: {
        submitting({
          siteSetting,
          themeSetting,
          storeSetting,
          domainSetting,
          setOnError,
          setStageCompleted,
          updateProcessing,
        });
        break;
      }
      case DeployStages.deploying: {
        deploying();
        break;
      }
      default:
        break;
    }
  }, [currentStage]);

  // when facing into error, prepare for next run
  useEffect(() => {
    if (onError) {
      setCurrentStage(DeployStages.pending);
      updateProcessing({ message: '准备开始...', state: 'info' });
    }
  }, [onError]);

  return (
    <div className={styles.container}>
      <Card bordered className={styles.processing}>
        {processing.map(generateTaggedInfo)}
      </Card>

      {onError && <p>看起来遇到了错误，请按照提示来修改设置并重新提交</p>}

      {currentStage === DeployStages.pending && (
        <>
          <Button
            onClick={() => {
              setOnError(false);
              setCurrentStage(DeployStages.validating);
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
