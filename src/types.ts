export type PeopleActivityMap = Map<string, Set<Activity>>;

export type GlobalState = {
  peopleMap: PeopleActivityMap | null;
  me: string;
  thisPage: string,
  mostRecentlyClickedName: string | null,
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
  