import styles from './index.less';

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
