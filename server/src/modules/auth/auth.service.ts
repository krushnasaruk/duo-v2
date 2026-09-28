import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterInput } from '@codequest/shared';
import prisma from '../../config/database';
import { ApiError } from '../../errors/api.error';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          role: data.role as any,
          profile: {
            create: {
              fullName: data.display_name,
            }
          }
        },
        include: {
          profile: true
        }
      });
      return newUser;
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(pass, user.passwordHash);
    
    if (!isValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  generateToken(userId: string, role: string) {
    return jwt.sign({ id: userId, role }, (JWT_SECRET as string) || 'fallback_secret', {
      expiresIn: JWT_EXPIRES_IN as any,
    });
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
