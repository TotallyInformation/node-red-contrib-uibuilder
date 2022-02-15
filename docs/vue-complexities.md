---
title: Some complexities when using VueJS
description: >
   While VueJS is a powerful and flexible front-end framework, it isn't without its issues.
   This page outlines some things to be wary of.
created: 2022-02-15 16:28:47
lastUpdated: 2022-02-15 16:54:48
---

## Reactive Variables

A common mistake when working with Vue and uibuilder is to fail to understand that any variable you want to use in your HTML has to be pre-defined to the Vue app.

You do this by adding the variable name to the list in the `data` section of the Vue app's configuration. Some examples are included in the Vue-specific uibuilder templates and examples.

### Deep object reactivity

A related issue is to fail to understand that Vue attempts to heavily optimise reactivity (when a web UI has to update because a variable has changed). In order to do so, it will generally only dig as deep into a variable as you have pre-defined in your `data` section. So if you define `data.fred` as `"hello"` and then later turn it into a deep object (maybe containing something like `foo.bar.bah.something`), Vue is unlikely to recognise that it needs to update the UI.

To avoid this, try to define complex objects and arrays with a suitable template structure. However, if you can't do that, Vue does provide a workaround. See [Reactivity in Depth (Vue2 Docs)[https://v2.vuejs.org/v2/guide/reactivity.html for details.].

## Component Packaging

While Vue is very flexible, the downside of this is that there are several ways in which Vue component authors can package their components.

The laziest way is for the author to code as a `.vue` file complete with `import` statements. If you are lucky, they may provide some documentation on how to build that into final code but often they make the assumption that you already know how to do that.

At the other extreme, good authors will not only provide the source but several pre-built versions (as `.js` files) that can be loaded directly into your front-end code using a `script` tag in the HTML. They will auto-execute and even attach themselves to the Vue app so that you don't need to declare them. If you find a `dist` folder in the library, you are probably in luck. `bootstrap-vue` is a good (complex) example of this approach which is one of the reasons it made it into common use with uibuilder in comparison with otherwise equivalent libraries.

In between these two extemes are various other, often confusing, options rarely helped as they often are missing good documentation. Some authors may pre-build `.js` files but in a way that requires them both to be referenced as `script` tags in your html file **and** declared to Vue as a component.

Others still will present as `.vue` files that do not use import statements and may be loaded using [`http-vue-loader`](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Dynamically-load-.vue-files-without-a-build-step).

One possible alternative workaround in some cases is to use the [Skypack CDN](https://docs.skypack.dev/). This not only gives you access to any published library without needing to install it using uibuilder's library package manager (though instead it requires a live Internet connection) but it also allows you to work around some of the build limitations.

Unfortunately, even for experienced users, what approach is required is not always obvious.