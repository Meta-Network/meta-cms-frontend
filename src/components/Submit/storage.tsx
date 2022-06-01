import { generateStorageLink } from '@/utils/editor';
import { Typography } from 'antd';
import type { FC } from 'react';
import { useIntl } from 'umi';

import { STORAGE_PLATFORM } from '../../../config/index';
import styles from './submit.less';

interface Props {
  readonly storagePublicSetting: CMS.StoragePlatformSetting | undefined;
  readonly storagePrivateSetting: CMS.StoragePlatformSetting | undefined;
}

const { Text, Link } = Typography;

const NoBuildRepo = () => {
  const intl = useIntl();

  return <Text>{intl.formatMessage({ id: 'editor.submit.item.repo.noBuild' })}</Text>;
};

const Storage: FC<Props> = ({ storagePublicSetting, storagePrivateSetting }) => {
  return (
    <section className={styles.storage}>
      <section className={styles.storageItem}>
        <section className={styles.statusBox}>
          <section className={styles.itemStatus}>
            <span className={storagePublicSetting ? styles.done : styles.undone} />
          </section>
        </section>
        {storagePublicSetting ? (
          <Link
            href={generateStorageLink(
              STORAGE_PLATFORM,
              `${storagePublicSetting.userName}/${storagePublicSetting.repoName}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.itemRepoName}
          >
            {`${storagePublicSetting.userName} - ${storagePublicSetting.repoName}`}
          </Link>
        ) : (
          <NoBuildRepo />
        )}
      </section>
      <section className={styles.storageItem}>
        <section className={styles.statusBox}>
          <section className={styles.itemStatus}>
            <span className={storagePrivateSetting ? styles.done : styles.undone} />
          </section>
        </section>
        {storagePrivateSetting ? (
          <Link
            href={generateStorageLink(
              STORAGE_PLATFORM,
              `${storagePrivateSetting.userName}/${storagePrivateSetting.repoName}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.itemRepoName}
          >
            {`${storagePrivateSetting.userName} - ${storagePrivateSetting.repoName}`}
          </Link>
        ) : (
          <NoBuildRepo />
        )}
      </section>
    </section>
  );
};

export default Storage;
