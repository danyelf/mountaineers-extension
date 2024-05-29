import { Activity, PeopleActivityMap } from './types';

export async function savePeopleMapToLocalStorage(
  peopleMap: PeopleActivityMap
): Promise<void> {
  const mapEntries = Array.from(peopleMap.entries());
  const mapArray = mapEntries.map(([key, value]) => [key, Array.from(value)]);

  const itemsToStore = { peopleMap: mapArray };
  await chrome.storage.local.set(itemsToStore);
}

export async function saveActivitiesToStorage( activities: Activity[] ) {
  chrome.storage.local
  .set({
    activitiesList: activities,
  });
}

export async function loadPeopleMapAndActivitiesFromLocalStorage(): Promise<{
  peopleMap: PeopleActivityMap,
  cachedActivitiesList: Activity[]
}> {
  const storageResult = await chrome.storage.local.get(['peopleMap', 'activitiesList']); // Get specific item

  var peopleMap: PeopleActivityMap;

  if (storageResult.peopleMap) {
    const mapArray = storageResult.peopleMap as [string, Activity[]][];
    const mapEntries: [string, Set<Activity>][] = mapArray.map(
      ([key, value]: [string, Activity[]]) => {
        // Explicitly type the callback parameters
        const valueSet: Set<Activity> = new Set<Activity>(value);
        return [key, valueSet] as [string, Set<Activity>]; // Explicitly type the return value
      }
    );
    peopleMap = new Map<string, Set<Activity>>(mapEntries);
  } else {
    peopleMap = new Map<string, Set<Activity>>();
  }

  var cachedActivitiesList: Activity[];
  if (storageResult.activitiesList) {
    cachedActivitiesList = storageResult.activitiesList as Activity[];
  } else {
    cachedActivitiesList = [];
  }
  return { peopleMap, cachedActivitiesList };
}

