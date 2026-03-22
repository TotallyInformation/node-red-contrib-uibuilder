# fmVariablesPlugin

A [markdown-it](https://github.com/markdown-it/markdown-it) inline plugin that processes front-matter variable references embedded in Markdown content. Variables allow authors to inject dynamic values — typically sourced from YAML front-matter — directly into rendered output.

## Syntax

```
{{varName [arg1=value1, arg2=value2]}}
```

- `varName` — the variable name to resolve (alphanumeric/underscore).
- Arguments inside `[...]` are optional, comma-separated `key=value` pairs.
- Quotes around values are stripped automatically.

## How it works

1. The plugin registers an **inline rule** that scans for the `{{...}}` pattern.
2. When a match is found, the variable name and arguments are parsed into a token.
3. During rendering, the single handler function is called with the parsed arguments and the markdown-it environment object.
4. The handler's return value is inserted into the HTML output.

Unlike `directivePlugin` (which uses a map of named handlers), this plugin uses a **single handler function** for all variables. The variable name is included in the `args` object as `args.varName` for the handler to dispatch on.

## Usage

The plugin is **not** registered in the default markdown-it pipeline. It is loaded separately (typically in `customNode.js`) so that the handler function can access the Node-RED node instance and front-matter data.

```js
import { fmVariablesPlugin } from '@totallyinformation/uib-md-utils'

const handler = (args, env) => {
    const { varName, ...rest } = args

    // Look up the variable in front-matter attributes
    if (env.attributes && env.attributes[varName] !== undefined) {
        return String(env.attributes[varName])
    }

    // Return a placeholder for unknown variables
    return `[unknown: ${varName}]`
}

md.use(fmVariablesPlugin, handler)
```

### Parameters

| Parameter | Type       | Description                                      |
| --------- | ---------- | ------------------------------------------------ |
| `md`      | `object`   | The markdown-it instance.                        |
| `handler` | `function` | A single function that handles all variable lookups.|

### Handler signature

| Argument | Type     | Description                                                                |
| -------- | -------- | -------------------------------------------------------------------------- |
| `args`   | `object` | Parsed key-value pairs plus `varName` (the variable name).                 |
| `env`    | `object` | The markdown-it environment object passed to `md.render()`.                |

The handler must return an HTML string.

## Examples

### Simple variable substitution

Given front-matter:

```yaml
---
title: My Page
author: Jane Doe
---
```

And Markdown body:

```markdown
# {{title}}

Written by {{author}}.
```

Output:

```html
<h1>My Page</h1>
<p>Written by Jane Doe.</p>
```

### Variable with arguments

```markdown
Last updated: {{date [format=short]}}
```

The handler receives `{ varName: 'date', format: 'short' }`.

### Multiple variables in one line

```markdown
Copyright {{year}} {{author}}. All rights reserved.
```

Each `{{...}}` is matched and rendered independently.

## Error handling

- **Handler throws** — The error is caught and rendered as a custom element:
  ```html
  <fm-var class="fm-varName variable-error" data-fmvar="varName">Error in variable: varName</fm-var>
  <p>Error message text</p>
  ```
- **No handler provided** — The variable is rendered as:
  ```html
  <fm-var class="fm-varName variable-unknown" data-fmvar="varName">Unknown variable: varName</fm-var>
  ```

The `<fm-var>` custom element is used intentionally so that errors and unknowns are easy to identify and style without conflicting with standard HTML elements.

## Styling

```css
.variable-error {
    color: hsl(0, 70%, 50%);
    font-weight: bold;
    border: 0.1em dashed hsl(0, 70%, 50%);
    padding: 0.1em 0.3em;
}

.variable-unknown {
    color: hsl(30, 80%, 50%);
    font-style: italic;
    border: 0.1em dashed hsl(30, 80%, 50%);
    padding: 0.1em 0.3em;
}
```
