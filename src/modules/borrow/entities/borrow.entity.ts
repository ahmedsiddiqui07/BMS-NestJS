import { BorrowStatus } from 'src/common/constants/enum/borrow-status.enum';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Fine } from 'src/database/entities/fine.entity';
import { Book } from 'src/modules/book/entities/book.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity({ name: 'borrows' })
export class Borrow extends BaseEntity {
  @ManyToOne(() => User, (user) => user.borrows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.borrows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Column({ name: 'borrow_date', type: 'date', default: () => 'CURRENT_DATE' })
  borrowDate: Date;
  @Column({ name: 'due_date', type: 'date', nullable: false })
  dueDate: Date;

  @Column({ name: 'return_date', type: 'date', nullable: true })
  returnDate?: Date;

  @Column({ type: 'enum', enum: BorrowStatus, default: BorrowStatus.BORROWED })
  status: BorrowStatus;

  @Column({ name: 'reminder_sent_at', type: 'date', nullable: true })
  reminderSentAt?: Date;

  @OneToOne(() => Fine, (fine) => fine.borrow)
  fine: Fine[];
}
