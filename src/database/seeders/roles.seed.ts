import { roles } from 'src/common/constants/constant';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';

export const seedRoles = async () => {
  const roleRepo = AppDataSource.getRepository(Role);

  try {
    const existingRoles = await roleRepo.find({
      where: roles.map((name) => ({ name })),
    });

    const existingNames = new Set(existingRoles.map((r) => r.name));

    const newRoles = roles
      .filter((name) => !existingNames.has(name))
      .map((name) => roleRepo.create({ name }));

    if (newRoles.length > 0) {
      await roleRepo.save(newRoles);
      console.log(`✅ Created ${newRoles.length} roles.`);
    } else {
      console.log('ℹ️ Roles already exist, skipping.');
    }
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  }
};
