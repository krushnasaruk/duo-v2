import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.register(req.body);
      
      const token = this.authService.generateToken(user.id, user.role);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.login(email, password);
      
      const token = this.authService.generateToken(user.id, user.role);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is set by the authenticate middleware
      const user = await this.authService.getUserById(req.user!.id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };
}
