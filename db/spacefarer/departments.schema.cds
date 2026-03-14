namespace my.galactic.adventure;

using {cuid} from '@sap/cds/common';
using {my.galactic.adventure.Spacefarers} from './spacefarer.schema';

entity Departments : cuid {
  name        : String;
  description : String;

  spacefarers : Association to many Spacefarers
                  on spacefarers.department = $self;
}
