---
created: 2023-10-21 15:30:26
updated: 2024-09-01 15:40:16
---
# How to manage UIBUILDER documentation using Docksify.

The UIBUILDER documentation is made available as a GitHub web site and locally in Node-RED via its ExpressJS web server.

Docksify works using a single, main `docs/index.html` file.

## Build process

The Docsify configuration, styles and extensions are optimised for offline use when used in Node-RED.

Run `npm run buildDocBundle` from the uibuilder source folder. (Only for uibuilder developers)

## Included Docksify Extensions

The following Docsify extensions are bundled into this package:

* `docsify-copy-code`
* `docsify-darklight-theme`
* `docsify-pagination`
* `docsify-plugin-flexible-alerts`
* `docsify-plugin-toc`
* `docsify-themeable`

## Custom Code

The before and after page rendering hooks are used to:

* Provide a smart footer containing a copyright with auto-dates and the last updated date for the page (depends on the `lastUpdated` field in each pages frontmatter).
* Replace all instances of UIBUILDER text in pages with a colourified version using the UIBUILDER branding.

## Themes and CSS Overrides

### Docksify themes

```html
<link rel="stylesheet" type="text/css" href="./.config/docsify-darklight-theme/dist/docsify-themeable/style.min.css">
<link rel="stylesheet" type="text/css" href="./.config/docsify-themeable/dist/css/theme-simple.css" title="light">
<link rel="stylesheet alternative" type="text/css" href="./.config/docsify-themeable/dist/css/theme-simple-dark.css" title="dark">
<link rel="stylesheet" type="text/css" href="./.config/index.css">
```

### Custom theming

`./.config/index.css` contains a large number of style overrides.

#### Image alignment & sizing

Align images:

```markdown
![image alt >](/image-right.jpg) - aligns an image right
![image alt <](/image-left.jpg) - aligns an image left
![image alt ><](/image-centre.jpg) - aligns an image centre
```

Size overrides for images:

```markdown
![logo](https://docsify.js.org/_media/icon.svg ':size=WIDTHxHEIGHT')
![logo](https://docsify.js.org/_media/icon.svg ':size=50x100')
![logo](https://docsify.js.org/_media/icon.svg ':size=100')
```

You can also add a custom CSS class if needed:

```markdown
![logo](https://docsify.js.org/_media/icon.svg ':class=someCssClass')
```

You can also customise the HTML ID:

```markdown
![logo](https://docsify.js.org/_media/icon.svg ':id=someCssId')
```

## Information/Callout Boxes

The ["Flexible Alerts"](https://github.com/fzankl/docsify-plugin-flexible-alerts/) plugin provides highlighted callout information boxes. Each one is defined using an initial line:

```markdown
> [!NOTE]

> [!TIP]

> [!WARNING]
```

Additional types can be defined in `index.html` and the layout/style can be adjusted. See the plugin documentation for details.

Note that the 3 listed match the callouts allowed in GitHub markdown as well. They are also supported in Obsidian (via ) and natively in Typora.

Docsify native callouts (`!>`, `?>`) are not recommended as they do not match the commonly used GitHub callouts.

## UIBUILDER Major Version Changes

Update the documentation version in `index.html` and in `docs/_coverpage.md`

`index.html` has three places to change: html title, `.app-name-link::after`, and `window.$docsify.name`.

## Moving pages/folders

If you need to move a page or a folder, make use of `index.html`s `window.$docsify.alias` which provides mappings from old to new. It supports `regex` in the key.
