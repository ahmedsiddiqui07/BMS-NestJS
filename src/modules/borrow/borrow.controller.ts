import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import type { RequestWithUser } from 'src/common/types/interface';
import { BorrowStatus } from 'src/common/constants/enum/borrow-status.enum';
import { ROLES } from 'src/common/constants/constant';

@Controller('borrows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Roles(ROLES.USER)
  @Post('/:id')
  async borrowBook(@Req() req: RequestWithUser, @Param('id', PositiveIntPipe) id: number) {
    try {
      const result = await this.borrowService.borrowBook(req.user.id, id);
      return {
        message:
          result.type === 'borrowed'
            ? 'Book Borrowed Successfully'
            : 'This book is currently unavailable. Your request has been recorded',
        result,
      };
    } catch (err) {
      console.log('Error in borrow book Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Roles(ROLES.USER)
  @Patch('/:id/return')
  async returnBook(@Req() req: RequestWithUser, @Param('id', PositiveIntPipe) id: number) {
    try {
      const result = await this.borrowService.returnBook(req.user.id, id);
      return {
        message:
          result.status === BorrowStatus.LATE
            ? 'Book returned late. Fine applied'
            : 'Book returned successfully',

        result,
      };
    } catch (err) {
      console.log('Error in return book Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.LIBRARIAN)
  @Get('/:id')
  async getBorrowById(@Param('id', PositiveIntPipe) id: number) {
    try {
      const reuslt = await this.borrowService.getBorrowById(id);
      return {
        message: 'Borrow record fetched successfully',
        reuslt,
      };
    } catch (err) {
      console.log('Error in get borrow by id Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
