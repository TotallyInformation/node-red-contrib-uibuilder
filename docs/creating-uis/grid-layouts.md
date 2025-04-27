---
title: Creating a content-heavy grid layout using CSS Grid
description: |
  An example showing a complete blog-style layout. Easily adapted.
created: 2025-04-03 15:56:55
updated: 2025-04-03 15:56:59
---

![grid layout](grid-layout.png)

Layouts are generally the starting block of your UI. They provide the structure within which you can place your content. This example shows a simple grid layout that can be used for a blog or similar content-heavy site.

It is based on the CSS Grid layout system. This is a powerful and flexible way to create complex layouts with minimal code.

## Visual Structure

The basic visual structure consists of the following areas:

- A header - which contains the title and a horizontal navigation menu.
- A main content area - which acts as a container for a series of "arcticles" show in card format.
- A sidebar - Empty in this example but often used for navigation or additional content.
- A footer - Empty in this example but generally used for copyright and other information.

In the example code, there is a dotted line around each of these areas just to illustrate the layout, this is easily removed by changing the obvious entries in te CSS file.

Note that this structure is "responsive". Which is to say that, on narrower screens, each area will stack on top of each other. This is done using  `@media` CSS rule specifying the width in pixels where the change happens. That responsive width is set to 37.5em in this example. You can change this to suit your needs.

### Basic CSS rules for flexible layouts

CSS can get extremely complex if you aren't careful. However, there are a few basic rules that should help keep things simple but still flexible. Allowing you to adapt this basic layout to your needs.

- When defining CSS grids of any but the simplest type, always use `grid-template-areas`. This allows you to define the layout in a simple way. It also allows you to easily change the layout by changing the grid template areas. This is much easier than trying to change the grid columns and rows.
- Make extensive use of CSS variables. These can be set at the `:root` level and then overridden in more specific areas as needed. This allows you to easily change the look and feel of your site by changing a few variables.
- Use `%`, `em` or `rem` units for sizing. This allows the layout to adapt to the user's font size settings, allowing for users with accessibility requirements in particular. Avoid `px` units as much as possible. `%` sizing only really works for horizontal sizing. `em`s are roughly 1em = 16px typically. Though obviously, users can change this by changing their browser default font size.

- Allow for at least 1 sensible breakpoint in your layout. This is where the layout will change from a wide layout to a narrow layout. This is typically done using the `@media` CSS rule. You can have multiple breakpoints if you need them. Some helpful breakpoint standards are:

  | Device         | em's   | px's   |
  | -------------- | ------ | ------ |
  | Tablet         | 48em   | 768px  |
  | Tablet Wide    | 62em   | 992px  |
  | Mobile Small   | 30em   | 480px  |
  | Mobile Medium  | 37.5em | 600px  |
  | Mobile Large   | 48em   | 768px  |
  | Laptop/Desktop | 75em   | 1200px |

  
