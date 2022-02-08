import { extendWithErrorHandler } from '@/services/api/base-request';

export default extendWithErrorHandler({
  credentials: 'include',
  prefix: META_CMS_API,
  headers: {
    'Content-Type': 'application/json',
  },
});
