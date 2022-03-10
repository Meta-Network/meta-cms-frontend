import { userHasSite } from '@/utils';
import { Redirect, useModel } from 'umi';

export default () => {
  const { initialState } = useModel('@@initialState');
  if (userHasSite(initialState)) {
    return <Redirect to="/content/posts" />;
  } else {
    return <Redirect to="/create" />;
  }
};
