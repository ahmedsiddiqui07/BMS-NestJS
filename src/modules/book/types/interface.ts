import { UpdateBookDto } from '../dto/update.dto';

export interface UpdateBookInput {
  id: number;
  updateBookDto: UpdateBookDto;
  role: string;
}
