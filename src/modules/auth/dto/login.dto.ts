import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid Email Format' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'Password must be a string' })
  password: string;
}
