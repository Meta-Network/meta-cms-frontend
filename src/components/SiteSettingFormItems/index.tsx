import { useIntl } from 'umi';
import { siteInfoRules } from '../../../config';
import { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';

export default () => {
  const intl = useIntl();

  const timezones = {
    'Etc/GMT+12': intl.formatMessage({ id: 'timezones.Etc/GMT+12' }),
    'Pacific/Apia': intl.formatMessage({ id: 'timezones.Pacific/Apia' }),
    'Pacific/Honolulu': intl.formatMessage({ id: 'timezones.Pacific/Honolulu' }),
    'America/Anchorage': intl.formatMessage({ id: 'timezones.America/Anchorage' }),
    'America/Los_Angeles': intl.formatMessage({ id: 'timezones.America/Los_Angeles' }),
    'America/Denver': intl.formatMessage({ id: 'timezones.America/Denver' }),
    'America/Chicago': intl.formatMessage({ id: 'timezones.America/Chicago' }),
    'America/Regina': intl.formatMessage({ id: 'timezones.America/Regina' }),
    'America/Guatemala': intl.formatMessage({ id: 'timezones.America/Guatemala' }),
    'America/New_York': intl.formatMessage({ id: 'timezones.America/New_York' }),
    'America/Halifax': intl.formatMessage({ id: 'timezones.America/Halifax' }),
    'America/Sao_Paulo': intl.formatMessage({ id: 'timezones.America/Sao_Paulo' }),
    'America/Godthab': intl.formatMessage({ id: 'timezones.America/Godthab' }),
    'Atlantic/Azores': intl.formatMessage({ id: 'timezones.Atlantic/Azores' }),
    'Atlantic/Cape_Verde': intl.formatMessage({ id: 'timezones.Atlantic/Cape_Verde' }),
    'Europe/London': intl.formatMessage({ id: 'timezones.Europe/London' }),
    'Atlantic/Reykjavik': intl.formatMessage({ id: 'timezones.Atlantic/Reykjavik' }),
    'Europe/Budapest': intl.formatMessage({ id: 'timezones.Europe/Budapest' }),
    'Europe/Warsaw': intl.formatMessage({ id: 'timezones.Europe/Warsaw' }),
    'Europe/Paris': intl.formatMessage({ id: 'timezones.Europe/Paris' }),
    'Europe/Berlin': intl.formatMessage({ id: 'timezones.Europe/Berlin' }),
    'Africa/Lagos': intl.formatMessage({ id: 'timezones.Africa/Lagos' }),
    'Europe/Chisinau': intl.formatMessage({ id: 'timezones.Europe/Chisinau' }),
    'Africa/Cairo': intl.formatMessage({ id: 'timezones.Africa/Cairo' }),
    'Europe/Kiev': intl.formatMessage({ id: 'timezones.Europe/Kiev' }),
    'Europe/Bucharest': intl.formatMessage({ id: 'timezones.Europe/Bucharest' }),
    'Asia/Jerusalem': intl.formatMessage({ id: 'timezones.Asia/Jerusalem' }),
    'Africa/Johannesburg': intl.formatMessage({ id: 'timezones.Africa/Johannesburg' }),
    'Europe/Moscow': intl.formatMessage({ id: 'timezones.Europe/Moscow' }),
    'Asia/Riyadh': intl.formatMessage({ id: 'timezones.Asia/Riyadh' }),
    'Africa/Nairobi': intl.formatMessage({ id: 'timezones.Africa/Nairobi' }),
    'Asia/Baghdad': intl.formatMessage({ id: 'timezones.Asia/Baghdad' }),
    'Asia/Tehran': intl.formatMessage({ id: 'timezones.Asia/Tehran' }),
    'Asia/Dubai': intl.formatMessage({ id: 'timezones.Asia/Dubai' }),
    'Asia/Yerevan': intl.formatMessage({ id: 'timezones.Asia/Yerevan' }),
    'Asia/Yekaterinburg': intl.formatMessage({ id: 'timezones.Asia/Yekaterinburg' }),
    'Asia/Tashkent': intl.formatMessage({ id: 'timezones.Asia/Tashkent' }),
    'Asia/Calcutta': intl.formatMessage({ id: 'timezones.Asia/Calcutta' }),
    'Asia/Katmandu': intl.formatMessage({ id: 'timezones.Asia/Katmandu' }),
    'Asia/Almaty': intl.formatMessage({ id: 'timezones.Asia/Almaty' }),
    'Asia/Colombo': intl.formatMessage({ id: 'timezones.Asia/Colombo' }),
    'Asia/Novosibirsk': intl.formatMessage({ id: 'timezones.Asia/Novosibirsk' }),
    'Asia/Rangoon': intl.formatMessage({ id: 'timezones.Asia/Rangoon' }),
    'Asia/Krasnoyarsk': intl.formatMessage({ id: 'timezones.Asia/Krasnoyarsk' }),
    'Asia/Shanghai': intl.formatMessage({ id: 'timezones.Asia/Shanghai' }),
    'Asia/Singapore': intl.formatMessage({ id: 'timezones.Asia/Singapore' }),
    'Asia/Taipei': intl.formatMessage({ id: 'timezones.Asia/Taipei' }),
    'Australia/Perth': intl.formatMessage({ id: 'timezones.Australia/Perth' }),
    'Asia/Irkutsk': intl.formatMessage({ id: 'timezones.Asia/Irkutsk' }),
    'Asia/Seoul': intl.formatMessage({ id: 'timezones.Asia/Seoul' }),
    'Asia/Tokyo': intl.formatMessage({ id: 'timezones.Asia/Tokyo' }),
    'Asia/Yakutsk': intl.formatMessage({ id: 'timezones.Asia/Yakutsk' }),
    'Australia/Adelaide': intl.formatMessage({ id: 'timezones.Australia/Adelaide' }),
    'Australia/Brisbane': intl.formatMessage({ id: 'timezones.Australia/Brisbane' }),
    'Australia/Hobart': intl.formatMessage({ id: 'timezones.Australia/Hobart' }),
    'Asia/Vladivostok': intl.formatMessage({ id: 'timezones.Asia/Vladivostok' }),
    'Pacific/Port_Moresby': intl.formatMessage({ id: 'timezones.Pacific/Port_Moresby' }),
    'Pacific/Guadalcanal': intl.formatMessage({ id: 'timezones.Pacific/Guadalcanal' }),
    'Pacific/Auckland': intl.formatMessage({ id: 'timezones.Pacific/Auckland' }),
    'Pacific/Tongatapu': intl.formatMessage({ id: 'timezones.Pacific/Tongatapu' }),
  };

  return (
    <>
      <ProFormText
        width="md"
        name="title"
        label={intl.formatMessage({ id: 'guide.config.form.title' })}
        placeholder={intl.formatMessage({ id: 'guide.config.form.titlePlaceholder' })}
        rules={[
          {
            required: true,
            ...siteInfoRules.title,
          },
        ]}
      />
      <ProFormText
        width="md"
        name="subtitle"
        label={intl.formatMessage({ id: 'guide.config.form.subtitle' })}
        placeholder={intl.formatMessage({ id: 'guide.config.form.subtitlePlaceholder' })}
        rules={[
          {
            required: true,
            ...siteInfoRules.subtitle,
          },
        ]}
      />
      <ProFormText
        width="md"
        name="author"
        label={intl.formatMessage({ id: 'guide.config.form.author' })}
        placeholder={intl.formatMessage({ id: 'guide.config.form.authorPlaceholder' })}
        rules={[
          {
            required: true,
            ...siteInfoRules.author,
          },
        ]}
      />
      <ProFormTextArea
        width="md"
        name="description"
        label={intl.formatMessage({ id: 'guide.config.form.description' })}
        placeholder={intl.formatMessage({ id: 'guide.config.form.descriptionPlaceholder' })}
        rules={[
          {
            required: true,
            ...siteInfoRules.description,
          },
        ]}
      />
      <ProFormSelect
        mode="tags"
        width="md"
        name="keywords"
        fieldProps={{
          open: false,
        }}
        label={intl.formatMessage({ id: 'guide.config.form.keywords' })}
        extra={intl.formatMessage({ id: 'guide.config.form.keywordsExtra' })}
        rules={[
          {
            required: true,
            ...siteInfoRules.keywords,
            type: 'array',
          },
        ]}
      />
      <ProFormSelect
        width="md"
        name="language"
        label={intl.formatMessage({ id: 'guide.config.form.language' })}
        rules={[
          {
            required: true,
          },
        ]}
        valueEnum={{
          'zh-CN': '中文（简体）',
          'zh-TW': '中文（繁體）',
          en: 'English',
        }}
      />
      <ProFormSelect
        width="md"
        name="timezone"
        label={intl.formatMessage({ id: 'guide.config.form.timezone' })}
        fieldProps={{ showSearch: true }}
        rules={[
          {
            required: true,
          },
        ]}
        valueEnum={timezones}
      />
    </>
  );
};
