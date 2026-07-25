import { UserPayload } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      file?: Express.Multer.File;
    }
  }
}

export {};
