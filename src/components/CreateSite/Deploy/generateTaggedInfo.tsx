import { Tag } from 'antd';
import styles from './generateTaggedInfo.less';

/**
 * Generates deployment status messages with colored labels.
 * Used in the last step of the CreateSite component.
 * @param {GLOBAL.LogMessagesTemplate} info the message template
 * @param {number} index For the unique key, so don't be the same as the others
 * @returns {JSX.Element}
 */
export default (info: GLOBAL.LogMessagesTemplate, index: number) => {
  let color: string;

  switch (info.state) {
    case 'error':
      color = '#f50';
      break;
    case 'info':
      color = '#2db7f5';
      break;
    case 'success':
      color = '#87d068';
      break;
    default:
      color = '';
  }

  return (
    <p className={styles.processingMessage} key={info.message + index}>
      {color ? (
        <>
          <Tag className={styles.processingTag} color={color}>
            {info.state}
          </Tag>
          {info.message}
        </>
      ) : (
        info.message
      )}
    </p>
  );
};
