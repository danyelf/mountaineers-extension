export type PeopleActivityMap = Map<string, Set<Activity>>;

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

export const ActivityTypes = ['trip', 'event', 'course', 'other'];

export const rawToActvitiy = (raw: RawActivity): Activity => {
  return {
    category: raw.category,
    href: raw.href,
    title: raw.title,
    time: Date.parse(raw.start),
  };
};

export const activityStartDate = (a: Activity): string => {
  return new Date(a.time).toDateString();
};

// messages the popup can send to the background
export enum Popup_Messages {
  CLEAR_LOCAL_STORAGE = 'CLEAR_LOCAL_STORAGE',
  GET_STATUS = 'GET_STATUS',
  FIX_CHECKBOX = 'FIX_CHECKBOX',
}

// messages the frontend can send to the popup & background
export enum Frontend_Messages {
  HELLO_WORLD = 'HELLO_WORLD!',
  NO_LOGGED_IN_USER = 'NO_LOGGED_IN_USER', // complete
  PEOPLE_STATUS = 'PEOPLE_STATUS', // complete
  GET_ACTIVITIES = 'GET_ACTIVITIES', // working
  GET_ACTIVITY_ROSTERS = 'GET_ACTIVITY_ROSTERS', // working
}

export interface IMessage {
  message: string;
}

export interface Popup_Response extends IMessage {
  workingState: boolean;
}

export interface Frontend_Message extends IMessage {
  numPeople: number;
  numActivities: number;
  lastActivityCheck: number; // miliseconds
}
