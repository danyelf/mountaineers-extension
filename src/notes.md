Notes to self:

Some pieces I'm missing:
https://www.mountaineers.org/activities/activities/stewardship-darrington-ranger-district-trails-29
not all names are populating. (Why not?)

2. In the popup list in the roster, prepend the date instead of append, like in the profile page.
3. Popup list is a bit narrow on my desktop, and the list wraps unnecessarily. e.g. first pic.
4. I see some inconsistent datetimes, e.g. second pic
5. It would be cool to have hyperlinks to the activities in the popup list.

---

https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension

--

Note that this assumes that ME is always the same. Will break if > 1 person logs in.
Format for https://www.mountaineers.org/members/danyel-fisher/member-activity-history.json

````json
[
  {
    "category": "course",
    "href": "https://www.mountaineers.org/locations-lodges/seattle-branch/committees/seattle-climbing-committee/course-templates/alpine-climbing-courses/basic-alpine-climbing-course/activities/seattle-basic-alpine-field-trip-7-crevasse-rescue-evaluation-magnuson-park-9",
    "title": "Seattle Basic Alpine Field Trip #7 - Crevasse Rescue Evaluation - Magnuson Park",
    "uid": "dd963cf6f55b40d491e43e21802b4bf2",
    "leader": {
      "href": "https://www.mountaineers.org/members/liana-robertshaw-1",
      "name": "Liana Robertshaw"
    },
    "is_leader": false,
    "date": "May&nbsp;23,&nbsp;2024",
    "start": "2024-05-23",
    "trip_results": "Successful",
    "position": "Participant",
    "status": "Registered",
    "result": "Successful",
    "survey_url": "https://www.mountaineers.org/volunteer/feedback-survey-forms/course-activity-feedback/?surveyed-object-uid=dd963cf6f55b40d491e43e21802b4bf2",
    "response_url": "",
    "survey_summary_url": "",
    "review_state": "closed",
    "contact_is_private": false
  },
...
]```
````
