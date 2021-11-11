import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { ToolOutlined } from '@ant-design/icons';
import { Result } from 'antd';

export default () => {
  return (
    <Result
      icon={<ToolOutlined />}
      title={<FormattedMessage id="手机端正在施工中" />}
      subTitle={<FormattedMessage id="敬请使用电脑端体验本页面" />}
    />
  );
};
