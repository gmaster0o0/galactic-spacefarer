import cds from '@sap/cds';
import { sendCosmicWelcomeEmail } from '../mail/mail.service';

const minimumStardust = 100;
const minimumWormholeSkill = 10;
export default class GalacticSpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;

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
  // Validate stardust_collection
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
  // Cosmic minimum threshold for wormhole_navigation_skill
  if (data.wormhole_navigation_skill < minimumWormholeSkill) {
    data.wormhole_navigation_skill = minimumWormholeSkill;
  }

  return;
}
