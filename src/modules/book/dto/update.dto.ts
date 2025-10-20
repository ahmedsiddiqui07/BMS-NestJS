import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString({ message: 'Title must be a valid string.' })
  @MinLength(2, { message: 'Title must be at least 2 characters.' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Author must be a valid string.' })
  @MinLength(2, { message: 'Author name must be at least 2 characters.' })
  @MaxLength(100, { message: 'Author name cannot exceed 100 characters.' })
  author?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a number.' })
  @IsPositive({ message: 'Stock must be a positive number.' })
  stock?: number;

  @IsOptional()
  @IsBoolean({ message: 'is_available must be a boolean.' })
  is_available?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean.' })
  is_active?: boolean;
}
