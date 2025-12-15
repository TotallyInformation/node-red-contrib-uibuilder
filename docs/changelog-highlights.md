---
created: 2025-12-15 15:00:36
updated: 2025-12-15 17:36:09
version: 7.6.0
---
### Welcome to UIBUILDER v7.6.0
This is a relatively minor feature release.

This highlight changes popover is now included. It will only be shown once after an update.

#### Documentation
* Some usability improvements to the side menu. Including the ability to collapse sections. The expand/collapse state is remembered. The currently shown page is also scrolled into view in the menu.

#### uib-cache node
* Performance greatly improved to handle rapid influx of messages.

#### uib-brand CSS
* New `.visually-hidden` class added to support accessibility best practices.

#### Front-end client library
* Incoming messages now have a `_receivedHRtime` property added. This is a high-resolution timestamp. It can be used to measure message transit times accurately.

#### Other
* Various bug fixes, performance improvements and security enhancements.
