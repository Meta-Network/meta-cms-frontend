import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Modal, Spin, Typography, Image } from 'antd';
import { NavLink, useIntl } from 'umi';
import styles from './index.less';
import { PublishingTipStepStateType } from '@/services/constants';
import { FinishIcon } from '@/components/Icon';

const { Link } = Typography;

interface Props {
  readonly cover: string;
  readonly visiblePublishingTip: boolean;
  setVisiblePublishingTip: (val: boolean) => void;
}

const PublishingTip: FC<Props> = ({ cover, visiblePublishingTip, setVisiblePublishingTip }) => {
  const intl = useIntl();

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
    let time: NodeJS.Timer;
    if (visiblePublishingTip) {
      time = setInterval(() => {
        setStepState(PublishingTipStepStateType.Finish);
      }, 5000);
    } else {
      setStepState(PublishingTipStepStateType.Loading);
    }

    return () => clearInterval(time);
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
        {cover && (
          <Image width={'100%'} height={'100%'} src={cover} alt={'Cover'} preview={false} />
        )}
        <section className={styles.coverLoading}>
          {stepState === PublishingTipStepStateType.Loading ? (
            <Spin
              className={styles.coverLoadingSpin}
              tip={intl.formatMessage({
                id: 'editor.publishingTip.cover.loading',
              })}
            />
          ) : stepState === PublishingTipStepStateType.Finish ? (
            <section className={styles.coverState}>
              <FinishIcon />
              <p className={styles.coverStateText}>
                {intl.formatMessage({
                  id: 'editor.publishingTip.cover.finish',
                })}
              </p>
            </section>
          ) : null}
        </section>
      </section>
      <section className={styles.content}>
        {stepState === PublishingTipStepStateType.Loading ? (
          <>
            <p className={styles.title}>
              {intl.formatMessage({
                id: 'editor.publishingTip.content.loadingTextOne',
              })}
            </p>
            <p className={styles.title}>
              {intl.formatMessage({
                id: 'editor.publishingTip.content.loadingTextTwo',
              })}
            </p>
          </>
        ) : stepState === PublishingTipStepStateType.Finish ? (
          <>
            <p className={styles.title}>
              {intl.formatMessage({
                id: 'editor.publishingTip.content.finishTextOne',
              })}
            </p>
            <p className={styles.title}>
              {intl.formatMessage({
                id: 'editor.publishingTip.content.finishTextTwo',
              })}
            </p>
          </>
        ) : null}

        <section className={styles.action}>
          {stepState === PublishingTipStepStateType.Loading ? (
            <Spin className={styles.actionSpin} />
          ) : stepState === PublishingTipStepStateType.Finish ? (
            <NavLink to="/content/posts">
              <button className={styles.btnView}>
                {intl.formatMessage({
                  id: 'editor.publishingTip.content.finishButtonView',
                })}
              </button>
            </NavLink>
          ) : null}
        </section>
        <p className={styles.description}>
          {intl.formatMessage({
            id: 'editor.publishingTip.content.help.description',
          })}
        </p>
        <Link underline href={META_WIKI} target="_blank" className={styles.descriptionLink}>
          {intl.formatMessage({
            id: 'editor.publishingTip.content.help.descriptionLink',
          })}
        </Link>
      </section>
    </Modal>
  );
};

export default PublishingTip;
