import { Button, Modal } from 'antd';
import { FormattedMessage } from 'umi';
import Icon, { GithubOutlined } from '@ant-design/icons';
import { requestSocialAuth } from '@/services/api/meta-ucenter';
import FormattedInfo from '../FormattedInfo';
import { ReactComponent as GiteeIcon } from '../../../public/icons/custom/gitee-colored.svg';

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
    const request = await requestSocialAuth(
      name.toLowerCase(),
      `${window.location.origin}/result/store-setting-success?platform=${name}`,
    );
    window.open(request.data, '_blank');
  };

  const buttons = {
    github: (
      <Button key="submit" icon={<GithubOutlined />} onClick={handleRequest}>
        GitHub
      </Button>
    ),
    gitee: (
      <Button key="submit" icon={<Icon component={GiteeIcon} />} onClick={handleRequest}>
        Gitee
      </Button>
    ),
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
      title={<FormattedMessage id="guide.authorize.title" values={{ platform: name }} />}
      onOk={operationDone}
      onCancel={operationCancel}
      footer={[
        <Button key="submit" type="primary" onClick={operationDone}>
          完成
        </Button>,
      ]}
    >
      <FormattedMessage id="guide.authorize.subtitle" tagName="h2" />
      <FormattedInfo id="guide.authorize.info" values={{ platform: name }} customClass="" />
      <p>{buttons[name.toLowerCase()]}</p>
    </Modal>
  );
};
