import { getGithubReposName } from '@/services/api/global';
import { isDomainForbidden } from '@/services/api/meta-cms';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

export default (): any => {
  const [domainSettingValidation, setDomainSettingValidation] = useState<boolean>(false);
  const [storageSettingValidation, setStorageSettingValidation] = useState<boolean>(false);
  const {
    domainSetting = '',
    storageSetting = {},
    siteSetting = {},
  } = useModel('localStorageHooks');

  useEffect(() => {
    const { storage, username, repos } = storageSetting;
    if (!(storage && username && repos)) {
      setStorageSettingValidation(false);
      return;
    }
    // TODO: handle this error, it indicates the GitHub token has been revoked
    getGithubReposName().then((repoNamesRequest) => {
      const repoNames = repoNamesRequest.map((name) => name.toLowerCase());
      setStorageSettingValidation(
        Boolean(!repoNames.includes(repos.storageRepo) && !repoNames.includes(repos.publishRepo)),
      );
    });
  }, [storageSetting]);

  useEffect(() => {
    isDomainForbidden(domainSetting || '').then((isForbidden) => {
      setDomainSettingValidation(!isForbidden);
    });
  }, [domainSetting]);

  const siteSettingValidation: boolean = useMemo(() => {
    const keys: (keyof GLOBAL.SiteSetting)[] = [
      'title',
      'subtitle',
      'author',
      'description',
      'language',
      'keywords',
      'favicon',
    ];
    return keys.every((key) => siteSetting?.hasOwnProperty(key));
  }, [siteSetting]);

  return {
    domainSetting: {
      success: domainSettingValidation,
      i18n: 'guide.domain.title',
    },
    siteSetting: {
      success: siteSettingValidation,
      i18n: 'guide.config.title',
    },
    storageSetting: {
      success: storageSettingValidation,
      i18n: 'guide.storage.title',
    },
  };
};
