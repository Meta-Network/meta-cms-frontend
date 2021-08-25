// noinspection NonAsciiCharacters

import CDNSetting from '@/components/Guide/CDNSetting';
import PublisherSetting from '@/components/Guide/PublisherSetting';
import { useEffect, useState } from 'react';
import { Steps, Button, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import Welcome from '@/components/Guide/Welcome';
import SiteSetting from '@/components/Guide/SiteSetting';
import ThemeSetting from '@/components/Guide/ThemeSetting';
import StorageSetting from '@/components/Guide/StorageSetting';
import styles from './index.less';

const { Step } = Steps;

export default () => {
  const components = {
    欢迎: <Welcome />,
    选择主题: <ThemeSetting />,
    填写站点信息: <SiteSetting />,
    进行存储配置: <StorageSetting />,
    进行发布配置: <PublisherSetting />,
    站点访问加速: <CDNSetting />,
    完成: null,
  };
  const steps = Object.keys(components);

  // first time get local storage saved step
  const [current, setCurrent] = useState(parseInt(window.localStorage.getItem('step') || '0', 10));

  useEffect(() => {
    window.localStorage.setItem('step', current.toString());
  }, [current]);

  return (
    <PageContainer
      title="创建 Meta Space 站点"
      content={<p>体验 Meta Network，请从创建一个站点作为开始吧！</p>}
      breadcrumb={{}}
    >
      <ProCard split="vertical" bordered>
        <ProCard colSpan={5}>
          <Steps
            size="small"
            direction="vertical"
            current={current}
            onChange={(i) => setCurrent(i)}
          >
            {steps.map((step) => (
              <Step key={step} title={step} />
            ))}
          </Steps>
        </ProCard>
        <ProCard className={styles.contentContainer} title={steps[current]}>
          {/* render step of component here */}
          {components[steps[current]]}

          <Space className={styles.pageButtons}>
            <Button
              key="next"
              type="primary"
              onClick={() => setCurrent(current + 1)}
              disabled={current === steps.length - 1}
            >
              下一步
            </Button>
            <Button key="pre" onClick={() => setCurrent(current - 1)} disabled={current === 0}>
              上一步
            </Button>
          </Space>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};
