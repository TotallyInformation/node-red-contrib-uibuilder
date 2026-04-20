# taskLists

A [markdown-it](https://github.com/markdown-it/markdown-it) core-rule plugin that renders GitHub-style task lists (checkboxes) from standard Markdown list syntax. This is a reworked version of [markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists), brought up to date with added uibuilder features.

## Syntax

```markdown
- [ ] Unchecked item
- [x] Checked item
- [X] Also checked (uppercase X)
```

Both lowercase `x` and uppercase `X` are recognised as checked.

## How it works

The plugin registers a **core rule** that runs after inline parsing. It walks the entire token stream looking for the pattern:

1. `list_item_open` token
2. followed by `paragraph_open`
3. followed by an `inline` token whose content starts with `[ ] `, `[x] `, or `[X] `

When this pattern is detected, the plugin:

- Strips the checkbox markdown (`[ ] ` or `[x] `) from the text content.
- Injects an `<input type="checkbox">` HTML token.
- Optionally wraps the checkbox and text in a `<label>` element.
- Adds CSS classes to the list item (`task-list-item`) and the parent list (`contains-task-list`).

## Usage

The plugin is registered in the default markdown-it pipeline in `uib-md-utils`:

```js
md.use(taskLists, { enabled: false, label: true })
```

It can also be loaded manually:

```js
import { taskLists } from '@totallyinformation/uib-md-utils'

md.use(taskLists, {
    enabled: true,
    label: true,
})
```

## Options

All options are optional. Pass them as the second argument to `md.use()`.

| Option    | Type                 | Default | Description                                                  |
| --------- | -------------------- | ------- | ------------------------------------------------------------ |
| `enabled` | `boolean\|function`  | `false` | Whether checkboxes are interactive (editable). If a function, it is called at render time and its return value is used. |
| `label`   | `boolean`            | `false` | Whether to wrap the checkbox and text in a `<label>` element for better click targeting. |

## Output

Given the Markdown:

```markdown
- [x] Buy groceries
- [ ] Clean the house
- [ ] Write documentation
```

### With `label: false` (default)

```html
<ul class="contains-task-list">
  <li class="task-list-item">
    <input class="task-list-item-checkbox" checked="" disabled="" type="checkbox">
    Buy groceries
  </li>
  <li class="task-list-item">
    <input class="task-list-item-checkbox" disabled="" type="checkbox">
    Clean the house
  </li>
  <li class="task-list-item">
    <input class="task-list-item-checkbox" disabled="" type="checkbox">
    Write documentation
  </li>
</ul>
```

### With `label: true`

```html
<ul class="contains-task-list">
  <li class="task-list-item">
    <label class="task-list-item-label">
      <input class="task-list-item-checkbox" checked="" disabled="" type="checkbox">
      Buy groceries
    </label>
  </li>
  ...
</ul>
```

### With `enabled: true`

The `disabled=""` attribute is removed from checkboxes and the list item receives an additional `enabled` class:

```html
<li class="task-list-item enabled">
  <input class="task-list-item-checkbox" checked="" type="checkbox">
  Buy groceries
</li>
```

## CSS classes

| Class                       | Applied to   | Description                                      |
| --------------------------- | ------------ | ------------------------------------------------ |
| `contains-task-list`        | `<ul>` / `<ol>` | The parent list containing at least one task item. |
| `task-list-item`            | `<li>`       | Each list item that contains a checkbox.          |
| `enabled`                   | `<li>`       | Added alongside `task-list-item` when checkboxes are interactive. |
| `task-list-item-checkbox`   | `<input>`    | The checkbox input element.                       |
| `task-list-item-label`      | `<label>`    | The label wrapper (only when `label: true`).      |

## Styling

```css
.contains-task-list {
    list-style: none;
    padding-left: 1.5em;
}

.task-list-item {
    position: relative;
}

.task-list-item-checkbox {
    margin-right: 0.5em;
    vertical-align: middle;
}

.task-list-item-label {
    cursor: pointer;
}
```

## Accessibility

- When `label: true`, clicking the text toggles the checkbox, improving usability.
- Disabled checkboxes (`enabled: false`) are marked with the `disabled` attribute, which screen readers announce as non-interactive.
- When enabled, checkboxes are fully interactive and keyboard-accessible via <kbd>Space</kbd>.
