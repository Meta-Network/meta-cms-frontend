import React, { useState } from 'react';
import { message, Upload } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { uploadAvatar } from '@/services/api/global';
import { requestStorageToken } from '@/services/api/meta-ucenter';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ProForm, { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { getLocale } from 'umi';
// @ts-ignore
import moment from 'moment'; // eslint-disable-line @typescript-eslint/no-unused-vars
import momentTimezone from 'moment-timezone';
import styles from './styles.less';

const chTimezones = {
  'Etc/GMT+12': '(GMT-12:00) 国际日期变更线西',
  'Pacific/Apia': '(GMT-11:00) 萨摩亚中途岛',
  'Pacific/Honolulu': '(GMT-10:00) 夏威夷',
  'America/Anchorage': '(GMT-09:00) 阿拉斯加',
  'America/Los_Angeles': '(GMT-08:00) 太平洋时间（美国和加拿大）；蒂华纳',
  'America/Denver': '(GMT-07:00) 山地时间（美国和加拿大）',
  'America/Chicago': '(GMT-06:00) 中部时间（美国和加拿大）',
  'America/Regina': '(GMT-06:00) 萨斯喀彻温省',
  'America/Guatemala': '(GMT-06:00) 中美洲',
  'America/New_York': '(GMT-05:00) 东部时间（美国和加拿大）',
  'America/Halifax': '(GMT-04:00) 大西洋时间（加拿大）',
  'America/Sao_Paulo': '(GMT-03:00) 巴西利亚',
  'America/Godthab': '(GMT-03:00) 格陵兰',
  'Atlantic/Azores': '(GMT-01:00) 亚速尔群岛',
  'Atlantic/Cape_Verde': '(GMT-01:00) 佛得角群岛',
  'Europe/London': '(GMT) 格林威治标准时间：都柏林、爱丁堡、里斯本、伦敦',
  'Atlantic/Reykjavik': '(GMT) 卡萨布兰卡，蒙罗维亚',
  'Europe/Budapest': '(GMT+01:00) 贝尔格莱德、布拉迪斯拉发、布达佩斯、卢布尔雅那、布拉格',
  'Europe/Warsaw': '(GMT+01:00) 萨拉热窝、斯科普里、华沙、萨格勒布',
  'Europe/Paris': '(GMT+01:00) 布鲁塞尔、哥本哈根、马德里、巴黎',
  'Europe/Berlin': '(GMT+01:00) 阿姆斯特丹、柏林、伯尔尼、罗马、斯德哥尔摩、维也纳',
  'Africa/Lagos': '(GMT+01:00) 中西非',
  'Europe/Chisinau': '(GMT+02:00) 布加勒斯特',
  'Africa/Cairo': '(GMT+02:00) 开罗',
  'Europe/Kiev': '(GMT+02:00) 赫尔辛基、基辅、里加、索非亚、塔林、维尔纽斯',
  'Europe/Bucharest': '(GMT+02:00) 雅典、伊斯坦布尔、明斯克',
  'Asia/Jerusalem': '(GMT+02:00) 耶路撒冷',
  'Africa/Johannesburg': '(GMT+02:00) 哈拉雷，比勒陀利亚',
  'Europe/Moscow': '(GMT+03:00) 莫斯科、圣彼得堡、伏尔加格勒',
  'Asia/Riyadh': '(GMT+03:00) 科威特、利雅得',
  'Africa/Nairobi': '(GMT+03:00) 内罗毕',
  'Asia/Baghdad': '(GMT+03:00) 巴格达',
  'Asia/Tehran': '(GMT+03:30) 德黑兰',
  'Asia/Dubai': '(GMT+04:00) 阿布扎比、马斯喀特',
  'Asia/Yerevan': '(GMT+04:00) 巴库、第比利斯、埃里温',
  'Asia/Yekaterinburg': '(GMT+05:00) 叶卡捷琳堡',
  'Asia/Tashkent': '(GMT+05:00) 伊斯兰堡、卡拉奇、塔什干',
  'Asia/Calcutta': '(GMT+05:30) 钦奈、加尔各答、孟买、新德里',
  'Asia/Katmandu': '(GMT+05:45) 加德满都',
  'Asia/Almaty': '(GMT+06:00) 阿斯塔纳，达卡',
  'Asia/Colombo': '(GMT+06:00) 科特',
  'Asia/Novosibirsk': '(GMT+06:00) 阿拉木图，新西伯利亚',
  'Asia/Rangoon': '(GMT+06:30) 仰光',
  'Asia/Krasnoyarsk': '(GMT+07:00) 克拉斯诺亚尔斯克',
  'Asia/Shanghai': '(GMT+08:00) 北京、重庆、香港特别行政区、乌鲁木齐',
  'Asia/Singapore': '(GMT+08:00) 新加坡吉隆坡',
  'Asia/Taipei': '(GMT+08:00) 台北',
  'Australia/Perth': '(GMT+08:00) 珀斯',
  'Asia/Irkutsk': '(GMT+08:00) 伊尔库茨克、乌兰巴托',
  'Asia/Seoul': '(GMT+09:00) 首尔',
  'Asia/Tokyo': '(GMT+09:00) 大阪、札幌、东京',
  'Asia/Yakutsk': '(GMT+09:00) 雅库茨克',
  'Australia/Adelaide': '(GMT+09:30) 阿德莱德',
  'Australia/Brisbane': '(GMT+10:00) 布里斯班',
  'Australia/Hobart': '(GMT+10:00) 霍巴特',
  'Asia/Vladivostok': '(GMT+10:00) 符拉迪沃斯托克',
  'Pacific/Port_Moresby': '(GMT+10:00) 关岛，莫尔兹比港',
  'Pacific/Guadalcanal': '(GMT+11:00) 马加丹、所罗门群岛、新喀里多尼亚',
  'Pacific/Auckland': '(GMT+12:00) 奥克兰、惠灵顿',
  'Pacific/Tongatapu': '(GMT+13:00) 努库阿洛法',
};

/*
const timezones = {
  'Etc/GMT+12': '(GMT-12:00) International Date Line West',
  'Pacific/Apia': '(GMT-11:00) Midway Island, Samoa',
  'Pacific/Honolulu': '(GMT-10:00) Hawaii',
  'America/Anchorage': '(GMT-09:00) Alaska',
  'America/Los_Angeles': '(GMT-08:00) Pacific Time (US and Canada); Tijuana',
  'America/Denver': '(GMT-07:00) Mountain Time (US and Canada)',
  'America/Chicago': '(GMT-06:00) Central Time (US and Canada',
  'America/Regina': '(GMT-06:00) Saskatchewan',
  'America/Guatemala': '(GMT-06:00) Central America',
  'America/New_York': '(GMT-05:00) Eastern Time (US and Canada)',
  'America/Halifax': '(GMT-04:00) Atlantic Time (Canada)',
  'America/Sao_Paulo': '(GMT-03:00) Brasilia',
  'America/Godthab': '(GMT-03:00) Greenland',
  'Atlantic/Azores': '(GMT-01:00) Azores',
  'Atlantic/Cape_Verde': '(GMT-01:00) Cape Verde Islands',
  'Europe/London': '(GMT) Greenwich Mean Time: Dublin, Edinburgh, Lisbon, London',
  'Atlantic/Reykjavik': '(GMT) Casablanca, Monrovia',
  'Europe/Budapest': '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague',
  'Europe/Warsaw': '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb',
  'Europe/Paris': '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris',
  'Europe/Berlin': '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
  'Africa/Lagos': '(GMT+01:00) West Central Africa',
  'Europe/Chisinau': '(GMT+02:00) Bucharest',
  'Africa/Cairo': '(GMT+02:00) Cairo',
  'Europe/Kiev': '(GMT+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius',
  'Europe/Bucharest': '(GMT+02:00) Athens, Istanbul, Minsk',
  'Asia/Jerusalem': '(GMT+02:00) Jerusalem',
  'Africa/Johannesburg': '(GMT+02:00) Harare, Pretoria',
  'Europe/Moscow': '(GMT+03:00) Moscow, St. Petersburg, Volgograd',
  'Asia/Riyadh': '(GMT+03:00) Kuwait, Riyadh',
  'Africa/Nairobi': '(GMT+03:00) Nairobi',
  'Asia/Baghdad': '(GMT+03:00) Baghdad',
  'Asia/Tehran': '(GMT+03:30) Tehran',
  'Asia/Dubai': '(GMT+04:00) Abu Dhabi, Muscat',
  'Asia/Yerevan': '(GMT+04:00) Baku, Tbilisi, Yerevan',
  'Asia/Yekaterinburg': '(GMT+05:00) Ekaterinburg',
  'Asia/Tashkent': '(GMT+05:00) Islamabad, Karachi, Tashkent',
  'Asia/Calcutta': '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi',
  'Asia/Katmandu': '(GMT+05:45) Kathmandu',
  'Asia/Almaty': '(GMT+06:00) Astana, Dhaka',
  'Asia/Colombo': '(GMT+06:00) Sri Jayawardenepura',
  'Asia/Novosibirsk': '(GMT+06:00) Almaty, Novosibirsk',
  'Asia/Rangoon': '(GMT+06:30) Yangon Rangoon',
  'Asia/Krasnoyarsk': '(GMT+07:00) Krasnoyarsk',
  'Asia/Shanghai': '(GMT+08:00) Beijing, Chongqing, Hong Kong SAR, Urumqi',
  'Asia/Singapore': '(GMT+08:00) Kuala Lumpur, Singapore',
  'Asia/Taipei': '(GMT+08:00) Taipei',
  'Australia/Perth': '(GMT+08:00) Perth',
  'Asia/Irkutsk': '(GMT+08:00) Irkutsk, Ulaanbaatar',
  'Asia/Seoul': '(GMT+09:00) Seoul',
  'Asia/Tokyo': '(GMT+09:00) Osaka, Sapporo, Tokyo',
  'Asia/Yakutsk': '(GMT+09:00) Yakutsk',
  'Australia/Adelaide': '(GMT+09:30) Adelaide',
  'Australia/Brisbane': '(GMT+10:00) Brisbane',
  'Australia/Hobart': '(GMT+10:00) Hobart',
  'Asia/Vladivostok': '(GMT+10:00) Vladivostok',
  'Pacific/Port_Moresby': '(GMT+10:00) Guam, Port Moresby',
  'Pacific/Guadalcanal': '(GMT+11:00) Magadan, Solomon Islands, New Caledonia',
  'Pacific/Auckland': '(GMT+12:00) Auckland, Wellington',
  'Pacific/Tongatapu': "(GMT+13:00) Nuku'alofa",
};
*/

export default () => {
  const { initialState } = useModel('@@initialState');
  const {
    siteSetting,
    setSiteSetting,
  }: {
    siteSetting: Partial<GLOBAL.SiteSetting>;
    setSiteSetting: React.Dispatch<React.SetStateAction<GLOBAL.SiteSetting>>;
  } = useModel('storage');

  const [uploading, setUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>(siteSetting.favicon || '');

  const author = initialState?.currentUser?.nickname || '';
  const initialValues = {
    language: getLocale().split('-')[0],
    timezone: momentTimezone.tz.guess(),
    author,
    ...siteSetting,
  };

  const customRequest = async ({ file }: { file: File }): Promise<void> => {
    const done = message.loading('文件上传中...请稍候', 0);
    setUploading(true);
    const tokenRequest = await requestStorageToken();
    const token = tokenRequest.data;

    if (!token) {
      if (tokenRequest.statusCode === 401) {
        message.error('图像上传失败，请重新登录。');
      }
      message.error('图像上传失败。内部错误或无网络。');
    }

    const form = new FormData();
    form.append('file', file);

    const result = await uploadAvatar(form, token);
    done();

    if (result.statusCode === 201) {
      setImageUrl(result.data.publicUrl);
      message.success('上传成功，请提交您的站点信息设置。');
    } else {
      message.error('图像上传失败。');
    }
    setUploading(false);
  };

  const handleFinishing = async (values: GLOBAL.SiteSetting) => {
    values.favicon = imageUrl; // eslint-disable-line no-param-reassign
    setSiteSetting(values);
    message.success('成功保存站点信息设置。');
  };

  return (
    <div className={styles.container}>
      <ProForm
        style={{ width: 500 }}
        name="site-info"
        initialValues={initialValues}
        onFinish={handleFinishing}
        requiredMark="optional"
      >
        <ProFormText
          width="md"
          name="title"
          label="标题"
          placeholder="你的 Meta Space 标题"
          rules={[{ required: true }]}
        />
        <ProFormText
          width="md"
          name="subtitle"
          label="副标题"
          placeholder="你的 Meta Space 副标题"
          rules={[{ required: true }]}
        />
        <ProFormText
          width="md"
          name="author"
          label="作者"
          placeholder="作为 Meta Space 拥有者的名称"
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          width="md"
          name="description"
          label="描述"
          placeholder="你的 Meta Space 描述"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          mode="tags"
          width="md"
          name="keywords"
          fieldProps={{
            open: false,
          }}
          label="关键词"
          extra="其他人在搜索引擎中输入这些关键词会更容易找到你的站点"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          width="md"
          name="language"
          label="语言"
          rules={[{ required: true, message: '请选择您的 Meta Space 语言' }]}
          valueEnum={{
            zh: '中文',
            en: 'English',
            jp: '日本語',
            es: 'Español',
          }}
        />
        <ProFormSelect
          width="md"
          name="timezone"
          label="时区"
          fieldProps={{ showSearch: true }}
          rules={[{ required: true, message: '请选择您的 Meta Space 时区' }]}
          valueEnum={chTimezones}
        />
        <ProForm.Item
          name="favicon"
          getValueProps={(value) => [value]}
          valuePropName={'fileList'}
          label="网站图标"
          extra="可上传.ico .jpg .png 格式图片，展示在页面标签上"
          rules={[{ required: true, message: '请上传一个站点图标' }]}
        >
          <Upload
            title="上传站点图标"
            listType="picture-card"
            /*
              // @ts-ignore */
            customRequest={customRequest}
            showUploadList={false}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="favicon preview" style={{ width: '80%', height: '80%' }} />
            ) : (
              <div>
                {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </ProForm.Item>
      </ProForm>
    </div>
  );
};
