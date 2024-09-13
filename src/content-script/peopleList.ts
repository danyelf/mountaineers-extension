import { Activity, Activity_Types } from '../shared/types';
import { GlobalState } from './globalState';

export function getTrueCheckboxes(globalState: GlobalState) {
  if (globalState.checkboxState && globalState.checkboxState.length > 0) {
    return globalState.checkboxState
      .filter((v) => v.checked)
      .map((m) => m.name.toString());
  }

  return null;
}

// the one database call to rule them all.
export function getSortedFilteredActivityList(
  globalState: GlobalState,
  person: string
): Activity[] {
  if (!globalState.peopleMap) return [];
  const activities = globalState.peopleMap.get(person!);
  if (!activities) return [];

  const trueCheckboxes = getTrueCheckboxes(globalState);
  const rv = [...activities].filter((a) => acceptActivity(a, trueCheckboxes));

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
function acceptActivity(a: Activity, trueCheckboxes: string[] | null) {
  if (trueCheckboxes == null) return true;

  if (trueCheckboxes.includes(a.category)) {
    return true;
  }

  const isOtherOk = trueCheckboxes.includes(Activity_Types.OTHER);

  if (isOtherOk) {
    const vals = Object.values(Activity_Types) as string[];
    return !vals.includes(a.category);
  }

  return false;
}
