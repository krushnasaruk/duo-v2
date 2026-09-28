import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../errors/api.error';

const JWT_SECRET = process.env.JWT_SECRET as string;

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // DEVELOPMENT BYPASS
    if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS !== 'false') {
      req.user = { id: 'dev-creator-id-123', role: 'CREATOR' };
      return next();
    }

    const token = req.cookies.token;
    
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
