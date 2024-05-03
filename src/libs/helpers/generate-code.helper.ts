import * as generator from 'generate-password';

export const generateCode = (length = 16): string => {
  return generator.generate({
    length,
    numbers: true,
    symbols: false,
    uppercase: true,
    lowercase: false,
  });
};
