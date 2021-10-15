import ProCard from '@ant-design/pro-card';
import { Affix, Steps, Card } from 'antd';
import { FormattedMessage, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import Deploy from '@/components/Guide/Deploy';
import CDNSetting from '@/components/Guide/CDNSetting';
import FormattedInfo from '@/components/FormattedInfo';
import AnchoredTitle from '@/components/AnchoredTitle';
import SiteSetting from '@/components/Guide/SiteSetting';
import ThemeSetting from '@/components/Guide/ThemeSetting';
import StoreSetting from '@/components/Guide/StoreSetting';
import DomainSetting from '@/components/Guide/DomainSetting';
import PublisherSetting from '@/components/Guide/PublisherSetting';
import styles from './Guide.less';

const { Step } = Steps;

export default () => {
  const steps = useMemo<{ name: string; component: JSX.Element; description?: JSX.Element }[]>(
    () => [
      {
        name: '域名',
        description: <FormattedInfo id="guide.domain.info" />,
        component: <DomainSetting />,
      },
      {
        name: '主题',
        description: <FormattedInfo id="guide.theme.info" />,
        component: <ThemeSetting />,
      },
      {
        name: '信息',
        description: <FormattedInfo id="guide.config.info" />,
        component: <SiteSetting />,
      },
      {
        name: '存储',
        description: <FormattedInfo id="guide.storage.info" />,
        component: <StoreSetting />,
      },
      {
        name: '发布',
        description: <FormattedInfo id="guide.publish.info" />,
        component: <PublisherSetting />,
      },
      {
        name: 'CDN',
        description: <FormattedInfo id="guide.cdn.info" />,
        component: <CDNSetting />,
      },
      {
        name: '部署',
        description: <FormattedInfo id="guide.deploy.info" />,
        component: <Deploy />,
      },
    ],
    [],
  );
  const { current, setCurrent, stepStatus } = useModel('steps');

  useEffect(() => {
    window.onscroll = () => {
      let positions = steps.map(
        (step) => document.getElementById(step.name)?.getBoundingClientRect()?.top || 0,
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

    return () => {
      window.onscroll = null;
    };
  }, [steps, setCurrent]);

  return (
    <PageContainer
      title={<FormattedMessage id="guide.intro.title" />}
      content={<FormattedInfo id="guide.intro.info" customClass="header-text-info" />}
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
                  key={step.name}
                  title={
                    <a style={{ color: 'rgba(0, 0, 0, 0.85)' }} href={`#${step.name}`}>
                      {step.name}
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
              key={step.name}
              title={
                <div>
                  <AnchoredTitle name={step.name} />
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
