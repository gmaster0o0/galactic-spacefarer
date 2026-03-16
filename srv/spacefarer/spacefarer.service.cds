using {my.galactic.adventure as my} from '../../db/index';

@path: '/spacefarer'
service GalacticSpacefarerService {
  entity Spacefarers as projection on my.Spacefarers;
}
