import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let connectSpy: jest.SpyInstance;
  let disconnectSpy: jest.SpyInstance;
  let service: PrismaService;

  beforeEach(() => {
    connectSpy = jest
      .spyOn(PrismaClient.prototype, '$connect')
      .mockResolvedValue(undefined);
    disconnectSpy = jest
      .spyOn(PrismaClient.prototype, '$disconnect')
      .mockResolvedValue(undefined);

    const configService = {
      get: jest.fn(() => 'postgresql://user:pass@localhost:5432/db'),
    };
    service = new PrismaService(configService as unknown as ConfigService);
  });

  afterEach(() => {
    connectSpy.mockRestore();
    disconnectSpy.mockRestore();
  });

  it('connects to the database on module init', async () => {
    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('disconnects from the database on module destroy', async () => {
    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
