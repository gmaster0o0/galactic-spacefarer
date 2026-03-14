import cds from '@sap/cds';
import { afterAll, beforeAll } from '@jest/globals';

const { GET, expect, axios } = cds.test('.');
let previousAuth: any;
let previousTimeout: number | undefined;

beforeAll(() => {
  previousAuth = axios.defaults.auth;
  previousTimeout = axios.defaults.timeout;
  axios.defaults.auth = { username: 'alice', password: '' };
  axios.defaults.timeout = 10000;
});

afterAll(async () => {
  axios.defaults.auth = previousAuth;
  axios.defaults.timeout = previousTimeout;
  await (cds as any).shutdown?.();
});

describe('GalacticService OData APIs', () => {
  it('serves GalacticService.Spacefarers', async () => {
    const { data } = await GET`/odata/v4/galactic/Spacefarers ${{ params: { $select: 'ID,name' } }}`;
    expect(data.value).to.containSubset([{ ID: 's1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', name: 'Alara Voss' }]);
  });
});
