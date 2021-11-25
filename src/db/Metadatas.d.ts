import type {
  AuthorDigestRequestMetadata,
  AuthorSignatureMetadata,
} from '@metaio/meta-signature-util/lib/type/types.d';

export type Metadatas = {
  id?: number;
  postId: number;
  metadata: {
    digestMetadata: AuthorDigestRequestMetadata;
    authorSignatureMetadata: AuthorSignatureMetadata;
    digestMetadataIpfs: Storage.Fleek;
    authorSignatureMetadataIpfs: Storage.Fleek;
  };
  delete: 0 | 1;
  createdAt: string;
  updatedAt: string;
};

export type MetadataTempDataState = {
  delete: 0 | 1;
  createdAt: string;
  updatedAt: string;
};
