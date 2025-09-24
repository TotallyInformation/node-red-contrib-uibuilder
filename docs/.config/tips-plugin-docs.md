---
created: 2025-09-06 17:23:25
updated: 2025-09-06 18:14:57
---
# Tips Plugin Documentation

The Tips Plugin is a custom Docsify plugin that allows you to easily include tips from markdown files stored in the `tips/` folder anywhere in your documentation.

## Features

- **Easy Integration**: Simply use `[tip]` shortcodes in any markdown file
- **Random Tips**: Display random tips to provide variety
- **Specific Tips**: Reference specific tips by filename
- **Styled Display**: Beautiful, branded styling that matches UIBUILDER's design
- **Dark Mode Support**: Automatic adaptation to light/dark themes
- **Error Handling**: Graceful handling of missing tip files
- **Caching**: Efficient loading and caching of tip content

## Installation

The plugin is already integrated into the Docsify configuration in `docs/.config/index.js`. It automatically:

1. Loads all markdown files from the `tips/` folder
2. Removes YAML front matter from tip content
3. Caches tip content for better performance
4. Processes shortcodes in markdown before rendering

## Usage

### Basic Syntax

```markdown
[tip]                                    # Random tip
[tip:random]                            # Random tip (explicit)
[tip:rotate]                            # Rotating tip (updates every minute)
[tip:Browser and Node-RED are different contexts]  # Specific tip
```

### Available Tips

The plugin automatically discovers all `.md` files in the `tips/` folder. Currently available:

- Browser and Node-RED are different contexts
- Compare UIBUILDER with Dashboard 2
- Creating a Single Page App
- Front-end templates
- Messages to the UI are automatically filtered
- No-code output is low-code
- Send messages to Node-RED from the browser
- Send to UI from a function node
- UIBUILDER node outputs
- Where are my files

### Examples

#### Random Tip
Add variety to your documentation with random tips:

```markdown
[tip]
```

#### Contextual Tips
Include relevant tips in specific sections:

```markdown
When working with UIBUILDER nodes, remember:

[tip:UIBUILDER node outputs]
```

#### Rotating Tips
Display tips that automatically update every minute:

```markdown
[tip:rotate]
```

Rotating tips feature:
- **Auto-update**: Changes to a new random tip every minute
- **Visual indicator**: Shows a rotating icon (🔄) in the header
- **Smooth transition**: Subtle fade effect when updating
- **Animated border**: Gentle glow animation to indicate it's rotating
- **Performance**: Only starts timer when rotating tips are present

#### Multiple Tips
You can include multiple tips on the same page:

```markdown
[tip:Browser and Node-RED are different contexts]

[tip:Send to UI from a function node]
```

## Styling

The plugin includes comprehensive CSS styling:

- **Colors**: Uses UIBUILDER's brand colors (blue theme)
- **Layout**: Card-style design with header and content sections
- **Typography**: Clear hierarchy with icons and styled titles
- **Responsive**: Works well on all screen sizes
- **Interactive**: Subtle hover effects for better user experience
- **Accessibility**: Good contrast ratios and semantic HTML

## Adding New Tips

To add new tips:

1. Create a new `.md` file in the `docs/tips/` folder
2. Add YAML front matter if desired (will be automatically removed)
3. Write your tip content in markdown
4. Update the `tipsFiles` array in the plugin configuration

Example tip file (`docs/tips/My New Tip.md`):

```markdown
---
created: 2025-09-06 16:57:58
updated: 2025-09-06 16:58:59
---

This is my helpful tip content. It can include **markdown formatting** and even `code snippets`.
```

## Useage examples

The tips plugin supports four different ways to include tips:

### 1. Random Tip

To display a random tip from the tips folder, use:

```markdown
[tip]
```

This will show a random tip each time the page loads:

[tip]

### 2. Random Tip (Explicit)

You can also explicitly request a random tip:

```markdown
[tip:random]
```

[tip:random]

### 3. Rotating Tip

To display a tip that automatically updates every minute with a new random tip:

```markdown
[tip:rotate]
```

[tip:rotate]

The rotating tip features:
- 🔄 Visual indicator showing it rotates
- Animated glowing border
- Smooth fade transition when updating
- Updates automatically every 60 seconds

### 4. Specific Tip

To display a specific tip, use the filename (without the `.md` extension):

```markdown
[tip:UIBUILDER node outputs]
```

[tip:UIBUILDER node outputs]

### 5. Another Specific Tip

Here's another example with a different tip:

```markdown
[tip:Browser and Node-RED are different contexts]
```

[tip:Browser and Node-RED are different contexts]

### Error Handling

If you reference a tip that doesn't exist, you'll see an error message:

```markdown
[tip:Non-existent tip]
```

[tip:Non-existent tip]

### Styling

The tips are styled with a light blue theme that matches the UIBUILDER branding. The styling includes:

- Light blue background with subtle border
- Icon and title header
- Hover effects
- Dark mode support
- Responsive design

### Multiple Tips

You can include multiple tips on the same page:

[tip:Where are my files]

[tip:Send to UI from a function node]

This makes it easy to provide contextual help and tips throughout your documentation.


## Technical Details

### Plugin Architecture

The plugin consists of three main parts:

1. **Tip Loader**: Asynchronously loads and caches tip content
2. **Shortcode Processor**: Parses and replaces tip shortcodes in markdown
3. **HTML Generator**: Creates styled HTML for tip display

### Caching Strategy

- Tips are loaded once and cached in memory
- Subsequent requests use cached content
- Graceful fallback for loading errors

### Browser Compatibility

- Uses XMLHttpRequest for broad browser support
- Avoids modern fetch API for better compatibility
- Works in all browsers supported by Docsify

## Error Handling

The plugin handles various error scenarios:

- **Missing tip files**: Shows "Tip Not Found" message
- **Network errors**: Logs warnings and continues gracefully
- **Invalid shortcodes**: Ignored (no replacement)
- **Empty content**: Handles gracefully

## Performance Considerations

- Tips are loaded asynchronously to avoid blocking page rendering
- Content is cached to prevent repeated network requests
- Minimal performance impact on page load times

## Future Enhancements

Potential improvements for future versions:

- Tag-based tip filtering
- Tip categories and organization
- Search functionality within tips
- Tip rating and feedback system
- Integration with external tip sources
