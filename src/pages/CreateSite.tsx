import AnchoredTitle from '@/components/AnchoredTitle';
import Deploy from '@/components/CreateSite/Deploy';
import DomainSetting from '@/components/CreateSite/DomainSetting';
import SiteSetting from '@/components/CreateSite/SiteSetting';
import StorageSetting from '@/components/CreateSite/StorageSetting';
import FormattedDescription from '@/components/FormattedDescription';
import { userHasSite } from '@/utils';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import { Affix, Card, Steps } from 'antd';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, Redirect, useIntl, useModel } from 'umi';
import styles from './CreateSite.less';

const { Step } = Steps;

const CreateSite = () => {
  const intl = useIntl();
  const { currentStep, setCurrentStep, stepsStatus } = useModel('deploySiteStepStatus');

  const steps = useMemo<
    { title: string; setting: string; component: JSX.Element; description?: JSX.Element }[]
  >(
    () => [
      {
        title: intl.formatMessage({ id: 'guide.domain.title' }),
        setting: 'domainSetting',
        description: <FormattedDescription id="guide.domain.description" />,
        component: <DomainSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.config.title' }),
        setting: 'siteSetting',
        description: <FormattedDescription id="guide.config.description" />,
        component: <SiteSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.storage.title' }),
        setting: 'storageSetting',
        description: <FormattedDescription id="guide.storage.description" />,
        component: <StorageSetting />,
      },
      {
        title: intl.formatMessage({ id: 'guide.deploy.title' }),
        setting: 'deploySetting',
        description: <FormattedDescription id="guide.deploy.description" />,
        component: <Deploy />,
      },
    ],
    [intl],
  );

  useEffect(() => {
    const titlePositioningOffset = () => {
      let positions = steps.map(
        (step) => document.getElementById(step.title)?.getBoundingClientRect()?.top || 0,
      );

      const currentPosition = window.scrollY;
      positions = positions.map((e) => e + currentPosition);

      const closest = positions.reduce((prev, curr) =>
        Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev,
      );
      if (Math.abs(currentPosition - closest) < 60) {
        const index = positions.findIndex((e) => e === closest);
        setCurrentStep(steps[index].setting);
      }
    };
    window.addEventListener('scroll', titlePositioningOffset);

    return () => {
      window.removeEventListener('scroll', titlePositioningOffset);
    };
  }, [steps, setCurrentStep]);

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
            <Steps
              size="small"
              direction="vertical"
              current={steps.findIndex((e) => e.setting === currentStep)}
            >
              {steps.map((step) => (
                <Step
                  icon={stepsStatus[step.setting] === 'error' && <ExclamationCircleOutlined />}
                  status={stepsStatus[step.setting] as any}
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

const CreateSiteIfAvailable = () => {
  const { initialState } = useModel('@@initialState');
  return userHasSite(initialState) ? <Redirect to="/" /> : <CreateSite />;
};

export default CreateSiteIfAvailable;
