---
title: Basic CSS rules for flexible layouts
description: |
  Some simple guidelines and good practices for creating flexible layouts using CSS.
created: 2025-06-08 16:36:06
updated: 2025-06-08 16:36:10
---

CSS can get extremely complex if you aren't careful. However, there are a few basic rules that should help keep things simple but still flexible. Allowing you to adapt this basic layout to your needs.

- When defining CSS grids of any but the simplest type, always use `grid-template-areas`. This allows you to define the layout in a simple way. It also allows you to easily change the layout by changing the grid template areas. This is much easier than trying to change the grid columns and rows.

- Make extensive use of CSS variables. These can be set at the `:root` level and then overridden in more specific areas as needed. This allows you to easily change the look and feel of your site by changing a few variables.

- Use `%`, `em`, `rem`, or other relative units for sizing. This allows the layout to adapt to the user's font size settings, allowing for users with accessibility requirements in particular. **Avoid `px` units** if at all possible as it makes your layouts brittle. `%` sizing mostly works for horizontal sizing. `em`s are roughly 1em = 16px typically. Though obviously, users can change this by changing their browser default font size. [Reference](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units).

- Allow for at least 1 sensible breakpoint in your layout. This is where the layout will change from a wide layout to a narrow layout. This is typically done using the `@media` CSS rule. You can have multiple breakpoints if you need them. Some helpful breakpoint standards are:

  | Device         | em's   | px's   |
  | -------------- | ------ | ------ |
  | Tablet         | 48em   | 768px  |
  | Tablet Wide    | 62em   | 992px  |
  | Mobile Small   | 30em   | 480px  |
  | Mobile Medium  | 37.5em | 600px  |
  | Mobile Large   | 48em   | 768px  |
  | Laptop/Desktop | 75em   | 1200px |

- If working with newer browsers, you may wish to use [`container queries`](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) to allow for more flexible layouts. These let you control the layout of any container element based on the size of that container rather than the size of the viewport.
