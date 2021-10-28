import type { Table, Transaction } from 'dexie';
import Dexie from 'dexie';
import type { Posts } from './Posts';

export class StoreDB extends Dexie {
  posts!: Table<Posts, number>;
  constructor() {
    super('StoreDB');
    this.version(5)
      .stores({
        posts:
          '++id, cover, title, summary, content, hash, status, timestamp, delete, post, draft, tags',
      })
      .upgrade((tx: Transaction | any) => {
        // TODO: modify typescript
        return tx.posts.toCollection().modify((post: Posts) => {
          console.log('post', post);
          post.cover = post.cover || '';
          post.title = post.title || '';
          post.summary = post.summary || '';
          post.content = post.content || '';
          post.hash = post.hash || '';
          post.status = post.status || 'pending';
          post.timestamp = post.timestamp || Date.now();
          post.delete = post.delete || 0;
          post.post = post.post || null;
          post.draft = post.draft || null;
          post.tags = post.tags || [];
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
export const dbPostsAdd = async (data: Posts): Promise<number> => {
  return await db.posts.add(data);
};

/**
 * db posts get
 * @param id
 * @returns
 */
export const dbPostsGet = async (id: number): Promise<Posts | undefined> => {
  return await db.posts.get(id);
};

/**
 * db posts delete
 */
export const dbPostsDelete = async (id: number): Promise<void> => {
  return await db.posts.delete(id);
};

/**
 * db posts all
 * @returns
 */
export const dbPostsAll = async (): Promise<Posts[] | undefined> => {
  return await db.posts.where('delete').equals(0).reverse().sortBy('id');
};

/**
 * db posts where exist by id
 */
export const dbPostsWhereExist = async (id: number): Promise<boolean> => {
  // 草稿删除了 允许重新编辑
  const result = await db.posts.where('delete').equals(0).reverse().sortBy('id');
  return result.some((post) => post.post && Number(post.post.id) === id);
};

export const dbPostsWhereByID = async (id: number): Promise<Posts | undefined> => {
  // 草稿删除了 允许重新编辑
  const result = await db.posts.where('delete').equals(0).reverse().sortBy('id');
  return result.find((post) => post.post && Number(post.post.id) === id);
};
