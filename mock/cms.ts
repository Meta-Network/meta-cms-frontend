import { Request, Response } from 'express';

export default {
  'POST /api/domain/validate': (req: Request, res: Response) => {
    const domain = req.body.domain;
    const forbiddings = ['matataki', 'meta-network', 'meta-cms'];
    res.send(forbiddings.includes(domain.toLowerCase()));
  },
};
