import { AbstractError } from './abstract.error';

export const parseErrorMessage = (exception: Error | AbstractError) => {
  let message = exception.message;

  if (!message) {
    if (exception instanceof AbstractError) {
      message = 'Application error';
    } else {
      message = 'Internal Server Error';
    }
  }

  return message;
};
