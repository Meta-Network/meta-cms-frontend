/* eslint-disable react-hooks/exhaustive-deps */
import { DeployStages } from '@/services/constants';
import { useModel } from '@@/plugin-model/useModel';
import { useCallback, useEffect } from 'react';
import { Button, Card } from 'antd';
import validating from './validator';
import submitting from './submitter';
import generateTaggedInfo from './generateTaggedInfo';
import styles from './index.less';

export default () => {
  const { initialState } = useModel('@@initialState');
  const {
    currentStage,
    setCurrentStage,
    stageCompleted,
    setStageCompleted,
    onError,
    setOnError,
    processing,
    updateProcessing,
  } = useModel('guideStatus');

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
          onError,
          setOnError,
          updateProcessing,
        });
        break;
      }
      case DeployStages.submitting: {
        submitting({
          initialState,
          onError,
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
      <div className={styles.info}>
        <p>完成设置后，请点击下方的按钮开始部署您的站点。</p>
        <p>你可以在下方看到部署的的进度。</p>
      </div>

      <Card bordered className={styles.processing}>
        {processing.map(generateTaggedInfo)}
      </Card>

      {onError && <p>看起来你好像遇到了一个错误。别担心。按照提示来修改配置并重试就好。</p>}

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
