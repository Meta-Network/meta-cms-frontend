import type {
  AuthorDigestRequestMetadata,
  AuthorSignatureMetadata,
} from '@metaio/meta-signature-util/type/types.d';

export type Metadatas = {
  id?: number;
  postId: number;
  metadata: {
    digestMetadata: AuthorDigestRequestMetadata;
    authorSignatureMetadata: AuthorSignatureMetadata;
    digestMetadataIpfs: Storage.Fleek;
    authorSignatureMetadataIpfs: Storage.Fleek;
  };
  createdAt: string;
  updatedAt: string;
};
