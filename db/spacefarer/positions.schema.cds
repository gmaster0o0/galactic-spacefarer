namespace my.galactic.adventure;

using {cuid} from '@sap/cds/common';
using {my.galactic.adventure.Spacefarers} from './spacefarer.schema';

entity Positions : cuid {
  title       : String;
  rank        : String;

  spacefarers : Association to many Spacefarers
                  on spacefarers.position = $self;

}
