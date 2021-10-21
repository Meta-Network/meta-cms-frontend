import styles from './index.less';

/**
 * Make an anchored title(content only, no header tag).
 * Use margin and padding to jump to the correct position.
 * @param {string} title
 * @returns {JSX.Element}
 */
export default ({ title }: { title: string }) => (
  <>
    <span
      style={{
        marginTop: '-78px',
        paddingTop: '78px',
      }}
      id={title}
    >
      {title}
    </span>

    <a href={`#${title}`} className={styles.anchor}>
      #
    </a>
  </>
);
