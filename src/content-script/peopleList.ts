import { Activity, Activity_Types } from '../shared/types';
import { GlobalState } from './globalState';

// the one database call to rule them all.
export function getSortedFilteredActivityList(
  globalState: GlobalState,
  person: string
): Activity[] {
  if (!globalState.peopleMap) return [];
  const activities = globalState.peopleMap.get(person!);
  if (!activities) return [];

  const rv = [...activities].filter((a) => acceptActivity(a, globalState));

  // reverse time order
  rv.sort((a, b) => a.time - b.time);

  return rv;
}

// checkboxes are in Activity_types
// "OTHER" is special
// logic:
//    if no checkboxes are lit, erturn true
//    if activity.category is explicitly in the list, accept it
//    if "other" is lit,
function acceptActivity(a: Activity, globalState: GlobalState) {
  const checkboxes = globalState.checkboxState;

  console.log('Check ', a, ' against ', checkboxes);

  // no data. accept it all
  if (checkboxes.length === 0) return true;

  const trueCheckboxes = globalState.checkboxState
    .filter((v) => v.checked)
    .map((m) => m.name.toString());

  if (a.category in trueCheckboxes) return true;

  if (a.category in Object.keys(Activity_Types)) {
    return Activity_Types.OTHER in trueCheckboxes;
  }
}
