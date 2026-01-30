/** Reworked replica of markdown-it-task-lists
 * https://github.com/revin/markdown-it-task-lists
 * https://github.com/Anson2251/markdown-it-task-lists
 * Brought more up-to-date and with added uibuilder features.
 */

let disableCheckboxes = true
let useLabelWrapper = false

/** Sets an attribute on a token, pushing it if new or replacing if it exists.
 * @param {object} token - The markdown-it token to modify
 * @param {string} name - The attribute name to set
 * @param {string} value - The attribute value to set
 */
function attrSet(token, name, value) {
    const index = token.attrIndex(name)
    const attr = [name, value]

    if (index < 0) {
        token.attrPush(attr)
    } else {
        token.attrs[index] = attr
    }
}

/** Finds the parent token index by walking backwards through tokens.
 * @param {Array<object>} tokens - Array of markdown-it tokens
 * @param {number} index - The current token index to find parent for
 * @returns {number} The index of the parent token, or -1 if not found
 */
function parentToken(tokens, index) {
    const targetLevel = tokens[index].level - 1
    for (let i = index - 1; i >= 0; i--) {
        if (tokens[i].level === targetLevel) {
            return i
        }
    }
    return -1
}

/** Checks if the token at the given index represents a todo/task list item.
 * @param {Array<object>} tokens - Array of markdown-it tokens
 * @param {number} index - The token index to check
 * @returns {boolean} True if the token is a todo item
 */
function isTodoItem(tokens, index) {
    return isInline(tokens[index])
        && isParagraph(tokens[index - 1])
        && isListItem(tokens[index - 2])
        && startsWithTodoMarkdown(tokens[index])
}

/** Converts a token into a todo/task item by adding checkbox and optional label elements.
 * @param {object} token - The markdown-it token to convert
 * @param {Function} TokenConstructor - The Token constructor from markdown-it state
 */
function todoify(token, TokenConstructor) {
    // Get the text content without the checkbox markdown (e.g., "[ ] " or "[x] ")
    const textContent = token.content.slice(4)

    if (useLabelWrapper) {
        // Create a label that wraps the checkbox and contains the text
        const labelToken = new TokenConstructor('html_inline', '', 0)
        const checkbox = makeCheckbox(token, TokenConstructor)
        labelToken.content = `<label class="task-list-item-label">${checkbox.content}${textContent}</label>`

        // Replace all children with just the label token
        token.children = [labelToken]
        token.content = textContent
    } else {
        // Original behaviour: checkbox followed by text content
        token.children.unshift(makeCheckbox(token, TokenConstructor))
        token.children[1].content = token.children[1].content.slice(4)
        token.content = textContent

        if (token.children[1].position) {
            token.children[1].position += 4
        }

        if (token.children[1].size) {
            token.children[1].size -= 4
        }
    }
}

/** Creates a checkbox input token based on the task item state.
 * @param {object} token - The markdown-it token containing task item content
 * @param {Function} TokenConstructor - The Token constructor from markdown-it state
 * @returns {object} A new html_inline token containing the checkbox input
 */
function makeCheckbox(token, TokenConstructor) {
    const checkbox = new TokenConstructor('html_inline', '', 0)
    const disabledAttr = disableCheckboxes ? ' disabled="" ' : ''
    let checkedAttr = ''
    if (token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0) {
        checkedAttr = ' checked="" '
    }
    let uibActionAttr = ''
    // if (!disableCheckboxes) uibActionAttr = ' onclick="uibuilder.eventSend(event)" '
    checkbox.content = `<input class="task-list-item-checkbox"${checkedAttr}${disabledAttr}${uibActionAttr}type="checkbox">`
    return checkbox
}

/** Checks if a token is an inline token.
 * @param {object} token - The markdown-it token to check
 * @returns {boolean} True if the token type is 'inline'
 */
function isInline(token) {
    return token.type === 'inline'
}
/** Checks if a token is a paragraph open token.
 * @param {object} token - The markdown-it token to check
 * @returns {boolean} True if the token type is 'paragraph_open'
 */
function isParagraph(token) {
    return token.type === 'paragraph_open'
}
/** Checks if a token is a list item open token.
 * @param {object} token - The markdown-it token to check
 * @returns {boolean} True if the token type is 'list_item_open'
 */
function isListItem(token) {
    return token.type === 'list_item_open'
}

/** Checks if a token's content starts with todo markdown syntax ([ ], [x], or [X]).
 * @param {object} token - The markdown-it token to check
 * @returns {boolean} True if the token content starts with todo markdown
 */
function startsWithTodoMarkdown(token) {
    // leading whitespace in a list item is already trimmed off by markdown-it
    return token.content.indexOf('[ ] ') === 0 || token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0
}

/** markdown-it plugin to render GitHub-style task lists.
 * @param {object} md - The markdown-it instance
 * @param {object} [options] - Plugin configuration options
 * @param {boolean} [options.label] - Whether to wrap checkbox and text in a label element
 * @param {boolean|Function} [options.enabled] - Whether checkboxes are enabled (editable)
 */
function taskLists(md, options) {
    if (options) {
        useLabelWrapper = !!options.label
    }

    md.core.ruler.after('inline', 'github-task-lists', function(state) {
        if (options) {
            disableCheckboxes = (typeof options.enabled === 'function') ? !options.enabled() : !options.enabled
        }
        const tokens = state.tokens
        for (let i = 2; i < tokens.length; i++) {
            if (isTodoItem(tokens, i)) {
                todoify(tokens[i], state.Token)
                attrSet(tokens[i - 2], 'class', 'task-list-item' + (!disableCheckboxes ? ' enabled' : ''))
                attrSet(tokens[parentToken(tokens, i - 2)], 'class', 'contains-task-list')
            }
        }
    })
}

export { taskLists }
