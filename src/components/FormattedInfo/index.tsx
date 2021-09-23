import styles from './index.less';
import { FormattedMessage } from 'umi';

/* format i18n message with custom text-info style */
export default ({
  id,
  values = {},
  customClass = false,
}: {
  id: string;
  values?: any;
  customClass?: any;
}) => (
  <FormattedMessage id={id} values={values}>
    {(msg: string) => (
      <div className={customClass || styles.textInfo}>
        {msg
          ?.trim()
          .split('\n')
          .map((s, index) => (
            <p key={`${id}_${index + 1}`}>{s}</p>
          ))}
      </div>
    )}
  </FormattedMessage>
);
