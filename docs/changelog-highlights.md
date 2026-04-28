---
created: 2025-12-15 15:00:36
updated: 2026-04-28 16:51:07
version: 7.6.2
---
### Welcome to UIBUILDER v7.6.2
This is a bug-fix release.

A number of fixes have been made to Markweb, nothing major. Includes making the copyright footer dynamically update on changes to the page front-matter.

Removed ws: and wss: from the default Content Security Policy (CSP) `connect-src` as they are not needed and can interfere with other settings.

Added `uibuilder.asyncSend()` function to the client docs.

For the UIBUILDER documentation, there is now only a dark-mode since the light-mode was not really usable. More importantly, the sidebar is now **resizable** _and_ now includes the **page Table of Contents**. This means that there is now a lot more room for the actual documentation content.
