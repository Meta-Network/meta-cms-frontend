import ProCard from '@ant-design/pro-card';
import { Affix, Steps, Card } from 'antd';
import { useIntl, FormattedMessage, useModel, Redirect } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import Deploy from '@/components/CreateSite/Deploy';
import AnchoredTitle from '@/components/AnchoredTitle';
import SiteSetting from '@/components/CreateSite/SiteSetting';
import StoreSetting from '@/components/CreateSite/StoreSetting';
import DomainSetting from '@/components/CreateSite/DomainSetting';
import FormattedDescription from '@/components/FormattedDescription';
import styles from './CreateSite.less';

const { Step } = Steps;

const CreateSite = () => {
  const intl = useIntl();

  const steps = useMemo<{ title: string; component: JSX.Element; description?: JSX.Element }[]>(
    () => [
      {
        title: intl.formatMessage({ id: 'guide.domain.title' }),
        description: <FormattedDescription id="guide.domain.description" />,
        component: <DomainSetting />,
      },
      // {
      //   title: intl.formatMessage({ id: 'guide.theme.title' }),
      //   description: <FormattedDescription id="guide.theme.description" />,
      //   component: <ThemeSetting />,
      // },
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
      // {
      //   title: intl.formatMessage({ id: 'guide.publish.title' }),
      //   description: <FormattedDescription id="guide.publish.description" />,
      //   component: <PublisherSetting />,
      // },
      // {
      //   title: intl.formatMessage({ id: 'guide.cdn.title' }),
      //   description: <FormattedDescription id="guide.cdn.description" />,
      //   component: <CDNSetting />,
      // },
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
        setCurrent(positions.findIndex((e) => e === closest));
      }
    };
    window.addEventListener('scroll', titlePositioningOffset);

    return () => {
      window.removeEventListener('scroll', titlePositioningOffset);
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

const CheckPermission = () => {
  const { initialState } = useModel('@@initialState');
  const hasSite = initialState?.siteConfig?.domain;
  if (hasSite) {
    return <Redirect to="/" />;
  } else {
    return <CreateSite />;
  }
};

export default CheckPermission;
