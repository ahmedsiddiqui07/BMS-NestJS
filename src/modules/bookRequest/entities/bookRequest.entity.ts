import { RequestStatus } from 'src/common/constants/enum/req-status.enum';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Book } from 'src/modules/book/entities/book.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'book_requests' })
export class BookRequest extends BaseEntity {
  @Column({ length: 50, nullable: false })
  title: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @ManyToOne(() => User, (user) => user.bookRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.bookRequests, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'book_id' })
  book?: Book;
}
