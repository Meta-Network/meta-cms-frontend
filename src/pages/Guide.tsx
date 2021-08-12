// noinspection NonAsciiCharacters

import ChooseTheme from '@/components/Guide/ChooseTheme';
import { useState } from 'react';
import { Steps, Button, Space } from 'antd';
import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import Welcome from '@/components/Guide/Welcome';
import styles from './Guide.less';

const { Step } = Steps;

export default () => {
  const components = {
    欢迎: <Welcome />,
    选择主题: <ChooseTheme />,
    填写站点信息: null,
    填写站点配置: null,
    进行存储配置: null,
    完成: null,
  };
  const steps = Object.keys(components);
  const [current, setCurrent] = useState(0);
  return (
    <PageContainer
      title="创建 Meta Space 站点"
      content={<p>体验 Meta Network，请从创建一个站点作为开始吧！</p>}
      breadcrumb={{}}
    >
      <ProCard split="vertical" bordered>
        <ProCard colSpan={5}>
          <Steps size="small" direction="vertical" current={current}>
            {steps.map((step) => (
              <Step key={step} title={step} />
            ))}
          </Steps>
        </ProCard>
        <ProCard className={styles.contentContainer} title={steps[current]}>
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
