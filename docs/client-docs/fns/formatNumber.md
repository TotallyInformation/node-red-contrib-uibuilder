---
created: 2026-03-17 12:47:40
updated: 2026-03-17 13:08:51
---
### `formatNumber(value, decimalPlaces, intl, opts)` - Format an input number to a given locale and decimal places :id=formatNumber

Takes numeric input and formats it using the JavaScript standard [`INTL` library](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString).

Allows optional setting of the number of decimal places.

The `intl` argument takes the form like `en-GB`, `de-DE` (German), `ja-JP` (Japanese), etc. If not provided, the function takes *the browser's current locale* using `navigator.language` so that the number defaults to being formatted in the browser's current locale.

The `opts` argument allows passing INTL number formatting options, for example: `{ style: 'currency', currency: 'JPY' }` to get currency formatted as Japanese Yen.

> [!NOTE]
> This function is compatible with the [`uib-var` web component's `filter` attribute](client-docs/custom-components#filter).
> e.g.
> ```html
> <uib-var topic="mytopic/#1" filter="uibuilder.formatNumber(2, 'de-DE')">
>    [...]
> </uib-var>
> ```
