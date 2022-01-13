import type { FC } from 'react';
import { useState } from 'react';
import { Input, Select, Typography } from 'antd';
import {
  EyeOutlined,
  CaretDownOutlined,
  ArrowRightOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useIntl } from 'umi';
import styles from './submit.less';

const { Link } = Typography;
const { Option } = Select;

interface Props {
  readonly publicKey: string;
  setVisibleSignatureGenerate: (val: boolean) => void;
}

const GatewayIpfs: FC<Props> = ({ publicKey, setVisibleSignatureGenerate }) => {
  const intl = useIntl();
  const [visibleSignature, setVisibleSignature] = useState<boolean>(false);

  return (
    <section className={styles.gateway}>
      <section>
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
      </section>

      <section className={styles.itemGateway}>
        <div className={styles.flexAlignItemCenter}>
          <div className={styles.itemStatus}>
            {publicKey ? <span className={styles.done} /> : <span className={styles.undone} />}
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
      </section>
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
    </section>
  );
};

export default GatewayIpfs;
