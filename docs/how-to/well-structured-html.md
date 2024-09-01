---
title: Creating a well-structured HTML page
description: |
  Describes how to code a well structured HTML page using modern standards.
created: 2024-03-28 16:56:19
updated: 2024-03-28 17:09:16
---

Simple pages don't really need this level of complexity. However, if you are creating something with significant content and especially if you want to have it well indexed in search engines, it is worth thinking about the hierarchy of the elements on the page.

This page includes an accessible horizontal navigation menu, header and footer sections along with a `main` section that contains several articles and an `aside` (sidebar). The default `uib-brand.css` file will format this page quite nicely.

Pages like this seem very complex at first glance but if you open it in a decent editor (such as VSCode) and collapse the hierarchy down, you will quickly see the structure. Try to keep your HTML as well structured as possible.

## Hints

* Include title, meta description and a **single** `h1` for best searching and allowing for further processing.
* Give an `id` to every element that you might want to update dynamically from Node-RED or from some front-end custom JavaScript code.
* Think carefully about accessibility and **always** test accessibility when creating pages for other people to use. Most browsers now have decent accessibility tests built into their developer tools and more comprehensive testers exist on the web and as browser extensions. You should be aiming to achieve at least WAI 2.2 level "AA" accessibility levels. This is not only a moral requirement but also a legal one in many countries.

## Example HTML for a content-rich page

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="../uibuilder/images/node-blue.ico">

        <title>Standard Layout - Node-RED uibuilder</title>
        <meta name="description" content="Node-RED uibuilder - Standard Layout">

        <!-- Your own CSS (defaults to loading uibuilders css)-->
        <link type="text/css" rel="stylesheet" href="./index.css" media="all">

        <!-- #region Supporting Scripts. These MUST be in the right order. Note no leading / -->
        <script defer src="../uibuilder/uibuilder.iife.min.js"></script>
        <!-- <script defer src="./index.js">/* OPTIONAL: Put your custom code in that */</script> -->
        <!-- #endregion -->
    </head>
    <body>
        <!-- Here is our page header -->
        <header>
            <h1 class="with-subtitle">Standard HTML Layout Example</h1>
            <div role="doc-subtitle">Using the uibuilder IIFE library.</div>

            <!-- Navigation element (`horizontal` class is part of brand css) -->
            <nav id="main-menu" class="horizontal" aria-labelledby="primary-navigation">
                <!-- Optional nav heading - advised for accessibility -->
                <h2 id="primary-navigation">Menu</h2>:

                <ul id="mainmenu" role="menubar" aria-describedby="main-menu">
                    <!-- Aria & class used to track & highlight current page, usually set dynamically
                         tabindex makes menu selectable by keyboard for accessibility
                      -->
                    <li tabindex="0" role="menuitem" aria-current="page" class="currentRoute">
                        <a href="#">Home</a>
                    </li>
                    <li tabindex="0" role="menuitem"><a href="#">Our team</a></li>
                    <li tabindex="0" role="menuitem"><a href="#">Projects</a></li>
                    <li tabindex="0" role="menuitem"><a href="#">Contact</a></li>
                </ul>

                <!-- A Search form is another common non-linear way to navigate through a website. -->
                <form>
                    <input type="search" name="srch" placeholder="Search">
                    <input type="submit" value="🔍">
                </form>
            </nav>
        </header>

        <!-- Here is our page's main content -->
        <main>
            <!-- '#more' is used as a parent for dynamic HTML content in uibuilder examples -->
            <div id="more"></div>

            <!-- Wrap multiple articles -->
            <section id="articles" class="left">
                <!-- It contains an article -->
                <article>
                    <h2>Article heading</h2>

                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Donec a diam
                        lectus. Set sit amet ipsum mauris. Maecenas congue ligula as quam
                        viverra nec consectetur ant hendrerit. Donec et mollis dolor. Praesent
                        et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt
                        congue enim, ut porta lorem lacinia consectetur.
                    </p>

                    <h3>Subsection</h3>

                    <p>
                        Donec ut librero sed accu vehicula ultricies a non tortor. Lorem ipsum
                        dolor sit amet, consectetur adipisicing elit. Aenean ut gravida lorem.
                        Ut turpis felis, pulvinar a semper sed, adipiscing id dolor.
                    </p>

                    <p>
                        Pelientesque auctor nisi id magna consequat sagittis. Curabitur
                        dapibus, enim sit amet elit pharetra tincidunt feugiat nist imperdiet.
                        Ut convallis libero in urna ultrices accumsan. Donec sed odio eros.
                    </p>

                    <h3>Another subsection</h3>

                    <p>
                        Donec viverra mi quis quam pulvinar at malesuada arcu rhoncus. Cum
                        soclis natoque penatibus et manis dis parturient montes, nascetur
                        ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem
                        facilisis semper ac in est.
                    </p>

                    <p>
                        Vivamus fermentum semper porta. Nunc diam velit, adipscing ut
                        tristique vitae sagittis vel odio. Maecenas convallis ullamcorper
                        ultricied. Curabitur ornare, ligula semper consectetur sagittis, nisi
                        diam iaculis velit, is fringille sem nunc vet mi.
                    </p>
                </article>
                <!-- And another article -->
                <article>
                    <h2>Article 2</h2>

                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Donec a diam
                        lectus. Set sit amet ipsum mauris. Maecenas congue ligula as quam
                        viverra nec consectetur ant hendrerit. Donec et mollis dolor. Praesent
                        et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt
                        congue enim, ut porta lorem lacinia consectetur.
                    </p>
                </article>
            </section>

            <!-- the aside content can also be nested within the main content -->
            <section id="asides" class="right">
                <aside>
                    <h2>Related (aside)</h2>

                    <ul>
                        <li><a href="#">Oh I do like to be beside the seaside</a></li>
                        <li><a href="#">Oh I do like to be beside the sea</a></li>
                        <li><a href="#">Although in the North of England</a></li>
                        <li><a href="#">It never stops raining</a></li>
                        <li><a href="#">Oh well…</a></li>
                    </ul>
                </aside>
            </section>
        </main>

        <!-- And here is our main footer that is used across all the pages of our website -->
        <footer>
            <p>© Copyright 2155 by nobody. All rights reversed.</p>
        </footer>
    </body>
</html>
```

## References

* [HTML Semantic Elements](https://www.w3schools.com/html/html5_semantic_elements.asp).
* [Headings and sections  |  web.dev](https://web.dev/learn/html/headings-and-sections/).
* [Document and website structure - Learn web development | MDN](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure).
