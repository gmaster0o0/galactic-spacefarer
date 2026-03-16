import cds from '@sap/cds';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { describe, it } from 'vitest';

describe('Galactic Spacefarer Service', () => {
  const servicePath = '/spacefarer/Spacefarers';

  const { GET, chai } = cds.test(__dirname + '/..');
  chai.use(chaiAsPromised as any);
  chai.use(chaiSubset as any);
  const { expect } = chai;

  describe(`GET ${servicePath}`, () => {
    it('serves SpacefarerService.Spacefarers', async () => {
      const { data, status } = await GET`${servicePath} ${{ params: { $select: 'ID,name' } }}`;

      expect(data.value).to.containSubset([{ ID: 's1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', name: 'Alara Voss' }]);
      expect(status).to.equal(200);
    });

    it('Get Spacefarer by ID - not found', async () => {
      const req = GET(`${servicePath}('s1a2b3c4-d5e6-f7g8-h9i0-11notexit111')`);

      const { status, message } = await expect(req).to.be.rejectedWith(/404/i);

      expect(message).to.match(/not found/i);
      expect(status).to.equal(404);
    });

    it('Get Spacefarer by ID - invalid', async () => {
      const req = GET(`${servicePath}('invalid_id')`);

      const { status, message } = await expect(req).to.be.rejectedWith(/400/i);

      expect(message).to.match(/does not contain a valid UUID/i);
      expect(status).to.equal(400);
    });
  });
});
