---
title: Creating a chart using UIBUILDER
description: |
  Here we see how to create a chart on a page using data from Node-RED and a charting library.
created: 2025-05-26 17:32:21
updated: 2025-06-07 18:33:01
author: Julian Knight (Totally Information)
status: Draft
---

There are many charting libraries for web applications. While UIBUILDER should work with all of them, I can't cover them all here, but I will try to show some examples and provide some tips.

> [!NOTE]
> Not all of the examples here show any UIBUILDER interactions. They may only show how to get a chart to display and provide any CSS overrides needed. Generally, you will then use the UIBUILDER `onChange` or `onTopic` functions to listen for data update from Node-RED, updating the chart as needed. Similarly, the `uibuilder.send` function can be used to send data to Node-RED if you need to react to user inputs.
>
> All of the examples here use standard script versions of libraries rather than ES Modules. I will try to add ESM examples later.

> [!TIP]
> If you prefer to use local libraries instead of online CDNs, you can install the library using UIBUILDER's Library Manager feature. You will then need to change the `<script>` tag in your `index.html` file to point to the local library file instead of the CDN version.
>
> The locally installed version will have a URL that starts with `../uibuilder/vendor/<library-name>/...`

## Chart.js

[Website](https://www.chartjs.org/) [Docs](https://www.chartjs.org/docs/latest/) [GitHub](https://github.com/chartjs/Chart.js) [4.x Migration Guide](https://www.chartjs.org/docs/latest/migration/v4-migration.html)

Good for simple requirements. Has simple data structure. However, it appears to have a problem with timescale X-axis when set to auto where it rapidly increases memory usage and slows down browser responses. [Ref.](https://discourse.nodered.org/t/dashboard-v2-chart-node-doesnt-seem-to-handle-larger-data-sets-well/93833)

This is the library currently used by the Node-RED Dashboard chart node but it is known to cause browser performance issues with larger datasets.

## Plotly

[Website](https://plotly.com/javascript/) [Docs](https://plotly.com/javascript/getting-started/) [GitHub](https://github.com/plotly/plotly.js) [CDN Version](https://cdn.plot.ly/plotly-3.0.1.min.js)

### Strengths

* Has reasonable documentation.
* Sizing can be made responsive.
* Supports a wide range of chart types including 3D charts, maps, and more. Widely used for data analytics and scientific visualisation.
* Is also popular with Python users. Also has an extended Python library called [Dash Python](https://dash.plotly.com/). Additional libraries available for R, Julia, MATLAB, F#, ggplot2.
* Has localisation files in the main distribution (script only).

### Issues

* Has some dated code examples in the documentation and dated code in the library.
* No proper ES Module version available. Only a script version. However, it is possible to use the `plotly.js-dist` package from npm which provides a minified version of the library that has instructions for use with ESM. But this is not as complete as the main package.
* Not dark/light mode aware. Does not handle dark mode without some CSS overrides.
* No separate CSS file, styling is compiled in from source SCSS files making it more difficult to override styles than it should be.
* Not responsive by default. Width/height must be set using CSS. However, can use relative sizing units like `vh` and `%`. Can be made responsive by setting the `responsive` option to `true` in the `Plotly.newPlot()` call.
* Larger than uPlot at around 4.5MB minified. However, some patial bundles available though they are still quite large.
* Problems trying to use Plotly in a web component. [#1433](https://github.com/plotly/plotly.js/issues/1433#issuecomment-1879932490). This has been marked as "Won't Fix" by the Plotly team. It limits the usefulness of Plotly as the rest of the JavaScript ecosystem moves towards ES Modules and web components.

### Example

#### index.html

```html
<!doctype html>
<html lang="en"><head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="../uibuilder/images/node-blue.ico">

    <title>Plotly Chart - Node-RED UIBUILDER</title>
    <meta name="description" content="Node-RED UIBUILDER - Plotly Chart">

    <!-- Your own CSS (defaults to loading uibuilders css)-->
    <link type="text/css" rel="stylesheet" href="./index.css" media="all">

    <!-- #region Supporting Scripts. These MUST be in the right order. Note no leading / -->
    <script defer src="https://cdn.plot.ly/plotly-3.0.1.min.js" charset="utf-8"></script>
    <script defer src="../uibuilder/uibuilder.iife.min.js">/* THE UIBUILDER LIBRARY MUST BE IN THE HTML! DO NOT REMOVE */</script>
    <script defer src="./index.js">/* OPTIONAL: Put your custom code in that */</script>
    <!-- #endregion -->

</head><body>
    
    <header>
        <h1 class="with-subtitle">Plotly Chart</h1>
        <div role="doc-subtitle">Using UIBUILDER for Node-RED</div>
    </header>

    <main>
        <div id="plotly-chart"></div>

        <!-- '#more' is used as a parent for dynamic HTML content in examples
            Also, send {topic:"more", payload:"Hello from <b>Node-RED</b>"} to auto-display the payload -->
        <div id="more" uib-topic="more"></div>
    </main>

</body></html>
```

#### index.css

```css
/* Load defaults from `<userDir>/node_modules/node-red-contrib-uibuilder/front-end/uib-brand.min.css`
 * This is optional but reasonably complete and allows for light/dark mode switching.
 */
@import url("../uibuilder/uib-brand.min.css");

#plotly-chart {
    /* HAVE to set at least width and height for Plotly to render if not using responsive sizing */
    width: 100%;
    height: 50vh;
    margin-top: 1em;
}

/* Overrides for UIUILDER's default styles */
.js-plotly-plot .plotly .main-svg {
    margin:0;
    background-color: unset;
}
.js-plotly-plot .plotly .modebar-btn svg {
    background-color: unset;
    margin: unset;
}
```

#### index.js

```javascript
const plotlyChart = document.getElementById('plotly-chart')
if (plotlyChart) {
    const plotlyData = [{
            x: [1, 2, 3, 4, 5],
            y: [1, 2, 4, 8, 16]
        }]
    const plotlyLayout = {
        title: {
            text: 'Responsive to window\'s size!'
        },
        font: {size: 18}
    }
    const plotlyConfig = {
        responsive: true, // Make the chart responsive
        margin: { t: 0 },
    }
    // @ts-ignore
    Plotly.newPlot( plotlyChart, plotlyData, plotlyLayout, plotlyConfig )
}
```


## uPlot (AKA μPlot)

[Docs](https://github.com/leeoniya/uPlot/tree/master/docs) [GitHub](https://github.com/leeoniya/uPlot) [CDN version](https://www.jsdelivr.com/package/npm/uplot)

It is very fast, especially for time series and really is a tiny library (~50k). It is also able to easily handle streaming data with minimal CPU and memory usage.

### Strengths

* Fast. Handles high-frequency streamed data well.
* Lightweight. The minified version is around 50kB.
* Has both script and ESM versions.
* GitHub repo has
  * The dist folder populated.
  * A demo folder with examples.
  * A docs folder with a limited documentation page.

### Issues

* Library is not responsive. Width/height must be set in the options as pixel values.
* Library is not correctly CSS light/dark mode aware. The provided CSS is only light mode.
* Documentation is somewhat sparse.

### Example

#### index.html

```html
<!doctype html>
<html lang="en"><head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="../uibuilder/images/node-blue.ico">

    <title>μPlot Chart - Node-RED UIBUILDER</title>
    <meta name="description" content="Node-RED UIBUILDER - μPlot Chart">

    <!-- Your own CSS (defaults to loading uibuilders css)-->
    <link type="text/css" rel="stylesheet" href="./index.css" media="all">
    <link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@latest/dist/uPlot.min.css">

    <!-- #region Supporting Scripts. These MUST be in the right order. Note no leading / -->
    <script defer src="https://cdn.jsdelivr.net/npm/uplot@latest/dist/uPlot.iife.min.js"></script>
    <script defer src="../uibuilder/uibuilder.iife.min.js">/* THE UIBUILDER LIBRARY MUST BE IN THE HTML! DO NOT REMOVE */</script>
    <script defer src="./index.js">/* OPTIONAL: Put your custom code in that */</script>
    <!-- #endregion -->

</head><body>
    
    <header>
        <h1 class="with-subtitle">μPlot Chart</h1>
        <div role="doc-subtitle">Using UIBUILDER for Node-RED</div>
    </header>

    <main>
        <div id="uplot-chart"></div>

        <!-- '#more' is used as a parent for dynamic HTML content in examples
            Also, send {topic:"more", payload:"Hello from <b>Node-RED</b>"} to auto-display the payload -->
        <div id="more" uib-topic="more"></div>
    </main>

</body></html>
```

#### index.css

```css
/* Load defaults from `<userDir>/node_modules/node-red-contrib-uibuilder/front-end/uib-brand.min.css`
 * This is optional but reasonably complete and allows for light/dark mode switching.
 */
@import url("../uibuilder/uib-brand.min.css");

#uplot-chart {
    /* Might not need this if using light mode */
    background-color: white;
    margin-top: 1em;
    /* Overrides uibuilder's text color */
    --text2: black;
    /* Overrides uibuilder's surface color for tables */
    --surface4: white;
    --surface3: white;
}

#uplot-chart th {
    border: none;
    font-style: unset;
}

.u-title, .u-value {
    color: var(--text2);
}

.uplot canvas {
    background-color: unset;
    margin:unset;
}
```

#### index.js

```javascript
const uplotChart = document.getElementById('uplot-chart')
let uplot
let data
let opts
if (uplotChart) {
    data = [
        [1546300800, 1546387200],    // x-values (timestamps)
        [35, 71],    // y-values (series 1)
        [90, 15],    // y-values (series 2)
    ]

    opts = {
        title: "My Chart",
        id: "chart1",
        class: "my-chart",
        width: 800,
        height: 600,
        series: [
            {},
            {
                // initial toggled state (optional)
                show: true,

                spanGaps: false,

                // in-legend display
                label: "RAM",
                value: (self, rawValue) => rawValue == null ? '' : "$" + rawValue.toFixed(2),

                // series style
                stroke: "red",
                width: 1,
                fill: "rgba(255, 0, 0, 0.3)",
                dash: [10, 5],
            },
        ],
    }
    // @ts-ignore
    uplot = new uPlot(opts, data, uplotChart)
}
```
