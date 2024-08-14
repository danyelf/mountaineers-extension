# Commands

`npm install` to get dependences

Follow instructions at [Chrome Extension tutoral](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world).
Start the code running with `npm run watch`
Go to [chrome://extensions](chrome://extensions) and hit `load unpacked.` Use the `build` directory.

# Other browsers

Chrome uses `manifest.json`. `manifest_gecko` is for firefox; see [this stackoverflow](https://stackoverflow.com/questions/56271601/chrome-extensions-do-not-respect-browser-specific-settings)

That's because "browser-specific-settings" key is Mandatory for Firefox; disallowed for Chrome. Sigh.

Note that I haven't actually tried to deploy this for ff; Firefox approval process requires them to be able to try it, and that's a breach of mountaineers security:

https://extensionworkshop.com/documentation/publish/add-on-policies/#submission-guidelines says:

> To facilitate the functional testing, the add-on author must provide testing information and, if an account is needed for any part of the add-on’s functionality, testing credentials to allow use of the add-on.

---

Current TODO list:

- In the button, add a progress bar:
  How many total activities are there?
  How many have we processed so far?
  (Consider making the button reflect the work at startup)

- In the button, add a setting:
  [ ] Trip
  [ ] Course
  [ ] Other
  (What are the types again?)
  We may need to update the data store for this.

- Consider updating the data store format: versioning?
- Update logging:
  - while loading: info in progress bar. (send an event every once in a while!)
  - after loaded:
    - log URL pattern for page,

---

"category": "trip",
"category": "course",
"category": "event",
(there are probably others too)