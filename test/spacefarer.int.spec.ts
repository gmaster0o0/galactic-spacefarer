import cds from '@sap/cds';

describe('Galactic Spacefarer Service', () => {
  const { GET, expect } = cds.test(__dirname + '/..');

  it('serves GalacticService.Spacefarers', async () => {
    console.info('Sending GET request to /odata/v4/galactic/Spacefarers');
    const { data, status } = await GET`/odata/v4/galactic/Spacefarers ${{ params: { $select: 'ID,name' } }}`;
    console.info('Response received:', { data, status });
    expect(data.value).to.containSubset([{ ID: 's1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', name: 'Alara Voss' }]);
    expect(status).to.equal(200);
  });
});
