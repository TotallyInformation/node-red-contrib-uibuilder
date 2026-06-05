---
sortPriority: low
---

Just a test folder.

These folders contain a mix of things that should be included or excluded from the navigation and other index trees. It can otherwise be ignored as it is used to test the exclusion rules for the navigation and other index trees.

This folder/file has been marked as _low_ sort priority by setting `sortPriority: low` in the front matter. This means that it will appear after any pages/folders that do not have a sort priority set or have it set to "high".

The following files/folders are excluded in the navigation and other index trees even though they exist:
* `_images/` - because it is a hidden folder (starts with an underscore). Useful for resources that need to be referenced from your Markdown files but that you don't want to appear in the navigation.
* `_should-be-excluded/` - because it is a hidden folder (starts with an underscore). Also excludes the folder's contents.
* `exclusions-tests/.should-be-excluded.md` - starts with a dot, so is hidden.
* `exclusions-tests/level2/_should-be-excluded.md` - starts with an `_`, so is hidden.
* `exclusions-tests/level2/.should-be-excluded.md` - starts with a dot, so is hidden.
* `exclusions-tests/no-index/` - does not contain an `index.md` file, so is hidden.
* `exclusions-tests/no-index/no-index-file.md` - is in a hidden folder, so is hidden.

As of uibuilder v7.7.2, there should be 22 files in the internal index for the demo site (check the Node-RED log) even though there are more files than that. 20 of those files are accessible via the navigation menus or index listings.
