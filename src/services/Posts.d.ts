declare namespace PostType {
  type Posts = {
    id?: number;
    cover: string;
    title: string;
    summary: string;
    content: string;
    hash: string;
    status: 'pending' | 'publish';
    timestamp: number;
    delete: boolean;
    post: CMS.Post | null;
    draft: CMS.Draft | null;
    tags: string[];
    license: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
  };
}
