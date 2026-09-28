import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate-request';
import { registerSchema, loginSchema } from '@codequest/shared';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
