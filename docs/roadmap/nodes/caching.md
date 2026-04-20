---
title: Roadmap for caching using uib-cache
description: >
    This page is a working document to track the development of the caching features for uibuilder. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 15:29:01
updated: 2026-04-19 15:29:04
author: Julian Knight (Totally Information)
---

## To fix

* [ ] Editor panel: Some inputs width not consistent

## To improve

## Other

* Add empty cache button.
* [ ] Document
  * [ ] client-specific caching.
  * [ ] How to send cache on "route change" control msg - use a switch node before the cache
  * [ ] How to ONLY send cache on "route change" control msg
  * [ ] Improve docs by describing common use-cases: replay all or last 1, replay only on initial load, ...
* Output node.warn msg if recv input with no "Cache by" msg prop. (e.g. no msg.topic for default setting)

* ?? Add feature to only send data from the disconnected period. ??

* Change cache & main nodes to use client id rather than socket id where available. Since that is less likely to change.
* Add cache replay filtering. Option flags need adding for control. Filter by:
  * [ ] `routeId`
  * [ ] `clientId`
  * [ ] `pageName`
* [ ] Add processing for filters - use saved input on `_ui` or `_uib`, process if filter turned on
* [ ] Add a msg property option to DELAY delivery on cache replay. Or maybe an option to output replay to 2nd port which would be more flexible. 2nd port could also avoid all the extra options since they could simply be a change node that adds the appropriate `msg._uib` property.
* Add DELAY and EXPIRY features.
* Add cache clear button to complement the cache clear control msg
* Add optional page filter - a cache with a page filter will only send the cache if the replay request is from that page. Page filters need to allow a list of pages and ideally wildcards.
* Allow send to client id - would need clientId to _socketId map to be maintained by uibuilder.
* Add checks to prevent non-string cache by property values.
* Think about impact of a cache clear (affects all connected clients)
* Consider allowing an option for separate state and data stores ([D2 ref](https://discourse.nodered.org/t/how-to-sync-the-full-config-between-server-and-client-side-state/89252/4?u=totallyinformation))
* On close, delete cache

## Rejected

* ~~Add ROUTE-specific caching. And route filtering~~ Use multiple caches instead.
