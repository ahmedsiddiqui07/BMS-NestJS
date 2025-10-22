import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';

void (async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');
    await seedRoles();
    await seedUsers();
    console.log('All seeders executed successfully!');
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Connection closed.');
  }
})();
