/** markdown-it plugin to wrap headings and their associated content in
 * collapsible `<details>`/`<summary>` elements. This allows users to
 * collapse/expand page sections by heading level.
 *
 * When a heading is encountered, a `<details>` element is opened with the
 * heading inside a `<summary>`. All subsequent content until the next heading
 * of equal or higher level (or end of document) is placed inside the details body.
 * Nested headings produce nested `<details>` elements.
 *
 * @example
 * // Basic usage
 * md.use(detailsSummaryPlugin)
 *
 * @example
 * // Only wrap h2 and h3, collapsed by default
 * md.use(detailsSummaryPlugin, { levels: [2, 3], open: false })
 */

/** Wraps headings and their content in collapsible details/summary tags.
 * @param {object} md - The markdown-it instance
 * @param {object} [options] - Plugin configuration options
 * @param {number[]} [options.levels] - Which heading levels to wrap (1-6). Default: [1,2,3,4,5,6]
 * @param {boolean} [options.open] - Whether details elements are open (expanded) by default. Default: true
 * @param {string} [options.className] - CSS class added to each details element. Default: 'collapsible-section'
 */
const detailsSummaryPlugin = (md, options = {}) => {
    const defaults = {
        levels: [1, 2, 3, 4, 5, 6],
        open: true,
        className: 'collapsible-section',
    }
    const opts = { ...defaults, ...options, }

    md.core.ruler.after('inline', 'details-summary', (state) => {
        const tokens = state.tokens
        const newTokens = []
        /** @type {number[]} Stack tracking open heading levels for proper nesting */
        const stack = []

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]

            if (token.type === 'heading_open') {
                const level = parseInt(token.tag.slice(1), 10)

                if (opts.levels.includes(level)) {
                    // Close all open details with level >= current heading level
                    while (stack.length > 0 && stack[stack.length - 1] >= level) {
                        stack.pop()
                        const closeToken = new state.Token('html_block', '', 0)
                        closeToken.content = '</details>\n'
                        newTokens.push(closeToken)
                    }

                    // Open <details> and <summary>
                    const openToken = new state.Token('html_block', '', 0)
                    const openAttr = opts.open ? ' open' : ''
                    const classAttr = opts.className ? ` class="${opts.className}"` : ''
                    openToken.content = `<details${openAttr}${classAttr} data-level="${level}">\n<summary title="H${level}">\n`
                    newTokens.push(openToken)

                    stack.push(level)

                    // Push heading_open token
                    newTokens.push(token)

                    // Push all tokens between heading_open and heading_close
                    i++
                    while (i < tokens.length && tokens[i].type !== 'heading_close') {
                        newTokens.push(tokens[i])
                        i++
                    }

                    // Push heading_close token
                    if (i < tokens.length) {
                        newTokens.push(tokens[i])
                    }

                    // Close </summary>
                    const summaryClose = new state.Token('html_block', '', 0)
                    summaryClose.content = '</summary>\n'
                    newTokens.push(summaryClose)

                    continue
                }
            }

            newTokens.push(token)
        }

        // Close any remaining open details at end of document
        while (stack.length > 0) {
            stack.pop()
            const closeToken = new state.Token('html_block', '', 0)
            closeToken.content = '</details>\n'
            newTokens.push(closeToken)
        }

        state.tokens = newTokens
    })
}

export { detailsSummaryPlugin }
