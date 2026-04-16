import client from '../client';

export function fetchTest() {
  return client.get('/test');
}
