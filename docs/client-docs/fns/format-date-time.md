---
created: 2026-01-02 13:07:31
updated: 2026-01-02 13:24:47
---
Takes a JavaScript Date object (or a date string that can be converted to a Date object) and formats it using the JavaScript standard [`INTL` library](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString).

Only a limited set of format patterns are currently supported. If no pattern is provided, the date is formatted using the given/default locale format.

If no locale is provided, the browser's default locale is used.

Available format patterns:
* `iso` - ISO format without seconds: `YYYY-MM-DD HH:mm`
* `ISO` - ISO format with seconds: `YYYY-MM-DD HH:mm:ss`
* `YYYY` - 4-digit year
* `MMMM` - Full month name (e.g. January)
* `MMM` - Short month name (e.g. Jan)
* `MM` - 2-digit month (01-12)
* `DD` - 2-digit day of month (01-31)
* `HH` - 2-digit hour in 24-hour format (00-23)
* `dddd` - Full weekday name (e.g. Monday)
* `ddd` - Short weekday name (e.g. Mon)
* `mm` - 2-digit minutes (00-59)
* `ss` - 2-digit seconds (00-59)
