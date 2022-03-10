import { useModel } from '@@/plugin-model/useModel';
import { useEffect, useRef, useState } from 'react';

function usePrevious(value: any): string {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  // the very begging is unused
  return ref.current || '_nothing';
}

export default () => {
  const validations = useModel('deploySiteValidation');
  const [stepsStatus, setStepsStatus] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<string>('');

  const lastCurrent: string = usePrevious(currentStep);

  useEffect(() => {
    const last = lastCurrent;
    setStepsStatus((prev) => {
      const copy = { ...prev };
      const lastSuccess =
        lastCurrent === 'deploySetting'
          ? Object.values(validations).every((e: any) => e?.success)
          : validations[lastCurrent]?.success;

      copy[last] = lastSuccess ? 'finish' : 'error';
      copy[currentStep] = 'process';
      return copy;
    });
  }, [currentStep, lastCurrent, validations]);

  return {
    currentStep,
    stepsStatus,
    setCurrentStep,
  };
};
