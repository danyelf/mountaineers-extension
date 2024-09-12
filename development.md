# How the Code Does

## Getting Started

`npm install` to get dependences

Follow instructions at [Chrome Extension tutoral](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world).
Start the code running with `npm run watch`
Go to [chrome://extensions](chrome://extensions) and hit `load unpacked.` Use the `build` directory.

## Code Organization

### Extension-specific Stuff

An extension can have some or all of a content-script (the front page); a background service worker; and a popup that lives under the icon. There are a few subtleties to their lifecycles:

- Only the service worker can talk to the icon (e.g. to change it)
- Only the content-script can talk to the web
- The popup gets re-initiatlized whenever someone clicks on it.

And there's some weirdness with the ways that the popup communicates with the content-script (it can't initiate a conversation).

Folder structure follows these, to try to help communicate what code is used where.

## A Note on Other browsers

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
  [ ] Event
  [ ] Other
  (What are the types again?)
  NOTE 24-9-10: Ooh, this is going to be subtle and annoying. Turns out that the popup can't easily speak to all the content scripts. There's a whole query / broadcast mechansim here. Some options:

  - Don't put it in the popup. Put it on the page itself (or on personal settings)
  - Punt.
  - Hack: consider dropping (e.g.) all events > 15 people or something

- Update logging:
  - while loading: info in progress bar. (send an event every once in a while!)
  - after loaded:
    - log URL pattern for page,

--

Some known issues:

- Way under-tested at scale (John Bell)
- Does not properly work for multiple people sharing a browser
