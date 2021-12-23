import { Redirect, useModel } from 'umi';

export default () => {
  const { initialState } = useModel('@@initialState');
  const hasSite = initialState?.siteConfig?.domain;
  if (hasSite) {
    return <Redirect to="/content/drafts" />;
  } else {
    return <Redirect to="/create" />;
  }
};
