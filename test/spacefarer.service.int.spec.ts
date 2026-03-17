import cds from '@sap/cds';
import chaiAsPromised from 'chai-as-promised';
// @ts-ignore - no @types/chai-subset compatible with @types/chai v5
import chaiSubset from 'chai-subset';
import { describe, it } from 'vitest';

describe('Galactic Spacefarer Service', () => {
  const servicePath = '/spacefarer/Spacefarers';

  // Include PATCH for draft-update flows in OData V4.
  const { GET, POST, PATCH, DELETE, chai } = cds.test(__dirname + '/..');
  chai.use(chaiAsPromised as any);
  chai.use(chaiSubset as any);
  const { expect } = chai;

  // Helper to create auth headers for a given username (password is not needed for mocked auth)
  const asUser = (username: string) => ({ auth: { username, password: '' } });
  const entityUrl = (id: string, isActiveEntity: boolean) =>
    `${servicePath}(ID=${id},IsActiveEntity=${isActiveEntity})`;

  //Basic CRUD test
  describe('Basic CRUD tests', () => {
    describe('READ Operations', () => {
      it('serves SpacefarerService.Spacefarers', async () => {
        const { data, status } = await GET(`${servicePath}?$select=ID,name`, asUser('alice'));

        expect(data.value).to.containSubset([{ ID: 's1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', name: 'Alara Voss' }]);
        expect(status).to.equal(200);
      });

      it('Get Spacefarer by ID - not found', async () => {
        const req = GET(
          `${servicePath}(ID='s1a2b3c4-d5e6-f7g8-h9i0-11notexit111',IsActiveEntity=true)`,
          asUser('alice'),
        );

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

    describe('CREATE operation (draft-aware)', () => {
      it('creates a draft, activates it, and applies cosmic minimums on activation', async () => {
        const { data: draft, status: draftStatus } = await POST(
          servicePath,
          {
            name: 'Fresh Recruit',
            origin_planet: 'Mars Prime',
            stardust_collection: 1,
            wormhole_navigation_skill: 1,
          },
          asUser('alice'),
        );

        expect(draftStatus).to.equal(201);
        expect(draft.IsActiveEntity).to.equal(false);
        // Draft save does not run @before CREATE validations/enhancements.
        expect(draft.stardust_collection).to.equal(1);
        expect(draft.wormhole_navigation_skill).to.equal(1);

        const { status: activateStatus } = await POST(
          `${entityUrl(draft.ID, false)}/draftActivate`,
          {},
          asUser('alice'),
        );
        expect(activateStatus).to.equal(201);

        const { data: active } = await GET(entityUrl(draft.ID, true), asUser('alice'));
        expect(active.IsActiveEntity).to.equal(true);
        expect(active.stardust_collection).to.equal(100);
        expect(active.wormhole_navigation_skill).to.equal(10);

        await DELETE(entityUrl(draft.ID, true), asUser('alice'));
      });
    });

    describe('UPDATE operation (draft-aware)', () => {
      it('edits an active spacefarer through draftEdit and persists changes on activation', async () => {
        let id = '';

        try {
          const { data: draft } = await POST(
            servicePath,
            {
              name: 'Updater One',
              origin_planet: 'Mars Prime',
              stardust_collection: 200,
              wormhole_navigation_skill: 20,
            },
            asUser('alice'),
          );
          id = draft.ID;

          await POST(`${entityUrl(id, false)}/draftActivate`, {}, asUser('alice'));

          const { data: editDraft, status: editStatus } = await POST(
            `${entityUrl(id, true)}/draftEdit`,
            { PreserveChanges: false },
            asUser('alice'),
          );
          expect(editStatus).to.equal(201);
          expect(editDraft.IsActiveEntity).to.equal(false);

          const { status: patchStatus } = await PATCH(
            entityUrl(id, false),
            {
              spacesuit_color: 'Crimson',
            },
            asUser('alice'),
          );
          expect(patchStatus).to.equal(200);

          const { data: patchedDraft } = await GET(entityUrl(id, false), asUser('alice'));
          expect(patchedDraft.spacesuit_color).to.equal('Crimson');

          const { status: activateStatus } = await POST(`${entityUrl(id, false)}/draftActivate`, {}, asUser('alice'));
          expect(activateStatus).to.equal(200);

          const { data: active } = await GET(entityUrl(id, true), asUser('alice'));
          expect(active.spacesuit_color).to.equal('Crimson');
        } finally {
          if (id) {
            await DELETE(entityUrl(id, false), asUser('alice')).catch(() => undefined);
            await DELETE(entityUrl(id, true), asUser('alice')).catch(() => undefined);
          }
        }
      });
    });
  });

  describe('Draft mode (@odata.draft.enabled)', () => {
    // ── 1. CREATE DRAFT ──────────────────────────────────────────────────────

    it('creates a new draft (IsActiveEntity=false) and returns it', async () => {
      const { data, status } = await POST(
        servicePath,
        {
          name: 'Nova Strider',
          origin_planet: 'Mars Prime',
          stardust_collection: 500,
          wormhole_navigation_skill: 42,
        },
        asUser('alice'),
      );

      expect(status).to.equal(201);
      // CAP sets IsActiveEntity=false on fresh drafts
      expect(data.IsActiveEntity).to.equal(false);
      expect(data.HasActiveEntity).to.equal(false);
      expect(data.name).to.equal('Nova Strider');
    });

    it('draft is NOT visible in the active entity list before activation', async () => {
      // Create a draft
      const { data: draft } = await POST(
        servicePath,
        {
          name: 'Ghost Rider',
          origin_planet: 'Mars Prime',
          stardust_collection: 200,
          wormhole_navigation_skill: 20,
        },
        asUser('alice'),
      );

      // Active list must not contain the draft
      const { data } = await GET(`${servicePath}?$filter=IsActiveEntity eq true`, asUser('alice'));
      const found = data.value.find((sf: any) => sf.ID === draft.ID);
      expect(found).to.be.undefined;
    });

    // ── 2. ACTIVATE DRAFT ────────────────────────────────────────────────────

    it('activates a draft and makes it visible as an active entity', async () => {
      // Step 1 – create draft
      const { data: draft } = await POST(
        servicePath,
        {
          name: 'Lyra Kade',
          origin_planet: 'Mars Prime',
          stardust_collection: 300,
          wormhole_navigation_skill: 30,
        },
        asUser('alice'),
      );

      // Step 2 – activate
      const activateUrl = `${entityUrl(draft.ID, false)}/draftActivate`;
      const { status } = await POST(activateUrl, {}, asUser('alice'));
      expect(status).to.equal(201);

      // Step 3 – should now appear in the active list
      const { data } = await GET(entityUrl(draft.ID, true), asUser('alice'));
      expect(data.IsActiveEntity).to.equal(true);
      expect(data.name).to.equal('Lyra Kade');

      // ✅ Clean up — delete the activated record so it doesn't inflate the
      // seeded-count assertion in the Authentication & Authorization tests
      await DELETE(entityUrl(draft.ID, true), asUser('alice'));
    });

    // ── 3. EDIT EXISTING ENTITY ──────────────────────────────────────────────

    it('opens an existing active entity for editing (draftEdit creates a shadow draft)', async () => {
      const { data: draft } = await POST(
        servicePath,
        {
          name: 'Editable Voyager',
          origin_planet: 'Mars Prime',
          stardust_collection: 250,
          wormhole_navigation_skill: 25,
        },
        asUser('alice'),
      );
      await POST(`${entityUrl(draft.ID, false)}/draftActivate`, {}, asUser('alice'));

      const editUrl = `${entityUrl(draft.ID, true)}/draftEdit`;

      const { data, status } = await POST(editUrl, { PreserveChanges: false }, asUser('alice'));

      expect(status).to.equal(201);
      expect(data.IsActiveEntity).to.equal(false);
      // The draft points back to the original active entity
      expect(data.HasActiveEntity).to.equal(true);

      // Clean up – remove the draft shadow, then the active record.
      await DELETE(entityUrl(draft.ID, false), asUser('alice'));
      await DELETE(entityUrl(draft.ID, true), asUser('alice'));
    });

    // ── 4. DISCARD DRAFT ─────────────────────────────────────────────────────

    it('discards a draft so it disappears without affecting active data', async () => {
      const { data: draft } = await POST(
        servicePath,
        {
          name: 'Temp Traveler',
          origin_planet: 'Mars Prime',
          stardust_collection: 150,
          wormhole_navigation_skill: 15,
        },
        asUser('alice'),
      );

      const { status } = await DELETE(entityUrl(draft.ID, false), asUser('alice'));
      expect(status).to.equal(204);

      // Must not be retrievable anymore (neither as draft nor active)
      const req = GET(entityUrl(draft.ID, false), asUser('alice'));
      const { status: getStatus } = await expect(req).to.be.rejectedWith(/404/i);
      expect(getStatus).to.equal(404);
    });

    // ── 5. VALIDATION FIRES ON DRAFT ACTIVATE, NOT ON DRAFT SAVE ─────────────
    // CAP deliberately skips @before CREATE during draft saves — validation
    // only runs when the draft is activated (committed to the active table).

    it('draft save accepts invalid stardust (CAP defers validation to activate)', async () => {
      // This should resolve with 201 — CAP does NOT validate on draft save
      const { data: draft, status: saveStatus } = await POST(
        servicePath,
        {
          name: 'Bad Actor',
          origin_planet: 'Mars Prime',
          stardust_collection: -1, // invalid, but draft save still succeeds
          wormhole_navigation_skill: 50,
        },
        asUser('alice'),
      );

      expect(saveStatus).to.equal(201);
      expect(draft.stardust_collection).to.equal(-1); // bad value is stored in the draft

      // ✅ Clean up the orphaned draft
      await DELETE(entityUrl(draft.ID, false), asUser('alice'));
    });

    it('@before CREATE validation rejects invalid stardust when activating a draft', async () => {
      // Step 1 – create the draft with bad data (succeeds)
      const { data: draft } = await POST(
        servicePath,
        {
          name: 'Bad Actor',
          origin_planet: 'Mars Prime',
          stardust_collection: -1, // invalid
          wormhole_navigation_skill: 50,
        },
        asUser('alice'),
      );

      // Step 2 – activation should now fail with 400
      const activateUrl = `${entityUrl(draft.ID, false)}/draftActivate`;
      const req = POST(activateUrl, {}, asUser('alice'));

      const { status } = await expect(req).to.be.rejectedWith(/400/i);
      expect(status).to.equal(400);

      await DELETE(entityUrl(draft.ID, false), asUser('alice'));
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

      // alice has admin role - should see all 20 seeded spacefarers from all planets
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
