import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing database
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });
  console.log(`Created ADMIN: ${admin.email}`);

  // Create User
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      passwordHash,
      name: 'John Doe',
      role: 'USER',
    },
  });
  console.log(`Created USER: ${user.email}`);

  // Create Tasks for User
  await prisma.task.create({
    data: {
      title: 'Complete Project Assignment',
      description: 'Finish the backend API and frontend assignment by tomorrow.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      userId: user.id,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    },
  });

  await prisma.task.create({
    data: {
      title: 'Submit Scalability Note',
      description: 'Write a comprehensive review of load balancing, microservices, and Docker.',
      status: 'PENDING',
      priority: 'MEDIUM',
      userId: user.id,
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // in 2 days
    },
  });

  // Create Task for Admin
  await prisma.task.create({
    data: {
      title: 'Review Intern Code Submissions',
      description: 'Audit the REST principles, role security, and styling code quality of interns.',
      status: 'PENDING',
      priority: 'HIGH',
      userId: admin.id,
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
