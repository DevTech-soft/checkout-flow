import { TransactionStatus } from '@domain/transaction/transaction-status.enum';

export function mapGatewayStatus(status?: string): TransactionStatus {
  switch (status) {
    case 'APPROVED':
      return TransactionStatus.APPROVED;
    case 'DECLINED':
      return TransactionStatus.DECLINED;
    case 'PENDING':
      return TransactionStatus.PENDING;
    default:
      return TransactionStatus.ERROR;
  }
}
