import cds from '@sap/cds';
import { afterAll, beforeAll, expect as jestExpect } from '@jest/globals';

const { GET, axios } = cds.test('.');
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
    // eslint-disable-next-line no-console -- CI diagnostic marker before request
    console.info('[test] starting GET /Spacefarers');
    const request = GET`/odata/v4/galactic/Spacefarers ${{ params: { $select: 'ID,name' } }}`;
    const watchdog = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('GET /Spacefarers watchdog timeout after 12s')), 12000);
    });

    const { data }: any = await Promise.race([request, watchdog]);
    // eslint-disable-next-line no-console -- CI diagnostic marker after request
    console.info('[test] GET /Spacefarers completed');

    const rows = data?.value ?? [];
    const alara = rows.find((row: any) => row?.name === 'Alara Voss');
    jestExpect(alara).toBeDefined();
    jestExpect(alara.ID).toBe('s1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6');
  });
});
