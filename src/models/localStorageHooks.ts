import { useModel } from 'umi';
import { useEffect, useMemo, useState } from 'react';

export default () => {
  const username = useModel('@@initialState').initialState?.currentUser?.username as string;

  const [domainSetting, setDomainSetting] = useState<string | null>();
  const [storageSetting, setStorageSetting] = useState<Partial<GLOBAL.StorageSetting>>();
  const [siteSetting, setSiteSetting] = useState<GLOBAL.SiteSetting>();

  const localStorageByUser = useMemo(() => {
    const getAndParse = (key: string) => JSON.parse(window.localStorage.getItem(key) || '{}');
    return {
      set: (key: string, value: any) => {
        if (username && value !== undefined) {
          const entity = getAndParse(key);
          entity[username] = value;
          window.localStorage.setItem(key, JSON.stringify(entity));
        }
      },
      get: (key: string) => getAndParse(key)[username],
    };
  }, [username]);

  // if the username has changed, update the states
  // in this way to create a two-way binding logic between localStorage and states
  useEffect(() => {
    setDomainSetting(localStorageByUser.get('domainSetting'));
    setStorageSetting(localStorageByUser.get('storageSetting'));
    setSiteSetting(localStorageByUser.get('siteSetting'));
  }, [localStorageByUser]);

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
