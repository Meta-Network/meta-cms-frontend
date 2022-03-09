import { assign, isEmpty } from 'lodash';
import moment from 'moment';
import request from 'umi-request';
import {
  generateSeed,
  generateKeys,
  authorPublishMetaSpaceRequest,
  authorPostDigest,
  authorPostDigestSign,
} from '@metaio/meta-signature-util-v2';
import type {
  KeyPair,
  BaseSignatureMetadata,
  AuthorPostDigestMetadata,
  AuthorPostSignatureMetadata,
} from '@metaio/meta-signature-util-v2';
import { storeGet, storeSet } from './store';
import {
  KEY_META_CMS_METADATA_SEED,
  KEY_META_CMS_METADATA_PUBLIC_KEYS,
  GITHUB_URL,
  editorRules,
} from '../../config';
import { uploadToIpfsAPI } from '../helpers';
import { isValidUrl, sleep } from '.';
import { xssSummary } from './xss';
import { urlReg } from './reg';

type VerifySeedAndKeyReturnState = { seed: string[]; publicKey: string } | false;
type PublishMetaSpaceRequestState = {
  metadata: BaseSignatureMetadata;
  metadataIpfs: Storage.Fleek;
};

/**
 * 校验 vditor 是否存在
 * @returns
 */
export const hasVditor = async (time = 300): Promise<boolean> => {
  while (!(window.vditor && window.vditor.hasOwnProperty('vditor'))) {
    await sleep(time);
    console.log('sleep %s vditor', time);
  }

  console.log('hash vditor');
  return window.vditor.hasOwnProperty('vditor');
};

/**
 * parse Image Src
 * @param outerHTML
 * @returns
 */
export const parseImageSrc = (outerHTML: string) => {
  const outerHTMLSrcResult = outerHTML.match('src=".*?"');
  return outerHTMLSrcResult ? outerHTMLSrcResult[0].slice(5, -1) : '';
};

/**
 * generate summary
 * @returns
 */
