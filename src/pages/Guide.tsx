import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import { Affix, Steps, Card } from 'antd';
import { useEffect, useMemo } from 'react';
import Deploy from '@/components/Guide/Deploy';
import CDNSetting from '@/components/Guide/CDNSetting';
import AnchoredTitle from '@/components/AnchoredTitle';
import SiteSetting from '@/components/Guide/SiteSetting';
import ThemeSetting from '@/components/Guide/ThemeSetting';
import StoreSetting from '@/components/Guide/StoreSetting';
import DomainSetting from '@/components/Guide/DomainSetting';
import PublisherSetting from '@/components/Guide/PublisherSetting';
import styles from './Guide.less';

const { Step } = Steps;

export default () => {
  const steps = useMemo<{ name: string; component: JSX.Element }[]>(
    () => [
      {
        name: '域名',
        component: <DomainSetting />,
      },
      {
        name: '主题',
        component: <ThemeSetting />,
      },
      {
        name: '信息',
        component: <SiteSetting />,
      },
      {
        name: '存储',
        component: <StoreSetting />,
      },
      {
        name: '发布',
        component: <PublisherSetting />,
      },
      {
        name: 'CDN',
        component: <CDNSetting />,
      },
      {
        name: '部署',
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
      title="创建 Meta Space"
      content={[
        <span>Meta Space 是专属于您个人的数字空间，您有全部的控制权力。</span>,
        <br />,
        <span>立即创建属于自己的 Meta Space ，开始您的下一代社交网络的探索之旅。</span>,
        <p />,
      ]}
      breadcrumb={{}}
    >
      <div className={styles.main}>
        <Affix offsetTop={60}>
          <Card className={styles.steps}>
            <Steps size="small" direction="vertical" current={current}>
              {steps.map((step, index) => (
                <Step
                  icon={stepStatus[index] === 'error' && <ExclamationCircleOutlined />}
                  status={stepStatus[index]}
                  key={step.name}
                  title={step.name}
                />
              ))}
            </Steps>
          </Card>
        </Affix>
        <ProCard.Group direction="column" className={styles.container}>
          {steps.map((step) => (
            <ProCard
              className={styles.contentCard}
              key={step.name}
              title={<AnchoredTitle name={step.name} />}
              headerBordered
            >
              {step.component}
            </ProCard>
          ))}
          {/* place isn't fulfilled, so I'm using a placeholder here */}
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
