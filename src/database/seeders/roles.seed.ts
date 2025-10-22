import { ROLES } from 'src/common/constants/constant';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';
import { In } from 'typeorm';

export const seedRoles = async () => {
  const roleRepo = AppDataSource.getRepository(Role);

  try {
    const roles = Object.values(ROLES);
    const existingRoles = await roleRepo.find({
      where: { name: In(roles) },
    });

    const existingNames = new Set(existingRoles.map((r) => r.name));

    const newRoles = roles
      .filter((name) => !existingNames.has(name))
      .map((name) => roleRepo.create({ name }));

    if (newRoles.length > 0) {
      await roleRepo.save(newRoles);
      console.log(`Created ${newRoles.length} roles.`);
    } else {
      console.log('Roles already exist, skipping.');
    }
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
};
