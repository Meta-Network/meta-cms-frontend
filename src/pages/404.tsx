import { Button, Result } from 'antd';
import React from 'react';
import { history, useIntl } from 'umi';

const NoFoundPage: React.FC = () => {
  const intl = useIntl();

  return (
    <Result
      status="404"
      title={intl.formatMessage({
        id: 'result.notFound.title',
      })}
      subTitle={intl.formatMessage({
        id: 'result.notFound.subTitle',
      })}
      extra={
        <Button type="primary" onClick={() => history.push('/')}>
          {intl.formatMessage({
            id: 'result.notFound.button.backHome',
          })}
        </Button>
      }
    />
  );
};

export default NoFoundPage;
