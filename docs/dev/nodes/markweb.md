# Development notes for the Markweb node

See also https://discourse.nodered.org/t/letting-other-nodes-do-stuf-while-one-function-node-is-working-on-a-recursive-search/102196

https://nodesource.com/blog/worker-threads-nodejs-multithreading-in-javascript


> The buildIndexes function in https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/dev/nodes/markweb/customNode.js#L1161 searches the filing system (cross-platform) and finds markdown files to include in an index. For every found file, it has to read it to get additional data for the index. It is called on node-red startup and when chokidar detects a FS change. Please review the function and suggest improvements if any.



I'll fetch the file and look at the function.

I wasn't able to read `buildIndexes`, so I can't review it yet. GitHub's page only rendered the first ~1000 of the file's 2347 lines, and I couldn't fetch the raw file. If you paste the function (and ideally `setupFileWatcher`), I'll do a line-by-line review. Everything below is based on what I could see elsewhere in the file, plus a general checklist for this pattern.

## What I could see

**1. The "index not ready" check can't fire.** `nodeInstance` sets `this.index = new Map()` and starts `buildIndexes(this)` without awaiting it. The search hook then checks `if (!index)`, but an empty `Map` is truthy, so the "Search index not ready" branch never runs. During startup a search or nav render just sees an empty or partial index. A `node.indexReady` flag or a stored promise would fix this.

**2. Every watcher event seems to trigger a full rebuild.** A forum report shows one save producing `add` and `change` events for an editor temp file (`.goutputstream-...`), each followed by a full re-index. The same thread shows a re-index logging "0 files, 0kb" after an edit, on a folder another user's log shows as 20 files. That's one user's environment, so it's a lead rather than proof, but it's worth checking how your discovery step filters files.

## Checklist for the function itself

- **Build into a fresh Map and swap at the end** (`node.index = newIndex`), rather than clearing and refilling `node.index`. Otherwise there's a window where the index is empty or half-built while search or nav requests arrive.
- **Don't let rebuilds overlap.** Two near-simultaneous chokidar events can run two builds at once, and the slower one can overwrite the newer result. Use a single-flight guard with a "dirty" flag.
- **Debounce the watcher trigger**, and have chokidar ignore editor temp files (`ignored`, `awaitWriteFinish`).
- **Cap read concurrency.** An unbounded `Promise.all(files.map(readFile))` can hit `EMFILE` on large trees, especially on Windows. Prefer async `fs.promises` over `readFileSync` so you don't block the Node-RED event loop on startup.
- **Reuse unchanged entries.** Your `MarkwebIndexEntry` typedef already has `fsMtimeMs`. `stat` each file and only re-read and re-parse the frontmatter when mtime or size changed. That turns most rebuilds into a stat pass.
- **Handle per-file failures.** A file deleted between discovery and read, or malformed frontmatter, should log and skip (or set `error: true`), not reject the whole build.
- **Normalise paths to URL form.** Use `sep`-aware conversion so Windows `\` never leaks into index keys or `toUrl`.
- **Check memory.** `content` holds the raw markdown for every page. That's fine for search on small sites, but it's worth knowing the footprint for large ones.

## Sketch of the scheduling and concurrency parts

```js
/** Run an async function over items with a concurrency cap
 * @template T, R
 * @param {T[]} items Items to process
 * @param {number} limit Max concurrent operations
 * @param {(item: T) => Promise<R>} fn Async worker
 * @return {Promise<R[]>} Results in input order
 */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length), }, worker))
  return results
}

/** Debounced, single-flight trigger for index (re)builds
 * @param {runtimeNode & uibMwNode} node The node instance
 * @param {number} [delay] Debounce delay in ms
 */
