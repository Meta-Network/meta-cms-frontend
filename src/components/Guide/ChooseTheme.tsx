import styles from './styles.less';
import ThemePicker from '@/components/ThemePicker';

export default () => (
  <div className={styles.container}>
    <p>在这里，为您的 Meta Space 选择一个喜欢的主题吧。</p>
    <p>之后，您还是可以更换或进行其他个性化配置。</p>

    <ThemePicker />
  </div>
);
