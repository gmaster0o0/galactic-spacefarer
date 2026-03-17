using {my.galactic.adventure as my} from '../../db/index';

@path    : '/spacefarer'
@requires: 'authenticated-user'
service GalacticSpacefarerService {
  @restrict: [
    {
      grant: '*',
      to   : 'admin' // full CRUD, sees all planets
    },
    {
      grant: [
        'READ',
        'WRITE'
      ],
      to   : 'authenticated-user',
      where: 'origin_planet = $user.planet' // row-level isolation
    }
  ]
  //enable edit the object page
  @odata.draft.enabled
  entity Spacefarers as projection on my.Spacefarers;

  @readonly
  entity Departments as projection on my.Departments;

  @readonly
  entity Positions   as projection on my.Positions;


}
