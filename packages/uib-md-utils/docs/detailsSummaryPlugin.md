# detailsSummaryPlugin

A [markdown-it](https://github.com/markdown-it/markdown-it) core-rule plugin that wraps headings and their associated content in collapsible `<details>`/`<summary>` HTML elements. This allows users to collapse and expand page sections by heading level.

## How it works

When the plugin encounters a heading token during rendering, it:

1. Closes any currently open `<details>` elements at the same or deeper heading level.
2. Opens a new `<details>` element with the heading wrapped inside a `<summary>`.
3. All subsequent content — paragraphs, lists, code blocks, etc. — is placed inside the `<details>` body until the next heading of equal or higher level (or the end of the document).
4. Nested headings produce nested `<details>` elements, preserving the document hierarchy.

## Usage

The plugin is registered in the markdown-it pipeline automatically via `uib-md-utils`. It can also be loaded manually:

```js
import { detailsSummaryPlugin } from '@totallyinformation/uib-md-utils'

// Basic usage — all headings, expanded by default
md.use(detailsSummaryPlugin)

// Only wrap h2 and h3, collapsed by default
md.use(detailsSummaryPlugin, { levels: [2, 3], open: false })

// Custom CSS class
md.use(detailsSummaryPlugin, { className: 'my-collapsible' })
```

## Options

All options are optional. Pass them as the second argument to `md.use()`.

| Option      | Type       | Default                 | Description                                          |
| ----------- | ---------- | ----------------------- | ---------------------------------------------------- |
| `levels`    | `number[]` | `[1, 2, 3, 4, 5, 6]`   | Which heading levels (1–6) to wrap.                  |
| `open`      | `boolean`  | `true`                  | Whether `<details>` elements are expanded by default.|
| `className` | `string`   | `'collapsible-section'` | CSS class added to each `<details>` element.         |

## Output

Given the following Markdown:

```markdown
# Introduction

Some introductory text.

## Getting started

Steps to get started.

### Prerequisites

List of prerequisites.

## Advanced usage

More details here.
```

The plugin produces (simplified):

```html
<details open class="collapsible-section" data-level="1">
  <summary>
    <h1>Introduction</h1>
  </summary>
  <p>Some introductory text.</p>

  <details open class="collapsible-section" data-level="2">
    <summary>
      <h2>Getting started</h2>
    </summary>
    <p>Steps to get started.</p>

    <details open class="collapsible-section" data-level="3">
      <summary>
        <h3>Prerequisites</h3>
      </summary>
      <p>List of prerequisites.</p>
    </details>
  </details>

  <details open class="collapsible-section" data-level="2">
    <summary>
      <h2>Advanced usage</h2>
    </summary>
    <p>More details here.</p>
  </details>
</details>
```

Key points:

- Each `<details>` carries a `data-level` attribute matching its heading level, useful for CSS targeting.
- When a heading of the same or higher level appears, all deeper sections are closed first.
- Remaining open sections are closed automatically at the end of the document.

## Styling

The `collapsible-section` class (or your custom class) can be styled with CSS. For example:

```css
.collapsible-section {
    border-left: 0.2em solid hsl(210, 50%, 80%);
    padding-left: 1em;
    margin-bottom: 1em;
}

.collapsible-section summary {
    cursor: pointer;
    list-style: none;
}

.collapsible-section summary::-webkit-details-marker {
    display: none;
}

.collapsible-section summary::before {
    content: '▶ ';
    display: inline-block;
    transition: transform 0.2s;
}

.collapsible-section[open] > summary::before {
    transform: rotate(90deg);
}
```

You can also target specific heading levels using the `data-level` attribute:

```css
.collapsible-section[data-level="1"] {
    border-left-color: hsl(210, 60%, 50%);
}

.collapsible-section[data-level="2"] {
    border-left-color: hsl(210, 50%, 65%);
}
```

## Accessibility

The native `<details>`/`<summary>` elements provide built-in keyboard and screen reader support:

- **Keyboard**: Users can toggle sections with <kbd>Enter</kbd> or <kbd>Space</kbd> when the `<summary>` is focused.
- **Screen readers**: The collapsed/expanded state is announced automatically.
- No additional ARIA attributes are required.
