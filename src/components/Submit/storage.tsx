import type { FC } from 'react';
import { generateStorageLink } from '@/utils/editor';
import { Typography } from 'antd';
import { useIntl } from 'umi';

import styles from './submit.less';
import { STORAGE_PLATFORM } from '../../../config/index';

interface Props {
  readonly storageSetting: CMS.StoragePlatformSetting | undefined;
}

const { Text, Link } = Typography;

const Storage: FC<Props> = ({ storageSetting }) => {
  const intl = useIntl();

  return (
    <>
      <div className={styles.itemRepo}>
        <div className={styles.itemStatus}>
          <span className={storageSetting ? styles.done : styles.undone} />
        </div>
      </div>
      {storageSetting ? (
        <Link
          href={generateStorageLink(
            STORAGE_PLATFORM,
            `${storageSetting.userName}/${storageSetting.repoName}`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.itemRepoName}
        >
          {`${storageSetting.userName} - ${storageSetting.repoName}`}
        </Link>
      ) : (
        <Text>{intl.formatMessage({ id: 'editor.submit.item.repo.noBuild' })}</Text>
      )}
    </>
  );
};

export default Storage;
