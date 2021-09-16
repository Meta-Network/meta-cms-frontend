import { useEffect, useState } from 'react';

export default () => {
  const [themeSetting, setThemeSetting] = useState<number>(
    JSON.parse(window.localStorage.getItem('themeSetting') || '-1'),
  );
  const [domainSetting, setDomainSetting] = useState<string | null>(
    JSON.parse(window.localStorage.getItem('domainSetting') || 'null'),
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
