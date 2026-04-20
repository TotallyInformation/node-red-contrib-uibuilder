---
author: Julian Knight (Totally Information)
created: 2026-01-01 21:35:51
updated: 2026-03-22 14:36:01
status: Complete
title: GFM Alert Boxes
description: Tests different GitHub Flavored Markdown alert box scenarios. Also known as callouts.
---

Please note the various limitations shown at the end of these examples.

> This is a simple blockquote.
>
> Over multiple paragraphs.
>
> In fact, three paragraphs.
> With some longer text to see how it looks when it wraps over multiple lines in the rendered output.
> And even more text to make sure we have enough to see the effect properly.

## GFM Alert Boxes - {{path}}

The following alert/callout types are supported, using the syntax shown:
- Note: `> [!NOTE]`
- Tip: `> [!TIP]`
- Important: `> [!IMPORTANT]`
- Warning: `> [!WARNING]`
- Caution: `> [!CAUTION]`

> [!NOTE]
> Highlights information that users should take into account, even when skimming.
>
> This has another paragraph to show that it works over multiple paragraphs.
> And with more lines of text to see how it wraps.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

---

## Nestable

Nested within other elements.

> [!NOTE]
> This is a note
>
> > blockquote
> > after

Note that an alert box with a contained blockquote cannot have outer content after the embed.
> [!IMPORTANT]
>
> > multi line
> >
> > blockquote before
>
> This text should be inside the alert box, but outside the blockquote. However, this does not currently work.

---

Alerts cannot currently be nested inside another alert or a blockquote.

> This is a blockquote with
>
> > [!TIP]
> > tips inside

> [!WARNING]
>
> ~~~js
> console.log('nested alert')
> ~~~
>
> > [!CAUTION]
> > [Reference-style link][1]
> >
> > - This is
> > - a \`caution\` alert

[1]: https://google.com
