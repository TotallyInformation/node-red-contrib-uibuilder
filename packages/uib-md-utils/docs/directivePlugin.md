# directivePlugin

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin that processes custom directives embedded in Markdown content. Directives allow authors to call named handler functions directly from Markdown, producing dynamic HTML output at render time.

## Syntax

```
%%functionName [arg1=value1, arg2=value2]%%
```

- `functionName` — the name of the handler to invoke (alphanumeric/underscore).
- Arguments inside `[...]` are optional, comma-separated `key=value` pairs.
- Quotes around values are stripped automatically.

## How it works

The plugin operates at two levels:

1. **Block rule** — When a directive occupies an entire line on its own, it is treated as a block-level token. This prevents the output from being wrapped in `<p>` tags, which is important when the handler returns block-level HTML such as `<ul>`, `<div>`, or `<table>`.
2. **Inline rule** — When a directive appears inside a paragraph alongside other text, it is treated as an inline token and rendered in place.

Both block and inline directive tokens share the same renderer, which looks up the handler by name and calls it with parsed arguments.

## Usage

The plugin is **not** registered in the default markdown-it pipeline. It is loaded separately (typically in `customNode.js`) so that handler functions can access the Node-RED node instance, page index, and page attributes.

```js
import { directivePlugin } from '@totallyinformation/uib-md-utils'

const handlers = {
    toc: (args, env) => {
        // Return an HTML table of contents
        return '<nav class="toc">...</nav>'
    },
    badge: (args, env) => {
        return `<span class="badge">${args.label || 'Info'}</span>`
    },
}

md.use(directivePlugin, handlers)
```

### Parameters

| Parameter  | Type     | Description                                                        |
| ---------- | -------- | ------------------------------------------------------------------ |
| `md`       | `object` | The markdown-it instance.                                          |
| `handlers` | `object` | An object mapping directive names to handler functions.             |

### Handler signature

Each handler function receives:

| Argument | Type     | Description                                              |
| -------- | -------- | -------------------------------------------------------- |
| `args`   | `object` | Parsed key-value pairs from the directive's `[...]` block.|
| `env`    | `object` | The markdown-it environment object passed to `md.render()`.|

The handler must return an HTML string.

## Examples

### Block-level directive (own line)

```markdown
Some introductory text.

%%toc%%

More content below.
```

Because `%%toc%%` is the sole content of its line, the block rule matches and the handler's output is inserted without `<p>` wrapping.

### Inline directive (within text)

```markdown
This item has a %%badge [label=New]%% next to it.
```

Output (assuming the handler above):

```html
<p>This item has a <span class="badge">New</span> next to it.</p>
```

### Directive with multiple arguments

```markdown
%%chart [type=bar, data=sales, year=2025]%%
```

The handler receives `{ type: 'bar', data: 'sales', year: '2025' }`.

## Error handling

- **Handler throws** — The error is caught and rendered as:
  ```html
  <span class="directive-error" data-directive="fnName">Error in directive: fnName</span>
  <p>Error message text</p>
  ```
- **No handler found** — The raw directive text is escaped and rendered as:
  ```html
  <span class="directive-unknown" data-directive="fnName">%%fnName [...]%%</span>
  ```

## Styling

Target directive output using the CSS classes applied during error/unknown states:

```css
.directive-error {
    color: hsl(0, 70%, 50%);
    font-weight: bold;
}

.directive-unknown {
    color: hsl(30, 80%, 50%);
    font-style: italic;
}
```
