---
title: uibuilder instance template processing
description: |
  The process to create/change the the template of a uibuilder instance.
created: 2025-05-04 19:36:47
updated: 2025-05-04 19:57:13
---

## New uibuilder node

On initial deploy of a new uibuilder node, `nodes/uibuilder/uibuilder.js`>`nodeInstance` runs.

At the section "Does the instance folder exist?", If the instance folder does not exist, it is created and then `fslib.replaceTemplate` is called. If the instance folder does exist, Nothing is done.

fslib = `nodes/lib/fs.cjs`



## Existing node - change template

A template change is triggered in the uibuilder node's Editor config panel. Selecting the template from the drop-down and then pressing the "Load & Overwrite Files" button.

> [!WARNING]
> Note that this completely overwrites any folders/files with the same names as in the template.

This triggers a POST API call to `./uibuilder/admin/${url}` - this is serviced by `nodes/lib/admin-api-v3.js` `.post` handler. 

```
template: template, <= Template name
extTemplate: extTemplate, <= external template URL if needed
cmd: 'replaceTemplate',
reload: reload,
url: url,
```

The API calls `fslib.replaceTemplate(params.url, params.template, params.extTemplate, params.cmd, templateConf, uib, log)`.

The Editor is whether successful or not. If, on the Files tab of the config, the "Reload connected clients on save?" flag is set, the `reload` var is set to `true` and any connected clients are sent a control message to reload their page.



## Creating a new internal template


## Creating a new external template