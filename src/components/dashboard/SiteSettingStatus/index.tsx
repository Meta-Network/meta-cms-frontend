import { List } from 'antd';
import { useIntl } from 'umi';

export default () => {
  const intl = useIntl();
  const data = [
    intl.formatMessage({
      id: 'messages.dashboard.siteSettingStatus.item.modifyPersonalInformation',
    }),
    intl.formatMessage({
      id: 'messages.dashboard.siteSettingStatus.item.modifyTemplateInformation',
    }),
  ];

  return (
    <List
      size="large"
      // bordered
      style={{ width: '30vw' }}
      dataSource={data}
      renderItem={(item) => <List.Item>{item}</List.Item>}
    />
  );
};
