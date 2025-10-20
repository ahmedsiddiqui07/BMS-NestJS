import { BaseEntity } from 'src/common/entities/base.entity';
import { BookRequest } from 'src/modules/bookRequest/entities/bookRequest.entity';
import { Borrow } from 'src/modules/borrow/entities/borrow.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity({ name: 'books' })
export class Book extends BaseEntity {
  @Column({ length: 50, nullable: false, unique: true })
  title: string;

  @Column({ length: 50, nullable: false })
  author: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_active', default: true, nullable: false })
  isActive: boolean;

  @OneToMany(() => Borrow, (borrow) => borrow.book)
  borrows: Borrow[];

  @OneToMany(() => BookRequest, (bookRequest) => bookRequest.book)
  bookRequests: BookRequest[];
}
