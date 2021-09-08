import { useCallback, useState } from 'react';
import { DeployStages } from '@/services/constants';

export default () => {
  const [onError, setOnError] = useState<boolean | string>(false);
  const [currentStage, setCurrentStage] = useState<DeployStages>(DeployStages.pending);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [processing, setProcessing] = useState<GLOBAL.LogMessagesTemplate[]>([
    { message: '准备开始...', state: 'info' },
  ]);

  const updateProcessing = useCallback((info: GLOBAL.LogMessagesTemplate) => {
    setProcessing((prev) => [...prev, info]);
  }, []);

  return {
    currentStage,
    setCurrentStage,
    stageCompleted,
    setStageCompleted,
    onError,
    setOnError,
    processing,
    updateProcessing,
  };
};
