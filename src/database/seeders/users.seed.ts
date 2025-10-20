import { AppDataSource } from '../data-source';
import { User } from 'src/modules/user/entities/user.entity';
import { Role } from '../entities/role.entity';
import { hashPassword } from 'src/common/helper/helper';
import { Password, usersData } from 'src/common/constants/constant';
import { In } from 'typeorm';

export const seedUsers = async (): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);

  try {
    const [roles, existingUsers] = await Promise.all([
      roleRepo.find(),
      userRepo.find({
        where: { email: In(usersData.map((u) => u.email)) },
      }),
    ]);

    const roleMap = new Map(roles.map((r) => [r.name, r]));
    const existingEmails = new Set(existingUsers.map((u) => u.email));

    const passwordHash = await hashPassword(Password);

    const newUsers = usersData
      .filter((u) => !existingEmails.has(u.email))
      .map((u) => ({
        name: u.name,
        email: u.email,
        password: passwordHash,
        role: roleMap.get(u.role),
        isActive: true,
      }))
      .filter((u) => u.role);

    if (newUsers.length === 0) {
      console.log('ℹ️ No new users to insert.');
      return;
    }
    await userRepo.save(newUsers);

    console.log(`✅ Inserted ${newUsers.length} new users successfully.`);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};
