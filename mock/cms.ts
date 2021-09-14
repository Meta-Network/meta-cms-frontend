import { Request, Response } from 'express';

export default {
  'POST /api/site/info': (req: Request, res: Response) => {
    res.send({
      statusCode: 200,
      message: 'Ok',
      data: {
        meta: {
          itemCount: 10,
          totalItems: 20,
          itemsPerPage: 10,
          totalPages: 2,
          currentPage: 1,
        },
        links: {
          first: '/site/info?limit=10',
          previous: '',
          next: '/site/info?page=2&limit=10',
          last: '/site/info?page=2&limit=10',
        },
        items: [
          {
            id: 1,
            createdAt: '2021-07-27T11:39:39.150Z',
            updatedAt: '2021-07-27T11:39:39.150Z',
            userId: 0,
            title: 'string',
            cover: 'string',
            summary: 'string',
            platform: 'string',
            source: 'string',
            state: 'pending',
            category: 'string',
            tags: [],
          },
        ],
      },
    });
  },
  'POST /api/domain/validate': (req: Request, res: Response) => {
    const domain = req.body.domain;
    const forbiddings = ['matataki', 'meta-network', 'meta-cms'];
    res.send(forbiddings.includes(domain.toLowerCase()));
  },
};
