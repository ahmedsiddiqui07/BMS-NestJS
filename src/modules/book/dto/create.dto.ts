import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({ message: 'Book title is required.' })
  @IsString({ message: 'Title must be a valid string.' })
  @MinLength(2, { message: 'Title must be at least 2 characters.' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters.' })
  title: string;

  @IsNotEmpty({ message: 'Author name is required.' })
  @IsString({ message: 'Author must be a valid string.' })
  @MinLength(2, { message: 'Author name must be at least 2 characters.' })
  @MaxLength(100, { message: 'Author name cannot exceed 100 characters.' })
  author: string;

  @IsNotEmpty({ message: 'Stock count is required.' })
  @IsNumber({}, { message: 'Stock must be a number.' })
  @IsPositive({ message: 'Stock must be greater than zero.' })
  @Min(1, { message: 'Stock cannot be less than 1.' })
  stock: number;
}
