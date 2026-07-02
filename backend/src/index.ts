import dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import app from './app';
import { prisma } from './config/db';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`📖 Swagger documentation available at http://localhost:${PORT}/api-docs`);
  
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('💾 Database connected successfully via Prisma');
  } catch (error) {
    logger.error('❌ Database connection failure:', error);
    process.exit(1);
  }
});

// Handle graceful shutdowns
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connections closed. Exiting process.');
    process.exit(0);
  });
  
  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Force shutdown triggered due to hanging connections.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
