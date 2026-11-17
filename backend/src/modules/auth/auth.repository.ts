import { prisma } from '../../lib/prisma';
import type { User, Role, UserStatus } from '@prisma/client';

export interface CreateUserData {
  fullName: string;
  studentCode: string;
  email: string;
  passwordHash: string;
  role?: Role;
  status?: UserStatus;
}

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByStudentCode(studentCode: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { studentCode },
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        studentCode: data.studentCode,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'STUDENT',
        status: data.status ?? 'ACTIVE',
      },
    });
  }
}

export const authRepository = new AuthRepository();
