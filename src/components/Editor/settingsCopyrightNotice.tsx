import type { FC } from 'react';
import { Fragment, useState, useEffect } from 'react';
import { Tooltip, Radio, Checkbox, Modal, Space } from 'antd';
import { QuestionCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import styles from './settings.less';

const SettingsCopyrightNotice: FC = () => {
  const [value, setValue] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [originalCheckbox, setOriginalCheckbox] = useState(false);

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onChange = (e: any) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  function onChangeCheckbox(e: any) {
    console.log(`checked = ${e.target.checked}`);
  }

  useEffect(() => {
    console.log('originalCheckbox', originalCheckbox);
    if (originalCheckbox) {
      setIsModalVisible(true);
    }
  }, [originalCheckbox]);

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
              onChange={(e) => setOriginalCheckbox(e.target.checked)}
            >
              我声明此文章为本人原创
            </Checkbox>
          </div>

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
              <Radio.Group onChange={onChange} value={value}>
                <Space direction="vertical">
                  <Radio value={1}>允许</Radio>
                  <Radio value={2}>
                    不允许&nbsp;
                    <Tooltip title="不允许" placement="top">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Radio>
                  <Radio value={3}>
                    仅允许采用本协议授权的二次创作&nbsp;
                    <Tooltip title="仅允许采用本协议授权的二次创作" placement="top">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Radio>
                </Space>
              </Radio.Group>
              <Checkbox onChange={onChangeCheckbox}>允许商业性使用</Checkbox>
            </Space>

            <div className={styles.originalTerms}>则授权条款为：署名-非商业性使用-禁止演绎</div>
          </Fragment>
        </section>
      </section>
      <Modal title="原创声明" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>
          勾选本原创声明，即代表您确认并承诺该文章，包括文章中的使用的图片等其他元素，是由您本人（或持有该账号之组织）独立创作完成，或者已取得原作权利人的使用许可。有如下情况的文章请勿勾选本原创声明：
        </p>
        <p>1.歪曲、篡改、抄袭、剽窃他人创作而产生的作品，</p>
        <p>
          2.文章主要篇幅为诸如“法律、法规，国家机关的决议、决定、命令和其他具有立法、行政、司法性质的文件、时事新闻、历法、通用数表、通用表格和公式”等的公共内容；
        </p>
        <p>3.转发他人作品形成的内容，</p>
        <p>4.大篇幅引用他人内容或文章主要内容为他人作品，如书摘、文摘、报摘等；</p>
        <p>5.文章主体系整合、汇编他人作品内容</p>
        <p>6.通过其他侵犯著作权或其他权益方式形成的内容。</p>
        <p>在取得原作者或权利人同意后，对作品进行改编、翻译再创作的，视同原创。</p>
        <p>
          瞬MATATAKI鼓励用户发布原创文章，勾选本原创声明的文章会展示原创标识。但本原创声明仅是您对文章内容原创性的单方承诺，并不表示瞬MATATAKI认可了文章的原创性。若您在勾选本原创声明后，文章被证明并非独立原创，瞬MATATAKI将按照平台规范下架等。
        </p>
      </Modal>
    </Fragment>
  );
};

export default SettingsCopyrightNotice;
