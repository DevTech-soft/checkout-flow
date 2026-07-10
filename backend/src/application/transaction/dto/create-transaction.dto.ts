import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  cardToken!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(7, 20)
  phoneNumber!: string;
}
