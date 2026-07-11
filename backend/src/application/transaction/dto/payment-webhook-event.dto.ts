import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class WebhookSignatureDto {
  @IsArray()
  @IsString({ each: true })
  properties!: string[];

  @IsString()
  checksum!: string;
}

export class PaymentWebhookEventDto {
  @IsString()
  event!: string;

  @IsObject()
  data!: Record<string, unknown>;

  @ValidateNested()
  @Type(() => WebhookSignatureDto)
  signature!: WebhookSignatureDto;

  @IsInt()
  timestamp!: number;
}
