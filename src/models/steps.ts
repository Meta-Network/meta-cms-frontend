import { Storages } from '@/services/constants';
import { useModel } from '@@/plugin-model/useModel';
import { useEffect, useRef, useState } from 'react';
import { validator } from '@/components/CreateSite/Deploy/validator';

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current || 0;
}

export default () => {
  const username = useModel('@@initialState').initialState?.currentUser?.username;
  const [stepStatus, setStepStatus] = useState(Array(10));
  const [current, setCurrent] = useState<number>(0);
  const lastCurrent = usePrevious(current);

  useEffect(() => {
    const lastIndex = lastCurrent;
    const storage = Storages[lastIndex];
    let value: any = false;

    if (storage.value && username) {
      value = JSON.parse(storage.value)[username];
    }

    validator(storage.key, value).then((isSuccess: boolean) => {
      setStepStatus((prev) => {
        const copy = prev.slice();

        copy[lastIndex] = isSuccess ? 'finish' : 'error';
        copy[current] = 'process';

        return copy;
      });
    });
  }, [current, lastCurrent, username]);

  return {
    current,
    setCurrent,
    stepStatus,
  };
};
