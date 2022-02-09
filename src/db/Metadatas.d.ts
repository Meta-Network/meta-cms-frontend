import type {
  AuthorDigestMetadata,
  AuthorPostSignatureMetadata,
} from '@metaio/meta-signature-util-v2';

export type Metadatas = {
  id?: number;
  postId: number;
  metadata: {
    digestMetadata: AuthorDigestMetadata;
    authorSignatureMetadata: AuthorPostSignatureMetadata;
    digestMetadataIpfs: Storage.Fleek;
    authorSignatureMetadataIpfs: Storage.Fleek;
  };
  delete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MetadataTempDataState = {
  delete: boolean;
  createdAt: string;
  updatedAt: string;
};
