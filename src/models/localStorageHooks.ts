import { useModel } from 'umi';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default () => {
  const username = useModel('@@initialState').initialState?.currentUser?.username as string;

  const [domainSetting, setDomainSetting] = useState<string>('');
  const [storageSetting, setStorageSetting] = useState<Partial<GLOBAL.StorageSetting>>({});
  const [siteSetting, setSiteSetting] = useState<GLOBAL.SiteSetting>({} as GLOBAL.SiteSetting);
  const [siteNeedToDeploy, setSiteNeedToDeploy] = useState<boolean>(false);

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
    setIfHasValue(setSiteNeedToDeploy, 'siteNeedToDeploy', false);
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

  useEffect(() => {
    localStorageByUser.set('siteNeedToDeploy', siteNeedToDeploy);
  }, [localStorageByUser, siteNeedToDeploy]);

  return {
    domainSetting,
    storageSetting,
    siteSetting,
    siteNeedToDeploy,
    setDomainSetting,
    setStorageSetting,
    setSiteSetting,
    setSiteNeedToDeploy,
  };
};
