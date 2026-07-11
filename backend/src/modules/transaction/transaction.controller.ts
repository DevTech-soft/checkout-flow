import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateTransactionDto } from '@application/transaction/dto/create-transaction.dto';
import { PaymentWebhookEventDto } from '@application/transaction/dto/payment-webhook-event.dto';
import { TransactionResultDto } from '@application/transaction/dto/transaction-result.dto';
import { CreateTransactionUseCase } from '@application/transaction/use-cases/create-transaction.use-case';
import { GetTransactionStatusUseCase } from '@application/transaction/use-cases/get-transaction-status.use-case';
import { HandlePaymentWebhookUseCase } from '@application/transaction/use-cases/handle-payment-webhook.use-case';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionStatusUseCase: GetTransactionStatusUseCase,
    private readonly handlePaymentWebhookUseCase: HandlePaymentWebhookUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTransactionDto): Promise<TransactionResultDto> {
    return this.createTransactionUseCase.execute(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TransactionResultDto> {
    return this.getTransactionStatusUseCase.execute(id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Body() event: PaymentWebhookEventDto,
  ): Promise<{ received: true }> {
    return this.handlePaymentWebhookUseCase
      .execute(event)
      .then(() => ({ received: true as const }));
  }
}
