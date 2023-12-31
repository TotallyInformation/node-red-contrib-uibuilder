---
title: UIBUILDER Futures
created: 2023-12-30 20:11:21
updated: 2023-12-30 20:15:44
author: Julian Knight (Totally Information)
---

## Future aims and overall direction

UIBUILDER will continue to be independent of front-end frameworks though it will also continue to be as compatible as possible so that any desired framework can be used with it.

* It will continue to gain more zero-code pre-built elements.
* It will gain improved control over the instance root folder structure and the ability to execute `npm run` scripts defined in the `package.json`.
* More videos!

### Longer term focus

There remains a desire to build a page-builder feature so that people with no coding skills can build great data-driven web apps.

* The documentation quality will continue to improve.
* The number of 3rd-party module dependencies will be reduced. Starting with the eventual removal of `fs-extra` in favour of the native promisified fs library. Followed most likely by `arun`.
* Once Node.js v18 or 20 is the base, the code is likely to be refactored into multiple sub-packages in a mono-repo.
