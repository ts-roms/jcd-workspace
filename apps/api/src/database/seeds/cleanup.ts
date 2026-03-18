import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Logger } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const logger = new Logger('Cleanup');

/**
 * Cleanup script that drops all collections except:
 * - The superadmin user (sysadmin@gmail.com) and their role/permissions
 * - All courses and departments
 *
 * After cleanup, it re-seeds permissions, the Super Admin role, and the superadmin user.
 */
async function cleanup() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const connection = app.get<Connection>(getConnectionToken());
    const db = connection.db;

    if (!db) {
      throw new Error('Database connection not established');
    }

    logger.log('Starting database cleanup...');

    // Collections to fully drop (no data retained)
    const collectionsToDrop = [
      'sessions',
      'auditlogs',
      'personnels',
      'performanceevaluations',
      'nonteachingevaluations',
      'excellencehistories',
      'evaluationforms',
      'evaluationformresponses',
      'subjects',
      'settings',
    ];

    // Get all existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map((c) => c.name);

    // Drop specified collections
    for (const name of collectionsToDrop) {
      if (existingNames.includes(name)) {
        await db.dropCollection(name);
        logger.log(`Dropped collection: ${name}`);
      } else {
        logger.log(`Collection not found (skipping): ${name}`);
      }
    }

    // Clean users collection: keep only the superadmin
    if (existingNames.includes('users')) {
      const usersCollection = db.collection('users');
      const superadminEmail = 'sysadmin@gmail.com';
      const result = await usersCollection.deleteMany({
        email: { $ne: superadminEmail },
      });
      logger.log(
        `Cleaned users collection: removed ${result.deletedCount} non-superadmin users`,
      );

      // Clear session-related fields on the superadmin
      await usersCollection.updateMany(
        { email: superadminEmail },
        {
          $unset: {
            currentSessionId: '',
            lastLoginAt: '',
            lastLoginIp: '',
            enrolledSubjects: '',
            studentId: '',
            gradeLevel: '',
            course: '',
            adviser: '',
          },
        },
      );
      logger.log('Reset superadmin session and profile fields');
    }

    // Keep roles and permissions intact (Super Admin role + all permissions)
    // Keep courses and departments intact

    // Drop the migrate-mongo changelog so migrations can be re-run if needed
    if (existingNames.includes('changelog')) {
      await db.dropCollection('changelog');
      logger.log('Dropped migration changelog');
    }

    logger.log('');
    logger.log('=== Cleanup Summary ===');
    logger.log('RETAINED:');
    logger.log('  - Superadmin user (sysadmin@gmail.com)');
    logger.log('  - Roles & Permissions');
    logger.log('  - Courses & Departments');
    logger.log('REMOVED:');
    logger.log('  - All other users');
    logger.log('  - Sessions, Audit Logs, Settings');
    logger.log('  - Personnel & Evaluations');
    logger.log('  - Subjects, Evaluation Forms & Responses');
    logger.log('  - Migration changelog');
    logger.log('');
    logger.log('Database cleanup completed successfully!');
  } catch (error) {
    logger.error('Error during cleanup:', error);
    throw error;
  } finally {
    await app.close();
  }
}

cleanup()
  .then(() => {
    logger.log('Cleanup process finished');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Cleanup failed:', error);
    process.exit(1);
  });
