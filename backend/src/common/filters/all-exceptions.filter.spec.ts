import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
        getRequest: () => ({ method: 'GET', url: '/products' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('maps an HttpException to its own status and response body', () => {
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        path: '/products',
        message: 'Not found',
      }),
    );
  });

  it('maps an unknown error to a 500 with a generic message', () => {
    filter.catch(new Error('boom'), host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  it('maps a non-Error thrown value to a 500 with a generic message', () => {
    filter.catch('unexpected string throw', host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
      }),
    );
  });
});
