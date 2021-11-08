import { useCallback } from 'react';
// import { useIntl } from 'umi';

export default function useCreativeCommons() {
  // const intl = useIntl();

  const convertLicenseToDeedTitle = useCallback((license: string) => {
    // intl.formatMessage({
    //   id: 'messages.editor.success',
    // })
    const language = {
      BY: '署名',
      NC: '非商业性使用',
      ND: '禁止演绎',
      SA: '相同方式共享',
    };
    return license
      .split('-')
      .map((item) => language[item] || '')
      .join('-');
  }, []);

  return {
    convertLicenseToDeedTitle,
  };
}
