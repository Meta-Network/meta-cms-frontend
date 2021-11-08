import { useCallback } from 'react';
import { useIntl } from 'umi';

export default function useCreativeCommons() {
  const intl = useIntl();

  const convertLicenseToDeedTitle = useCallback(
    (license: string) => {
      intl.formatMessage({
        id: 'messages.editor.success',
      });
      const language = {
        BY: intl.formatMessage({ id: 'editor.creativeCommons.attribution' }),
        NC: intl.formatMessage({ id: 'editor.creativeCommons.nonCommercial' }),
        ND: intl.formatMessage({ id: 'editor.creativeCommons.noDerivatives' }),
        SA: intl.formatMessage({ id: 'editor.creativeCommons.shareAlike' }),
      };
      return license
        .split('-')
        .map((item) => language[item] || '')
        .join('-');
    },
    [intl],
  );

  return {
    convertLicenseToDeedTitle,
  };
}
