import cds from '@sap/cds';

const minimumStardust = 100;
const minimumWormholeSkill = 10;
export default class GalacticSpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;

    // Task 3 – @Before: validate & enhance skills
    this.before('CREATE', Spacefarers, (req) => {
      return validateAndEnhanceSpacefarer(req);
    });

    this.after('CREATE', Spacefarers, (spacefarer) => {
      return sendCosmicWelcomeEmail(spacefarer);
    });

    return super.init();
  }
}

export function validateAndEnhanceSpacefarer(req: cds.Request<any, Record<string, any>[]>): any {
  const data = req.data;

  if (data.stardust_collection === undefined) {
    return req.error(400, 'Missing stardust_collection');
  }

  if (typeof data.stardust_collection !== 'number' || data.stardust_collection < 0) {
    return req.error(400, 'Invalid stardust_collection: must be a non-negative number');
  }

  // Validate wormhole_navigation_skill
  if (data.wormhole_navigation_skill === undefined) {
    return req.error(400, 'Missing wormhole_navigation_skill');
  }

  if (
    typeof data.wormhole_navigation_skill !== 'number' ||
    data.wormhole_navigation_skill < 0 ||
    data.wormhole_navigation_skill > 100
  ) {
    return req.error(400, 'Invalid wormhole_navigation_skill: must be a number between 0 and 100');
  }

  // Cosmic minimum threshold for stardust_collection
  if (data.stardust_collection < minimumStardust) {
    data.stardust_collection = minimumStardust;
  }

  if (data.wormhole_navigation_skill < minimumWormholeSkill) {
    data.wormhole_navigation_skill = minimumWormholeSkill;
  }
  // If we reach here, validation passed and data is enhanced if needed
  return;
}

// fake email sender for demonstration — in production, this would be a real email transport (e.g., nodemailer)
export async function sendCosmicWelcomeEmail(
  spacefarer: any,
  // injectable transport — defaults to a console logger in production
  // eslint-disable-next-line no-unused-vars
  transport: (payload: { to: string; subject: string; body: string }) => Promise<void> = async (payload) => {
    // eslint-disable-next-line no-console
    console.log(`[CosmicMail] To: ${payload.to}`);
    // eslint-disable-next-line no-console
    console.log(`[CosmicMail] Subject: ${payload.subject}`);
    // eslint-disable-next-line no-console
    console.log(`[CosmicMail] Body: ${payload.body}`);
  },
): Promise<void> {
  const name = spacefarer.name || 'Spacefarer';
  const planet = spacefarer.origin_planet || 'the cosmos';

  await transport({
    to: `${name} <spacefarer@galactic.adventure>`,
    subject: 'Congratulations on your Cosmic Adventure!',
    body: `Dear ${name},\n\nWelcome aboard! You have been launched from ${planet} into the SAP galaxy.\n\nMay your wormhole navigation be true.\n\nThe Galactic Spacefarers Team`,
  });
}
