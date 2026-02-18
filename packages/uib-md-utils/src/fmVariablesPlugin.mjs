/**
 * Custom variables plugin for markdown-it
 * Processes {{varname [arg1=value1, arg2=value2]}}
 * @param {object} md - markdown-it instance
 * @param {function} handler - Function to handle variables
 * @returns {void}
 */
function fmVariablesPlugin(md, handler) {
    // Regular expression to match variables
    // Matches: {{varname [arg1=value1, arg2=value2]}}
    const VARIABLE_RE = /\{\{(\w+)\s*(?:\[([^\]]*)\])?\}\}/ // eslint-disable-line security/detect-unsafe-regex

    /** Parse arguments from variable string
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

    /** Inline rule to process variables
     * @param {object} state - Current state
     * @param {boolean} silent - Silent mode flag
     * @returns {boolean} Success status
     */
    function fmVariablesRule(state, silent) {
        const start = state.pos
        const max = state.posMax

        // Quick fail if we don't have {{
        if (state.src.charCodeAt(start) !== 0x7B
            || /* { */ state.src.charCodeAt(start + 1) !== 0x7B /* { */) {
            return false
        }

        // Check if we're inside code
        // markdown-it tracks code state, but we need to check manually
        const marker = state.src.slice(start, start + 2)
        if (marker !== '{{') return false

        // Additional safety: check if we're in a code block by examining previous tokens
        // const tokens = state.tokens
        // for (let i = tokens.length - 1; i >= 0; i--) {
        //     const token = tokens[i]
        //     if (token.type === 'code_inline' || token.type === 'fence') {
        //         return false
        //     }
        // }

        // Find the closing %%
        const match = VARIABLE_RE.exec(state.src.slice(start))
        if (!match) return false

        const fmVariable = match[0]
        const fnName = match[1]
        const argsStr = match[2] || ''

        // If in silent mode, just return true to indicate we matched
        if (silent) return true

        // Parse arguments
        const args = parseArgs(argsStr)
        args.varName = fnName // Include the variable name in args for convenience

        // Create token
        const token = state.push('fmVariables', '', 0)
        token.meta = {
            args,
            raw: fmVariable,
        }

        // Advance position
        state.pos += fmVariable.length

        return true
    }

    /** Renderer for variable tokens
     * NB: Errors are wrapped in a dummy component, <fm-var class="variable-error">, so that they can be easily styled.
     * @param {Array} tokens - Token array
     * @param {number} idx - Current token index
     * @param {object} options - Options
     * @param {object} env - Environment
     * @param {object} self - Renderer instance
     * @returns {string} Rendered HTML
     */
    function renderFmVariables(tokens, idx, options, env, self) {
        const token = tokens[idx]
        const { args, raw, } = token.meta

        // Check if handler exists
        if (handler && typeof handler === 'function') {
            try {
                return handler(args, env)
            } catch (err) {
                console.error(`Error executing variable handler '${args.varName}': ${err.message}`, err)
                return `<fm-var class="fm-${args.varName} variable-error" data-fmvar="${args.varName}">Error in variable: ${args.varName}</fm-var><p>${err.message}</p>`
            }
        }

        // No handler found, return as-is or error
        return `<fm-var class="fm-${args.varName} variable-unknown" data-fmvar="${args.varName}">Unknown variable: ${args.varName}</fm-var>`
    }

    // Register the inline rule
    md.inline.ruler.before('escape', 'fmVariables', fmVariablesRule)

    // Register the renderer
    md.renderer.rules.fmVariables = renderFmVariables
}

export { fmVariablesPlugin }
