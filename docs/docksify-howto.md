# How to manage UIBUILDER documentation using Docksify.

The UIBUILDER documentation is made available as a GitHub web site and locally in Node-RED via its ExpressJS web server.

Docksify works using a single, main `docs/index.html` file.

## Included Docksify Extensions

All Docksify extensions are loaded externally from the `jsdelivr` CDN website. So Internet access is required for everything to work correctly.

```html
<script src="https://cdn.jsdelivr.net/npm/docsify-edit-on-github/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify/lib/plugins/search.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify-darklight-theme/dist/docsify-themeable/main.min.js" type="text/javascript"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify-darklight-theme/dist/docsify-themeable/index.min.js" type="text/javascript"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs/components/prism-json.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs/components/prism-nginx.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify/lib/plugins/front-matter.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify-mustache/dist/docsify-mustache.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify-pagination/dist/docsify-pagination.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify-plugin-flexible-alerts/dist/docsify-plugin-flexible-alerts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify-copy-code/dist/docsify-copy-code.min.js"></script>
```

## Custom Code

The before and after page rendering hooks are used to:

* Provide a smart footer containing a copyright with auto-dates and the last updated date for the page (depends on the `lastUpdated` field in each pages frontmatter).
* Replace all instances of UIBUILDER text in pages with a colourified version using the UIBUILDER branding.

## Themes and CSS Overrides

### Docksify themes

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/docsify-darklight-theme/dist/docsify-themeable/style.min.css" type="text/css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/docsify-themeable/dist/css/theme-simple.css" title="light">
<link rel="stylesheet alternative" href="https://cdn.jsdelivr.net/npm/docsify-themeable/dist/css/theme-simple-dark.css" title="dark">
```

### Custom theming

The `<style>` section in the `index.html` head contains a number of style overrides.

#### Image alignment

```markdown
![image alt >](/image-right.jpg) - aligns an image right
![image alt <](/image-left.jpg) - aligns an image left
![image alt ><](/image-centre.jpg) - aligns an image centre
```

## Information/Callout Boxes

The ["Flexible Alerts"](https://github.com/fzankl/docsify-plugin-flexible-alerts/) plugin provides highlighted callout information boxes. Each one is defined using an initial line:

```markdown
> [!NOTE]

> [!TIP]

> [!WARNING]

> [!ATTENTION]
```

Additional types can be defined in `index.html` and the layout/style can be adjusted. See the plugin documentation for details.

The following Docsify native callouts can also be used but are not recommended as they do not render well in all circumstances:

```
!> Callout with red exclamation mark

?> Callout with blue information mark
```

## UIBUILDER Major Version Changes

Update the documentation version in `index.html` and in `docs/_coverpage.md`

`index.html` has three places to change: html title, `.app-name-link::after`, and `window.$docsify.name`.

## Moving pages/folders

If you need to move a page or a folder, make use of `index.html`s `window.$docsify.alias` which provides mappings from old to new. It supports `regex` in the key.
