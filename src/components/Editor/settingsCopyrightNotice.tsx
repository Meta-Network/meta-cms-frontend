import type { FC } from 'react';
import { Fragment, useState, useMemo, useCallback } from 'react';
import { getLocale, getAllLocales } from 'umi';
import { Tooltip, Radio, Checkbox, Modal, Space, Typography } from 'antd';
import { QuestionCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import styles from './settings.less';
import {
  creativeCommonsLicenseGenerator,
  licenseDetailLink,
  extractLicense,
} from '@/utils/creative-commons';
import { useMount } from 'ahooks';
import useCreativeCommons from '@/hooks/useCreativeCommons';

const { Link } = Typography;

interface Props {
  readonly license: string;
  handleChangeLicense: (val: string) => Promise<void>;
}

type LicenseRadioValueType = '' | 'nd' | 'sa';

const SettingsCopyrightNotice: FC<Props> = ({ license, handleChangeLicense }) => {
  const [licenseRadioValue, setLicenseRadioValue] = useState<LicenseRadioValueType>('');
  const [licenseCheckboxValue, setLicenseCheckboxValue] = useState<boolean>(false);
  const [originalNoticeVisible, setOriginalNoticeVisible] = useState<boolean>(false);
  const [originalCheckbox, setOriginalCheckbox] = useState<boolean>(false);
  const { convertLicenseToDeedTitle } = useCreativeCommons();

  const CCLicenseCredit = useMemo(() => {
    if (!originalCheckbox) return {}; // 非原创不适用
    const _license = creativeCommonsLicenseGenerator({
      ShareAlike: licenseRadioValue === 'sa',
      Noncommercial: !licenseCheckboxValue,
      NoDerivativeWorks: licenseRadioValue === 'nd',
    });

    const _extractLicenseResult = extractLicense(_license);
    const chinese = convertLicenseToDeedTitle(extractLicense(_extractLicenseResult));
    const url = licenseDetailLink(_extractLicenseResult);
    return { license: _license, chinese, url };
  }, [originalCheckbox, licenseCheckboxValue, licenseRadioValue, convertLicenseToDeedTitle]);

  /**
   * set license
   */
  const setCCLicense = useCallback((_license: string) => {
    switch (extractLicense(_license)) {
      case 'BY-NC':
        setLicenseRadioValue('');
        setLicenseCheckboxValue(false);
        break;
      case 'BY-NC-ND':
        setLicenseRadioValue('nd');
        setLicenseCheckboxValue(false);
        break;
      case 'BY-NC-SA':
        setLicenseRadioValue('sa');
        setLicenseCheckboxValue(false);
        break;
      case 'BY':
        setLicenseRadioValue('');
        setLicenseCheckboxValue(true);
        break;
      case 'BY-ND':
        setLicenseRadioValue('nd');
        setLicenseCheckboxValue(true);
        break;
      case 'BY-SA':
        setLicenseRadioValue('sa');
        setLicenseCheckboxValue(true);
        break;
      default:
        console.log('未知协议不处理', _license);
        break;
    }

    // console.log('当前协议', _license);
  }, []);

  /**
   * handle license radio change
   */
  const handleLicenseRadioChange = useCallback(
    (val: LicenseRadioValueType) => {
      const _license = creativeCommonsLicenseGenerator({
        ShareAlike: val === 'sa',
        Noncommercial: !licenseCheckboxValue,
        NoDerivativeWorks: val === 'nd',
      });

      setLicenseRadioValue(val);
      handleChangeLicense(_license);
    },
    [licenseCheckboxValue, handleChangeLicense],
  );

  /**
   * handle license checkbox change
   */
  const handleLicenseCheckboxChange = useCallback(
    (val: boolean) => {
      const _license = creativeCommonsLicenseGenerator({
        ShareAlike: licenseRadioValue === 'sa',
        Noncommercial: !val,
        NoDerivativeWorks: licenseRadioValue === 'nd',
      });

      setLicenseCheckboxValue(val);
      handleChangeLicense(_license);
    },
    [licenseRadioValue, handleChangeLicense],
  );

  /**
   * handle original checkbox
   */
  const handleOriginalCheckbox = useCallback(
    (val: boolean) => {
      setOriginalCheckbox(val);

      // true show tips
      if (val) {
        setOriginalNoticeVisible(true);
      }

      // set license
      handleLicenseRadioChange('');
    },
    [handleLicenseRadioChange],
  );

  useMount(() => {
    if (license) {
      setCCLicense(license);
      setOriginalCheckbox(true);
    }

    console.log(getAllLocales());
    console.log(getLocale());
  });

  return (
    <Fragment>
      <section className={styles.item}>
        <p className={styles.itemTitle}>版权声明</p>
        <section className={styles.itemContent}>
          <div className={styles.originalTitle}>
            原创声明&nbsp;
            <Tooltip title="原创声明" placement="top">
              <QuestionCircleOutlined />
            </Tooltip>
          </div>
          <div>
            <Checkbox
              checked={originalCheckbox}
              onChange={(e) => handleOriginalCheckbox(e.target.checked)}
            >
              我声明此文章为本人原创
            </Checkbox>
          </div>

          {originalCheckbox && (
            <Fragment>
              <div className={styles.originalTips}>
                Creative Commons 授权许可协议&nbsp;
                <Tooltip title="Creative Commons 授权许可协议" placement="top">
                  <QuestionCircleOutlined />
                </Tooltip>
              </div>
              <div className={styles.originalTips}>
                请问您允许作品被别人转载、节选、混编、二次创作吗？
              </div>
              <Space direction="vertical">
                <Radio.Group
                  onChange={(e) => handleLicenseRadioChange(e.target.value)}
                  value={licenseRadioValue}
                >
                  <Space direction="vertical">
                    <Radio value={''}>允许</Radio>
                    <Radio value={'nd'}>
                      不允许&nbsp;
                      <Tooltip
                        title="他人不能再混合、转换、或者基于该作品创作，且不能分发修改后的作品"
                        placement="top"
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Radio>
                    <Radio value={'sa'}>
                      仅允许采用本协议授权的二次创作&nbsp;
                      <Tooltip
                        title="他人再混合、转换或者基于本作品进行创作，必须基于与原先许可协议相同的许可协议分发作品。"
                        placement="top"
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Radio>
                  </Space>
                </Radio.Group>
                <Checkbox
                  onChange={(e) => handleLicenseCheckboxChange(e.target.checked)}
                  checked={licenseCheckboxValue}
                >
                  允许商业性使用
                </Checkbox>
              </Space>

              <Link
                href={CCLicenseCredit?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.originalTerms}
              >
                则授权条款为：{CCLicenseCredit?.chinese}
              </Link>
            </Fragment>
          )}
        </section>
      </section>
      <Modal
        title="原创声明"
        visible={originalNoticeVisible}
        onOk={() => setOriginalNoticeVisible(false)}
        onCancel={() => setOriginalNoticeVisible(false)}
      >
        <Space direction="vertical">
          <div>
            勾选本原创声明，即代表您确认并承诺该文章，包括文章中的使用的图片等其他元素，是由您本人（或持有该账号之组织）独立创作完成，或者已取得原作权利人的使用许可。有如下情况的文章请勿勾选本原创声明：
          </div>
          <div>1.歪曲、篡改、抄袭、剽窃他人创作而产生的作品，</div>
          <div>
            2.文章主要篇幅为诸如“法律、法规，国家机关的决议、决定、命令和其他具有立法、行政、司法性质的文件、时事新闻、历法、通用数表、通用表格和公式”等的公共内容；
          </div>
          <div>3.转发他人作品形成的内容，</div>
          <div>4.大篇幅引用他人内容或文章主要内容为他人作品，如书摘、文摘、报摘等；</div>
          <div>5.文章主体系整合、汇编他人作品内容</div>
          <div>6.通过其他侵犯著作权或其他权益方式形成的内容。</div>
          <div>在取得原作者或权利人同意后，对作品进行改编、翻译再创作的，视同原创。</div>
          <div>
            瞬MATATAKI鼓励用户发布原创文章，勾选本原创声明的文章会展示原创标识。但本原创声明仅是您对文章内容原创性的单方承诺，并不表示瞬MATATAKI认可了文章的原创性。若您在勾选本原创声明后，文章被证明并非独立原创，瞬MATATAKI将按照平台规范下架等。
          </div>
        </Space>
      </Modal>
    </Fragment>
  );
};

export default SettingsCopyrightNotice;
