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
  createdAt: string;
  updatedAt: string;
}
