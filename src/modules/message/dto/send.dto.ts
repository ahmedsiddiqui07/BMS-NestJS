import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty({ message: 'Chat ID is required' })
  @IsNumber({}, { message: 'Chat ID must be a number' })
  chatId: number;

  @IsNotEmpty({ message: 'Message content cannot be empty' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(1, { message: 'Message must be at least 1 character' })
  @MaxLength(1000, { message: 'Message cannot exceed 1000 characters' })
  message: string;
}
