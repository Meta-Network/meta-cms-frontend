import { syncPostsByPlatform, waitUntilSyncFinish } from '@/services/api/meta-cms';

/**
 * Sync posts by Sources automatically.
 * @param sources Provide sources to sync.
 */
export default async (sources: CMS.SourceStatusResponse[]) => {
  const syncQueue: Promise<any>[] = [];
  const syncStates: Promise<boolean>[] = [];

  sources.forEach((service: CMS.SourceStatusResponse) => {
    syncQueue.push(syncPostsByPlatform(service.platform));
    syncStates.push(waitUntilSyncFinish(service.platform));
  });

  await Promise.all(syncQueue);
  await Promise.all(syncStates);
};
