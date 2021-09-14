import { Card, Result } from 'antd';

export default () => (
  <Card>
    <Result
      status="success"
      title="已成功配置仓储"
      subTitle="恭喜您完成了仓储的配置，现在可以关闭此页面，回到刚才的页面点击完成按钮即可。"
    />
  </Card>
);
