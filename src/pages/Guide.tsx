import ProCard from '@ant-design/pro-card';
import { useEffect, useMemo, useState } from 'react';
import { Steps, Affix, Card } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import Deploy from '@/components/Guide/Deploy';
import CDNSetting from '@/components/Guide/CDNSetting';
import AnchoredTitle from '@/components/AnchoredTitle';
import SiteSetting from '@/components/Guide/SiteSetting';
import ThemeSetting from '@/components/Guide/ThemeSetting';
import StorageSetting from '@/components/Guide/StorageSetting';
import PublisherSetting from '@/components/Guide/PublisherSetting';
import styles from './Guide.less';

const { Step } = Steps;

export default () => {
  const steps = useMemo<{ name: string; component: JSX.Element }[]>(
    () => [
      {
        name: '选择主题',
        component: <ThemeSetting />,
      },
      {
        name: '填写站点信息',
        component: <SiteSetting />,
      },
      {
        name: '进行存储配置',
        component: <StorageSetting />,
      },
      {
        name: '进行发布配置',
        component: <PublisherSetting />,
      },
      {
        name: '站点访问加速',
        component: <CDNSetting />,
      },
      {
        name: '部署',
        component: <Deploy />,
      },
    ],
    [],
  );

  // get local storage saved step
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    window.onscroll = () => {
      let positions = steps.map(
        (step) => document.getElementById(step.name)!.getBoundingClientRect().top,
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
      title="创建 Meta Space 站点"
      content={<p>体验 Meta Network，请从创建一个站点作为开始吧！</p>}
      breadcrumb={{}}
    >
      <div className={styles.main}>
        <Affix offsetTop={60}>
          <Card className={styles.steps}>
            <Steps size="small" direction="vertical" current={current}>
              {steps.map((step) => (
                <Step key={step.name} title={step.name} />
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
        </ProCard.Group>
      </div>
    </PageContainer>
  );
};
