import { BaseEntity } from '../../common/entities/base.entity';
import { Borrow } from 'src/modules/borrow/entities/borrow.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'fines' })
export class Fine extends BaseEntity {
  @OneToOne(() => Borrow, (borrow) => borrow.fine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'borrow_id' })
  borrow: Borrow;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'unpaid' })
  status: string;
}
