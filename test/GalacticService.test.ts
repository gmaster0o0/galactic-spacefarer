import cds from '@sap/cds';
import { expect as jestExpect } from '@jest/globals';

const { GET } = cds.test('.');

describe('GalacticService OData APIs', () => {
  it('serves GalacticService.Spacefarers', async () => {
    // eslint-disable-next-line no-console -- CI diagnostic marker before request
    console.info('[test] starting GET /Spacefarers');
    const request = GET`/odata/v4/galactic/Spacefarers ${{
      params: { $select: 'ID,name' },
      auth: { username: 'alice', password: '' },
      timeout: 10000,
    }}`;
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
