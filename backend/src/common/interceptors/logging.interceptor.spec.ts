import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  it('logs the request method, url and duration once the handler completes', (done) => {
    const interceptor = new LoggingInterceptor();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', url: '/transactions' }),
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of({ ok: true }) };

    const logSpy = jest
      .spyOn(interceptor['logger'], 'log')
      .mockImplementation(() => undefined);

    interceptor.intercept(context, next).subscribe((value) => {
      expect(value).toEqual({ ok: true });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^POST \/transactions \+\d+ms$/),
      );
      done();
    });
  });
});
