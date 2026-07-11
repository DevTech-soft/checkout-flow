import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { mapGatewayStatus } from './gateway-status.mapper';

describe('mapGatewayStatus', () => {
  it.each([
    ['APPROVED', TransactionStatus.APPROVED],
    ['DECLINED', TransactionStatus.DECLINED],
    ['PENDING', TransactionStatus.PENDING],
    ['VOIDED', TransactionStatus.ERROR],
    [undefined, TransactionStatus.ERROR],
  ])('maps gateway status %s to %s', (status, expected) => {
    expect(mapGatewayStatus(status)).toBe(expected);
  });
});
