import { loadTest } from 'loadtest';

const options = {
  url: 'http://localhost:8000',
  maxRequests: 1000,
};
const result = await loadTest(options);
result.show();
console.log('Tests run successfully');
