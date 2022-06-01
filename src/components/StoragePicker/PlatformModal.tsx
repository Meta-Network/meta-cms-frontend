import { requestSocialAuth } from '@/services/api/meta-ucenter';
import Icon, { GithubOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { FormattedMessage, useIntl } from 'umi';
import { ReactComponent as GiteeIcon } from '../../../public/icons/custom/gitee-colored.svg';
import FormattedDescription from '../FormattedDescription';

export default ({
  name,
  visibleState,
  confirmedState,
}: {
  name: GLOBAL.StorageProvider;
  visibleState: any;
  confirmedState: any;
}) => {
  const intl = useIntl();
  const [, setConfirmed] = confirmedState;
  const [modalVisible, setModalVisible] = visibleState;

  const handleRequest = async () => {
    const request = await requestSocialAuth(
      name.toLowerCase(),
      `${window.location.origin}/result/storage-setting-success?platform=${name}`,
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
      title={<FormattedMessage id="guide.authorization.title" values={{ platform: name }} />}
      onOk={operationDone}
      onCancel={operationCancel}
      footer={[
        <Button key="submit" type="primary" onClick={operationDone}>
          {intl.formatMessage({ id: 'component.button.finish' })}
        </Button>,
      ]}
    >
      <FormattedMessage id="guide.authorization.subtitle" tagName="h2" />
      <FormattedDescription
        id="guide.authorization.description"
        variables={{ platform: name }}
        customClass=""
      />
      <p>{buttons[name.toLowerCase()]}</p>
    </Modal>
  );
};
