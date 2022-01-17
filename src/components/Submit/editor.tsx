import type { FC } from 'react';
import { useCallback, useState, useEffect } from 'react';
import { Card, Form, Button, Checkbox, Radio, Space, message } from 'antd';
import styles from './submit.less';
import { verifySeedAndKey } from '@/utils/editor';
import {
  getDefaultSiteConfigAPI,
  getPublisherSettingAPI,
  getStorageSettingAPI,
} from '@/helpers/index';
import { useMount } from 'ahooks';
import { KEY_META_CMS_GATEWAY_CHECKED, STORAGE_PLATFORM } from '../../../config/index';
import { storeGet, storeSet } from '@/utils/store';
import { useIntl } from 'umi';
import GenerateKey from './generate';
import GatewayIpfs from './gatewayIpfs';
import Storage from './storage';
import { GatewayType } from '@/services/constants';

interface Props {
  readonly loading: boolean;
  handlePublish: (gateway: boolean) => void;
  setDropdownVisible: (visible: boolean) => void;
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

const Submit: FC<Props> = ({ loading, handlePublish, setDropdownVisible }) => {
  const intl = useIntl();

  const [visibleSignatureGenerate, setVisibleSignatureGenerate] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>('');
  const [storagePublicSetting, setStoragePublicSetting] = useState<CMS.StoragePlatformSetting>();
  const [storagePrivateSetting, setStoragePrivateSetting] = useState<CMS.StoragePlatformSetting>();
  const [gatewayType, setGatewayType] = useState<GatewayType>(GatewayType.Default);

  const onFinish = (values: any) => {
    console.log('Success:', values);

    if (gatewayType && !publicKey) {
      message.warning(intl.formatMessage({ id: 'messages.editor.submit.generateKey' }));
      return;
    }

    if (!storagePublicSetting && !storagePrivateSetting) {
      message.warning(intl.formatMessage({ id: 'messages.editor.submit.bindStorage' }));
      return;
    }

    handlePublish(!!gatewayType);
  };

  // get seed and key
  const getSeedAndKey = useCallback(() => {
    const result = verifySeedAndKey();
    if (result) {
      setPublicKey(result.publicKey);
    } else {
      setPublicKey('');
    }
  }, [setPublicKey]);

  /**
   * fetch Storage Setting
   * public private
   */
  const fetchStorageSetting = useCallback(async () => {
    const defaultSiteConfigResult = await getDefaultSiteConfigAPI();
    if (!defaultSiteConfigResult) {
      return;
    }

    const storagePublicResult = await getPublisherSettingAPI(
      defaultSiteConfigResult.id,
      STORAGE_PLATFORM,
    );

    const storagePrivateResult = await getStorageSettingAPI(
      defaultSiteConfigResult.id,
      STORAGE_PLATFORM,
    );

    if (storagePublicResult) {
      setStoragePublicSetting(storagePublicResult);
    }
    if (storagePrivateResult) {
      setStoragePrivateSetting(storagePrivateResult);
    }
  }, []);

  const gatewayTypeChange = useCallback(
    (checkedValue: (GatewayType.Ipfs | GatewayType.Arweave)[]) => {
      // console.log('checkedValue', checkedValue);

      let val = GatewayType.Default;
      if (checkedValue.length) {
        val = checkedValue[checkedValue.length - 1];
      }

      setGatewayType(val);
      storeSet(KEY_META_CMS_GATEWAY_CHECKED, val);
    },
    [],
  );

  useEffect(() => {
    getSeedAndKey();
  }, [getSeedAndKey]);

  useMount(() => {
    fetchStorageSetting();
    // get Gateway Checked
    setGatewayType(storeGet(KEY_META_CMS_GATEWAY_CHECKED) || GatewayType.Default);
  });

  return (
    <Card
      title={intl.formatMessage({ id: 'editor.submit.title' })}
      bodyStyle={{ padding: 0 }}
      style={{ width: 360 }}
    >
      <Form
        name="SubmitEditor"
        initialValues={{ remember: true }}
        layout={'vertical'}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        {/* 存储仓库 */}
        <Form.Item
          label={intl.formatMessage({ id: 'editor.submit.item.repo.label' })}
          className={styles.item}
          style={{ marginTop: 20 }}
        >
          <Radio value="githubStorage" checked={!!STORAGE_PLATFORM}>
            <span className={styles.itemType}>
              {intl.formatMessage({ id: 'editor.submit.item.repo.private.name' })}
            </span>
            {' - '}
            {intl.formatMessage({ id: 'editor.submit.item.repo.private.description' })}
          </Radio>
        </Form.Item>
        <Storage
          storagePublicSetting={storagePublicSetting}
          storagePrivateSetting={storagePrivateSetting}
        />
        {/* 存证服务 */}
        <Form.Item
          label={intl.formatMessage({ id: 'editor.submit.item.gateway.label' })}
          className={styles.item}
          style={{ marginTop: 20 }}
        >
          <Checkbox.Group onChange={(val: any) => gatewayTypeChange(val)} value={[gatewayType]}>
            <Space direction="vertical">
              <Checkbox value="ipfs">
                <span className={styles.itemType}>
                  {intl.formatMessage({ id: 'editor.submit.item.gateway.name' })}
                </span>
                {' - '}
                {intl.formatMessage({ id: 'editor.submit.item.gateway.description' })}
              </Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>
        {gatewayType === GatewayType.Ipfs && (
          <GatewayIpfs
            publicKey={publicKey}
            setVisibleSignatureGenerate={setVisibleSignatureGenerate}
          />
        )}

        <Form.Item className={styles.footer}>
          <Space>
            <Button onClick={() => setDropdownVisible(false)} loading={loading}>
              {intl.formatMessage({
                id: 'component.button.cancel',
              })}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {intl.formatMessage({
                id: 'component.button.startPublishing',
              })}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <GenerateKey
        visibleSignatureGenerate={visibleSignatureGenerate}
        setVisibleSignatureGenerate={setVisibleSignatureGenerate}
        publicKey={publicKey}
        setPublicKey={setPublicKey}
      />
    </Card>
  );
};

export default Submit;
