import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { Card, Result } from 'antd';

export default () => {
  const platforms = ['GitHub', 'Gitee'];
  const param = new URLSearchParams(window.location.search).get('platform') || '';

  const title = platforms.includes(param) ? (
    <FormattedMessage id="guide.result.titleWithPlatform" values={{ platform: param }} />
  ) : (
    <FormattedMessage id="guide.result.titleNoPlatform" />
  );

  return (
    <Card>
      <Result
        status="success"
        title={title}
        subTitle={<FormattedMessage id="guide.result.info" />}
      />
    </Card>
  );
};
