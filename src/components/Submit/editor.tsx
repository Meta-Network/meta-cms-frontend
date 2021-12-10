import type { FC } from 'react';
import React, { Fragment, useCallback, useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Radio,
  Select,
  Space,
  message,
  Typography,
} from 'antd';
import {
  EyeOutlined,
  CaretDownOutlined,
  ArrowRightOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import styles from './submit.less';
import { generateStorageLink, verifySeedAndKey } from '@/utils/editor';
import { getDefaultSiteConfigAPI, getStorageSettingAPI } from '@/helpers/index';
import { useMount } from 'ahooks';
import { KEY_META_CMS_GATEWAY_CHECKED } from '../../../config/index';
import { storeGet, storeSet } from '@/utils/store';
import { useIntl } from 'umi';
import GenerateKey from './generate';

interface Props {
  handlePublish: (gateway: boolean) => void;
  setDropdownVisible: (visible: boolean) => void;
}

const { Text, Link } = Typography;
const { Option } = Select;
const STORAGE_PLATFORM = 'github';

const Submit: FC<Props> = ({ handlePublish, setDropdownVisible }) => {
  const intl = useIntl();

  const [visibleSignatureGenerate, setVisibleSignatureGenerate] = useState<boolean>(false);
  const [visibleSignature, setVisibleSignature] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>('');
  // const [gatewayLoading, setGatewayLoading] = useState<boolean>(true);
  const [gatewayChecked, setGatewayChecked] = useState<boolean>(false);
  const [storageSetting, setStorageSetting] = useState<CMS.StoragePlatformSetting>();

  const onFinish = (values: any) => {
    console.log('Success:', values);

    if (gatewayChecked && !publicKey) {
      message.warning(intl.formatMessage({ id: 'messages.editor.submit.generateKey' }));
      return;
    }

    if (!storageSetting) {
      message.warning(intl.formatMessage({ id: 'messages.editor.submit.bindStorage' }));
      return;
    }

    handlePublish(gatewayChecked);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  /**
   * get seed and key
   */
  const getSeedAndKey = useCallback(() => {
    const result = verifySeedAndKey();
    if (result) {
      setPublicKey(result.publicKey);
    } else {
      setPublicKey('');
    }
  }, [setPublicKey]);

  /**
   * handle Gateway Change Checked
   */
  const handleGatewayChangeChecked = useCallback((val: boolean) => {
    setGatewayChecked(val);
    storeSet(KEY_META_CMS_GATEWAY_CHECKED, JSON.stringify(val));
  }, []);

  /**
   * handle set gateway
   */
  // const handleSetGateway = useCallback(async () => {
  // setGatewayLoading(true);
  // // const result = await something()
  // await sleep(2000);
  // const result = true;
  // if (result) {
  //   message.success('设置成功');
  // } else {
  //   message.error('设置失败');
  // }
  // setGatewayLoading(false);
  // }, []);

  /**
   * fetch Storage Setting
   */
  const fetchStorageSetting = useCallback(async () => {
    const defaultSiteConfigResult = await getDefaultSiteConfigAPI();
    if (!defaultSiteConfigResult) {
      return;
    }
    const storageResult = await getStorageSettingAPI(defaultSiteConfigResult.id, STORAGE_PLATFORM);
    if (storageResult) {
      setStorageSetting(storageResult);
    }
  }, []);

  /**
   * get Gateway Checked
   */
  const getGatewayChecked = useCallback(async () => {
    const gatewayCheckedResult = JSON.parse(storeGet(KEY_META_CMS_GATEWAY_CHECKED) || 'false');
    setGatewayChecked(gatewayCheckedResult);
  }, []);

  useEffect(() => {
    getSeedAndKey();
  }, [getSeedAndKey]);

  useMount(() => {
    fetchStorageSetting();
    getGatewayChecked();
  });

  return (
    <Card
      title={intl.formatMessage({ id: 'editor.submit.title' })}
      bodyStyle={{ padding: 0 }}
      style={{ width: 340 }}
    >
      <Form
        name="basic"
        initialValues={{ remember: true }}
        layout={'vertical'}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          name="github"
          label={intl.formatMessage({ id: 'editor.submit.item.repo.label' })}
          className={styles.item}
        >
          <Radio value="githubPublic" checked={!!STORAGE_PLATFORM}>
            <span className={styles.itemType}>
              {intl.formatMessage({ id: 'editor.submit.item.repo.private.name' })}
            </span>{' '}
            - {intl.formatMessage({ id: 'editor.submit.item.repo.private.description' })}
          </Radio>
          <div className={styles.itemRepo}>
            <div className={styles.itemStatus}>
              <span className={storageSetting ? styles.done : styles.undone} />
            </div>
            {storageSetting ? (
              <Link
                href={generateStorageLink(
                  STORAGE_PLATFORM,
                  `${storageSetting.userName}/${storageSetting.repoName}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.itemRepoName}
              >
                {`${storageSetting.userName} - ${storageSetting.repoName}`}
              </Link>
            ) : (
              <Text>{intl.formatMessage({ id: 'editor.submit.item.repo.noBuild' })}</Text>
            )}
          </div>
        </Form.Item>

        <Form.Item
          name="ipfs"
          label={intl.formatMessage({ id: 'editor.submit.item.gateway.label' })}
          className={styles.item}
        >
          <Checkbox
            value="ipfs"
            style={{ lineHeight: '32px' }}
            checked={gatewayChecked}
            onChange={(e) => handleGatewayChangeChecked(e.target.checked)}
          >
            <span className={styles.itemType}>
              {intl.formatMessage({ id: 'editor.submit.item.gateway.name' })}
            </span>{' '}
            - {intl.formatMessage({ id: 'editor.submit.item.gateway.description' })}
          </Checkbox>
        </Form.Item>

        {gatewayChecked && (
          <Fragment>
            <Form.Item name="select-multiple" label="" className={styles.item}>
              <div className={styles.flexAlignItemCenter}>
                <div className={styles.itemStatus}>
                  <span className={styles.done} />
                </div>
                <div className={styles.itemForm}>
                  <Select
                    placeholder={intl.formatMessage({
                      id: 'editor.submit.item.gateway.gatewayPlaceholder',
                    })}
                    bordered={false}
                    showArrow={false}
                    disabled={true}
                    defaultValue="ipfs"
                  >
                    <Option value="ipfs">IPFS - FLEEK</Option>
                  </Select>
                  <CaretDownOutlined />
                </div>
                <span className={styles.btn} style={{ color: 'rgba(0, 0, 0, 0.25)' }}>
                  {intl.formatMessage({ id: 'editor.submit.item.gateway.setting' })}
                </span>
              </div>
            </Form.Item>

            <Form.Item name="publicKey" label="" className={styles.item}>
              <div className={styles.flexAlignItemCenter}>
                <div className={styles.itemStatus}>
                  {publicKey ? (
                    <span className={styles.done} />
                  ) : (
                    <span className={styles.undone} />
                  )}
                </div>
                <div className={styles.itemForm}>
                  <Input
                    placeholder={intl.formatMessage({
                      id: 'editor.submit.item.gateway.keyPlaceholder',
                    })}
                    className={styles.input}
                    value={publicKey}
                    disabled={true}
                  />
                  {visibleSignature ? (
                    <EyeOutlined onClick={() => setVisibleSignature(!visibleSignature)} />
                  ) : (
                    <EyeInvisibleOutlined onClick={() => setVisibleSignature(!visibleSignature)} />
                  )}
                </div>
                <span className={styles.btn} onClick={() => setVisibleSignatureGenerate(true)}>
                  {intl.formatMessage({
                    id: 'editor.submit.item.gateway.keyGenerate',
                  })}
                </span>
              </div>
            </Form.Item>
            {visibleSignature && (
              <div className={styles.key}>
                <div className={styles.keyVal}>
                  {publicKey ||
                    intl.formatMessage({
                      id: 'editor.submit.item.gateway.noKey',
                    })}
                </div>
                <div className={styles.keyGenerate}>
                  {intl.formatMessage({
                    id: 'editor.submit.item.gateway.keyGenerateText',
                  })}{' '}
                  <Link onClick={() => window.open('/manage/account')}>
                    <ArrowRightOutlined />
                  </Link>
                </div>
              </div>
            )}
          </Fragment>
        )}

        <Form.Item className={styles.footer}>
          <Space>
            <Button onClick={() => setDropdownVisible(false)}>
              {intl.formatMessage({
                id: 'component.button.cancel',
              })}
            </Button>
            <Button type="primary" htmlType="submit">
              {intl.formatMessage({
                id: 'component.button.submit',
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
