import { Redirect, useModel } from 'umi';

export default () => {
  const { initialState } = useModel('@@initialState');
  if (initialState?.siteConfig?.domain) {
    return <Redirect to="/dashboard" />;
  } else {
    return <Redirect to="/create" />;
  }
};
