namespace my.galactic.adventure;

using {
  managed,
  cuid
} from '@sap/cds/common';

// import realted entities
using {my.galactic.adventure as department} from './departments.schema';
using {my.galactic.adventure as position} from './positions.schema';


entity Spacefarers : cuid, managed {
  name                      : String;
  stardust_collection       : Integer;
  wormhole_navigation_skill : Integer;
  origin_planet             : String;
  spacesuit_color           : String;

  //relations
  department                : Association to department.Departments;
  position                  : Association to position.Positions;
}
