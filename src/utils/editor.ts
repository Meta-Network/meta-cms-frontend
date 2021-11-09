import { assign, isEmpty } from 'lodash';
import moment from 'moment';
import {
  generateKeys,
  generatePostDigestRequestMetadata,
  generateAuthorDigestSignMetadata,
  uint8ToHexString,
} from '@metaio/meta-signature-util';
import type {
  KeyPair,
  PostMetadata,
  AuthorDigestRequestMetadata,
  AuthorSignatureMetadata,
} from '@metaio/meta-signature-util/type/types.d';
import { storeGet } from './store';
import { KEY_META_CMS_METADATA_SEED, KEY_META_CMS_METADATA_PUBLIC_KEYS } from '../../config';

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
  const seedGeneratePublicKey = uint8ToHexString(keys.public);

  // Verify that the seed and key match
  if (publicKeyStore === seedGeneratePublicKey) {
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
 * generate signature
 * @param { payload: PostMetadata }
 * @returns
 */
export const generateSignature = ({
  payload,
}: {
  payload: PostMetadata;
}): {
  authorDigestSignatureMetadataStorageType: string;
  authorDigestSignatureMetadataRefer: string;
} => {
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

  return {
    authorDigestSignatureMetadataStorageType: 'ipfs',
    authorDigestSignatureMetadataRefer: authorSignatureMetadata.signature,
  };
};
