import type { FC } from 'react';
import React, { useCallback } from 'react';
import { Modal, Card, Form, Input, Button, Checkbox, Radio, Select, Space } from 'antd';
import { KeyOutlined, EyeOutlined, CaretDownOutlined, ArrowRightOutlined } from '@ant-design/icons';
import styles from './submit.less';

interface Props {
  handlePublish: () => void;
}

const { Option } = Select;
const { confirm } = Modal;

const Submit: FC<Props> = ({ handlePublish }) => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
    if (false) {
      handlePublish();
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const showConfirmKey = useCallback(() => {
    confirm({
      title: '生成非金融 KEY',
      icon: <KeyOutlined />,
      content: (
        <div>
          <p>检测到您当前还未生成 非金融 KEY</p>
          <p>(存储在浏览器中，用户产生加密签名)</p>
          <Input placeholder="KEY" />
        </div>
      ),
      okText: '管理',
      cancelText: '立即生成',
      closable: true,
      zIndex: 1051,
    });
  }, []);

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
              <Select placeholder="网关未选定" bordered={false} showArrow={false}>
                <Option value="ipfs">IPFS</Option>
                <Option value="github">GITHUB</Option>
              </Select>
              <CaretDownOutlined />
            </div>
            <span className={styles.btn}>设置</span>
          </div>
        </Form.Item>

        <Form.Item name="select-multiple" label="" className={styles.item}>
          <div className={styles.flexAlignItemCenter}>
            <div className={styles.itemStatus}>
              <span className={styles.done} />
            </div>
            <div className={styles.itemForm}>
              <Input placeholder="签名未设置" className={styles.input} />
              <EyeOutlined />
              {/* <EyeInvisibleOutlined /> */}
            </div>
            <span className={styles.btn} onClick={showConfirmKey}>
              生成
            </span>
          </div>
        </Form.Item>
        <div className={styles.key}>
          <div className={styles.keyVal}>0x3484040A7c337A95d0eD7779769ffe3e14ecCcA6</div>
          <div className={styles.keyGenerate}>
            生成自你的非金融 KEY{' '}
            <a href="#">
              <ArrowRightOutlined />
            </a>
          </div>
        </div>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }} className={styles.footer}>
          <Space>
            <Button>取消</Button>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Submit;
