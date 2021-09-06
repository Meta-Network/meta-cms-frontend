import { LinkOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { requestSocialAuth } from '@/services/api/meta-ucenter';

export default ({
  name,
  visibleState,
  confirmedState,
}: {
  name: GLOBAL.StoreProvider;
  visibleState: any;
  confirmedState: any;
}) => {
  const [modalVisible, setModalVisible] = visibleState;
  const [, setConfirmed] = confirmedState;

  const handleRequest = async () => {
    const request = await requestSocialAuth(name.toLowerCase(), window.location.href);
    window.open(request.data, '_blank');
  };

  const operationCancel = () => {
    setModalVisible(false);
  };

  const operationDone = () => {
    setModalVisible(false);
    setConfirmed(name);
  };

  return (
    <Modal
      visible={modalVisible}
      title={`使用 ${name} 作为仓储`}
      onOk={operationDone}
      onCancel={operationCancel}
      footer={[
        <Button key="back" onClick={operationCancel}>
          返回
        </Button>,
        <Button key="submit" type="primary" onClick={operationDone}>
          完成
        </Button>,
      ]}
    >
      <h2>请注意！</h2>
      <p>接下来您会将被引导到 {name} 的授权页面，为创建站点进行授权。</p>
      <p>我们会为您创建并维护您的个人站点，除此之外，不会产生其他行为。</p>
      <p>请确保您拥有 {name} 的账号，并在其授权页面进行授权。</p>
      <p>
        <Button key="submit" icon={<LinkOutlined />} onClick={handleRequest}>
          跳转到 {name} 进行授权
        </Button>
      </p>
      <p>完成授权后，请点击下方的完成按钮。</p>
    </Modal>
  );
};
