import { assign, isEmpty } from 'lodash';
import moment from 'moment';
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
} from '../../config';
import { uploadToIpfsAPI } from '../helpers';

type VerifySeedAndKeyReturnState = { seed: string[]; publicKey: string } | false;
type PublishMetaSpaceRequestState = {
  metadata: BaseSignatureMetadata;
  metadataIpfs: Storage.Fleek;
};

/**
 * generate summary
 * @returns
 */
export const generateSummary = (): string => {
  // TODO: modify
  try {
    const htmlContent = (window as any).vditor!.getHTML();
    if (htmlContent) {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      return div.innerText.length >= 100 ? `${div.innerText.slice(0, 97)}...` : div.innerText;
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
