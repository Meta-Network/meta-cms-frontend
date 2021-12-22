import { Redirect, useModel } from 'umi';

export default () => {
  const { initialState } = useModel('@@initialState');
  if (initialState?.siteConfig?.domain) {
    return <Redirect to="/content/drafts" />;
  } else {
    return <Redirect to="/create" />;
  }
};
