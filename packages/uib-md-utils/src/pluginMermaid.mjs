/** markdown-it plugin that renders mermaid fenced code blocks as
 * `<pre class="mermaid">...raw diagram code...</pre>` elements.
 *
 * Client-side rendering is delegated to the mermaid browser library loaded by
 * markweb.mjs (the bundled front-end/utils/mermaid.esm.min.js).  No server-side
 * processing, no async machinery, and no external dependencies are required.
 *
 * Non-mermaid fence blocks are passed through to the default fence renderer.
 * @module pluginMermaid
 */

/** markdown-it plugin that emits mermaid fence blocks as `<pre class="mermaid">` elements.
 * @param {import('markdown-it')} md - markdown-it instance
 * @returns {import('markdown-it')} The modified markdown-it instance
 */
function markdownItMermaid(md) {
    const defaultFenceRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
    }

    md.renderer.rules.fence = function(tokens, idx, options, env, self) {
        const token = tokens[idx]
        const langName = token.info.trim().split(/\s+/g)[0]

        if (langName === 'mermaid') {
            // Emit raw diagram code inside a <pre class="mermaid"> element.
            // mermaid.js (loaded by markweb.mjs) scans for these elements and renders them client-side.
            return `<pre class="mermaid">${md.utils.escapeHtml(token.content.trim())}</pre>\n`
        }

        return defaultFenceRenderer(tokens, idx, options, env, self)
    }

    return md
}

export { markdownItMermaid }
