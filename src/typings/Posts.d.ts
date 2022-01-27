declare namespace Router {
  type PostQuery = {
    id: string;
  };
}

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
    post: (CMS.Post & { stateId: number; stateIdData: FetchPostsStorageState }) | null;
    draft: CMS.Draft | null;
    tags: string[];
    license: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
  };
}

declare namespace AllPostsType {
  type PostListItem = {
    gallery: string;
    title: string;
    submitStatus: SubmitStatusEnum;
    publishStatus: PublishStatusEnum;
    requestDate: string;
    authorisationStatus: AuthorisationStatusEnum;
    action?: React.ReactNode;
  };
}
