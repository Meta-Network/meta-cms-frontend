import { message } from 'antd';
import { getLocale } from 'umi';
import React, { useState } from 'react';
import ProForm from '@ant-design/pro-form';
import { useModel } from '@@/plugin-model/useModel';
import SiteSettingFormItems from '../SiteSettingFormItems';
// @ts-ignore
import moment from 'moment'; // eslint-disable-line @typescript-eslint/no-unused-vars
import momentTimezone from 'moment-timezone';

export default () => {
  const { initialState } = useModel('@@initialState');
  const {
    siteSetting,
    setSiteSetting,
  }: {
    siteSetting: Partial<GLOBAL.SiteSetting>;
    setSiteSetting: React.Dispatch<React.SetStateAction<GLOBAL.SiteSetting>>;
  } = useModel('storage');

  const [faviconUrl, setFaviconUrl] = useState<string>(siteSetting.favicon || '');

  const author = initialState?.currentUser?.nickname || '';
  const initialValues = {
    language: getLocale().split('-')[0],
    timezone: momentTimezone.tz.guess(),
    author,
    ...siteSetting,
  };

  const handleFinishing = async (values: GLOBAL.SiteSetting) => {
    values.favicon = faviconUrl; // eslint-disable-line no-param-reassign
    setSiteSetting(values);
    message.success('成功保存站点信息设置。');
  };

  return (
    <ProForm
      style={{ width: 500 }}
      name="site-info"
      initialValues={initialValues}
      onFinish={handleFinishing}
      requiredMark="optional"
    >
      <SiteSettingFormItems faviconUrl={faviconUrl} setFavIconUrl={setFaviconUrl} />
    </ProForm>
  );
};
