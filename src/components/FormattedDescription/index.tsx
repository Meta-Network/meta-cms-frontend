import { FormattedMessage } from 'umi';
import styles from './index.less';

/**
 * Format i18n message with custom `text-description` style.
 * For the consist page header's helper content.
 * @param {string} id i18n content id
 * @param {any} variables set the variables of this content
 * @param {any} customClass set the custom css class name, it's {styles.textDescription} by default
 * @returns {JSX.Element}
 */
export default ({
  id,
  variables = {},
  customClass = undefined,
}: {
  id: string;
  variables?: any;
  customClass?: string;
}) => (
  <FormattedMessage id={id} values={variables}>
    {(msg: string) => (
      <div className={customClass ?? styles.textDescription}>
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
