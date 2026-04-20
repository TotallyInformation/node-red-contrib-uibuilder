import mermaid from 'mermaid'

/** markdown-it plugin for server-side Mermaid diagram rendering
 * @param {object} md - markdown-it instance
 * @param {object} options - plugin options
 * @returns {object} markdown-it instance with plugin
 */
function markdownItMermaidServer(md, options = {}) {
    const defaultOptions = {
        theme: 'default',
        securityLevel: 'strict',
        className: 'mermaid-diagram',
        backgroundColor: 'transparent',
        width: 800,
        height: 600,
    }

    const opts = { ...defaultOptions, ...options, }

    // Initialize Mermaid for server-side rendering
    mermaid.initialize({
        startOnLoad: false,
        theme: opts.theme,
        securityLevel: opts.securityLevel,
        fontFamily: 'arial, sans-serif',
    })

    // Store the original fence renderer
    const defaultFenceRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
    }

    // Override the fence renderer
    md.renderer.rules.fence = function(tokens, idx, mdOptions, env, self) {
        const token = tokens[idx]
        const info = token.info.trim()
        const langName = info.split(/\s+/g)[0]

        // Check if this is a mermaid code block
        if (langName === 'mermaid') {
            const code = token.content.trim()
            const id = `mermaid-${Math.random().toString(36)
                .substr(2, 9)}`

            // Store the render promise in the token
            // This will be resolved later
            if (!env.mermaidPromises) {
                env.mermaidPromises = []
            }

            // Create a placeholder that we'll replace
            const placeholder = `__MERMAID_PLACEHOLDER_${env.mermaidPromises.length}__`

            // Queue the rendering
            env.mermaidPromises.push(
                mermaid.render(id, code)
                    .then(result => ({
                        placeholder,
                        html: /* html */`
                            <div class="${opts.className}" data-diagram-id="${id}">
                                ${result.svg}
                            </div>
                        `,
                    }))
                    .catch(error => ({
                        placeholder,
                        html: /* html */`
                            <div class="${opts.className} mermaid-error" data-diagram-id="${id}">
                                <pre style="color: red; background: #fee; padding: 10px; border-radius: 4px;">
                                    Error rendering Mermaid diagram:
                                    ${md.utils.escapeHtml(error.message)}

                                    Diagram code:
                                    ${md.utils.escapeHtml(code)}
                                </pre>
                            </div>
                        `,
                    }))
            )

            return placeholder
        }

        // Use default renderer for other code blocks
        return defaultFenceRenderer(tokens, idx, mdOptions, env, self)
    }

    return md
}

/** Render markdown with server-side Mermaid diagrams
 * @param {object} md - markdown-it instance with plugin
 * @param {string} markdown - Markdown content
 * @returns {Promise<string>} Rendered HTML
 */
async function renderMarkdownAsync(md, markdown) {
    const env = {}

    // First pass: render markdown and collect mermaid promises
    let html = md.render(markdown, env)

    // Wait for all mermaid diagrams to render
    if (env.mermaidPromises && env.mermaidPromises.length > 0) {
        const results = await Promise.all(env.mermaidPromises)

        // Replace placeholders with actual rendered SVGs
        results.forEach((result) => {
            html = html.replace(result.placeholder, result.html)
        })
    }

    return html
}

// Export both the plugin and the async render function
export { markdownItMermaidServer, renderMarkdownAsync }
