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

  console.log(rv.length);
  // reverse time order
  rv.sort((a, b) => a.time - b.time);

  console.log(rv.length);

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

  // no data. accept it all
  if (checkboxes.length === 0) return true; //  a.category == 'course';

  const trueCheckboxes = globalState.checkboxState
    .filter((v) => v.checked)
    .map((m) => m.name.toString());

  console.log('Check ', a.category, ' against ', trueCheckboxes);

  if (trueCheckboxes.includes(a.category)) {
    return true;
  }

  const isOtherOk = trueCheckboxes.includes(Activity_Types.OTHER);
  console.log('other checked', isOtherOk);

  if (isOtherOk) {
    const vals = Object.values(Activity_Types) as string[];
    return !vals.includes(a.category);
  }

  return false;
}
