import styles from './styles.less';
import StoragePicker from '@/components/StoragePicker';

export default () => (
  <div className={styles.container}>
    <div className={styles.info}>
      <p>在这里可以配置一个存储位置以保存您的站点。</p>
      <p>您的站点代码会全部托管到该平台，我们只会帮您创建和修改。</p>
    </div>
    <StoragePicker />
  </div>
);
