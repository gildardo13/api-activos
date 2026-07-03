import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail({}, { message: 'El formato debe ser de tipo Email' })
  @ApiProperty({ description: 'Email' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria ' })
  @MinLength(8, { message: 'Contraseña debe tener mas de 8 caracteres' })
  @ApiProperty({ description: 'Password' })
  password: string;
}
