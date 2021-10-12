import type { Table } from 'dexie';
import Dexie from 'dexie';
import type { Posts } from './Posts';

export class StoreDB extends Dexie {
  posts!: Table<Posts, number>;
  constructor() {
    super('StoreDB');
    this.version(1)
      .stores({
        posts: '++id, cover, title, summary, content, hash, status, timestamp',
      })
      .upgrade((tx: any) => {
        // 只有在低于2版本的数据库中会执行以下操作
        // TODO: typescript
        return tx.posts.toCollection().modify((post: Posts) => {
          console.log('post', post);
          post.cover = post.cover || '';
          post.title = post.title || '';
          post.summary = post.summary || '';
          post.content = post.content || '';
          post.hash = post.hash || '';
          post.status = post.status || 'pending';
          post.timestamp = post.timestamp || Date.now();
        });
      });
  }
}

export const db = new StoreDB();
