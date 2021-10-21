import { useState } from 'react';

export default () => {
  const [lockedConfigs, updateLockedConfigs] = useState<{ id: number; state: boolean }[]>([]);

  const getLockedConfigState = (id: number) =>
    lockedConfigs.find((config) => config.id === id)?.state;

  const setLockedConfig = (id: number, state: boolean) => {
    updateLockedConfigs((prev) => {
      const copy = prev;
      const config = copy.find((e) => e.id === id);
      if (config) {
        config.state = state;
      } else {
        copy.push({ id, state });
      }
      return copy;
    });
  };

  return {
    getLockedConfigState,
    setLockedConfig,
  };
};
