TODOs

[] Current bug: "could not establish connection, recieving end does not exist". Seems to be coming from both sides, so no handshake. How's the Background doing?

---

[] Progress meter on reading (activities read so far)
[] Consider upgrading the whole thing to React so the control panel stays in sync when you click on/off different activity types

- Add Vite
- Separate logic from presentation—this will ease the transition to React components. (I think we're mostly there?)
- Do the popup first

[] On personal pages, break up activity types into groups
[] Make sure THIS activity isn't listed
[] Do we want a better data storage format? (e.g. duckdb-embed?)
[] FIX/CONFIRM personal name bug -- does the record store under "john-bell" or "john-bell-1"?

DONE
[x] CODE MAINTENANCE: label all assumptions in "fragile" for later maintenance
[x] CODE MAINTENANCE: move all chrome.runtime into a single place