export const generateSummary = async (): Promise<string> => {
  await hasVditor();

  // TODO: 没有删掉 \n
  try {
    const htmlContent = window.vditor.getHTML();
    if (htmlContent) {
      const summery = xssSummary(htmlContent);
      return summery.length >= editorRules.summary.max
        ? `${summery.slice(0, editorRules.summary.max - 3)}...`
        : summery;
    }
    return '';
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * post data merged updateAt
 */
export const postDataMergedUpdateAt = (data: any) =>
  assign(data, { updatedAt: moment().toISOString() });

/**
 * generate Seed And Key
 * @returns
 */
export const generateSeedAndKey = (): {
  seed: string[];
  keys: KeyPair;
} => {
  const seed: string[] = generateSeed();
  const keys: KeyPair = generateKeys(seed);

  storeSet(KEY_META_CMS_METADATA_SEED, JSON.stringify(seed));
  storeSet(KEY_META_CMS_METADATA_PUBLIC_KEYS, keys.public);

  return {
    seed,
    keys,
  };
};

/**
 * verify Seed And Key
 * @returns object or false
 */
export const verifySeedAndKey = (): VerifySeedAndKeyReturnState => {
  const seedStore = JSON.parse(storeGet(KEY_META_CMS_METADATA_SEED) || '[]');
  const publicKeyStore = storeGet(KEY_META_CMS_METADATA_PUBLIC_KEYS) || '';

  if (isEmpty(seedStore) || !publicKeyStore) {
    console.error('Seed or key does not exist.');
    return false;
  }

  const keys: KeyPair = generateKeys(seedStore);

  // Verify that the seed and key match
  if (publicKeyStore === keys.public) {
    return {
      seed: seedStore,
      publicKey: publicKeyStore,
    };
  } else {
    console.error('Seed or key does not match.');
    return false;
  }
};

/**
 * generate Storage Link
 * @param platform
 * @param url
 * @returns
 */
export const generateStorageLink = (platform: CMS.StoragePlatform, url: string) => {
  const list = {
    github: GITHUB_URL,
  };

  return `${list[platform]}/${url}`;
};

export const generateDataViewerLink = (type: CMS.MetadataStorageType, refer: string): string => {
  return `${META_NETWORK_DATA_VIEWER_URL}/${type}/${refer}`;
};

/**
 * publish MetaSpace Request
 * 抛出来的错误 用于外部判断做多语言显示
 * @param { serverDomain }
 * serverDomain The author claims to publish their Meta Space to this domain
 * @returns
 */
export const publishMetaSpaceRequest = async ({
  serverDomain,
}: {
  serverDomain: string;
}): Promise<PublishMetaSpaceRequestState> => {
  const seedStore: string[] = JSON.parse(storeGet(KEY_META_CMS_METADATA_SEED) || '[]');
  if (!seedStore.length) {
    throw new Error('empty seed');
  }
  const keys: KeyPair = generateKeys(seedStore);
  const data = authorPublishMetaSpaceRequest.generate(keys, serverDomain);
  const dataBlob = new Blob([JSON.stringify(data)], {
    type: 'application/json',
  });
  const dataMetadataForm = new FormData();
  dataMetadataForm.append(
    'file',
    dataBlob,
    `metadata-authorPublishMetaSpaceRequest-${data.ts}.json`,
  );

  const dataMetadataResult = await uploadToIpfsAPI(dataMetadataForm);
  if (!dataMetadataResult) {
    throw new Error('upload fail');
  }

  return {
    metadata: data,
    metadataIpfs: dataMetadataResult,
  };
};

/**
 * generate pipelinesPostOrdersData
 * @param payload
 * @returns
 */
export const pipelinesPostOrdersData = ({
  payload,
}: {
  payload: {
    categories: string;
    content: string;
    cover: string;
    license: string;
    summary: string;
    tags: string;
    title: string;
  };
}): {
  authorPostDigest: AuthorPostDigestMetadata;
  authorPostDigestSign: AuthorPostSignatureMetadata;
} => {
  const verifyResult = verifySeedAndKey();
  if (!verifyResult) {
    throw new Error('seed or key does not exist or does not match.');
  }

  const keys: KeyPair = generateKeys(verifyResult.seed);

  const authorPostDigestResult = authorPostDigest.generate(payload);
  // console.log('authorPostDigestResult', authorPostDigestResult);

  const authorPostDigestSignResult = authorPostDigestSign.generate(
    keys,
    META_SPACE_BASE_DOMAIN,
    authorPostDigestResult.digest,
  );
  // console.log('authorPostDigestSignResult', authorPostDigestSignResult);

  return {
    authorPostDigest: authorPostDigestResult,
    authorPostDigestSign: authorPostDigestSignResult,
  };
};

/**
 * 是否有效图片
 * @param src
 * @returns
 */
export const isValidImage = async (src: string) => {
  try {
    const response = await request.get(src, {
      responseType: 'blob',
    });

    return !!response;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * 获取过滤后的 HTML 然后转成 Markdown
 * @returns
 */
export const renderFilteredContent = async (): Promise<string> => {
  await hasVditor();

  try {
    const htmlContent = window.vditor.getHTML();
    if (htmlContent) {
      return window.vditor.html2md(htmlContent);
    }
    return '';
  } catch (e) {
    console.error(e);
    return '';
  }
};

/**
 * 获取预览区域所有图片地址
 * @returns
 */
export const getPreviewImageLink = async (existList: string[]): Promise<string[]> => {
  await hasVditor();

  try {
    const htmlContent = window.vditor.getHTML();
    if (htmlContent) {
      const DIV = document.createElement('div');
      DIV.innerHTML = htmlContent;

      const imageLinkList: HTMLImageElement[] = [
        ...(DIV.querySelectorAll('img') as NodeListOf<HTMLImageElement>),
      ];

      /**
       * 过滤条件
       *
       * 1. 有 src
       * 2. 非法 url 和 url 正则检查
       * 3. src 不为 fleek (已上传)
       *      图片不存在（会在编辑器方法里面处理）
       * 4. 图片没有处理过
       * 5. 空 空地址会使用当前 url 需要屏蔽（现在使用 outerHTML，会直接为空过滤掉）
       */

      // 过滤
      const list = imageLinkList.reduce(
        (previousValue: string[], currentValue: HTMLImageElement) => {
          const outerHTMLSrc = parseImageSrc(currentValue.outerHTML);

          // console.log('outerHTMLSrc', outerHTMLSrc, outerHTMLSrc.length);

          if (
            outerHTMLSrc &&
            isValidUrl(outerHTMLSrc) &&
            urlReg.test(outerHTMLSrc) &&
            !outerHTMLSrc.includes(FLEEK_NAME) &&
            !existList.includes(outerHTMLSrc) &&
            outerHTMLSrc !== window.location.href
          ) {
            previousValue.push(outerHTMLSrc);
          }

          return previousValue;
        },
        [],
      );

      // 清理格式
      // console.log('list', list);

      // 去重
      return [...new Set(list)];
    }
    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * 检查所有图片链接是否有效
 * @returns
 */
export const checkAllImageLink = async (): Promise<string[]> => {
  await hasVditor();

  const htmlContent = window.vditor.getHTML();
  if (htmlContent) {
    const DIV = document.createElement('div');
    DIV.innerHTML = htmlContent;

    const imageLinkList: HTMLImageElement[] = [
      ...(DIV.querySelectorAll('img') as NodeListOf<HTMLImageElement>),
    ];

    const list = imageLinkList.reduce((previousValue: string[], currentValue: HTMLImageElement) => {
      const outerHTMLSrc = parseImageSrc(currentValue.outerHTML);

      if (!outerHTMLSrc || !isValidUrl(outerHTMLSrc) || !urlReg.test(outerHTMLSrc)) {
        previousValue.push(outerHTMLSrc);
      }

      return previousValue;
    }, []);

    // console.log('list', list);

    return list;
  }

  return [];
};

/**
 * 转换无效链接为消息提示
 * @param list
 * @returns
 */
export const convertInvalidUrlMessage = (list: string[]): string => {
  return list.reduce((previousValue, currentValue) => {
    return previousValue + `【"${currentValue}"】`;
  }, '');
};