function scheduleIndexBuild(node, delay = 300) {
  clearTimeout(node._idxTimer)
  node._idxTimer = setTimeout(async () => {
    if (node._idxRunning) {
      node._idxDirty = true
      return
    }
    node._idxRunning = true
    try {
      do {
        node._idxDirty = false
        await buildIndexes(node)
      } while (node._idxDirty)
    } finally {
      node._idxRunning = false
    }
  }, delay)
}
```

Inside `buildIndexes`, the shape would be:

1. Discover files (your existing search).
2. `mapLimit(files, 32, async (file) => { ... })`, which `stat`s the file, reuses `node.index.get(key)` if `fsMtimeMs` and size match, and otherwise reads and parses it inside try/catch.
3. Assemble `newIndex` and assign `node.index = newIndex` once.
4. Set `node.indexReady = true`.

Also clear `_idxTimer` in your `close` handler so a pending rebuild can't fire after the node is removed.

If you paste the function, I can check it against the points above and give specific diffs rather than a pattern.

> Pasted


Now that I can see both functions, I need to correct one point from my last reply. The watcher does filter well: dotfiles, `_` files and non-`.md` files never trigger a rebuild, so the editor temp-file noise from the forum thread isn't a rebuild problem. Also, since `getMarkdownFile` updates the Map in place and doesn't clear it, there's no empty-index window, so my "build a fresh Map and swap" advice doesn't apply.

I haven't seen `getMarkdownFile`, which is probably where the real per-file cost is, and I haven't run any of this.

## Findings, roughly by impact

1. **A glob failure wipes the whole index.** On error you set `files = []`. The stale-entry loop then deletes every entry and `_indexes-changed` is broadcast. A single unreadable subfolder could do this, since fast-glob throws on errors other than ENOENT unless `suppressErrors` is set. On discovery failure, log and return with the existing index untouched.

2. **The glob patterns look fragile.**
   - `${prefix}**/_*` expands to `…/**` + `**/_*`, i.e. `****/_*`. As far as I know, glob engines only treat `**` as a globstar when it is a whole path segment, so `****` probably behaves like `*`. That means `_*` files and dirs are only excluded one level deep. The three `${prefix}**/…` ignores are probably all affected.
   - Both `fgSync` calls use the same ignore list, so the second (`_index.md`) call adds nothing. `**/*.md` already matches `_index.md`.
   - The patterns embed the absolute source path. Glob-special characters in that path (parentheses, brackets, `!`) change the meaning of the pattern.
   - **Worth testing:** two logs in the forum thread show the same markweb-demo folder indexing 20 files under one path and 0 files under `~/.node-red/...`. I can't say why from the code, but "path contains a dot-folder" is a strong candidate. Running your two `fgSync` calls against that folder would settle it.
   - The fix is `cwd` plus relative patterns, with a plain JS filter applied to the relative path as the single source of truth for the `_`/`.` rules. Dot-prefixed or special-character parent folders then can't matter.

3. **`buildIndexes` and the watcher disagree about `_index.md`.** `buildIndexes` explicitly includes `_index.md`, but the watcher filter returns `false` for any file whose name starts with `_`. Editing `_index.md` therefore never triggers a rebuild. Sharing one `isIndexablePath()` helper fixes this and keeps `walkFolderStructure` consistent too.

4. **Overlapping builds can corrupt the index.** There's no single-flight guard. Say build A globs, then a file is added, then build B globs and adds it. If A finishes last, its `validPaths` lacks the new file and it deletes B's entry. The startup build and the first watcher event can overlap this way. Also, `node.isIndexing` is set back to `false` right after the sync glob, before any file is read, so it doesn't mean what its name says.

5. **A transient read error deletes a good page.** Rejected files aren't in `validPaths`, so if a file is briefly unreadable (editor mid-save, `EBUSY` on Windows) its entry is pruned and it vanishes from nav and search until the next rebuild. Skip pruning for that run when any file failed.

6. **Unbounded parallelism and a blocking glob.** `Promise.allSettled(files.map(...))` opens every file at once, which risks `EMFILE` on big trees. `fgSync` also blocks the event loop on every rebuild, which your TODO already notes.

7. **`serialize(node.index)` costs more than the build.** `v8.serialize` copies every page's raw markdown synchronously, just to print a size in a log line. Sum `content.length` as you go instead.

8. **`globalThis._uibIndexes = {}` resets on every call,** so with two markweb nodes only the last-built instance survives. Use `??=`.

9. **Smaller points**
   - `_indexes-changed` is sent even when nothing changed. If `getMarkdownFile` can report "changed", skip it otherwise, so every client doesn't refetch nav on a touched file.
   - Map insertion order is non-deterministic (your own warning). Sort once at the end.
   - `index.size` against `files.length` is more informative than `files.length` alone.

## Suggested rewrite of `buildIndexes`

```javascript
/** Is a path inside the source folder indexable? Shared by buildIndexes and the file watcher.
 * Any `_` or `.` prefixed folder excludes it. Files must be `.md` and not `_` or `.` prefixed, except `_index.md`.
 * @param {string} relPath Path relative to the source folder, `/` separators
 * @return {boolean} True if the path should be indexed
 */
