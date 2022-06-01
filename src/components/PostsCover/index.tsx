import { Image } from 'antd';
import type { FC } from 'react';
import { useIntl } from 'umi';
import styles from './index.less';

interface Props {
  readonly src: string;
  readonly alt?: string;
  readonly width?: string;
  readonly height?: string;
}

const PostsCover: FC<Props> = ({ src, alt, width = '100px', height = '50px' }) => {
  const intl = useIntl();

  return (
    <>
      {src ? (
        <div className={styles.coverWrapper}>
          <Image width={width} height={height} src={src} style={{ objectFit: 'cover' }} alt={alt} />
        </div>
      ) : (
        <div className={styles.noCover}>
          {intl.formatMessage({ id: 'messages.table.noCoverExists' })}
        </div>
      )}
    </>
  );
};

export default PostsCover;
