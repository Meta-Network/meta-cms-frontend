import type {
  AuthorDigestMetadata,
  AuthorPostSignatureMetadata,
} from '@metaio/meta-signature-util';

export type Metadatas = {
  id?: number;
  postId: number;
  metadata: {
    digestMetadata: AuthorDigestMetadata;
    authorSignatureMetadata: AuthorPostSignatureMetadata;
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
