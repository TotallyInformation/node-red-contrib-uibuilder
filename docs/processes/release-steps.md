---
title: How to release a new version of UIBUILDER
description: |
  Several steps are needed, in the right order, to be able to release a new version.
created: 2024-09-01 11:34:53
updated: 2025-12-30 11:28:54
author: Julian Knight (Totally Information)
---

This assumes all main updates have been done for this release and that local testing is complete.

## Incorporating bug-fixes from `main` branch

When working on the dev branch, it may be necessary to release a new bug-fix release from `main`. At that point, you should then incorporate the changes into your feature branch(es).

Firstly commit or stash any outstanding changes in your `dev` branch.

Then, from the VSCode command line, do:

```bash
git switch main
git pull origin main
git switch dev
git merge main
```
Now the Source Control panel in VSCode will have any files with conflicts marked. Click on them to view the conflict and resolve. Then do another commit and push.

If you did a stash, do `git stash pop` now to re-apply your changes.

## Creating a feature branch

No longer needed - work is done directly on the `dev` branch.

* ~~On GitHub, click on the "Switch branches/tags" drop-down. Search for the new name - e.g. v7.3.0 - if it does not exist, GitHub will offer to create it from the current main branch.~~
* ~~In VSCode, switch to the SOURCE CONTROL sidebar, click on REMOTES, refresh if needed. Expand "origin" and click on the "Switch to branch..." icon.~~

## 01) Check docs/roadmap/next.md

* For outstanding issues that need resolving before release.
* Move any remaining To Do items to the roadmap for future changes.
* Check the Highlights and update if needed.
* Move anything under the "unreleased" section to the correct version section and update the GitHub links.

## 02) Check version numbers

Make sure version numbers are correct and aligned:

* package.json
* gulpfile.js
  
  Make sure that `gulp watch` is running for these:

* src\front-end-module\ui.js
* src\front-end-module\uibuilder.module.js

## 03) Do a dependency update

* `npm outdated` & `npm update`.

Needs to be run against:
* Root folder (uibuilder).
* `packages/uib-md-utils` folder.
* `templates/blank` folder.

## 03a) Update the docs bundle

* Run `npm run buildDocBundle` to update the docs bundle.

## 03b) Update the client library typescript definitions

These are in `templates\blank\types`. They are updated by asking Copilot _"Update the typescript descripion files in `./templates/blank/types` to match the updated version of `./src/front-end-module/uibuilder.module.mjs`"_.

## 03c) Build the uib-md-utils package

Run `npm run buildUibMdUtils` to build the package.

## 04) Do a final commit & push to the dev branch

* Commit and push

## 05) Merge GitHub dev branch to main

* Do a pull request, dev branch to main.
* Check DeepScan and Snyk results and resolve any issues.
  * If issues, fix and update the PR.
* If any conflicts, do `git merge main` on VSCode command line (in the dev branch).

For conflicts that can't be merged in GitHub web interface, use VSCode command line:

```bash
git switch main
git pull origin main
git switch dev
git merge main
```
Now the Source Control panel in VSCode will have any files with conflicts marked. Click on them to view the conflict and resolve. Then do another commit and push.

Remember to switch branches to the version branch in VS Code before continuing.

## 06) Do a test upgrade install to existing uibuilder environment

* Install manually from GitHub main branch.
* Check everything works - see [Regression Tests](dev/regression-tests.md).
* Do any bug fixes in main.
* Do a final doc check/update.
* Do a final commit/push to main.

## 07) Create a new GitHub tag & release

* Run `gulp createTag` from VSCode terminal (making sure to use main branch).
* [On GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder/tags), create a release from the tag and paste the version changelog notes into the release notes.

## 08) Publish new version to npm

* Run `npm publish --access public` from VSCode terminal (making sure to use main branch).
* Check https://www.npmjs.com/package/node-red-contrib-uibuilder to make sure it has updated.

## 09) Update Node-RED flows and forum

* Run "check for update" on https://flows.nodered.org/node/node-red-contrib-uibuilder.
* Post to forum:
  * Category: Share your nodes.
  * Tag: node-red-contrib-uibuilder.
  * Title: `:sparkles: UIBUILDER New Release v6.8.2 - something about the release` OR, for major releases `:star2: UIBUILDER Major Release v7.0.0 - it’s here at last!`
  * Include intro and version changelog.

## 10) If releasing a bug-fix to main

After publishing:

```bash
git switch dev
git merge main
```
