import { useCallback, useMemo, useState } from 'react';

export default () => {
  const [processing, setProcessing] = useState<GLOBAL.LogMessagesTemplate[]>([]);

  const updateProcessing = useCallback(
    (info: GLOBAL.LogMessagesTemplate) => {
      setProcessing((prev) => [...prev, info]);
    },
    [setProcessing],
  );

  const processingMessage = useMemo(() => {
    const updateByState = (state: 'info' | 'error' | 'success'): ((message: string) => void) => {
      return (message: string) => {
        updateProcessing({ message, state });
      };
    };
    return {
      info: updateByState('info'),
      success: updateByState('success'),
      error: updateByState('error'),
    };
  }, [updateProcessing]);

  // after the current stage work is done, continue to the next stage
  return {
    processing,
    processingMessage,
  };
};
