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
}
