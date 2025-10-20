import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BookRequestService } from './book-request.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UpdateBookRequestDto } from './dto/update.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLES } from 'src/common/constants/constant';

@Controller('book-request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookRequestController {
  constructor(private readonly bookRequestService: BookRequestService) {}
  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  async updateBookRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBookRequestDto,
  ) {
    const result = await this.bookRequestService.updateBookRequest(id, body.status);
    return {
      message: 'Book request updated successfully',
      result,
    };
  }

  @Get(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  async getBookRequestById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.bookRequestService.getBookRequestById(id);
    return {
      message: 'Book request fetched successfully',
      result,
    };
  }
}
