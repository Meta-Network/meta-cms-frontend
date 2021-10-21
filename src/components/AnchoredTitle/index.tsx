import styles from './index.less';

/**
 * Make an anchored title(content only, no header tag).
 * Use margin and padding to jump to the correct position.
 * @param {string} name
 * @returns {JSX.Element}
 */
export default ({ name }: { name: string }) => (
  <>
    <span
      style={{
        marginTop: '-78px',
        paddingTop: '78px',
      }}
      id={name}
    >
      {name}
    </span>

    <a href={`#${name}`} className={styles.anchor}>
      #
    </a>
  </>
);
