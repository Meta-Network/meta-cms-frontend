import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

export default () => {
  const username = useModel('@@initialState').initialState?.currentUser?.username as string;

  const [domainSetting, setDomainSetting] = useState<string>('');
  const [storageSetting, setStorageSetting] = useState<Partial<GLOBAL.StorageSetting>>({});
  const [siteSetting, setSiteSetting] = useState<GLOBAL.SiteSetting>({} as GLOBAL.SiteSetting);

  const getUsersEntity = (key: string) => {
    let entity;
    try {
      entity = JSON.parse(window.localStorage.getItem(key) || '{}');
    } catch {
      entity = {};
    }
    return entity instanceof Object ? entity : {};
  };

  const localStorageByUser = useMemo(() => {
    return {
      set: (key: string, value: any) => {
        if (username && value !== undefined) {
          const entity = getUsersEntity(key);
          entity[username] = value;
          window.localStorage.setItem(key, JSON.stringify(entity));
        }
      },
      get: (key: string) => getUsersEntity(key)[username],
    };
  }, [username]);

  const setIfHasValue = useCallback(
    (setFn: React.Dispatch<React.SetStateAction<any>>, key: string, defaultVal: any) => {
      setFn(localStorageByUser.get(key) ?? defaultVal);
    },
    [localStorageByUser],
  );

  // if the username has changed, update the states
  // in this way to create a two-way binding logic between localStorage and states
  useEffect(() => {
    setIfHasValue(setDomainSetting, 'domainSetting', '');
    setIfHasValue(setStorageSetting, 'storageSetting', {});
    setIfHasValue(setSiteSetting, 'siteSetting', {});
  }, [localStorageByUser, setIfHasValue]);

  useEffect(() => {
    localStorageByUser.set('domainSetting', domainSetting);
  }, [localStorageByUser, domainSetting]);

  useEffect(() => {
    localStorageByUser.set('storageSetting', storageSetting);
  }, [localStorageByUser, storageSetting]);

  useEffect(() => {
    localStorageByUser.set('siteSetting', siteSetting);
  }, [localStorageByUser, siteSetting]);

  return {
    domainSetting,
    storageSetting,
    siteSetting,
    setDomainSetting,
    setStorageSetting,
    setSiteSetting,
  };
};
