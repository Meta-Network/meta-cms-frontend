import { useModel } from '@@/plugin-model/useModel';
import { useEffect, useState } from 'react';

export default () => {
  const username = useModel('@@initialState').initialState?.currentUser?.username;
  const getLocalStorage = (key: string) => JSON.parse(window.localStorage.getItem(key) || '{}');
  const generateSetFunction = (func: any) => {
    return (value: any, isUpdate = false) => {
      if (username) {
        if (isUpdate) {
          func((prev: any) => {
            const copy = { ...prev };
            copy[username] = { ...prev[username], ...value };
            return copy;
          });
        } else {
          func((prev: any) => {
            const copy = { ...prev };
            copy[username] = value;
            return copy;
          });
        }
      }
    };
  };

  // const [themeSetting, setThemeSetting] = useState<Record<string, number>>(
  //   getLocalStorage('themeSetting'),
  // );

  const [domainSettingInternal, setDomainSettingInternal] = useState<Record<string, string | null>>(
    getLocalStorage('domainSetting'),
  );

  const [storeSettingInternal, setStoreSettingInternal] = useState<
    Record<string, Partial<GLOBAL.StoreSetting>>
  >(getLocalStorage('storeSetting'));

  const [siteSettingInternal, setSiteSettingInternal] = useState<
    Record<string, GLOBAL.SiteSetting>
  >(getLocalStorage('siteSetting'));

  const [siteNeedToDeployInternal, setSiteNeedToDeployInternal] = useState<Record<string, boolean>>(
    getLocalStorage('siteNeedToDeploy'),
  );

  const setStorage = (key: string, value: any) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  useEffect(() => {
    setStorage('domainSetting', domainSettingInternal);
  }, [domainSettingInternal]);

  // useEffect(() => {
  //   setStorage('themeSetting', themeSetting);
  // }, [themeSetting]);

  useEffect(() => {
    setStorage('storeSetting', storeSettingInternal);
  }, [storeSettingInternal]);

  useEffect(() => {
    setStorage('siteSetting', siteSettingInternal);
  }, [siteSettingInternal]);

  useEffect(() => {
    setStorage('siteNeedToDeploy', siteNeedToDeployInternal);
  }, [siteNeedToDeployInternal]);

  const domainSetting = username ? domainSettingInternal[username] : '';
  const setDomainSetting = generateSetFunction(setDomainSettingInternal);

  const storeSetting = username
    ? storeSettingInternal[username]
    : ({} as Partial<GLOBAL.StoreSetting>);
  const setStoreSetting = generateSetFunction(setStoreSettingInternal);

  const siteSetting = username
    ? siteSettingInternal[username]
    : ({} as Partial<GLOBAL.SiteSetting>);
  const setSiteSetting = generateSetFunction(setSiteSettingInternal);

  const siteNeedToDeploy = username ? siteNeedToDeployInternal[username] : false;
  const setSiteNeedToDeploy = generateSetFunction(setSiteNeedToDeployInternal);

  return {
    domainSetting,
    setDomainSetting,
    // themeSetting,
    // setThemeSetting,
    storeSetting,
    setStoreSetting,
    siteSetting,
    setSiteSetting,
    siteNeedToDeploy,
    setSiteNeedToDeploy,
  };
};
