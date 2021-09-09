import { Storages } from '@/services/constants';
import { useEffect, useRef, useState } from 'react';
import { validator } from '@/components/Guide/Deploy/validator';

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current || 0;
}

export default () => {
  const [stepStatus, setStepStatus] = useState(Array(10));
  const [current, setCurrent] = useState<number>(0);
  const lastCurrent = usePrevious(current);

  useEffect(() => {
    setStepStatus((prev) => {
      const copy = prev.slice();
      const lastIndex = lastCurrent;
      const storage = Storages[lastIndex];

      copy[lastIndex] = validator(storage.key, storage.value) ? 'finish' : 'error';
      copy[current] = 'process';

      return copy;
    });
  }, [current, lastCurrent]);

  return {
    current,
    setCurrent,
    stepStatus,
  };
};
