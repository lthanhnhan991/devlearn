import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED_IDS } from '../src/types/seed-ids';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@devlearn.local' },
    update: {},
    create: {
      id: SEED_IDS.admin,
      email: 'admin@devlearn.local',
      fullName: 'Admin',
      passwordHash: hash,
      role: 'ADMIN',
    },
  });
  await prisma.user.upsert({
    where: { email: 'teacher@devlearn.local' },
    update: {},
    create: {
      id: SEED_IDS.teacher,
      email: 'teacher@devlearn.local',
      fullName: 'Teacher',
      passwordHash: hash,
      role: 'TEACHER',
    },
  });
  await prisma.user.upsert({
    where: { email: 'student@devlearn.local' },
    update: {},
    create: {
      id: SEED_IDS.student,
      email: 'student@devlearn.local',
      fullName: 'Student',
      passwordHash: hash,
      role: 'STUDENT',
      studentCode: 'SV001',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
