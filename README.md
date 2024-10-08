# <img src="public/icons/icon_48.png" width="45" align="left"> Mountaineers Trips in Common

An extension to show the number of trips and activities in common on Mountaineers trips.

Ever tried to remember just who that person is? "Did we hike up Norse Peak together, or were you on the Mt Si scramble last year?" The Trips in Common extension shows you your trips with other Mountaineers!

## Features

- For each person mentioned on an activity page, adds an annotation with the number of trips in common. Hover over the annotation to get a popup list of the trips.
- For each person's profile page, adds a list of trips you've had in commmon with them to their profile page.

![People Page](readme-img/peoplepage.png)
![Acitvity Page](readme-img/activity.png)

### Version Log

0.0.0.2: Still in preview. Consistent dates. Addedd "clear cache" button for debugging. Events are now clickable.

## Install

[**Chrome** extension](https://chromewebstore.google.com/detail/mountaineer-trips-in-comm/naccnbaphpghakhhnppgiibdkipmhhgf?pli=1&fbclid=IwAR2Lpf07nSy4ZJNjKPNlWjUez-zMT8-5ihqwv0dHD_WjTl8n4QSrDbjzRvA)

Note that the first time you run it, the extension will take a few moments to load your past trips. The more activities you have participated in, the longer this will take.

## Warnings and Limitations

The extension uses local browser storage. Right now, it only keeps one person's records. If you log in as someone else on the same browser, the extension will get confused and may provide incoherent results. It may also fall out of sync if an activity has a change in membership.

This code is fragile -- as an extension, it can only see the structure of the page. It matches for a number of formatting quirks that are subject to change at any time.

I believe it also matches only on name (at the moment) -- "Alex Smith" refers to three people.

In a better world, the Mountaineers would replace all of this with a single database call.

## A Note on Privacy

The Mountaineers website allows you to see a fairly limited set of information about other people: you can go to their Members page to see what is public about them. In addition, for every activity, you can see the roster of people who are registered for it.

This extension looks only at the rosters of activities that **you** have attended. It looks only at information you can see, logged in as your credentials.

This extension collects anonymous usage data to track dissemination. It does not collect the URL of the activities or pages you are looking at.

## Behind the Scenes

When you start the extension for the first tiome, and go to a Mountaineers page while logged in, the app does the following:

- Downloads a list of all activities you've been involved in
- For each of those activities, hops to the activity page and downloads a list of the people involved
- Assembles a mapping: person => {activity, activity, activity}

It only checks for new activities, once a day.

## Contribution

Suggestions and pull requests are welcomed!.
