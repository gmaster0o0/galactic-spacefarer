using {my.galactic.adventure as my} from '../../db/index';

service GalacticService {
  entity Spacefarers as projection on my.Spacefarers;
}
