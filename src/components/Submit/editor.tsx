import {
  getDefaultSiteConfigAPI,
  getPublisherSettingAPI,
  getStorageSettingAPI,
} from '@/helpers/index';
import { GatewayType } from '@/services/constants';
import { verifySeedAndKey } from '@/utils/editor';
import { storeGet, storeSet } from '@/utils/store';
import { useMount } from 'ahooks';
import { Button, Card, Checkbox, Form, message, Radio, Space } from 'antd';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'umi';
import { KEY_META_CMS_GATEWAY_CHECKED, STORAGE_PLATFORM } from '../../../config/index';
import GenerateKey from './generate';
import Seed from './seed';
import Storage from './storage';
import styles from './submit.less';

interface Props {
  readonly loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handlePublish: (value: GatewayType) => void;
  setDropdownVisible: (visible: boolean) => void;
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

const Submit: FC<Props> = ({ loading, setLoading, handlePublish, setDropdownVisible }) => {
  const intl = useIntl();

  const [visibleSignatureGenerate, setVisibleSignatureGenerate] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>('');
  const [storagePublicSetting, setStoragePublicSetting] = useState<CMS.StoragePlatformSetting>();
  const [storagePrivateSetting, setStoragePrivateSetting] = useState<CMS.StoragePlatformSetting>();
  const [gatewayType, setGatewayType] = useState<GatewayType>(GatewayType.Default);

  // 提交
  const onFinish = () => {
    // 仅仅提交一次
    if (loading) return;

    setLoading(true);
    // console.log('Success:', values);

    // 没有 seed or key，seed and key not match
    if (!publicKey) {
      message.warning(intl.formatMessage({ id: 'messages.editor.submit.generateKey' }));
      setLoading(false);
      return;
    }

    // 没有 storage
    if (!storagePublicSetting && !storagePrivateSetting) {
      message.warning(intl.formatMessage({ id: 'messages.editor.submit.bindStorage' }));
      setLoading(false);
      return;
    }

    handlePublish(gatewayType);
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

  // 处理存证类型改变
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
              {intl.formatMessage({ id: 'editor.submit.item.repo.name' })}
            </span>
            {' - '}
            {intl.formatMessage({ id: 'editor.submit.item.repo.description' })}
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
              <Checkbox value="arweave">
                <span className={styles.itemType}>
                  {intl.formatMessage({ id: 'editor.submit.item.gateway.arweave.name' })}
                </span>
                {' - '}
                {intl.formatMessage({ id: 'editor.submit.item.gateway.description' })}
              </Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>
        <Seed publicKey={publicKey} setVisibleSignatureGenerate={setVisibleSignatureGenerate} />

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
