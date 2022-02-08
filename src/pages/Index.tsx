import { Redirect, useModel } from 'umi';

export default () => {
  const { initialState } = useModel('@@initialState');
  const hasSite = initialState?.siteConfig?.domain;
  if (hasSite) {
    return <Redirect to="/content/posts" />;
  } else {
    return <Redirect to="/create" />;
  }
};
