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
  entity Spacefarers as projection on my.Spacefarers;
}
