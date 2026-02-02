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

// Private version of task lists
import { taskLists } from './tasklist.mjs'

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

const parser = md
    .use(attrs)
    .use(anchor, {
        permalink: anchor.permalink.headerLink(),
        // permalink: anchor.permalink.linkAfterHeader({
        //     style: 'visually-hidden',
        //     assistiveText: title => `Permalink to “${title}”`,
        //     visuallyHiddenClass: 'visually-hidden',
        //     wrapper: ['<div class="wrapper">', '</div>'],
        // }),
        // permalink: anchor.permalink.linkInsideHeader({
        //     symbol: ' 🔗',
        //     placement: 'after',
        // }),
    })
    // .use(mdItObsidianCallouts)
    .use(MarkdownItGitHubAlerts)
    .use(
        taskLists,
        {
            enabled: false,
            label: true,
        }
    )

const mdParse = md.render.bind(md)

export {
    fm,
    mdParse,
}
