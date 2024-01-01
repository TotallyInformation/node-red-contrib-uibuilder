---
created: 2022-01-01T20:16:44
updated: 2023-12-30 20:27:53
author: Julian Knight (Totally Information)
title: Roadmap Archive
---

**Update 2022-01-19**: These are the old entries from the WIKI To Do page. They need tidying up and consolidating into the newer structure.
**Update 2022-06-18**: Now mostly tidied and consolidated. Just a few left that I want to keep for reference.

## Ideas

* Node(s) for specific web components. Possibly allowing the component to be pushed over ws. [Ref.1](https://markus.oberlehner.net/blog/distributed-vue-applications-pushing-content-and-component-updates-to-the-client/) - _[Keep for reference]_
* Extend middleware hook feature to allow for different middleware for each node instance
  instead of one for all instances.
* Add safety validation checks to `msg` before allowing it to be sent/received to/from front-end

  Started: script/style is removed if disallowed in settings, uibuilder control msgs dropped (since v1.0.0)
* _We might need to add some checks for updated master templates? Maybe issue a warning? Not sure._
