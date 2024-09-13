import { CheckboxStateRecord, PeopleActivityMap } from '../shared/types';
import { badgeClickCallback } from './decoratePage';

// Strictly speaking, I should be doing something like a "context" here
// This GlobalState object usefuly passes around the things I need to know

export class GlobalState {
  constructor(thisPage: string) {
    this.peopleMap = null;
    this.me = '';
    this.mostRecentlyClickedName = null;
    this.badgeClickCallback = badgeClickCallback(this);
    this.checkboxState = [];
  }

  // database of Person -> Set<Activity>
  peopleMap: PeopleActivityMap | null = null;

  // currently logged in username
  me: string = '';

  // tracks hover state for popup pages
  mostRecentlyClickedName: string | null;

  // callback populates the badge. This probably shouldn't be here --
  // I just had needed to pass around the globalstate object into the callback
  badgeClickCallback?: (e: MouseEvent) => void;

  // state of the checkboxes in the popup
  checkboxState: CheckboxStateRecord[];
}
