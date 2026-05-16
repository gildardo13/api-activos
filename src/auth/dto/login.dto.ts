import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe tener un formato valido' })
  @ApiProperty({ description: 'Email' })
  email: string;

  @IsString()
  @ApiProperty({ description: 'Password' })
  @IsNotEmpty({ message: 'La contraseña no debe estar vacia' })
  password: string;
}
