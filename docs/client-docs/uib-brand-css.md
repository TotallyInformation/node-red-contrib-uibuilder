---
title: Documentation for the uibuilder standard CSS file
description: >
   Details of the different styles and their usage.
created: 2023-02-25 13:54:50
lastUpdated: 2023-02-25 15:27:31
---

*(This document is a work-in-progress, it is not complete)*

This style sheet is light/dark adaptive and has a basic style reset for the most commonly used HTML tags.

To force light/dark (ignoring browser prefs), simply add `<meta name="color-scheme" content="dark">` (or light, or both) to your HTML `<head>` section or add `:root { color-scheme: dark; }` to your CSS file.

Remember that styles starting with a `.` define CSS classes.

## Standard Colour Classes

Each of the colour classes have matching sets of CSS variables. The main colour variables use HSL definitions that have individual hue, saturation and lightness variables so that everything is easily tweaked to preference.

* `.brand` - Use this as the base colour from which many of the other general styles are defined. The `--brand-hue` variable controls the base hue.
* `.complementary`, `.primary`, `.secondary` - Based from the brand hue. Complementary is 180° around the colour wheel. The other two use "Split Complementary" colour theory. Change the `--accent-offset` variable from the default 30° to 60° to get "Triadic" complementary colours.
* `.surface1` to `.surface4` - Combinations of low-impact foreground/background colours that should work well together. Adaptive to light/dark settings.
* `.rad-shadow` - Standard adaptive box shadow.
* `.info`, `.success`, `.warning`/`.warn`, `.failure`/`.error`/`.danger` - 4 semantic colours with meanings that should be common in most parts of the world.

## Forms

Forms are bordered with a horizontal layout (labels on the same row as the inputs). Layouts currently done using floats but this will change in a future release to use Flex or Grid layouts.

For screen widths below 600px, the labels are moved above the inputs.

## Tables

Tables are bordered (using collapsed borders) with odd/even tbody row formatting. Table heads and foots are separately formatted. Adaptive surface colours are used.

## Notifications and Alerts

TBC

## Grids and Flex Layouts

Still much to be done to provide a set of standard grid and flex layouts. Currently only a simple set are available

* `.flex` - Display flex with a 0.5rem gap.
* `.grid`, `.grid-2`, `.grid-3`, `.grid-4` - 1-4 wide grids with 0.5rem gaps.

## Utility Styles

* `.animate-pulse` - A standard pulse animation. Useful with `.status-side-panel`.
* `.border` - Turn on a border with a standard color and corner radius.
* `.box` - Similar to border but with internal padding.
* `.centre` - Centres blocks within their parent block (by applying left & right auto margins).
* `.emoji` - Apply to a `<span>` containing an emoji to make it look a lot nicer on most platforms.
* `.noborder` - Turn off a border
* `.status-side-panel` - A narrow, full-height block designed to show a vertical coloured status bar (no text). Apply one of the standard colour classes as well. Use with `.animate-pulse` to get an eye-catching effect.
* `.text-larger`, `.text-smaller` - Hopefully obvious.
* `.withsubtitle` - Use on a page heading tag (usually `<h1>`) where you want to follow it with a subtitle.
* `[role="doc-subtitle"]` - Add this role attribute to a `<div>` immediately following a page heading to get smaller text with no gap.
* `.uppercase` - Force text to display only in upper case.

In addition, there is a set of colours defined for simple syntax highlighting of JSON objects since these so often need to be viewed. The `uibuilder.showMsg` and `uibuilder.syntaxHighlight` functions use these colours.

## CSS Variables

* `--uib-css` - Can be used in JavaScript to know if this style sheet is loaded. See the definition for details on use.
* `--brand-hue` - 200 by default. Sets the base colour scheme.

Many other variables are defined that control levels of saturation, light/dark, border radii, shadows, colours, etc.

## Notes on the basic reset

I've tried to keep the resets to a minimum so that browsers can retain some personality. For example, unlike most resets, I do not set all margins to zero.

* All box-sizing is set to `border-box` which provides more consistent box sizing.
* Line-height, and font-size are standardised at the `<html>` level.
* Foreground/background colors are set to adaptive variables so that they automatically adjust to light/dark browser settings.
* Fonts are defaulted to sans-serif which is much easier to read on-screen.
* Headings have a slightly smaller line height than standard text which makes multi-line headings look better.
* Image types are given a standard layout.
* `<p>` tags within a parent `<div>` are given a 1rem left & right margin.
* All button types are given a standard look. With hover, focus and active highlights.
* Input types (including button, textarea and select) are set to inherit their parent fonts to stop some browsers making them look nasty.
* Blockquotes are given a border, some padding and a box-shadow to make them stand out.
* `<code>` blocks are given a slightly larger font-size since most browsers seem to use a font that is noticably smaller than standard.
* `<main>` is centered with left/right margin and padding and a max width. You can use this as a standard page content container.
