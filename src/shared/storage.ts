import { Activity, CheckboxStateRecord, PeopleActivityMap } from './types';
import { getStorage } from './storage_crossbrowser';

export async function savePeopleMapAndActivitiesToLocalStorage(
  lastActivityCheck: number,
  peopleMap: PeopleActivityMap,
  activities: Activity[]
): Promise<void> {
  const mapEntries = Array.from(peopleMap.entries());
  const mapArray = mapEntries.map(([key, value]) => [key, Array.from(value)]);

  await getStorage().set({
    lastActivityCheck: lastActivityCheck,
    peopleMap: mapArray,
    activitiesList: activities,
  });
}

export async function clearLocalStorage(): Promise<void> {
  getStorage().clear();
}

export async function loadPeopleMapAndActivitiesFromLocalStorage(): Promise<{
  lastActivityCheck: number;
  peopleMap: PeopleActivityMap;
  cachedActivitiesList: Activity[];
}> {
  const storageResult = await getStorage().get([
    'lastActivityCheck',
    'peopleMap',
    'activitiesList',
  ]);

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

  const lastActivityCheck = storageResult.lastActivityCheck as number;

  var checkboxState = storageResult.checkboxState as CheckboxStateRecord[];

  return { lastActivityCheck, peopleMap, cachedActivitiesList };
}

export async function saveCheckboxState(checkboxState: CheckboxStateRecord[]) {
  await getStorage().set('checkboxState', checkboxState);
}

export async function loadCheckboxState() {
  const storageResult = await getStorage().get('checkboxState');
  return storageResult.checkboxState;
}
