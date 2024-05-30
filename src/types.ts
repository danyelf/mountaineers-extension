import { badgeClickCallback } from './decoratePage';

export type PeopleActivityMap = Map<string, Set<Activity>>;

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

// reflects the titles in
// https://www.mountaineers.org/members/danyel-fisher/member-activity-history.json
// (see in notes.md)
export interface Activity {
  category: string;
  href: string;
  title: string;
  status: string;
  start: string; // start date
}
