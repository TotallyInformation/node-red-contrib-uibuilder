---
title: How to release a new version of UIBUILDER
description: |
  Several steps are needed, in the right order, to be able to release a new version.
created: 2024-09-01 11:34:53
updated: 2024-09-01 11:56:07
---

This assumes all main updates have been done for this release and that local testing is complete.

## 01) Check the CHANGELOG

* For outstanding issues that need resolving before release.
* Move any remaining To Do items to the roadmap for future changes.
* Check the Highlights and update if needed.
* Move anything under the "unreleased" section to the correct version section and update the GitHub links.

## 02) Check version numbers

Make sure version numbers are correct and aligned:

* package.json
* gulpfile.js
* src\front-end-module\ui.js
* src\front-end-module\uibuilder.module.js

## 03) Do a final commit & push to the dev branch

* Do a final `npm outdated` check.
* Check DeepScan results and resolve any issues.

## 04) Merge GitHub dev branch to main

* Do a pull request, dev branch to main.
* If any conflicts, do `git merge main` on VSCode command line (in the dev branch).

Remember to switch branches in VS Code before continuing.

## 05) Do a test upgrade install to existing uibuilder environment

* Install manually from GitHub main branch.
* Check everything works - see [Regression Tests](dev/regression-tests.md).
* Do any bug fixes in main.
* Do a final doc check/update.
* Do a final commit/push to main.

## 06) Create a new GitHub tag & release

* Run `gulp createTag` from VSCode terminal (making sure to use main branch).
* On GitHub, create a release from the tag and paste the version changelog notes into the release notes.

## 07) Publish new version to npm

* Run `npm publish --access public` from VSCode terminal (making sure to use main branch).
* Check https://www.npmjs.com/package/node-red-contrib-uibuilder to make sure it has updated.

## 08) Update Node-RED flows and forum

* Run "check for update" on https://flows.nodered.org/node/node-red-contrib-uibuilder.
* Post to forum:
  * Category: Share your nodes.
  * Tag: node-red-contrib-uibuilder.
  * Title: `:sparkles: UIBUILDER New Release v6.8.2 - something about the release` OR, for major releases `:star2: UIBUILDER Major Release v7.0.0 - it’s here at last!`
  * Include intro and version changelog.