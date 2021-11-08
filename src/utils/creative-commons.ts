import { getLocale } from 'umi';

const CreativeCommons = 'CC';
const Version = '4.0';

/**
 * CreativeCommons License Generator
 * @param {object} param 包含了 ShareAlike Noncommercial NoDerivativeWorks 三个属性的 object
 * @param {boolean} param.ShareAlike 可以自由复制、散布、展示及演出本作品；若您改变、转变或更改本作品，仅在遵守与本作品相同的许可条款下，您才能散布由本作品产生的派生作品。
 * @param {boolean} param.Noncommercial 可以自由复制、散布、展示及演出本作品；您不得为商业目的而使用本作品。
 * @param {boolean} param.NoDerivativeWorks 可以自由复制、散布、展示及演出本作品；您不得改变、转变或更改本作品
 */
export const creativeCommonsLicenseGenerator = ({
  ShareAlike = false,
  Noncommercial = false,
  NoDerivativeWorks = false,
}) => {
  if (ShareAlike && NoDerivativeWorks)
    throw new Error("You can't use ShareAlike and NoDerivativeWorks at the same time.");
  const result = ['BY']; // 自2004年以来，当前所有的许可协议要求必须原作者署名
  if (Noncommercial) result.push('NC');
  if (NoDerivativeWorks) result.push('ND');
  if (ShareAlike) result.push('SA');

  result.unshift(CreativeCommons);
  result.push(Version);
  return result.join('-');
};

/**
 * extract license
 * CC-BY-4.0
 * return BY
 * @param license license string
 * @returns license
 */
export const extractLicense = (license: string) => {
  const reg = /^CC\-.*?\-4\.0/g;
  const include = reg.test(license);
  reg.lastIndex = 0;
  if (include) {
    // CC-**-4.0
    return license.slice(3, license.length - 4);
  } else {
    return license;
  }
};

/**
 * license link
 * @param license
 * @returns
 */
export const licenseDetailLink = (license: string) => {
  const language = {
    'zh-CN': 'zh',
    'en-US': 'en',
  };
  console.log('getLocale', getLocale());
  return `https://creativecommons.org/licenses/${license.toLowerCase()}/4.0/deed.${
    language[getLocale()] || language['zh-CN']
  }`;
};
