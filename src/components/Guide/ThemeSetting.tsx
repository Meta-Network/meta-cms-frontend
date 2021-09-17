import styles from './styles.less';
import ThemePicker from '@/components/ThemePicker';

export default () => (
  <div className={styles.container}>
    <div className={styles.info}>
      <p>为您的 Meta Space 挑选一个喜欢的主题。</p>
      <p>未来您将可以更换或个性化配置。</p>
    </div>
    <ThemePicker />
  </div>
);
