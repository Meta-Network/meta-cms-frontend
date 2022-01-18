import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Modal, Spin, Typography } from 'antd';
import { NavLink } from 'umi';
import styles from './index.less';
import { PublishingTipStepStateType } from '@/services/constants';
import { FinishIcon } from '@/components/Icon';

const { Link } = Typography;

interface Props {
  readonly visiblePublishingTip: boolean;
  setVisiblePublishingTip: (val: boolean) => void;
}

const PublishingTip: FC<Props> = ({ visiblePublishingTip, setVisiblePublishingTip }) => {
  const [stepState, setStepState] = useState<PublishingTipStepStateType>(
    PublishingTipStepStateType.Loading,
  );

  const handleOk = () => {
    setVisiblePublishingTip(false);
  };

  const handleCancel = () => {
    setVisiblePublishingTip(false);
  };

  useEffect(() => {
    if (visiblePublishingTip) {
      setInterval(() => {
        setStepState(PublishingTipStepStateType.Finish);
      }, 5000);
    }
  }, [visiblePublishingTip]);

  return (
    <Modal
      width={500}
      visible={visiblePublishingTip}
      title=""
      onOk={handleOk}
      onCancel={handleCancel}
      className={styles.modal}
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <section className={styles.cover}>
        <img src="https://www.yikaojixun.com/uploads/701675e17f04c0a80fd5b7ba61a3d731.jpg" alt="" />
        <section className={styles.coverLoading}>
          {stepState === PublishingTipStepStateType.Loading ? (
            <Spin className={styles.coverLoadingSpin} tip="Loading..." />
          ) : stepState === PublishingTipStepStateType.Finish ? (
            <section className={styles.coverState}>
              <FinishIcon />
              <p className={styles.coverStateText}>Successful</p>
            </section>
          ) : null}
        </section>
      </section>
      <section className={styles.content}>
        {stepState === PublishingTipStepStateType.Loading ? (
          <>
            <p className={styles.title}>感谢您的创作和信任！</p>
            <p className={styles.title}>正在将您的文章添加到发布队列中，请勿关闭此页面</p>
          </>
        ) : stepState === PublishingTipStepStateType.Finish ? (
          <>
            <p className={styles.title}>您的文章已经在发布队列中了～</p>
            <p className={styles.title}>这需要花费一些时间和 Web3 交互，请耐心等候</p>
          </>
        ) : null}

        <section className={styles.action}>
          {stepState === PublishingTipStepStateType.Loading ? (
            <Spin className={styles.actionSpin} />
          ) : stepState === PublishingTipStepStateType.Finish ? (
            <NavLink to="/content/drafts">
              <button className={styles.btnView}>查看我的作品</button>
            </NavLink>
          ) : null}
        </section>
        <p className={styles.description}>技术说明：</p>
        <Link
          underline
          href="https://meta-io.gitbook.io/meta-wiki"
          target="_blank"
          className={styles.descriptionLink}
        >
          您的文章是如何去平台发布到 Meta Space 中的？
        </Link>
      </section>
    </Modal>
  );
};

export default PublishingTip;
