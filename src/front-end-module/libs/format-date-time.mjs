const FORMATTER_CACHE = new Map()

/** Gets a cached Intl.DateTimeFormat instance.
 * @param {Intl.LocalesArgument} locale Locale code. (e.g. 'en-US')
 * @param {Intl.DateTimeFormatOptions} options Intl options
 * @returns {Intl.DateTimeFormat} A cached Intl.DateTimeFormat instance
 */
function getFormatter(locale, options) {
    const key = `${locale}|${JSON.stringify(options)}`

    if (!FORMATTER_CACHE.has(key)) {
        FORMATTER_CACHE.set(
            key,
            new Intl.DateTimeFormat(locale, options)
        )
    }

    return FORMATTER_CACHE.get(key)
}

/** Gets the parts of a date for a specific locale.
 * @param {Date} date Input JS Date
 * @param {string} [locale] Locale code. (e.g. 'en-US'). Defaults to browser locale.
 * @returns {Object<string, string>} Object with date parts
 */
function getParts(date, locale = navigator.language) {
    const formatter = getFormatter(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        hour12: false,
    })

    return Object.fromEntries(
        formatter.formatToParts(date).map((/** @type {{ type: any; value: any; }} */ p) => [p.type, p.value])
    )
}

/** Gets locale specific names for months and weekdays.
 * @param {Date} date Input JS Date
 * @param {string} [locale] Locale code. (e.g. 'en-US'). Defaults to browser locale.
 * @returns {{ MMMM: string, MMM: string, dddd: string, ddd: string }} Object with month and day names
 */
function getNames(date, locale = navigator.language) {
    return {
        MMMM: getFormatter(locale, { month: 'long', }).format(date),
        MMM: getFormatter(locale, { month: 'short', }).format(date),
        dddd: getFormatter(locale, { weekday: 'long', }).format(date),
        ddd: getFormatter(locale, { weekday: 'short', }).format(date),
    }
}

/** Format a Date using Intl with optional pattern support.
 * @param {Date|string|number} date Input JS Date, date string, or timestamp
 * @param {string} [pattern] Optional pattern string
 * @param {string} [locale] Locale code. Defaults to browser locale.
 * @returns {string} Formatted date string
 */
export function formatDate(date, pattern, locale = navigator.language) {
    // Attempt to convert to Date if not already
    if (!(date instanceof Date)) {
        date = new Date(date)
    }

    // @ts-ignore
    if (isNaN(date)) {
        throw new TypeError('Invalid Date')
    }

    // Default Intl output if no pattern provided
    if (pattern == null || pattern === '') {
        return new Intl.DateTimeFormat(locale).format(date)
    }

    // Handle ISO shorthand patterns
    if (pattern === 'iso') {
        pattern = 'YYYY-MM-DD HH:mm'
    } else if (pattern === 'ISO') {
        pattern = 'YYYY-MM-DD HH:mm:ss'
    }

    const parts = getParts(date, locale)
    const names = getNames(date, locale)

    const tokens = {
        YYYY: parts.year,
        MM: parts.month,
        DD: parts.day,
        HH: parts.hour,
        mm: parts.minute,
        ss: parts.second,
        ...names,
    }

    return pattern.replace(
        /YYYY|MMMM|MMM|MM|DD|dddd|ddd|HH|mm|ss/g,
        // @ts-ignore
        token => tokens[token]
    )
}

export default formatDate
