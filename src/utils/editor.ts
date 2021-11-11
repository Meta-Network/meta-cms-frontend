import { assign, isEmpty } from 'lodash';
import moment from 'moment';
import {
  generateSeed,
  generateKeys,
  generatePostDigestRequestMetadata,
  generateAuthorDigestSignMetadata,
} from '@metaio/meta-signature-util';
import type {
  KeyPair,
  PostMetadata,
  AuthorDigestRequestMetadata,
  AuthorSignatureMetadata,
} from '@metaio/meta-signature-util/type/types.d';
import { storeGet, storeSet } from './store';
import { KEY_META_CMS_METADATA_SEED, KEY_META_CMS_METADATA_PUBLIC_KEYS } from '../../config';
import { uploadToIpfsAPI } from '../helpers';

type VerifySeedAndKeyReturnState = { seed: string[]; publicKey: string } | false;
type GenerateMetadataParams = { payload: PostMetadata };
type UploadMetadataParams = { payload: PostMetadata };
type GenerateMetadataReturnState =
  | {
      digestMetadata: AuthorDigestRequestMetadata;
      authorSignatureMetadata: AuthorSignatureMetadata;
    }
  | false;
type UploadMetadataReturnState =
  | {
      digestMetadata: AuthorDigestRequestMetadata;
      authorSignatureMetadata: AuthorSignatureMetadata;
      digestMetadataIpfs: Storage.Fleek;
      authorSignatureMetadataIpfs: Storage.Fleek;
    }
  | false;

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
 * generate metadata
 * @param { payload: PostMetadata }
 * @returns
 */
export const generateMetadata = ({
  payload,
}: GenerateMetadataParams): GenerateMetadataReturnState => {
  const verifyResult = verifySeedAndKey();
  if (!verifyResult) {
    console.error('seed or key does not exist or does not match.');
    return false;
  }

  const keys: KeyPair = generateKeys(verifyResult.seed);
  const digestMetadata: AuthorDigestRequestMetadata = generatePostDigestRequestMetadata(payload);
  console.log('digestMetadata', digestMetadata);

  const authorSignatureMetadata: AuthorSignatureMetadata = generateAuthorDigestSignMetadata(
    keys,
    META_SPACE_BASE_DOMAIN,
    digestMetadata.digest,
  );
  console.log('authorSignatureMetadata', authorSignatureMetadata);

  return {
    digestMetadata,
    authorSignatureMetadata,
  };
};

/**
 * upload metadata
 * @param { payload: PostMetadata }
 * @returns
 */
export const uploadMetadata = async ({
  payload,
}: UploadMetadataParams): Promise<UploadMetadataReturnState | false> => {
  const generateMetadataResult = generateMetadata({ payload });
  if (!generateMetadataResult) {
    return false;
  }
  const { digestMetadata, authorSignatureMetadata } = generateMetadataResult;

  // generate json file
  const digestMetadataBlob = new Blob([JSON.stringify(digestMetadata)], {
    type: 'application/json',
  });
  const digestMetadataForm = new FormData();
  digestMetadataForm.append(
    'file',
    digestMetadataBlob,
    `metadata-digest-${digestMetadata.ts}.json`,
  );

  const authorSignatureMetadataBlob = new Blob([JSON.stringify(authorSignatureMetadata)], {
    type: 'application/json',
  });
  const authorSignatureMetadataForm = new FormData();
  authorSignatureMetadataForm.append(
    'file',
    authorSignatureMetadataBlob,
    `metadata-author-signature-${authorSignatureMetadata.ts}.json`,
  );

  // upload ipfs
  const digestMetadataResult = await uploadToIpfsAPI(digestMetadataForm);
  if (!digestMetadataResult) {
    return false;
  }
  const authorSignatureMetadataResult = await uploadToIpfsAPI(authorSignatureMetadataForm);
  if (!authorSignatureMetadataResult) {
    return false;
  }

  return {
    digestMetadata: digestMetadata,
    authorSignatureMetadata: authorSignatureMetadata,
    digestMetadataIpfs: digestMetadataResult,
    authorSignatureMetadataIpfs: authorSignatureMetadataResult,
  };
};
