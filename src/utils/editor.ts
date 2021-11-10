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
export const verifySeedAndKey = ():
  | {
      seed: string[];
      publicKey: string;
    }
  | false => {
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
}: {
  payload: PostMetadata;
}): AuthorSignatureMetadata => {
  const verifyResult = verifySeedAndKey();
  if (!verifyResult) {
    throw new Error('seed or key does not exist or does not match.');
  }

  const keys: KeyPair = generateKeys(verifyResult.seed);
  const digestMetadata: AuthorDigestRequestMetadata = generatePostDigestRequestMetadata(payload);
  console.log('digestMetadata', digestMetadata);

  const authorSignatureMetadata: AuthorSignatureMetadata = generateAuthorDigestSignMetadata(
    keys,
    'metaspace.life',
    digestMetadata.digest,
  );
  console.log('authorSignatureMetadata', authorSignatureMetadata);

  return authorSignatureMetadata;
};

/**
 * upload metadata
 * @param { payload: PostMetadata }
 * @returns
 */
export const uploadMetadata = async ({
  payload,
}: {
  payload: PostMetadata;
}): Promise<Storage.Fleek | false> => {
  const metadata = generateMetadata({ payload });

  // generate json file
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const form = new FormData();
  form.append('file', blob, `metadata-${metadata.ts}.json`);

  // upload ipfs
  const result = await uploadToIpfsAPI(form);
  console.log('res', result);

  if (result) {
    return result;
  } else {
    console.error('no result');
    return false;
  }
};
