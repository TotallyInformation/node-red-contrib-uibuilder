---
title: Documentation for the uibuilder standard CSS file
description: >
   Details of the different styles and their usage.
created: 2023-02-25 13:54:50
lastUpdated: 2023-12-11 17:36:55
---

*(This document is a work-in-progress, it is not complete)*

This style sheet is light/dark adaptive and has a basic style reset for the most commonly used HTML tags.

To force light/dark (ignoring browser prefs), simply change `<html lang="en">` to `<html lang="en" class="light">` or `<html lang="en" class="dark">` in your html file. Note, however, that while this works with this css file, it may not work with other ones. If you want to have the same effect in another css file, use `:root, :root.light {}` and `:root.dark` specifications.

Remember that styles starting with a `.` define CSS classes.

> [!NOTE]
> See the [Notes on the basic reset](#notes-on-the-basic-reset) below for details about the base configuration of these styles.
>
> But it is worth noting that the base font size, font face, and several other settings are left up to the browser to allow users to choose their own for accessibility. So when planning layouts using this style sheet, remember to leave room for differences in browser settings. Do not try to be too restrictive or overly controlling. This is good practice anyway.
>
> The style sheet is designed to work well with data-driven web pages and the focus is on adaptability and flexibility rather than tight layouts.

## Standard Colour Classes

Each of the colour classes have matching sets of CSS variables. The main colour variables use HSL definitions that have individual hue, saturation and lightness variables so that everything is easily tweaked to preference.

* `.surface1` to `.surface4` - Combinations of low-impact foreground/background colours that should work well together. Adaptive to light/dark settings.
* `.info`, `.success`, `.warning`/`.warn`, `.failure`/`.error`/`.danger` - 4 semantic colours with meanings that should be common in most parts of the world.
* `.complementary`, `.primary`, `.secondary` - Based from the brand hue. Complementary is 180° around the colour wheel. The other two use "Split Complementary" colour theory. Change the `--accent-offset` variable from the default 30° to 60° to get "Triadic" complementary colours.
* `.brand` - Use this as the base colour from which many of the other general styles are defined. The `--brand-hue` variable controls the base hue.
* `.rad-shadow` - Standard adaptive box shadow.

## Forms

Forms are bordered with a horizontal layout (labels on the same row as the inputs). Layouts currently done using floats but this will change in a future release to use Flex or Grid layouts.

For screen widths below 600px, the labels are moved above the inputs.

## Tables

* Tables are bordered (using collapsed borders). The colour for the table border is `--text3`. Inner borders use `--surface4`. The table has a top & bottom margin of 1rem.
* Even `tbody` rows have a background colour of `--surface3` and foreground colour of `--text2`.
* Table heads (`thead`) use `--text2` font colour, `--surface4` background colour. Font is bold.
* Table foots (`tfoot`) use `--text2` font colour, `--surface4` background colour. Font is italic.
* Adaptive surface colours are used for light/dark browser preferences.

Remember to use accessible table structures for the best effects. If you want a table heading row(s), put them inside a `<thead>` and put the main body of the table in a `<tbody>` container.

## Notifications and Alerts

TBC

## Grids and Flex Layouts

Still much to be done to provide a set of standard grid and flex layouts. Currently only a simple set are available

* `.flex` - Display flex with a 0.5rem gap.
* `.grid`, `.grid-2`, `.grid-3`, `.grid-4` - 1-4 wide grids with 0.5rem gaps.
* `.grid-fit` - Dynamic wrapping grid based on the `--grid-fit-min` variable (15rem by default)

### Status grids

Designed to be small rounded boxes with a left-hand coloured panel (no text) showing a specific status.

* `.status-grid` - use on the outer element. Grid will auto-fit with sizing from 14em to 1fr.
* `status-heading` - Spans a grid row.
* `status-link` - Use on an `<a>` tag wrapped around either a full entry or a subset. It hides the usual colour and underlining of links.

```html
<main>
   <div class="status-grid">
      <h2 class="status-heading">Something</h2>
      <div class="box flex">
         <div class="status-side-panel"></div>
         <div>
            <div>Box text</div>
            <div class="smaller">Another line of smaller text</div>
         </div>
      </div>
      <!-- ... -->
   </div>
</main>
```

## Utility Styles

* `.animate-pulse` - A standard pulse animation. Useful with `.status-side-panel`.
* `.border` - Turn on a border with a standard color and corner radius. Margin, padding and corner radius are controlled by variables.
* `.box` - Similar to border but with internal padding. The box class has matching `h2`-`h6` sub-classes that reduce top margin to 0.5rem.
* `.centre`, `.center` - Centres blocks within their parent block (by applying left & right auto margins).
* `.emoji` - Apply to a `<span>` containing an emoji to make it look a lot nicer on most platforms.
* `.noborder` - Turn off a border
* `.status-side-panel` - A narrow, full-height block designed to show a vertical coloured status bar (no text). Apply one of the standard colour classes as well. Use with `.animate-pulse` to get an eye-catching effect.
* `.text-larger`, `.text-smaller` - Hopefully obvious.
* `.withsubtitle` - Use on a page heading tag (usually `<h1>`) where you want to follow it with a subtitle.
* `[role="doc-subtitle"]` - Add this role attribute to a `<div role="doc-subtitle">` immediately following a page heading to get smaller text with no gap.
* `.uppercase` - Force text to display only in upper case.

In addition, there is a set of colours defined for simple syntax highlighting of JSON objects since these so often need to be viewed. The `uibuilder.showMsg` and `uibuilder.syntaxHighlight` functions use these colours. They are controlled by a `.syntax-highlight` class and have `.key`, `.string`, `.number`, `.boolean`, `.null` and `.undefined` sub-classes.

## CSS Variables

CSS Variables let you easily reuse the base hues and other settings in your own custom CSS styles and/or let you easily change the base theme's look and feel.

### Hues

There are a set of hue's that are used by the colour classes. You can change these variables without needing to change the classes if you want a different theme. Hues are a single number in degrees around the [colour wheel](https://designs.ai/colors/color-wheel).

Try [Brandon Mathis's HSL Color Picker](https://hslpicker.com/#0af) if you want to play with hues and colors.

#### Highlighting hues

* `--info-hue` (203) - Use for highlighting information displays.
* `--success-hue` (120) - Use for highlighting anything successful or good.
* `--warning-hue` (40) - Use for highlighting warnings.
* `--failure-hue` (2) - Use for highlighting failures, errors or danger.
* `--brand-hue` (200) - Sets the base colour scheme.
* `--complementary-hue` (brand+complementary) - Adjust by changing `--complementary-offset` but should generally always be 180
* `--primary-hue` (brand+complementary+accent) - Main accent hue. Adjust by changing `--accent-offset` and/or `--complementary-offset`
* `--secondary-hue` (brand+complementary-accent) - Secondary accent hue. Adjust by changing `--accent-offset` and/or `--complementary-offset`

#### Standard foreground/background hues

* `--text-hue` (brand) - Auto-adjusts for light/dark. Set to `--brand-hue` by default but may be changed if needed (TODO).
* `--surface-hue` (brand) - set to `--brand-hue` by default but may be changed if needed (TODO).

#### Adjustment hue offset angles

* `--complementary-offset` (180) - Offset from brand hue for complementary colours. (TODO)
* `--accent-offset` (30) - Offset angle for accent colours. 30=Split complementary, 60=Triadic.

### Colours

Colour variables can be used in `color` (foreground/font) and `background-color` or anywhere else that takes an actual colour. In `uib-brand`, colours are always set using [HSL specifications](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl) so that they can be easily manipulated. Manipulating HSL specifications is much easier mathematicaly and visually than using RGB.

Colours in `uib-brand` adjust according to whether you are using "light" or "dark" modes. In each case, the hue remains the same but the saturation and lightness values are adjusted. So if trying to create your own colour scheme, don't forget to change the various saturation and lightness variables for both light and dark settings.

* `--brand` - The base colour.

#### Text colours

Based on the `--text-hue` which is set to `--brand-hue` by default.

`--text1`, `--text2`, `--text3`, `--text4` - Darkest/lightest text - most contrast -> Least contrast

#### Background (surface) colours

Based on the `--surface-hue` which is set to `--brand-hue` by default.

`--surface1`, `--surface2`, `--surface3`, `--surface4`, `--surface5` - Most -> least contrast

#### Highlight colours

Intense versions use 100% saturation and 50% lightness instead of the calculated S & L.

`-fg` (foreground) and `-bg` (background) versions allow you to have fg/bg variations that adjust to light/dark. The non-extension version is set to the `-bg` version by default.

* `--info`, `--info-intense`
* `--success`, `--success-intense`
* `--warning` (alias `--warn`), `--warning-intense`
* `--failure` (alias `--error`, `--danger`), `--failure-intense`
* `--complementary`, `--complementary-fg`, `--complementary-bg`
* `--primary`, `--primary-fg`, `--primary-bg`
* `--secondary`, `--secondary-fg`, `--secondary-bg`

#### Saturation settings

    --saturation-bias: 0;
    --light-saturation: .66;
    --dark-saturation: calc(var(--light-saturation) * .6);
    --saturation-value: var(--light-saturation);
    --saturation: calc(var(--saturation-value) + var(--saturation-bias));

#### Lightness settings

    --lightness-bias: 0;
    --light-lightness: .57;
    --dark-lightness: calc(var(--light-lightness) * .75);
    --lightness-value: var(--light-lightness);
    --lightness: calc(var(--lightness-value) + var(--lightness-bias));

#### Text settings

    --text-saturation: .2;
    --text-bias: 0;
    --light-text-lightness: .1;
    --light-text-factor: 1;
    --dark-text-lightness: .9;
    --dark-text-factor: -1;
    --text-factor: var(--light-text-factor);
    --text-lightness: var(--light-text-lightness);

#### Background (surface) settings

    --surfaces-saturation: .1;
    --surfaces-bias: 0;
    --light-surfaces-lightness: .95;
    --light-surfaces-factor: 1;
    --dark-surfaces-lightness: .1;
    --dark-surfaces-factor: -1;
    --surfaces-factor: var(--light-surfaces-factor);
    --surfaces-lightness: var(--light-surfaces-lightness);

### Shadows

Note that shadows are notoriously difficult to get right in dark modes. The default settings are based on [the smooth shadow creator](https://shadows.brumm.af/).

* `--shadow` (shadow1) - Default shadow
* `--shadow1` - Heavier
* `--shadow2` - Lighter

#### Shadow settings

    --surface-shadow-light: var(--brand-hue) 10% 20%;
    --shadow-strength-light: .02;

    --surface-shadow-dark: var(--brand-hue) 30% 30%;
    --shadow-strength-dark: .1;

    --surface-shadow: var(--surface-shadow-light);
    --shadow-strength: var(--shadow-strength-light);

### Other

* `--border-margin` (`0`) - Applies to `border` class only. How much `margin` to add to a bordered element.
* `--border-pad` (`0.5rem`) - Applies to `border` class only. How much `padding` to add to a bordered element.
* `--border-radius` (`0.5rem`) - Used for all styles that have rounded corners. (buttons, inputs, borders, etc.)
* `--font-family` (`sans-serif`) - Sans-serif is much easier to read on-screen, the actual font is left up to the browser/OS.
* `--grid-fit-min` (`15rem`) - Used by the `.grid-fit` class to specify the minimum child component size. That defines when contents will wrap.
* `--mode` - `light` or `dark` according to the current browser preference or html class override.
* `--uib-css` - Can be used in JavaScript to know if this style sheet is loaded. See the definition for details on use.

Many other variables are defined that control levels of saturation, light/dark, border radii, shadows, colours, etc.

> [!NOTE]
> You can get the current value of a CSS variable from JavaScript using:
> ```javascript
> getComputedStyle(document.body).getPropertyValue('--mode')
> ```
> If you need to get a value within a W3C HTML component, use a reference to the component instance instead:
> ```javascript
> getComputedStyle(uib.$('#gauge1')).getPropertyValue('--mode')
> ```

## Notes on the basic reset

I've tried to keep the resets to a minimum so that browsers can retain some personality. For example, unlike most resets, I do not set all margins to zero.

* Use `<main>` as a smart container to set max width to a comfortable reading width.
* The base & heading font-sizes are **not** set so that it is defined by the browser. This allows users who need larger font sizes to set it for themselves. Font sizes for things like headings are set relative to the base-font. Only the `code` style definition has a set size which is 120% of the base font.
* The base font-family is set to `sans-serif`, leaving the details up to the browser/user. Controlled by the `--font-family` variable.
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
* All button types are formatted using `--text1` font colour and `--info` background colour. They have hover, focus and acive visible effects.

### General reset settings

* `html` - Font colour `--text2`, background colour `--surface2`, accent colour `--brand`, font size 100%, line-height 1.5.
* `body` - Font family "sans-serif". Left & right margin 1rem.
* `blockquote` - bordered using `--text3` colour. Padding of 0.3rem. Box shadow of `--shadow`.
* `code` - Font size 120%.
* `main` - 1rem left/right padding, max width 64rem, centred on page. Use this as a smart container.

## Notes on sizing things

You should make every effort **NEVER** to use fixed (e.g. pixel) sizing for any size measurements. Doing so, severely restricts the usefulness of your pages on different sized screens and gives a poor accessibility experience for users who need to adjust things (poor vision, etc).

So always strive to use percentage, "em" or "rem" measurements.

* Percentage (%) is often good for horizontal measurements. It may be useful vertically inside certain types of set sized containers.
* "em" - Measures relative to the font size of the parent element.
* "rem" - Measures relative to the find size of the root element. This can be useful to avoid issues when working with headings, etc. It is a more stable measure.

There are plenty of other relative units, check out this [MDN Reference](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units). In particular `vw` and `vh` are % relative to the width and height of the currently visible browser window [ref.](https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport).
