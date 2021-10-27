export interface Posts {
  id?: number;
  cover: string;
  title: string;
  summary: string;
  content: string;
  hash: string;
  status: 'pending' | 'publish';
  timestamp: number;
  delete: 0 | 1;
  post: CMS.Post | null;
  draft: CMS.Draft | null;
}

export interface PostsTemp {
  id?: number;
  cover?: string;
  title?: string;
  summary?: string;
  content?: string;
  hash?: string;
  status?: 'pending' | 'publish';
  timestamp?: number;
  delete?: 0 | 1;
}

export const PostTempData: Posts = {
  cover: '',
  title: '',
  summary: '',
  content: '',
  hash: '',
  status: 'pending',
  timestamp: Date.now(),
  delete: 0,
  post: null,
  draft: null,
};
