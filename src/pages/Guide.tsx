import ProCard from '@ant-design/pro-card';
import { Affix, Steps, Card } from 'antd';
import { useIntl, FormattedMessage, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import Deploy from '@/components/Guide/Deploy';
import CDNSetting from '@/components/Guide/CDNSetting';
import FormattedDescription from '@/components/FormattedDescription';
import AnchoredTitle from '@/components/AnchoredTitle';
import SiteSetting from '@/components/Guide/SiteSetting';
import ThemeSetting from '@/components/Guide/ThemeSetting';
import StoreSetting from '@/components/Guide/StoreSetting';
import DomainSetting from '@/components/Guide/DomainSetting';
import PublisherSetting from '@/components/Guide/PublisherSetting';
import styles from './Guide.less';

const { Step } = Steps;

export default () => {
  const intl = useIntl();

  const steps = useMemo<{ title: string; component: JSX.Element; description?: JSX.Element }[]>(
    () => [
      {
        title: intl.formatMessage({ id: 'guide.domain.title' }),
        description: <FormattedDescription id="guide.domain.description" />,
        component: <DomainSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.theme.title' }),
        description: <FormattedDescription id="guide.theme.description" />,
        component: <ThemeSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.config.title' }),
        description: <FormattedDescription id="guide.config.description" />,
        component: <SiteSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.storage.title' }),
        description: <FormattedDescription id="guide.storage.description" />,
        component: <StoreSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.publish.title' }),
        description: <FormattedDescription id="guide.publish.description" />,
        component: <PublisherSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.cdn.title' }),
        description: <FormattedDescription id="guide.cdn.description" />,
        component: <CDNSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.deploy.title' }),
        description: <FormattedDescription id="guide.deploy.description" />,
        component: <Deploy />,
      },
    ],
    [intl],
  );
  const { current, setCurrent, stepStatus } = useModel('steps');

  useEffect(() => {
    const positioningOffset = () => {
      let positions = steps.map(
        (step) => document.getElementById(step.title)?.getBoundingClientRect()?.top || 0,
      );

      const currentPosition = window.pageYOffset;
      positions = positions.map((e) => e + currentPosition);

      const closest = positions.reduce((prev, curr) =>
        Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev,
      );

      if (Math.abs(currentPosition - closest) < 60) {
        setCurrent(positions.findIndex((e) => e === closest));
      }
    };
    window.addEventListener('scroll', positioningOffset);

    return () => {
      window.removeEventListener('scroll', positioningOffset);
    };
  }, [steps, setCurrent]);

  return (
    <PageContainer
      title={<FormattedMessage id="guide.intro.title" />}
      content={
        <FormattedDescription id="guide.intro.description" customClass="header-text-description" />
      }
      breadcrumb={{}}
    >
      <div className={styles.main}>
        <Affix offsetTop={40}>
          <Card className={styles.steps}>
            <Steps size="small" direction="vertical" current={current}>
              {steps.map((step, index) => (
                <Step
                  icon={stepStatus[index] === 'error' && <ExclamationCircleOutlined />}
                  status={stepStatus[index]}
                  key={step.title}
                  title={
                    <a style={{ color: 'rgba(0, 0, 0, 0.85)' }} href={`#${step.title}`}>
                      {step.title}
                    </a>
                  }
                />
              ))}
            </Steps>
          </Card>
        </Affix>
        <ProCard.Group direction="column" className={styles.container}>
          {steps.map((step) => (
            <ProCard
              headerBordered
              className={styles.contentCard}
              key={step.title}
              title={
                <div>
                  <AnchoredTitle title={step.title} />
                  <div className={styles.cardDescription}>{step.description}</div>
                </div>
              }
            >
              {step.component}
            </ProCard>
          ))}
          {/* place isn't fulfilled, using a placeholder here */}
          <ProCard
            style={{ opacity: 0, height: '360px' }}
            className={styles.contentCard}
            key="placeholder"
            headerBordered
          />
        </ProCard.Group>
      </div>
    </PageContainer>
  );
};
