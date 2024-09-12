// the goal of this file is
// - if the user is logged into mountaineers.org
// take a look at https://www.mountaineers.org/members/danyel-fisher/member-activities
// for each activbity in HISTORY, go to ${activity)/roster-tab
// e.g. https://www.mountaineers.org/locations-lodges/seattle-program-center/events/spring-gear-grab-2024-05-20/roster-tab
// pull the roster from the activity
// add to storage soimething like
// [ { person:  person , [ {name: activity_name, url: activity_rul }]} ]

import {
  loadPeopleMapAndActivitiesFromLocalStorage,
  savePeopleMapAndActivitiesToLocalStorage,
} from '../shared/storage';
import {
  Activity,
  Frontend_Messages,
  PeopleActivityMap,
  RawActivity,
  rawToActvitiy,
} from '../shared/types';
import { asyncMap, difference } from '../shared/util';

//     how do I find MY activities page?
//          start w. https://www.mountaineers.org/
//          one choice: search throuigh  all hrefs looking for /member-activities
//          e.g. https://www.mountaineers.org/members/danyel-fisher/member-activities

interface ActivityRoster {
  acthref: string;
  roster: string[];
}

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
  const rawactivities = (await response.json()) as RawActivity[]; // Get the HTML content as text
  const activities = rawactivities
    .filter((a) => a.status === 'Registered')
    .map((a) => rawToActvitiy(a));
  return activities;
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
async function getRosterForActivity(acthref: string): Promise<ActivityRoster> {
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

// assume past activities are fixed
export async function updateParticipantList(
  me: string // my name
): Promise<PeopleActivityMap | void> {
  const { lastActivityCheck, peopleMap, cachedActivitiesList } =
    await loadPeopleMapAndActivitiesFromLocalStorage();

  console.log(
    'read from cache',
    lastActivityCheck,
    peopleMap,
    cachedActivitiesList
  );

  if (Date.now() - lastActivityCheck < 60 * 60 * 1000) {
    // data is pretty new

    chrome.runtime.sendMessage({
      message: Frontend_Messages.PEOPLE_STATUS,
      numPeople: peopleMap.size,
      numActivities: cachedActivitiesList.length,
      lastActivityCheck: lastActivityCheck,
    });

    return peopleMap;
  }

  // check current activity set

  const activityUrl = `https://www.mountaineers.org/members/${me}/member-activities`;

  const currentTime = Date.now();

  chrome.runtime.sendMessage({
    message: Frontend_Messages.GET_ACTIVITIES,
  });

  const liveActivitesList = await getActvities(activityUrl);

  const liveActivitesMap = new Map(liveActivitesList.map((a) => [a.href, a]));
  const liveActivitySet = [...liveActivitesMap.keys()];

  const cachedActivitySet = cachedActivitiesList.map((a) => a.href);
  // should be set.difference, but not in firefox
  const toReadSet = difference(liveActivitySet, cachedActivitySet);

  chrome.runtime.sendMessage({
    message: Frontend_Messages.GET_ACTIVITY_ROSTERS,
    numActivities: liveActivitesList.length,
  });

  // WAVE 2: get storage, get activity URLs. Uses Promise.all. Does it parallelize?
  const rosters = await asyncMap([...toReadSet], getRosterForActivity);

  // Finally
  rosters.forEach((activityRoster) => {
    activityRoster.roster.forEach((person) => {
      if (person == me) return; // dont need me
      if (!peopleMap.has(person)) {
        peopleMap.set(person, new Set<Activity>());
      }
      const act = liveActivitesMap.get(activityRoster.acthref);
      if (act) {
        peopleMap.get(person)!.add(act);
      } else {
        console.log("Confusing! Can't find activty", activityRoster.acthref);
      }
    });
  });

  await savePeopleMapAndActivitiesToLocalStorage(
    currentTime,
    peopleMap,
    liveActivitesList
  );

  chrome.runtime.sendMessage({
    message: Frontend_Messages.PEOPLE_STATUS,
    numPeople: peopleMap.size,
    numActivities: liveActivitesList.length,
    lastActivityCheck: lastActivityCheck,
  });

  return peopleMap;
}
