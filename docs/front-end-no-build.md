---
title: Avoiding build steps for front-end development
description: >
  What ways are there to avoid having a build step (transpile, compile) when developing front-end code?
created: 2022-02-15 15:27:05
lastUpdated: 2022-02-15 16:25:08
---

A build step is simply a way to take things that your browser wont understand directly (like .vue, .jsx files)
and convert them to somthing that they can understand. Along the way, it will try to optimise everything to give the best possible performance.

## Why avoid a build step?

Built steps require additional tooling that can be complex to set up correctly. In addition, they require you to remember to rebuild whenever you make a change to your front-end code. In addition, different libraries and packages may be set up differently and therefore require a significant amount of knowledge to make everything work together.

So for simplicity and speed of development, if a build step can be avoided, you may find that beneficial.

## How to avoid a build step

The main reasons why a build step may be needed is because your front-end code contains statements that the users browser will not understand. This may be because the code is something specific to your chosen front-end library (e.g. VueJS, REACT, etc.) or it may be that the example code you have picked up uses a new version of JavaScript than your browser supports.

For the second of those, you can try loading the page in one of the browser types your users will have and see what errors you get. Then you may well be able to code those out.

For the first of the issues, in order to avoid a build step, you will need a version of the front-end library that contains a dynamic build feature. Of the various popular libraries, only VueJS contains such a version as far as I know, see the WIKI links below for more details.

The final reason for possbibly wanting a build-step is for performance improvements.

If you do need to use a build step, please see the [Front-End Build Steps and Tools page](front-end-builds).

## More Information

* [Dynamically load .vue files without a build step [uibuilder WIKI]]( https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Dynamically-load-.vue-files-without-a-build-step)
* [Load Vue components without a build step (modern browsers only) [uibuilder WIKI]](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Load-Vue-components-without-a-build-step-(modern-browsers-only))
* [Vue (v2)](https://www.npmjs.com/package/vue) - tells you which js file to use
* [Skypack CDN: Vue](https://www.skypack.dev/view/vue) - Skypack is a CDN that intelligently loads the correct library remotely and allows you to use ESM `import` statements making your HTML simpler (no working out what `script` tags to use).