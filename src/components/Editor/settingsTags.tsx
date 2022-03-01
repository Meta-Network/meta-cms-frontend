import React, { useState, useCallback, useMemo } from 'react';
import { useIntl } from 'umi';
import { message, Select } from 'antd';
import styles from './settings.less';
import { useMount } from 'ahooks';
import { getDefaultSiteConfigAPI } from '@/helpers';
import { spaceTagsAPI } from '@/services/api/space';
import { storeGet, storeSet } from '@/utils/store';
import { uniqBy } from 'lodash';
import { editorRules } from '../../../config';

const { Option } = Select;
const KEY_META_CMS_HISTORY_TAGS = 'metaCmsHistoryTags';
const HISTORY_TAGS_MAX = 10;
const SPACE_TAGS_MAX = 20;
const SELECT_TAGS_MAX = editorRules.tags.maxNumber;

interface Props {
  readonly tags: string[];
  handleChangeTags: (val: string[]) => void;
}

// TODO: 暂时自定义 后续可自定义
const tagsDefaultList = [
  { name: 'Meta' },
  { name: 'MetaNetwork' },
  { name: 'MetaCMS' },
  { name: 'BTC' },
  { name: 'ETH' },
  { name: '区块链' },
  { name: '虚拟货币' },
  { name: '数字货币' },
  { name: '加密货币' },
  { name: '比特币' },
  { name: '以太坊' },
  { name: '空投' },
];

const SettingsTags: React.FC<Props> = ({ tags, handleChangeTags }) => {
  const intl = useIntl();
  const [spaceTags, setSpaceTags] = useState<Space.Tags[]>([]);
  const [historyTags, setHistoryTags] = useState<string[]>([]);

  // tags list
  const tagsList = useMemo(() => {
    // space tags, max 20 tags
    const spaceTagsSortFn = (a: Space.Tags, b: Space.Tags) => b.count - a.count;
    const _spaceTagsSortResult = spaceTags.sort(spaceTagsSortFn);
    const _spaceTagsResult = _spaceTagsSortResult
      .map((i) => ({ name: i.name }))
      .slice(0, SPACE_TAGS_MAX);

    // history tags, max 10 tags
    const _historyTagsResult = historyTags.map((i) => ({ name: i })).slice(0, HISTORY_TAGS_MAX);

    // default tags

    return uniqBy([..._spaceTagsResult, ..._historyTagsResult, ...tagsDefaultList], 'name');
  }, [spaceTags, historyTags]);

  /**
   * fetch space tags
   */
  const fetchTags = useCallback(async () => {
    const resultDefaultSiteConfig = await getDefaultSiteConfigAPI();
    if (!resultDefaultSiteConfig) {
      return;
    }

    const resulSpaceTags = await spaceTagsAPI(resultDefaultSiteConfig.domain);

    if (resulSpaceTags) {
      setSpaceTags(resulSpaceTags);
    }
  }, []);

  /**
   * fetch history tags
   */
  const fetchHistoryTags = useCallback(async () => {
    const _historyTags = storeGet(KEY_META_CMS_HISTORY_TAGS);
    const _historyTagsResult: string[] = _historyTags ? JSON.parse(_historyTags) : [];

    setHistoryTags(_historyTagsResult);
  }, []);

  /**
   * merged history tags
   */
  const mergedHistoryTags = useCallback((val: string) => {
    if (!val) {
      return;
    }

    const _historyTags = storeGet(KEY_META_CMS_HISTORY_TAGS);
    const _historyTagsResult: string[] = _historyTags ? JSON.parse(_historyTags) : [];

    _historyTagsResult.unshift(val);

    // max 10 tags
    storeSet(
      KEY_META_CMS_HISTORY_TAGS,
      JSON.stringify([...new Set(_historyTagsResult.slice(0, HISTORY_TAGS_MAX))]),
    );
  }, []);

  /**
   * handle select change tags
   */
  const handleSelectChangeTags = useCallback(
    (val: string[]) => {
      // 判断新添加的 tag 长度
      if (val.length && val[val.length - 1].length > editorRules.tags.singleLength) {
        message.warning(
          intl.formatMessage(
            {
              id: 'messages.editor.verify.tag.singleLength',
            },
            {
              max: editorRules.tags.singleLength,
            },
          ),
        );
        return;
      }

      // 判断总个数
      if (val.length > SELECT_TAGS_MAX) {
        return;
      }
      handleChangeTags(val);

      // new add tag
      if (val.length > tags.length) {
        const currentTag = val.slice(val.length - 1)[0];
        mergedHistoryTags(currentTag);
      }
    },
    [tags, handleChangeTags, mergedHistoryTags, intl],
  );

  useMount(() => {
    fetchTags();
    fetchHistoryTags();
  });

  return (
    <section className={styles.item}>
      <p className={styles.itemTitle}>
        {intl.formatMessage({
          id: 'editor.header.settings.tags',
        })}
      </p>
      <section className={styles.itemContent}>
        <Select
          mode="tags"
          allowClear
          style={{ width: '100%' }}
          value={tags}
          onChange={handleSelectChangeTags}
        >
          {tagsList.map((i) => (
            <Option key={i.name} value={i.name}>
              {i.name}
            </Option>
          ))}
        </Select>
      </section>
    </section>
  );
};

export default SettingsTags;
