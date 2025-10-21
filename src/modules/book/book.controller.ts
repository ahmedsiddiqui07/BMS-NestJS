import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { BookService } from './book.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import type { RequestWithUser } from 'src/common/types/interface';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { CreateBookDto } from './dto/create.dto';
import { UpdateBookDto } from './dto/update.dto';
import { ROLES } from 'src/common/constants/constant';
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Post('/')
  async createBook(@Body() createBookDto: CreateBookDto) {
    try {
      const { author, stock, title } = createBookDto;
      const book = await this.bookService.createBook({ title, author, stock });
      return {
        message: 'Book Created Successfully',
        book,
      };
    } catch (err) {
      console.log('Error in create book Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Roles(ROLES.ADMIN, ROLES.LIBRARIAN, ROLES.SUPER_ADMIN)
  @Patch('/:id')
  async updateBook(
    @Req() req: RequestWithUser,
    @Body() updateBookDto: UpdateBookDto,
    @Param('id', PositiveIntPipe) id: number,
  ) {
    try {
      const role = req.user.role;
      const book = await this.bookService.updateBook({ id, updateBookDto, role });
      return {
        message: 'Book Updated Successfully',
        book,
      };
    } catch (err) {
      console.log('Error in Update Book Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
  @Get('/:id')
  async getBookById(@Param('id', PositiveIntPipe) id: number) {
    try {
      const book = await this.bookService.getBookById(id);
      return {
        message: 'Book fetched Successfully',
        book,
      };
    } catch (err) {
      console.log('Error in Get Book By Id Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
