import type { FC } from 'react';
import { Fragment, useState, useMemo, useCallback } from 'react';
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
import { useIntl } from 'umi';

const { Link } = Typography;

interface Props {
  readonly license: string;
  handleChangeLicense: (val: string) => Promise<void>;
}

type LicenseRadioValueType = '' | 'nd' | 'sa';

const SettingsCopyrightNotice: FC<Props> = ({ license, handleChangeLicense }) => {
  const intl = useIntl();

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

        // set default license
        handleLicenseRadioChange('');
      } else {
        // remove license
        handleLicenseRadioChange('');
        setLicenseCheckboxValue(false);

        // No original statement, remove license
        handleChangeLicense('');
      }
    },
    [handleLicenseRadioChange, handleChangeLicense],
  );

  useMount(() => {
    if (license) {
      setCCLicense(license);
      setOriginalCheckbox(true);
    }
  });

  return (
    <Fragment>
      <section className={styles.item}>
        <p className={styles.itemTitle}>{intl.formatMessage({ id: 'editor.license.title' })}</p>
        <section className={styles.itemContent}>
          <div className={styles.originalTitle}>
            {intl.formatMessage({ id: 'editor.license.originalStatement.tip' })}&nbsp;
            <Tooltip
              title={intl.formatMessage({ id: 'editor.license.originalStatement.tip' })}
              placement="top"
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </div>
          <div>
            <Checkbox
              checked={originalCheckbox}
              onChange={(e) => handleOriginalCheckbox(e.target.checked)}
            >
              {intl.formatMessage({ id: 'editor.license.originalStatement.checkbox' })}
            </Checkbox>
          </div>

          {originalCheckbox && (
            <Fragment>
              <div className={styles.originalTips}>
                {intl.formatMessage({ id: 'editor.license.creativeCommons' })}&nbsp;
                <Tooltip
                  title={intl.formatMessage({ id: 'editor.license.creativeCommons.tip' })}
                  placement="top"
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </div>
              <div className={styles.originalTips}>
                {intl.formatMessage({ id: 'editor.license.creativeCommons.share' })}
              </div>
              <Space direction="vertical">
                <Radio.Group
                  onChange={(e) => handleLicenseRadioChange(e.target.value)}
                  value={licenseRadioValue}
                >
                  <Space direction="vertical">
                    <Radio value={''}>
                      {intl.formatMessage({ id: 'editor.license.creativeCommons.allow' })}
                    </Radio>
                    <Radio value={'nd'}>
                      {intl.formatMessage({ id: 'editor.license.creativeCommons.nd' })}&nbsp;
                      <Tooltip
                        title={intl.formatMessage({ id: 'editor.license.creativeCommons.nd.tip' })}
                        placement="top"
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Radio>
                    <Radio value={'sa'}>
                      {intl.formatMessage({ id: 'editor.license.creativeCommons.sa' })}&nbsp;
                      <Tooltip
                        title={intl.formatMessage({ id: 'editor.license.creativeCommons.sa.tip' })}
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
                  {intl.formatMessage({ id: 'editor.license.creativeCommons.businessAllowed' })}
                </Checkbox>
              </Space>

              <Link
                href={CCLicenseCredit?.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.originalTerms}
              >
                {intl.formatMessage({ id: 'editor.license.creativeCommons.terms' })}
                {CCLicenseCredit?.chinese}
              </Link>
            </Fragment>
          )}
        </section>
      </section>
      <Modal
        title={intl.formatMessage({ id: 'editor.license.originalStatement' })}
        visible={originalNoticeVisible}
        onOk={() => setOriginalNoticeVisible(false)}
        onCancel={() => setOriginalNoticeVisible(false)}
      >
        <Space direction="vertical">
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.one' })}</div>
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.two' })}</div>
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.three' })}</div>
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.four' })}</div>
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.five' })}</div>
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.six' })}</div>
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.seven' })}</div>
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.eight' })}</div>
          <div>{intl.formatMessage({ id: 'editor.license.originalStatement.content.nine' })}</div>
        </Space>
      </Modal>
    </Fragment>
  );
};

export default SettingsCopyrightNotice;
