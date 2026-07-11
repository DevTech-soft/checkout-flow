import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('delegates the health check to HealthService', async () => {
    const healthService = {
      check: jest.fn().mockResolvedValue({ status: 'ok', database: 'up' }),
    };
    const controller = new HealthController(
      healthService as unknown as HealthService,
    );

    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
    expect(healthService.check).toHaveBeenCalled();
  });
});
