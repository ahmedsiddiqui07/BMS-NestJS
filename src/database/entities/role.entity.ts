import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../modules/user/entities/user.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ length: 50, unique: true })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
