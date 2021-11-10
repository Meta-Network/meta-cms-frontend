import type { FC } from 'react';
import React, { Fragment, useCallback, useState, useEffect } from 'react';
import { Modal, Card, Form, Input, Button, Checkbox, Radio, Select, Space, message } from 'antd';
import {
  KeyOutlined,
  EyeOutlined,
  CaretDownOutlined,
  ArrowRightOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import styles from './submit.less';
// import * as utils from '@metaio/meta-signature-util';
import { generateSeedAndKey, verifySeedAndKey } from '@/utils/editor';

interface Props {
  handlePublish: () => void;
}

const { Option } = Select;

const Submit: FC<Props> = ({ handlePublish }) => {
  const [visibleSignatureGenerate, setVisibleSignatureGenerate] = useState<boolean>(false);
  const [visibleSignature, setVisibleSignature] = useState<boolean>(false);
  const [signatureLoading, setSignatureLoading] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>('');

  const [gatewayLoading, setGatewayLoading] = useState<boolean>(true);

  const onFinish = (values: any) => {
    console.log('Success:', values);
    // if (false) {
    //   handlePublish();
    // }

    if (!publicKey) {
      message.warning('请生成 非金融 KEY');
      return;
    }

    handlePublish();
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
   * generate Seed and Key
   */
  const generatePublicKey = useCallback(() => {
    // test
    // const seed: string[] = generateSeed();
    // console.log('seed', seed);

    // const keys: KeyPair = generateKeys(seed);
    // console.log('keys', keys);

    // const payload = {
    //   title: 'One testing post',
    //   categories: 'Meta Network,Testing',
    //   content: 'Some post content here...May be very long...',
    //   cover: 'https://cover.url.com/',
    //   licence: 'CC BY 4.0',
    //   summary: 'Some post content here...',
    //   tags: 'Testing Tag, UnitTest',
    // };
    // const digestMetadata: AuthorDigestRequestMetadata = generatePostDigestRequestMetadata(payload);
    // console.log('digestMetadata', digestMetadata);

    // const authorSignatureMetadata: AuthorSignatureMetadata = generateAuthorDigestSignMetadata(
    //   keys,
    //   'metaspace.life',
    //   digestMetadata.digest,
    // );
    // console.log('authorSignatureMetadata', authorSignatureMetadata);

    // // test
    // return {
    //   authorDigestSignatureMetadataStorageType: 'ipfs',
    //   authorDigestSignatureMetadataRefer: authorSignatureMetadata.signature,
    // };

    // const seed = JSON.parse(storeGet(KEY_META_CMS_METADATA_SEED) || '[]');
    // const publicKey = JSON.parse(storeGet(KEY_META_CMS_METADATA_PUBLIC_KEYS) || '""');
    // const privateKey = JSON.parse(storeGet(KEY_META_CMS_METADATA_PRIVATE_KEYS || '""');

    const { keys } = generateSeedAndKey();

    return {
      publicKey: keys.public,
    };
  }, []);

  /**
   * handle generate publicKey
   */
  const handleGeneratePublicKey = useCallback(async () => {
    setSignatureLoading(true);

    try {
      const { publicKey: _publicKey } = generatePublicKey();
      setPublicKey(_publicKey);

      message.success('生成成功');
    } catch (error) {
      console.log('error', error);
      message.error('生成失败');
    }

    setSignatureLoading(false);
  }, [generatePublicKey, setPublicKey]);

  /**
   * handle set gateway
   */
  const handleSetGateway = useCallback(async () => {
    setGatewayLoading(true);
    // // const result = await something()
    // await sleep(2000);
    // const result = true;
    // if (result) {
    //   message.success('设置成功');
    // } else {
    //   message.error('设置失败');
    // }
    // setGatewayLoading(false);
  }, []);

  useEffect(() => {
    // (window as any).utils = utils;
    getSeedAndKey();
  }, [getSeedAndKey]);

  return (
    <Card title="准备好提交文章到仓储仓库了？" bodyStyle={{ padding: 0 }} style={{ width: 340 }}>
      <Form
        name="basic"
        initialValues={{ remember: true }}
        layout={'vertical'}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item name="radio-group" label="储存正文" className={styles.item}>
          <Radio.Group>
            <Radio value="a">
              <span className={styles.itemType}>Github私密库</span> - 存储未发布内容
            </Radio>
          </Radio.Group>
          <div className={styles.itemRepo}>
            <div className={styles.itemStatus}>
              <span className={styles.done} />
            </div>
            <a href="#" className={styles.itemRepoName}>
              guanchao71 - linkework....
            </a>
          </div>
        </Form.Item>

        <Form.Item name="checkbox-group" label="存证服务" className={styles.item}>
          <Checkbox.Group>
            <Checkbox value="A" style={{ lineHeight: '32px' }}>
              <span className={styles.itemType}>IPFS</span> - 存储可验证的元数据
            </Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item name="select-multiple" label="" className={styles.item}>
          <div className={styles.flexAlignItemCenter}>
            <div className={styles.itemStatus}>
              <span className={styles.done} />
            </div>
            <div className={styles.itemForm}>
              <Select
                placeholder="网关未选定"
                bordered={false}
                showArrow={false}
                disabled={gatewayLoading}
                defaultValue="ipfs"
              >
                <Option value="ipfs">IPFS</Option>
                <Option value="github">GITHUB</Option>
              </Select>
              <CaretDownOutlined />
            </div>
            <span onClick={handleSetGateway} className={styles.btn}>
              设置
            </span>
          </div>
        </Form.Item>

        <Form.Item name="publicKey" label="" className={styles.item}>
          <div className={styles.flexAlignItemCenter}>
            <div className={styles.itemStatus}>
              {publicKey ? <span className={styles.done} /> : <span className={styles.undone} />}
            </div>
            <div className={styles.itemForm}>
              <Input
                placeholder="签名未设置"
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
              生成
            </span>
          </div>
        </Form.Item>
        {visibleSignature && (
          <div className={styles.key}>
            <div className={styles.keyVal}>{publicKey || '暂无'}</div>
            <div className={styles.keyGenerate}>
              生成自你的非金融 KEY{' '}
              <a href="javascript:;" onClick={() => setVisibleSignatureGenerate(true)}>
                <ArrowRightOutlined />
              </a>
            </div>
          </div>
        )}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }} className={styles.footer}>
          <Space>
            <Button>取消</Button>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Modal
        visible={visibleSignatureGenerate}
        title={
          <Fragment>
            <KeyOutlined />
            &nbsp;生成非金融 KEY
          </Fragment>
        }
        onCancel={() => setVisibleSignatureGenerate(false)}
        footer={[
          <Button onClick={() => setVisibleSignatureGenerate(false)}>取消</Button>,
          <Button type="primary" loading={signatureLoading} onClick={handleGeneratePublicKey}>
            {publicKey ? '重新生成' : '立即生成'}
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <div>{publicKey ? '您已生成 非金融 KEY' : '检测到您当前还未生成 非金融 KEY'}</div>
          <div>(存储在浏览器中，用户产生加密签名)</div>
          <Input value={publicKey} placeholder="KEY" disabled />
        </Space>
      </Modal>
    </Card>
  );
};

export default Submit;
