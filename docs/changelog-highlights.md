---
created: 2025-12-15 15:00:36
updated: 2026-04-22 11:48:22
version: 7.6.1
---
### Welcome to UIBUILDER v7.6.1
This is a bug-fix release.

The order of loading of ExpressJS web server middleware has been corrected so that any custom middleware in `~/.node-red/uibuilder/.common/uibMiddleware.js` is now loaded after the uibuilder master middleware that adds uibuilder specific headers and cookies. This should allow custom middleware to work as expected.
