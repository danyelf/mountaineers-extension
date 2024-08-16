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
export interface RawActivity {
  category: string;
  href: string;
  title: string;
  status: string;
  start: string; // start date
}

export interface Activity {
  category: string;
  href: string;
  title: string;
  time: number;
}

export const rawToActvitiy = (raw: RawActivity): Activity => {
  return {
    category: raw.category,
    href: raw.href,
    title: raw.title,
    time: Date.parse(raw.start),
  };
};

export const start = (a: Activity): string => {
  return new Date(a.time).toDateString();
};

export enum Popup_Messages {
  CLEAR_LOCAL_STORAGE = 'clearLocalStorage',
  UPDATE_ICON = 'updateIcon',
}

export interface Popup_Response {
  workingState: boolean;
  message: string;
}
