import type { Table, Transaction } from 'dexie';
import Dexie from 'dexie';
import moment from 'moment';
import { License } from '../../config';
import type { Metadatas, MetadataTempDataState } from './Metadatas';

export class StoreDB extends Dexie {
  posts!: Table<PostType.Posts, number>;
  metadatas!: Table<Metadatas, number>;
  constructor() {
    super('StoreDB');
    this.version(14)
      .stores({
        posts:
          '++id, cover, title, summary, content, hash, status, timestamp, delete, post, draft, tags, license, userId, sourceData ,createdAt, updatedAt',
        metadatas: '++id, postId, metadata, delete, createdAt, updatedAt',
      })
      .upgrade((tx: Transaction | any) => {
        const time = moment().toISOString();
        // TODO: modify typescript
        tx.posts.toCollection().modify((post: PostType.Posts) => {
          // console.log('post', post);
          post.cover = post.cover || '';
          post.title = post.title || '';
          post.summary = post.summary || '';
          post.content = post.content || '';
          post.hash = post.hash || '';
          post.status = post.status || 'pending';
          post.timestamp = post.timestamp || Date.now();
          post.delete = post.delete || false;
          post.post = post.post || null;
          post.draft = post.draft || null;
          post.tags = post.tags || [];
          post.license = post.license || License;
          post.userId = post.userId || 0;
          post.sourceData = post.sourceData || null;
          post.createdAt = post.createdAt || time;
          post.updatedAt = post.updatedAt || time;
        });
        tx.metadatas.toCollection().modify((metadata: Metadatas) => {
          // console.log('Metadatas', metadata);
          metadata.delete = metadata.delete || false;
        });
      });
  }
}

export const db = new StoreDB();

/**
 * db posts update
 * @param id
 * @param data
 * @returns
 */
export const dbPostsUpdate = async <T>(id: number, data: T): Promise<number> => {
  return await db.posts.update(id, data);
};

/**
 * db posts add
 * @param data
 * @returns
 */
export const dbPostsAdd = async (data: PostType.Posts): Promise<number> => {
  return await db.posts.add(data);
};

/**
 * db posts get
 * @param id
 * @returns
 */
export const dbPostsGet = async (id: number): Promise<PostType.Posts | undefined> => {
  return await db.posts.get(id);
};

/**
 * db posts delete
 */
export const dbPostsDelete = async (id: number): Promise<void> => {
  return await db.posts.delete(id);
};

/**
 * db posts delete current user
 * @param userId
 * @returns
 */
export const dbPostsDeleteCurrent = async (userId: number): Promise<number> => {
  return await db.posts.where('userId').equals(userId).delete();
};

/**
 * db posts delete all
 * @returns
 */
export const dbPostsDeleteAll = async (): Promise<number> => {
  return await db.posts.toCollection().delete();
};

/**
 * db posts all
 * @param userId
 * @returns
 */
export const dbPostsAll = async (userId: number): Promise<PostType.Posts[] | undefined> => {
  return await db.posts
    .filter((i) => !i.delete && i.userId === userId)
    .reverse()
    .sortBy('updatedAt');
};

/**
 * db posts all counter
 * @param userId
 * @returns
 */
export const dbPostsAllCount = async (userId: number): Promise<number> => {
  return await db.posts.filter((i) => !i.delete && i.userId === userId).count();
};

/**
 * db drafts allcounter
 * @param userId
 * @returns
 */
export const dbDraftsAllCount = async (userId: number): Promise<number> => {
  return await db.posts.filter((i) => !i.delete && i.userId === userId && i.post == null).count();
};

export const dbPostsWhereExistByTitle = async ({
  title,
  userId,
}: {
  title: string;
  userId: number;
}): Promise<boolean> => {
  const result = await db.posts.filter((i) => !i.delete && i.userId === userId).toArray();
  return result.some((post) => post.title === title);
};

/**
 * dbPostsWhereExistByTitleAndId
 * @param title
 * @param userId
 * @returns
 */
export const dbPostsWhereExistByTitleAndId = async ({
  title,
  id,
  userId,
}: {
  title: string;
  id: number;
  userId: number;
}): Promise<boolean> => {
  // 草稿删除了，并且是自己的草稿，排除当前文章
  const result = await db.posts.filter((i) => !i.delete && i.userId === userId).toArray();
  return result.some((post) => post.id !== id && post.title === title);
};

// post data temp
export const PostTempData = (): PostType.Posts => ({
  cover: '',
  title: '',
  summary: '',
  content: '',
  hash: '',
  status: 'pending',
  timestamp: Date.now(),
  delete: false,
  post: null,
  draft: null,
  tags: [],
  license: License,
  userId: 0,
  sourceData: null,
  createdAt: moment().toISOString(),
  updatedAt: moment().toISOString(),
});

// db metadatas

// metadata data temp
export const MetadataTempData = (): MetadataTempDataState => ({
  delete: false,
  createdAt: moment().toISOString(),
  updatedAt: moment().toISOString(),
});

/**
 * db metadatas add
 * @param data
 * @returns
 */
export const dbMetadatasAdd = async (data: Metadatas): Promise<number> => {
  return await db.metadatas.add(data);
};

/**
 * db metadatas update by postId
 * @param id
 * @param data
 * @returns
 */
export const dbMetadatasUpdateByPostId = async <T>(postId: number, data: T): Promise<number> => {
  return await db.metadatas.where('postId').equals(postId).modify(data);
};

/**
 * db metadatas delete
 * @param postId
 * @returns
 */
export const dbMetadatasDelete = async (postId: number): Promise<number> => {
  return await db.metadatas.where('postId').equals(postId).delete();
};

/**
 * db metadatas delete all
 * @returns
 */
export const dbMetadatasDeleteAll = async (): Promise<number> => {
  return await db.metadatas.toCollection().delete();
};
