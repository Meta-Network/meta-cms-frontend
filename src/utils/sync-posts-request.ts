import { syncPostsByPlatform, waitUntilSyncFinish } from '@/services/api/meta-cms';
import { message } from 'antd';

/**
 * Sync posts by Sources automatically.
 * @param sources Provide sources to sync.
 * @param setSyncLoading React state to update a button or the page's loading state.
 * @param tableRef If it's updating a table, pass the table's ref in to reset the table.
 */
export default async (
  sources: CMS.SourceStatusResponse[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSyncLoading = (value: boolean) => {},
  tableRef: any = { current: { reset: () => {} } },
) => {
  const done = message.loading('文章同步中…请稍候');
  setSyncLoading(true);

  const syncQueue: Promise<any>[] = [];
  const syncStates: Promise<boolean>[] = [];

  sources.forEach((service: CMS.SourceStatusResponse) => {
    syncQueue.push(syncPostsByPlatform(service.platform));
    syncStates.push(waitUntilSyncFinish(service.platform));
  });

  await Promise.all(syncQueue);

  Promise.all(syncStates).then(() => {
    message.success('文章同步完成。');
    tableRef.current?.reset();
    setSyncLoading(false);
    done();
  });
};
