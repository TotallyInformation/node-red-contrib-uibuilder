/**
 * Custom directive plugin for markdown-it
 * Processes %%fnName [arg1=value1, arg2=value2]%% directives
 * @param {object} md - markdown-it instance
 * @param {object} handlers - Object containing handler functions keyed by directive name
 * @returns {void}
 */
function directivePlugin(md, handlers = {}) {
    // Regular expression to match directives
    // Matches: %%functionName [arg1=value1, arg2=value2]%%
    const DIRECTIVE_RE = /%%(\w+)\s*(?:\[([^\]]*)\])?%%/ // eslint-disable-line security/detect-unsafe-regex

    /**
     * Parse arguments from directive string
     * @param {string} argsStr - Arguments string like "arg1=value1, arg2=value2"
     * @returns {object} Parsed arguments as key-value pairs
     */
    function parseArgs(argsStr) {
        if (!argsStr || !argsStr.trim()) return {}

        const args = {}
        const pairs = argsStr.split(',')

        pairs.forEach((pair) => {
            const [key, ...valueParts] = pair.split('=')
            if (key) {
                const trimmedKey = key.trim()
                const value = valueParts.join('=').trim()
                // Remove quotes if present
                args[trimmedKey] = value.replace(/^["']|["']$/g, '')
            }
        })

        return args
    }

    /**
     * Inline rule to process directives
     * @param {object} state - Current state
     * @param {boolean} silent - Silent mode flag
     * @returns {boolean} Success status
     */
    function directiveRule(state, silent) {
        const start = state.pos
        const max = state.posMax

        // Quick fail if we don't have %%
        if (state.src.charCodeAt(start) !== 0x25
            || /* % */ state.src.charCodeAt(start + 1) !== 0x25 /* % */) {
            return false
        }

        // Check if we're inside code
        // markdown-it tracks code state, but we need to check manually
        const marker = state.src.slice(start, start + 2)
        if (marker !== '%%') return false

        // Additional safety: check if we're in a code block by examining previous tokens
        // const tokens = state.tokens
        // for (let i = tokens.length - 1; i >= 0; i--) {
        //     const token = tokens[i]
        //     if (token.type === 'code_inline' || token.type === 'fence') {
        //         return false
        //     }
        // }

        // Find the closing %%
        const match = DIRECTIVE_RE.exec(state.src.slice(start))
        if (!match) return false

        const directive = match[0]
        const fnName = match[1]
        const argsStr = match[2] || ''

        // If in silent mode, just return true to indicate we matched
        if (silent) return true

        // Parse arguments
        const args = parseArgs(argsStr)

        // Create token
        const token = state.push('directive', '', 0)
        token.meta = {
            fnName,
            args,
            raw: directive,
        }

        // Advance position
        state.pos += directive.length

        return true
    }

    /**
     * Renderer for directive tokens
     * @param {Array} tokens - Token array
     * @param {number} idx - Current token index
     * @param {object} options - Options
     * @param {object} env - Environment
     * @param {object} self - Renderer instance
     * @returns {string} Rendered HTML
     */
    function renderDirective(tokens, idx, options, env, self) {
        const token = tokens[idx]
        const { fnName, args, raw, } = token.meta

        // Check if handler exists
        if (handlers[fnName] && typeof handlers[fnName] === 'function') {
            try {
                return handlers[fnName](args, env)
            } catch (err) {
                console.error(`Error executing directive handler '${fnName}': ${err.message}`, err)
                return `<span class="directive-error" data-directive="${fnName}">Error in directive: ${fnName}</span><p>${err.message}</p>`
            }
        }

        // No handler found, return as-is or error
        return `<span class="directive-unknown" data-directive="${fnName}">${md.utils.escapeHtml(raw)}</span>`
    }

    /** Block rule to process directives that are the sole content of a paragraph.
     * This prevents block-level output (e.g. <ul>) from being wrapped in <p> tags.
     * @param {object} state - Block state
     * @param {number} startLine - Start line index
     * @param {number} endLine - End line index
     * @param {boolean} silent - Silent mode flag
     * @returns {boolean} Success status
     */
    function directiveBlockRule(state, startLine, endLine, silent) {
        const pos = state.bMarks[startLine] + state.tShift[startLine]
        const max = state.eMarks[startLine]
        const line = state.src.slice(pos, max).trim()

        // Must match the entire line as a single directive
        const match = line.match(/^%%(\w+)\s*(?:\[([^\]]*)\])?\s*%%$/) // eslint-disable-line security/detect-unsafe-regex
        if (!match) return false

        if (silent) return true

        const fnName = match[1]
        const argsStr = match[2] || ''

        state.line = startLine + 1

        const token = state.push('directive_block', '', 0)
        token.meta = {
            fnName,
            args: parseArgs(argsStr),
            raw: match[0],
        }
        token.map = [startLine, state.line]

        return true
    }

    // Register block rule (higher priority) - handles directives on their own line
    md.block.ruler.before('paragraph', 'directive_block', directiveBlockRule)

    // Register the inline rule - handles directives embedded in text
    md.inline.ruler.before('escape', 'directive', directiveRule)

    // Both block and inline directive tokens use the same renderer
    md.renderer.rules.directive_block = renderDirective
    md.renderer.rules.directive = renderDirective
}

export { directivePlugin }
