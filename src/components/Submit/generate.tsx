import React, { Fragment, useCallback, useState } from 'react';

import { Modal, Input, Button, Space, message } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import { generateSeedAndKey } from '@/utils/editor';

interface Props {
  readonly publicKey: string;
  readonly visibleSignatureGenerate: boolean;
  setPublicKey: (val: string) => void;
  setVisibleSignatureGenerate: (val: boolean) => void;
}

const GenerateKey: React.FC<Props> = ({
  visibleSignatureGenerate,
  publicKey,
  setPublicKey,
  setVisibleSignatureGenerate,
}) => {
  const intl = useIntl();
  const [signatureLoading, setSignatureLoading] = useState<boolean>(false);

  /**
   * handle generate publicKey
   */
  const handleGeneratePublicKey = useCallback(async () => {
    setSignatureLoading(true);

    try {
      const { keys } = generateSeedAndKey();
      setPublicKey(keys.public);

      message.success(intl.formatMessage({ id: 'messages.editor.submit.generateKey.success' }));
    } catch (error) {
      console.log(error);
      message.error(intl.formatMessage({ id: 'messages.editor.submit.generateKey.fail' }));
    }

    setSignatureLoading(false);
  }, [setPublicKey, intl]);

  return (
    <Modal
      visible={visibleSignatureGenerate}
      title={
        <Fragment>
          <KeyOutlined />
          &nbsp;
          {intl.formatMessage({
            id: 'editor.submit.modalKey.title',
          })}
        </Fragment>
      }
      onCancel={() => setVisibleSignatureGenerate(false)}
      footer={[
        <Button onClick={() => setVisibleSignatureGenerate(false)}>
          {intl.formatMessage({
            id: 'component.button.cancel',
          })}
        </Button>,
        <Button type="primary" loading={signatureLoading} onClick={handleGeneratePublicKey}>
          {publicKey
            ? intl.formatMessage({
                id: 'component.button.regenerate',
              })
            : intl.formatMessage({
                id: 'component.button.generateImmediately',
              })}
        </Button>,
      ]}
    >
      <Space direction="vertical">
        <div>
          {publicKey
            ? intl.formatMessage({
                id: 'editor.submit.modalKey.content.beenGenerated',
              })
            : intl.formatMessage({
                id: 'editor.submit.modalKey.content.notGenerated',
              })}
        </div>
        <div>
          {intl.formatMessage({
            id: 'editor.submit.modalKey.content.description',
          })}
        </div>
        <Input value={publicKey} placeholder="KEY" disabled />
      </Space>
    </Modal>
  );
};

export default GenerateKey;
