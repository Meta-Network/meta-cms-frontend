import { useEffect, useState } from 'react';

export default () => {
  const [themeSetting, setThemeSetting] = useState<number>(
    parseInt(window.localStorage.getItem('themeSetting') || '-1', 10),
  );
  const [domainSetting, setDomainSetting] = useState<string>(
    window.localStorage.getItem('domainSetting') || '',
  );
  const [storeSetting, setStoreSetting] = useState<GLOBAL.StoreSetting>(
    JSON.parse(window.localStorage.getItem('storeSetting') || '{}'),
  );
  const [siteSetting, setSiteSetting] = useState<GLOBAL.SiteSetting>(
    JSON.parse(window.localStorage.getItem('siteSetting') || '{}'),
  );

  const setStorage = (key: string, value: any) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  useEffect(() => {
    setStorage('domainSetting', domainSetting);
  }, [domainSetting]);

  useEffect(() => {
    setStorage('themeSetting', themeSetting);
  }, [themeSetting]);

  useEffect(() => {
    setStorage('storeSetting', storeSetting);
  }, [storeSetting]);

  useEffect(() => {
    setStorage('siteSetting', siteSetting);
  }, [siteSetting]);

  return {
    domainSetting,
    setDomainSetting,
    themeSetting,
    setThemeSetting,
    storeSetting,
    setStoreSetting,
    siteSetting,
    setSiteSetting,
  };
};
