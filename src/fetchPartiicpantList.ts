// the goal of this file is
// - if the user is logged into mountaineers.org
// take a look at https://www.mountaineers.org/members/danyel-fisher/member-activities
// for each activbity in HISTORY, go to ${activity)/roster-tab
// e.g. https://www.mountaineers.org/locations-lodges/seattle-program-center/events/spring-gear-grab-2024-05-20/roster-tab
// pull the roster from the activity
// add to storage soimething like
// [ { person:  person , [ {name: activity_name, url: activity_rul }]} ]

import { asyncMap } from './util';

//     how do I find MY activities page?
//          start w. https://www.mountaineers.org/
//          one choice: search throuigh  all hrefs looking for /member-activities
//          e.g. https://www.mountaineers.org/members/danyel-fisher/member-activities

// loads the page, returns activityUrl
async function fetchMemberActivitiesUrls(): Promise<string> {
  const response = await fetch('https://www.mountaineers.org');
  const text = await response.text(); // Get the HTML content as text

  // Parse the HTML to find the links
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  // Select all anchor tags (links)
  const links = doc.querySelectorAll('a');

  // Filter the links to find the ones we're interested in
  const memberActivitiesUrls: string[] = [];
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.endsWith('/member-activities')) {
      memberActivitiesUrls.push(href); // Add the URL to our result array
    }
  });

  //    console.log("Found ", memberActivitiesUrls);

  return memberActivitiesUrls[0];
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

interface ActivityRoster {
  acthref: string;
  roster: string[];
}

export type PeopleActivityMap = Map<string, Set<Activity>>;

// we are called with
// https://www.mountaineers.org/members/danyel-fisher/member-activities
// but the activites we care about are at
// https://www.mountaineers.org/members/danyel-fisher/member-activity-history.json
function getMemberActivityHistoryUrl(memberActivitiesUrl: string): string {
  // Use a regular expression to extract the member's name
  const regex = /\/members\/([^\/]+)\/member-activities$/;
  const match = memberActivitiesUrl.match(regex);

  if (match && match[1]) {
    const memberName = match[1];
    return `https://www.mountaineers.org/members/${memberName}/member-activity-history.json`;
  } else {
    // URL doesn't match the expected format, return null or handle the error
    throw 'Invalid member activities URL format:' + memberActivitiesUrl;
  }
}

async function getActvities(activitiesUrl: string): Promise<Activity[]> {
  // update URL string: change from ..../member-activities to /member-activity-history.json
  // console.log('inspecting', activitiesUrl);
  const correctedUrl = getMemberActivityHistoryUrl(activitiesUrl);
  const response = await fetch(correctedUrl);
  const activities = (await response.json()) as Activity[]; // Get the HTML content as text
  return activities.filter((a) => a.status === 'Registered');
}

// given a roseter-contact, returns the core string
// expect URL to look like https://www.mountaineers.org/members/bill-dittig?ajax_load=1
export function contactFromEntry(rosterEntry: Element): string | null {
  try {
    const url = new URL(rosterEntry.querySelector('a')!.href);
    return url.pathname.split('/')[2]; // NOT ROBUST -- ASSUMES URL
  } catch (e) {
    try {
      const url = new URL(rosterEntry.querySelector('img')!.src);
      return url.pathname.split('/')[2]; // NOT ROBUST -- ASSUMES URL
    } catch (e2) {
      // they have neither a url nor an image
      return null;
    }
  }
}

// we get an activity, and return the list of people on it by adding /roster-tab to it
async function getRoster(acthref: string): Promise<ActivityRoster> {
  const activity_roster = acthref + '/roster-tab';

  const response = await fetch(activity_roster);
  const text = await response.text(); // Get the HTML content as text

  // Parse the HTML to find the links
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  const rosterEntries = doc.querySelectorAll('div.roster-contact');

  const roster: string[] = [];
  rosterEntries.forEach((rosterEntry) => {
    const name = contactFromEntry(rosterEntry);
    if (name) roster.push(name);
  });

  //  console.log(act.title, act.href, 'Found ', roster);
  return { acthref, roster };
}

async function loadPeopleMapFromLocalStorage(): Promise<PeopleActivityMap> {
  const result = await chrome.storage.local.get(['peopleMap']); // Get specific item
  if (result.peopleMap) {
    const mapArray = result.peopleMap as [string, Activity[]][];
    const mapEntries: [string, Set<Activity>][] = mapArray.map(
      ([key, value]: [string, Activity[]]) => {
        // Explicitly type the callback parameters
        const valueSet: Set<Activity> = new Set<Activity>(value);
        return [key, valueSet] as [string, Set<Activity>]; // Explicitly type the return value
      }
    );

    return new Map<string, Set<Activity>>(mapEntries);
  } else {
    return new Map<string, Set<Activity>>();
  }
}

async function savePeopleMapToLocalStorage(
  peopleMap: PeopleActivityMap
): Promise<void> {
  const mapEntries = Array.from(peopleMap.entries());
  const mapArray = mapEntries.map(([key, value]) => [key, Array.from(value)]);

  const itemsToStore = { peopleMap: mapArray };
  await chrome.storage.local.set(itemsToStore);
}

// assume past activities are fixed
export async function updateParticipantList()  : Promise<PeopleActivityMap> {
  // const peoplemap: PeopleActivityMap = new Map<string, Set<Activity>>();

  // for later optimization: I've broken this into "waves". Everything in a wave can be doone in parallel,
  // but right now has lots of AWAIT in it

  // WAVE 1: get storage, get activity URLs.
  const storageResult = await chrome.storage.local.get(['activitiesList']);

  var cachedActivitiesList: Activity[];
  if (storageResult.activitiesList) {
    cachedActivitiesList = storageResult.activitiesList as Activity[];
  } else {
    cachedActivitiesList = [];
  }
  const peoplemap = await loadPeopleMapFromLocalStorage();

  console.log('read from cache', peoplemap, cachedActivitiesList);

  const activityUrl = await fetchMemberActivitiesUrls();
  const me = new URL(activityUrl).pathname.split('/')[2];
  const liveActivitesList = await getActvities(activityUrl);
  const liveActivitesMap = new Map(liveActivitesList.map((a) => [a.href, a]));
  const liveActivitySet = new Set(liveActivitesMap.keys());

  const cachedActivitySet = new Set(cachedActivitiesList.map((a) => a.href));

  const toReadSet = liveActivitySet.difference(cachedActivitySet);

  // this seems wrong -- it's preinting out a rather long list
  console.log('to read list', toReadSet);

  // WAVE 2: get storage, get activity URLs. Uses Promise.all. Does it parallelize?
  const rosters = await asyncMap([...toReadSet], getRoster);

  // Finally
  rosters.forEach((activityRoster) => {
    activityRoster.roster.forEach((person) => {
      if (person == me) return; // dont need me
      if (!peoplemap.has(person)) {
        peoplemap.set(person, new Set<Activity>());
      }
      const act = liveActivitesMap.get(activityRoster.acthref);
      if (act) {
        peoplemap.get(person)!.add(act);
      } else {
        console.log("Confusing! Can't find activty", activityRoster.acthref);
      }
    });
  });

  await savePeopleMapToLocalStorage(peoplemap);

  chrome.storage.local
    .set({
      activitiesList: liveActivitesList,
    })
    .then(() => {
      console.log('storage is set!');
    });

  console.log('The peoplemap at save time', peoplemap);
  return peoplemap;
}
