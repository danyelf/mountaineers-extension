import { PeopleActivityMap } from '../shared/types';
import { badgeClickCallback } from './decoratePage';

export class GlobalState {
  constructor(thisPage: string) {
    this.peopleMap = null;
    this.me = '';
    this.thisPage = thisPage;
    this.mostRecentlyClickedName = null;
    this.badgeClickCallback = badgeClickCallback(this);
  }

  peopleMap: PeopleActivityMap | null = null;
  me: string = '';
  thisPage: string;
  mostRecentlyClickedName: string | null;
  badgeClickCallback?: (e: MouseEvent) => void;
}
