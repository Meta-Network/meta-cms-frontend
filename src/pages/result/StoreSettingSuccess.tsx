import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { Result } from 'antd';

export default () => {
  const platforms = ['GitHub', 'Gitee'];
  const platform = new URLSearchParams(window.location.search).get('platform') || '';
  const error = new URLSearchParams(window.location.search).get('error') || '';

  const title = platforms.includes(platform) ? (
    <FormattedMessage id="guide.result.titleWithPlatform" values={{ platform: platform }} />
  ) : (
    <FormattedMessage id="guide.result.titleNoPlatform" />
  );

  if (error) {
    return (
      <Result
        status="error"
        title={<FormattedMessage id="guide.result.bindPlatformErrorTitle" />}
        subTitle={<FormattedMessage id="guide.result.bindPlatformErrorDescription" />}
      />
    );
  } else {
    return (
      <Result
        status="success"
        title={title}
        subTitle={<FormattedMessage id="guide.result.description" />}
      />
    );
  }
};
