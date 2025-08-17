// the goal of this file is
// - if the user is logged into mountaineers.org
// take a look at https://www.mountaineers.org/members/danyel-fisher/member-activities
// for each activbity in HISTORY, go to ${activity)/roster-tab
// e.g. https://www.mountaineers.org/locations-lodges/seattle-program-center/events/spring-gear-grab-2024-05-20/roster-tab
// pull the roster from the activity
// add to storage soimething like
// [ { person:  person , [ {name: activity_name, url: activity_rul }]} ]

import { logError, logMessage } from '../lib/logMessaage';
import { sendMessage } from '../shared/sendMessage';
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
import { fragile_getActivities, fragile_getRosterForActivity } from './fragile';

//     how do I find MY activities page?
//          start w. https://www.mountaineers.org/
//          one choice: search throuigh  all hrefs looking for /member-activities
//          e.g. https://www.mountaineers.org/members/danyel-fisher/member-activities

export interface ActivityRoster {
  acthref: string;
  roster: string[];
}

// given a roseter-contact, returns the core string
// expect URL to look like https://www.mountaineers.org/members/bill-dittig?ajax_load=1
// TODO: confirm this works for "foo-bar-1" as well as "foo-bar"

// assume past activities are fixed
export async function updateParticipantList(
  me: string // my name
): Promise<PeopleActivityMap | void> {
  const { lastActivityCheck, peopleMap, cachedActivitiesList } =
    await loadPeopleMapAndActivitiesFromLocalStorage();

  logMessage(
    'read from cache',
    lastActivityCheck,
    peopleMap,
    cachedActivitiesList
  );

  const ONE_HOUR = 60 * 60 * 1000;
  if (Date.now() - lastActivityCheck < ONE_HOUR) {
    // data is pretty new

    sendMessage(Frontend_Messages.PEOPLE_STATUS, {
      numPeople: peopleMap.size,
      numActivities: cachedActivitiesList.length,
      lastActivityCheck: lastActivityCheck,
    });

    return peopleMap;
  }

  // check current activity set

  const currentTime = Date.now();

  sendMessage(Frontend_Messages.GET_ACTIVITIES);

  const liveActivitesList = await fragile_getActivities(me);

  const liveActivitesMap = new Map(liveActivitesList.map((a) => [a.href, a]));
  const liveActivitySet = [...liveActivitesMap.keys()];

  const cachedActivitySet = cachedActivitiesList.map((a) => a.href);
  // should be set.difference, but not in firefox
  const toReadSet = difference(liveActivitySet, cachedActivitySet);

  sendMessage(Frontend_Messages.GET_ACTIVITY_ROSTERS, {
    numMessages: liveActivitesList.length,
  });

  // WAVE 2: get storage, get activity URLs. Uses Promise.all. Does it parallelize?
  const rosters = await asyncMap([...toReadSet], fragile_getRosterForActivity);

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
        logError("Confusing! Can't find activty", activityRoster.acthref);
      }
    });
  });

  await savePeopleMapAndActivitiesToLocalStorage(
    currentTime,
    peopleMap,
    liveActivitesList
  );

  sendMessage(Frontend_Messages.PEOPLE_STATUS, {
    numPeople: peopleMap.size,
    numActivities: liveActivitesList.length,
    lastActivityCheck: lastActivityCheck,
  });

  return peopleMap;
}
