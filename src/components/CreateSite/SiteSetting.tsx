import ProForm from '@ant-design/pro-form';
import { message } from 'antd';
import { getLocale, useIntl, useModel } from 'umi';
import SiteSettingFormItems from '../SiteSettingFormItems';
// @ts-expect-error
// eslint-disable-next-line prettier/prettier,@typescript-eslint/no-unused-vars
import moment from 'moment';
import momentTimezone from 'moment-timezone';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { siteSetting, setSiteSetting } = useModel('localStorageHooks');

  const faviconUrl = META_SPACE_DEFAULT_FAVICON_URL;
  const author = initialState?.currentUser?.nickname || '';

  let defaultLanguage = getLocale().split('-')[0];
  if (defaultLanguage === 'zh') defaultLanguage = 'zh-CN';

  const initialValues = {
    author,
    language: defaultLanguage,
    timezone: momentTimezone.tz.guess(),
    favicon: META_SPACE_DEFAULT_FAVICON_URL,
    ...(siteSetting as Partial<GLOBAL.SiteSetting>),
  };

  const handleFinishing = async (values: GLOBAL.SiteSetting) => {
    values.favicon = faviconUrl; // eslint-disable-line no-param-reassign
    setSiteSetting(values);
    message.success(intl.formatMessage({ id: 'messages.deployment.saveConfigSuccess' }));
  };

  return (
    <ProForm
      style={{ width: 500 }}
      name="site-info"
      initialValues={initialValues}
      onFinish={handleFinishing}
      requiredMark="optional"
    >
      <SiteSettingFormItems />
    </ProForm>
  );
};
