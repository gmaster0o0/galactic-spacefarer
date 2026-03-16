import cds from '@sap/cds';
import chaiAsPromised from 'chai-as-promised';
// @ts-ignore - no @types/chai-subset compatible with @types/chai v5
import chaiSubset from 'chai-subset';
import { describe, it } from 'vitest';

describe('Galactic Spacefarer Service', () => {
  const servicePath = '/spacefarer/Spacefarers';

  const { GET, chai } = cds.test(__dirname + '/..');
  chai.use(chaiAsPromised as any);
  chai.use(chaiSubset as any);
  const { expect } = chai;

  // Helper to create auth headers for a given username (password is not needed for mocked auth)
  const asUser = (username: string) => ({ auth: { username, password: '' } });

  //Basic CRUD test
  describe('Basic CRUD tests', () => {
    it('serves SpacefarerService.Spacefarers', async () => {
      const { data, status } = await GET(`${servicePath}?$select=ID,name`, asUser('alice'));

      expect(data.value).to.containSubset([{ ID: 's1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', name: 'Alara Voss' }]);
      expect(status).to.equal(200);
    });

    it('Get Spacefarer by ID - not found', async () => {
      const req = GET(`${servicePath}(ID='s1a2b3c4-d5e6-f7g8-h9i0-11notexit111',IsActiveEntity=true)`, asUser('alice'));

      const { status, message } = await expect(req).to.be.rejectedWith(/404/i);
      expect(message).to.match(/not found/i);
      expect(status).to.equal(404);
    });

    it('Get Spacefarer by ID - invalid', async () => {
      const req = GET(`${servicePath}(ID='invalid_id',IsActiveEntity=true)`, asUser('alice'));

      const { status, message } = await expect(req).to.be.rejectedWith(/400/i);
      expect(message).to.match(/does not contain a valid UUID/i);
      expect(status).to.equal(400);
    });

    it('supports pagination via $top and $skip', async () => {
      const { data } = await GET(`${servicePath}?$top=3&$skip=0`, asUser('alice'));

      expect(data.value).to.have.lengthOf(3);
    });

    it('returns next page with $skip', async () => {
      const { data } = await GET(`${servicePath}?$top=3&$skip=3`, asUser('alice'));

      expect(data.value.length).to.be.greaterThan(0);
    });
  });
  // Authentication & Authorization tests
  describe('Authentication & Authorization', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const req = GET(servicePath);

      const { status } = await expect(req).to.be.rejectedWith(/401/i);
      expect(status).to.equal(401);
    });

    it('admin (alice) sees all spacefarers across all planets', async () => {
      const { data, status } = await GET(`${servicePath}?$select=ID,name,origin_planet`, asUser('alice'));

      // alice has admin role - should see all 20 spacefarers from all planets
      expect(data.value).to.have.lengthOf(20);
      expect(data.value).to.containSubset([
        { name: 'Alara Voss', origin_planet: 'Mars Prime' },
        { name: 'Jax Orin', origin_planet: 'Titan' },
        { name: 'Elara Kree', origin_planet: 'Venus Station' },
        { name: 'Zephyr Blane', origin_planet: 'Kepler-186f' },
        { name: 'Mira Sol', origin_planet: 'Föld' },
      ]);
      expect(status).to.equal(200);
    });

    it('planet-x-user only sees Mars Prime spacefarers', async () => {
      const { data, status } = await GET(`${servicePath}?$select=ID,name,origin_planet`, asUser('planet-x-user'));

      // planet-x-user has attr.planet = 'Mars Prime' — only Alara Voss matches
      expect(data.value).to.containSubset([{ name: 'Alara Voss', origin_planet: 'Mars Prime' }]);
      data.value.forEach((sf: { origin_planet: string }) => {
        expect(sf.origin_planet).to.equal('Mars Prime');
      });
      expect(status).to.equal(200);
    });

    it('planet-y-user only sees Titan spacefarers', async () => {
      const { data, status } = await GET(`${servicePath}?$select=ID,name,origin_planet`, asUser('planet-y-user'));

      // planet-y-user has attr.planet = 'Titan' — only Jax Orin matches
      expect(data.value).to.containSubset([{ name: 'Jax Orin', origin_planet: 'Titan' }]);
      data.value.forEach((sf: { origin_planet: string }) => {
        expect(sf.origin_planet).to.equal('Titan');
      });
      expect(status).to.equal(200);
    });

    it('planet-x-user cannot see planet-y-user spacefarers', async () => {
      const { data, status } = await GET(`${servicePath}?$select=ID,name,origin_planet`, asUser('planet-x-user'));

      const titanSpacefarers = data.value.filter((sf: { origin_planet: string }) => sf.origin_planet === 'Titan');
      expect(titanSpacefarers).to.have.lengthOf(0);
      expect(status).to.equal(200);
    });
  });
});