function isIndexablePath(relPath) {
    const segments = relPath.split('/')
    const file = segments.pop() ?? ''
    if (!file.endsWith('.md')) return false
    if (file.startsWith('.')) return false
    if (file.startsWith('_') && file !== '_index.md') return false
    return !segments.some(seg => seg.startsWith('_') || seg.startsWith('.'))
}

/** Build search & nav indexes. Single-flight: calls made during a run join it and trigger one re-run.
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @return {Promise<void>} Resolves when the index is up to date
 */
function buildIndexes(node) {
    if (node.indexRun) {
        node.indexDirty = true
        return node.indexRun
    }
    node.indexRun = (async () => {
        try {
            do {
                node.indexDirty = false
                await buildIndexesOnce(node)
            } while (node.indexDirty)
            node.indexReady = true
        } finally {
            node.indexRun = null
        }
    })()
    return node.indexRun
}

/** One indexing pass
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @return {Promise<void>}
 */
async function buildIndexesOnce(node) {
    const log = uib.RED.log
    const strt = performance.now()
    const url = node.url
    const index = node.index
    const cwd = node.instanceFolder.replace(/\\/g, '/')

    /** @type {string[]} */
    let files
    try {
        // Relative pattern + cwd: the parent path can't affect matching.
        // `fgAsync` = an async export from libs/fs.cjs (I haven't seen what it exports)
        const found = await fgAsync('**/*.md', { cwd, ignore: ['**/_*/**'], })
        files = found.filter(isIndexablePath).sort().map(rel => `${cwd}/${rel}`)
    } catch (e) {
        // Keep the existing index - an empty list would delete every entry
        log.error(`🌐🕸️🛑[markweb:buildIndex:${url}] Error reading markdown files from "${cwd}": ${e.message}`)
        return
    }

    // `mapLimit` as in my earlier sketch
    const results = await mapLimit(files, 32, async (file) => {
        try {
            return { file, entry: await getMarkdownFile(node, file), }
        } catch (err) {
            return { file, err, }
        }
    })

    const validPaths = new Set()
    let failures = 0
    for (const { file, entry, err, } of results) {
        if (err) {
            failures++
            log.error(`🌐🕸️🛑[markweb:buildIndex:${url}] Skipping file "${file}" due to error: ${err?.message ?? err}`)
        } else if (entry?.path) {
            validPaths.add(entry.path)
        }
    }

    // Only prune if every file was read OK, otherwise a transient error drops a good page
    if (failures === 0) {
        for (const key of index.keys()) {
            if (!validPaths.has(key)) index.delete(key)
        }
    }

    // Deterministic order. Synchronous, so nothing can observe the Map mid-reorder
    const ordered = [...index.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    index.clear()
    for (const [key, doc] of ordered) index.set(key, doc)

    node.sendToFe({ topic: '_indexes-changed', }, node, uib.ioChannels.control)

    // ! TEMPORARY - debugging convenience
    globalThis._uibIndexes ??= {}
    globalThis._uibIndexes[url] = index

    let chars = 0
    for (const doc of index.values()) chars += doc.content?.length ?? 0
    log.info(`🌐🕸️[markweb:buildIndex:${url}] Indexed "${node.instanceFolder}" in ${Math.round(performance.now() - strt)}ms. ${index.size} entries from ${files.length} files, ~${(chars / 1024).toFixed(0)}kb markdown`)
}
```

Initialise `node.indexReady = false` and `node.indexRun = null` in `nodeInstance`, and have the search hook check `node.indexReady` instead of `!index`.

## Watcher changes

```javascript
// Replace the inline filter with the shared helper
const changesCopy = changes.filter(({ eventType: evType, filename: fn, }) => {
    if (evType === 'addDir') return false
    const rel = fn.replace(/\\/g, '/')
    if (evType === 'unlinkDir') return !rel.split('/').some(seg => seg.startsWith('_') || seg.startsWith('.'))
    return isIndexablePath(rel)
})
```

- **Timer on close:** `rebuildTimeout` is a closure local, so the node's `close` handler can't clear it and a rebuild can fire after redeploy. Store it as `node.rebuildTimeout` and `clearTimeout(this.rebuildTimeout)` in the close handler.
- **`_source-change` payload:** `eventType` and `url` come from the last raw event, which may be an irrelevant file. Use `changesCopy.at(-1)`.
- **Logging:** per-event `log.info` is noisy, so `log.debug` or `trace` would be better. Replace `console.error(err)` with the logger.
- **Depth:** the watcher uses `depth: 9` but the glob has no depth limit, so deep files are indexed but never watched. Pick one limit.
- **Optional:** chokidar's `ignored` can also be a function. Check which major version is in `packages/uib-fs-utils` before relying on that.

Send me `getMarkdownFile` and I'll check whether the mtime short-circuit is there and whether it returns the entry or something else, since the pruning logic depends on that.

> Sent

This answers some of what I said I'd need to check, and it also shows a mistake in my last rewrite. Failures in `getMarkdownFile` are returned as `{ error: true, ... }`, not thrown, so `Promise.allSettled` and my `mapLimit` both see them as successes. My `failures` counter would stay at 0 and pruning would run anyway.

## Findings

**1. A read or parse error deletes the page's good index entry.**
- The error objects have no `path`, so `validPaths` never gets the key and `buildIndexes` prunes it.
- A file mid-save, or with front-matter that is briefly invalid while you type, disappears from nav and search until the next clean rebuild.
- A brand-new file with a front-matter error never enters the index at all, since the error object is returned without `index.set`.
- The `Skipping file ... due to error` branch in `buildIndexes` is effectively dead, because `getMarkdownFile` catches everything first.
- The error HTML return shape is probably there for the page handler, which I haven't seen. It's the wrong contract for the indexer.

The simplest fix is to stop deriving the "keep" set from read results. Compute it from the discovered files' URL paths, so a file that exists is never pruned, whether or not it parsed this time.

**2. Files that map to the same key fight each other.**
- `index.md`, `_index.md` and `foo/foo.md` all map to `/foo/`, and the reads run in parallel.
- Each file sees the other's entry with a different `fsMtimeMs`, so it re-reads and overwrites.
- Every rebuild re-reads both files, and the winner depends on which read finishes last.
- Collisions are probably rare, but the result is non-deterministic and nothing warns you. Pick one by explicit precedence and log a warning.

**3. The cache check is thinner than it looks.**
- **mtime only.** Files restored with preserved mtimes (`git checkout`, `rsync -t`, `cp -p`, some sync tools) can change content without changing mtime. Add size.
- **`node.globalAttributes` is baked into each entry** via the spread. If the config watcher reloads those, cached entries keep the old values until each file's mtime changes. I haven't seen `processConfig` or the config watcher, so check whether they clear the index. If not, a version counter on the node fixes it.
- **A failed `stat` leaves `fStats = {}`.** `undefined === undefined` then makes an entry stored without an mtime look permanently fresh. Treat a failed `stat` as an error. Stat-before-read is the right order, because a mid-write race leaves an older mtime and a later re-read.

**4. `created` from `birthtimeMs` is unreliable.**
- Editors that save via temp file plus rename create a new inode, so birthtime resets to the save time. `created` then equals `updated` for those users.
- Birthtime support also varies by filesystem (overlayfs and some Linux setups return 0 or ctime).
- Front-matter should be the only trusted source. Consider leaving `created` empty when it's absent, or documenting the fallback as "approximate".

**5. Root-level `<foldername>.md`.**
- `isFolderNamedIndex` compares against `basename(dirname(file))`. For a file directly in the source folder, that's the instance folder's own name.
- A source folder `docs/` containing `docs.md` is typed `'folder'`, but its key is `/docs`, because the key regex needs a path segment before the repeat.
- It's an edge case, but the type and the key disagree.

**6. Housekeeping**
- `morePath` and `parsedPath` are unused, and `isDemo` is destructured but unused.
- The `@return` JSDoc still says "HTML body", and the function returns three different shapes (`{}`, error object, entry).
- The shallow copy comment promises mutation safety, but `tags` and any nested front-matter objects are shared with the cached entry.
- `from` is stored on the entry and goes stale once cached.
- Splitting the function in two is the real tidy-up. A throwing `loadIndexEntry()` serves the indexer, and a thin `getMarkdownFile()` wrapper does the cache lookup and error-page HTML for the handler.

**7. Outside the function, noticed in `renderSidebarTree`**
- `<a href="${entry.path}">${entry.title}</a>` is unescaped. The `title` attribute only escapes `"`.
- A front-matter title containing `<` or `&`, or a filename containing `"`, breaks the markup.
- The content comes from the site author, so it's a robustness problem more than a security one, but an `escapeHtml` helper would be cheap.

## Changes

Extract the path logic from `getMarkdownFile` so both functions share it:

```javascript
/** Convert a source file path to its relative path and index key
 * @param {string} instanceFolder The node's source folder
 * @param {string} file FS path to a markdown file
 * @return {{relativePath: string, urlPath: string}} Relative path (`/` separators) and index key
 */
function fileToUrlPath(instanceFolder, file) {
  const relativePath = relative(instanceFolder, file).replace(/\\/g, '/')
  const urlPath = '/' + relativePath
    .replace(/\.md$/, '')
    .replace(/(^|\/)_index$/, '$1')
    .replace(/(^|\/)index$/, '$1')
    .replace(/(^|\/)([^/]+)\/\2$/, '$1$2/')
  return { relativePath, urlPath, }
}
```

In `buildIndexesOnce`, replace everything from the `mapLimit` call to the prune loop with this. It resolves collisions up front, derives the keep set from discovery, and no longer depends on read results:

```javascript
const rank = f => ({ 'index.md': 0, '_index.md': 1, }[basename(f)] ?? 2)

/** @type {Map<string, string>} index key -> source file */
const wanted = new Map()
for (const file of files) {
  const { urlPath, } = fileToUrlPath(node.instanceFolder, file)
  const prev = wanted.get(urlPath)
  if (!prev) {
    wanted.set(urlPath, file)
    continue
  }
  const [keep, drop,] = rank(file) < rank(prev) ? [file, prev,] : [prev, file,]
  log.warn(`🌐🕸️⚠️[markweb:buildIndex:${url}] "${drop}" and "${keep}" both map to "${urlPath}". Using "${basename(keep)}"`)
  wanted.set(urlPath, keep)
}

await mapLimit([...wanted.values(),], 32, async (file) => {
  try {
    await getMarkdownFile(node, file, undefined, undefined, 'buildIndexes')
  } catch (err) {
    log.error(`🌐🕸️🛑[markweb:buildIndex:${url}] Skipping file "${file}" due to error: ${err.message}`)
  }
})

// Prune only entries whose source file no longer exists. Errored files keep their last good entry
for (const key of index.keys()) {
  if (!wanted.has(key)) index.delete(key)
}
```

In `getMarkdownFile`, replace the `relativePath`/`urlPath` block with `const { relativePath, urlPath, } = fileToUrlPath(instanceFolder, file)`, then replace the `stat` and `needToUpd` blocks with:

```javascript
let fStats
try {
  fStats = await stat(file)
} catch (err) {
  log.error(`🌐🕸️🛑[markweb:getMarkdownFile:${url}] Cannot stat "${file}". ${err.message}`)
  return {
    error: true,
    title: 'Error',
    description: `Error reading markdown file "${file}"`,
    content: `<h1>Error</h1><p>There was an error reading the requested markdown file.</p><pre>${err.message}</pre>`,
  }
}

const existing = index.get(urlPath)
if (
  existing
  && existing.file === filename
  && existing.fsMtimeMs === fStats.mtimeMs
  && existing.fsSize === fStats.size
  && existing.attrsVersion === node.attrsVersion // bump this wherever globalAttributes are (re)loaded
) {
  return { ...existing, }
}
```

Then drop the `needToUpd` flag, de-indent the read/parse block, and add `fsSize: fStats.size` and `attrsVersion: node.attrsVersion` to the `attributes` object. Add `fsSize` and `attrsVersion` to the `MarkwebIndexEntry` typedef. `node.attrsVersion` needs initialising to `0` in `nodeInstance`.

Change 1 and the dedupe stand on their own if you only want the minimal fix. The `attrsVersion` part only matters if the config watcher can change `globalAttributes` at runtime.

If you send me `processConfig` and the page `handler`, I can check the `globalAttributes` reload path. I can also see whether the handler relies on `getMarkdownFile` returning the error-page shape before you split it.

