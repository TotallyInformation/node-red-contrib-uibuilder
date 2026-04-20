/** Internal Markdown utilities for uibuilder - bundles marked and front-matter
 * Re-exports dependencies for use in production without adding to main package.json
 *
 * IDEAS:
 * -
 */

// https://www.npmjs.com/package/front-matter
import fm from 'front-matter'
// @ts-ignore https://www.npmjs.com/package/markdown-it
import markdownit from 'markdown-it'
// ?? https://www.npmjs.com/package/markdown-it-highlightjs ??
// https://www.npmjs.com/package/highlight.js
import hljs from 'highlight.js'
// https://www.npmjs.com/package/markdown-it-obsidian-callouts
// import mdItObsidianCallouts from 'markdown-it-obsidian-callouts'
// https://github.com/antfu/markdown-it-github-alerts
import MarkdownItGitHubAlerts from 'markdown-it-github-alerts'
// https://github.com/arve0/markdown-it-attrs
import attrs from 'markdown-it-attrs'
// https://www.npmjs.com/package/markdown-it-anchor
import anchor from 'markdown-it-anchor'

// Private mermaid plugin
// import { markdownItMermaidServer, renderMarkdownAsync } from './pluginMermaid.mjs'

// Private version of task lists
import { taskLists } from './tasklist.mjs'
// Private %%...%% directive plugin
import { directivePlugin } from './directivePlugin.mjs'
// Private {{varname [arg1=value1, arg2=value2]}} variables plugin
import { fmVariablesPlugin } from './fmVariablesPlugin.mjs'
// Private plugin to wrap headings in collapsible <details>/<summary> elements
import { detailsSummaryPlugin } from './detailsSummaryPlugin.mjs'

const md = markdownit({
    html: true,
    linkify: true,
    // typographer: true,

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externally.
    // If result starts with <pre... internal wrapper is skipped.
    // highlight: function (/*str, lang*/) { return ''; }
    // Highlight.JS integration
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang, }).value
            } catch (__) {}
        }
        return '' // use external default escaping
    },
})

md
    // .use(markdownItMermaidServer)
    .use(attrs)
    .use(anchor, { permalink: anchor.permalink.headerLink(), })
    // .use(mdItObsidianCallouts)
    .use(MarkdownItGitHubAlerts)
    .use(taskLists, { enabled: false, label: true, })
    .use(detailsSummaryPlugin)
    // NB: directivePlugin and fmVariablesPlugin are loaded in customNode.js
    // so their handlers can access the node instance, index, and page attributes

// Use this to render markdown to HTML
const mdParse = md.render.bind(md)

export {
    fm,
    md,
    mdParse,
    directivePlugin,
    detailsSummaryPlugin,
    fmVariablesPlugin,
    // mermaid,
}
