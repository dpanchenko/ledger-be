import { AbstractError } from './abstract.error';
import { parseErrorMessage } from './parse-error-message';

export const parseError = (exception: Error | AbstractError) => {
  return {
    exception: exception.name,
    message: parseErrorMessage(exception),
    stack: process.env.NODE_ENV !== 'production' ? exception.stack : undefined,
    payload: (exception as AbstractError).payload ?? undefined,
    parent: (exception as AbstractError).parent ? parseError((exception as AbstractError).parent) : undefined,
  };
};
