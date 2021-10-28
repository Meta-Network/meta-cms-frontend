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
  tags: string[];
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
  tags: [],
};
