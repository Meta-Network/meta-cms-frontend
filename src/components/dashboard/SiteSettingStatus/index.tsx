// import { useIntl } from 'umi';
import { List } from 'antd';

export default () => {
  // const intl = useIntl();
  const data = ['修改了个人信息', '修改了 Meta Space 模板信息'];

  return (
    <List
      size="large"
      // bordered
      style={{ width: '30vw' }}
      dataSource={data}
      renderItem={(item) => <List.Item>{item}</List.Item>}
    />
  );
};
