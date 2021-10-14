import React, { useState, useCallback, useEffect } from 'react';

import { history } from 'umi';
import { Input, message } from 'antd';
import Editor from '../../components/Editor';
import styles from './Edit.less';
import UploadImage from '@/components/Editor/uploadImage';
import EditorHeader from '@/components/Editor/editorHeader';
import { useMount } from 'ahooks';
import { dbPostsUpdate, dbPostsAdd, dbPostsGet } from '../../models/db';
import { PostTempData } from '../../models/Posts';
import type { Query } from '../../typings/Posts.d';
import { imageUploadByUrlAPI } from '@/helpers';
import { assign } from 'lodash';
import type Vditor from 'vditor';
const Edit: React.FC = () => {
  // cover
  const [cover, setCover] = useState<string>('');
  // title
  const [title, setTitle] = useState<string>('');
  // content
  const [content, setContent] = useState<string>('');
  // draft mode
  const [draftMode, setDraftMode] = useState<0 | 1 | 2>(0); // 0 1 2
  // vditor
  const [vditor, setVditor] = useState<Vditor>();
  // 处理图片上传开关
  const [flagImageUploadToIpfs, setFlagImageUploadToIpfs] = useState(false);
  /**
   * publish
   */
  const handlePublish = useCallback(() => {
    console.log('publish');

    console.log(title);
    console.log(content);
  }, [title, content]);

  /**
   * generate summary
   */
  const generateSummary = useCallback((): string => {
    const htmlContent = (window as any).vditor!.getHTML();
    if (htmlContent) {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      return div.innerText.length >= 100 ? div.innerText.slice(0, 97) + '...' : div.innerText;
    }
    return '';
  }, []);

  /**
   * handle history url state
   */
  const handleHistoryState = useCallback((id: string) => {
    window.history.replaceState({}, '', `?id=${id}`);
    history.location.query!.id = id;
  }, []);

  /**
   * async content to DB
   */
  const asyncContentToDB = useCallback(
    async (val: string) => {
      setContent(val);
      setDraftMode(1);

      const { id } = history.location.query as Query;
      const data = { content: val, summary: generateSummary() };
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData, data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [generateSummary, handleHistoryState],
  );

  /**
   * handle image upload to ipfs
   */
  const handleImageUploadToIpfs = useCallback(async () => {
    if (flagImageUploadToIpfs) return;
    setFlagImageUploadToIpfs(true);

    const _vditor = (window as any).vditor;
    if (!_vditor) {
      setFlagImageUploadToIpfs(false);
      return;
    }

    const contentHTML = _vditor.getHTML();
    const DIV = document.createElement('div');
    DIV.innerHTML = contentHTML;

    const imgList: HTMLImageElement[] = [
      // TODO: type ts
      // @ts-ignore
      ...(DIV.querySelectorAll('img') as NodeListOf<HTMLImageElement>),
    ];

    const imgListFilter = imgList.filter((i) => {
      const reg = new RegExp('[a-zA-z]+://[^s]*');

      // get img src
      const result = i.outerHTML.match('src=".*?"');
      const _src = result ? result[0].slice(5, -1) : '';
      // console.log('_src', _src);

      return i.src && !i.src.includes('https://storageapi.fleek.co') && reg.test(_src);
    });
    // console.log('imgListFilter', imgListFilter);

    if (imgListFilter.length > 0) {
      _vditor.disabled();

      for (let i = 0; i < imgListFilter.length; i++) {
        const ele = imgListFilter[i];

        const result = await imageUploadByUrlAPI(ele.src);
        if (result) {
          // _vditor.tip('上传成功', 2000);
          message.success('上传成功');
          ele.src = result.publicUrl;
          ele.alt = result.key;
        }
      }

      // console.log('imgList', imgList);

      const mdValue = _vditor.html2md(DIV.innerHTML);

      _vditor.setValue(mdValue);

      await asyncContentToDB(mdValue);

      _vditor.enable();
    }

    setFlagImageUploadToIpfs(false);
  }, [flagImageUploadToIpfs, asyncContentToDB]);

  /**
   * handle async content to db
   */
  const handleAsyncContentToDB = useCallback(
    async (val: string) => {
      await asyncContentToDB(val);
      await handleImageUploadToIpfs();
    },
    [asyncContentToDB, handleImageUploadToIpfs],
  );

  /**
   * fetch DB content
   */
  const fetchDBContent = useCallback(async () => {
    const { id } = history.location.query as Query;
    if (id) {
      const result = await dbPostsGet(Number(id));
      if (result) {
        console.log('result', result);
        setCover(result.cover);
        setTitle(result.title);
        setContent(result.content);

        setTimeout(() => {
          (window as any).vditor!.setValue(result.content);
          // handle all image
          handleImageUploadToIpfs();
        }, 1000);
      }
    }
  }, []);

  /**
   * async cover to DB
   */
  const asyncCoverToDB = useCallback(
    async (url: string) => {
      setCover(url);
      setDraftMode(1);

      const { id } = history.location.query as Query;
      const data = { cover: url };
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        const resultID = await dbPostsAdd(assign(PostTempData, data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [handleHistoryState],
  );

  /**
   * async title to DB
   */
  const asyncTitleToDB = useCallback(
    async (val: string) => {
      setTitle(val);
      setDraftMode(1);

      const { id } = history.location.query as Query;
      const data = { title: val };
      if (id) {
        await dbPostsUpdate(Number(id), data);
      } else {
        assign(PostTempData, data);
        const resultID = await dbPostsAdd(assign(PostTempData, data));
        handleHistoryState(String(resultID));
      }

      setDraftMode(2);
    },
    [handleHistoryState],
  );

  useMount(() => {
    fetchDBContent();
  });

  useEffect(() => {
    console.log('watch', vditor);
    if (!!vditor) {
      console.log(`Update Default Vditor:`, vditor);
    }

    // 10s handle all image
    const timer = setInterval(handleImageUploadToIpfs, 10000);
    return () => clearInterval(timer);
  }, [vditor, handleImageUploadToIpfs]);

  return (
    <section className={styles.container}>
      <EditorHeader draftMode={draftMode} handlePublish={handlePublish} />
      <section className={styles.edit}>
        <UploadImage cover={cover} asyncCoverToDB={asyncCoverToDB} />
        <Input
          type="text"
          placeholder="Title"
          className={styles.title}
          maxLength={30}
          value={title}
          onChange={(e) => asyncTitleToDB(e.target.value)}
        />
        <Editor asyncContentToDB={handleAsyncContentToDB} bindVditor={setVditor} />
      </section>
    </section>
  );
};

export default Edit;
