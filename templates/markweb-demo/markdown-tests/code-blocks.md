---
author: Julian Knight (Totally Information)
created: 2026-03-18 16:01:31
updated: 2026-03-25 17:17:55
status: Complete
title: Code Blocks
description: Different code block scenarios in markdown.
---

Code may be inline or block level. Code blocks can also have syntax highlighting and may contain long lines that require horizontal scrolling. Code blocks should not have markdown processing applied to their content, except for variable substitution if applicable.

Syntax highlighting only works on block level code with triple backticks and a language specifier. Markweb currently uses highlight.js for syntax highlighting, which supports a wide range of languages. The language is specified immediately after the opening triple backticks, e.g. `javascript` or `python`. When you hover over the block, the language name should be displayed in the top right corner of the block.

## Inline

Inline `code` with backticks.

Inline ``code with `backticks` inside``.

Inline code containing variables and special directives should not be processed: `{{status}}`, `%%index%%`

## Blocks

```
Code block with multiple lines
  no syntax highlighting or special directives
(status is replaced but index is ignored):
{{status}}, %%index%%
```

```javascript
// JavaScript code block with syntax highlighting
function hello() {
  console.log('Hello, World!')
}
```

```json
{
  "name": "John",
  "age": 30,
  "city": "New York",
  "location": [54.123, 1.234]
}
```

```markdown
# Code block with markdown content but no processing
- This is a list item
- **Bold text**
```

```python
# Code block with Python syntax highlighting
def greet(name):
  return f"Hello, {name}!"
```

```bash
# Code block with bash syntax highlighting
echo "Hello, World!"
```

```powershell
# Code block with PowerShell syntax highlighting
Write-Host "Hello, World!"
```

```ini
; Code block with INI syntax highlighting
[Section]
key=value
```

A wide code block with long lines. Should result in a horizontal scrolling container block. The page should not overflow horizontally.

```
This is a very long line of code that should cause the code block to scroll horizontally if it exceeds the width of the container. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
```

> [!NOTE]
> A code block inside a callout box. Should render correctly with the callout styling intact.
>
> ```javascript
> console.log('This is a code block inside a callout box.')
> ```
