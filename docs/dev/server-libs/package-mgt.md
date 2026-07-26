---
created: 2026-07-22 15:29:55
updated: 2026-07-22 16:56:03
---
# `nodes/libs/package-mgt.cjs`

> [!NOTE]
> This information was AI generated.

## Overview

This module implements the package-management layer used by the uibuilder runtime to inspect, install, remove, update, and describe npm packages associated with a uibuilder root folder and individual uibuilder instances.

It is exported as a **singleton**: requiring the module returns one shared `UibPackages` instance that maintains internal state across calls.

## Purpose and responsibilities

The file is responsible for:

- Ensuring a uibuilder root `package.json` exists and has the expected structure.
- Reading installed package metadata from npm.
- Normalizing package information into `package.json.uibuilder.packages`.
- Installing, uninstalling, and updating npm packages through child-process execution.
- Reading npm scripts from instance-specific `package.json` files.
- Locating instance root folders and package folders for serving vendor assets.

It sits between:

- the filesystem (`package.json`, backups, template copy),
- npm CLI commands (`npm list`, `npm outdated`, `npm install`, `npm uninstall`, `npm update`, `npm run`),
- and the runtime configuration exposed by `uibGlobalConfig`.

## Architecture / key concepts

### Singleton module

The module ends with:

```js
const uibPackages = new UibPackages()
module.exports = uibPackages
```

This means:

- only one manager instance is expected to exist,
- internal state is shared globally within the Node.js process,
- callers must treat it as a long-lived service object rather than a disposable utility.

### Configuration lifecycle

The class uses a setup gate:

- `setup()` must be called before most operational methods.
- `#isConfigured` prevents repeated setup.
- Several methods throw or warn if setup has not occurred.

### State mutation

The module stores mutable runtime state on the instance:

- `this.uibPackageJson`
- `this.dependencyDetails`
- `this.dependencyProblems`
- `this.globalPrefix`
- `this.log`, `this.RED`, `this.uib`

This state is updated by `setup()`, `pkgCheck()`, `pkgsQuickUpd()`, and `updateInstalledPackageDetails()`.

### Two-stage package metadata update

The package metadata workflow is intentionally split:

- **Fast sync update** via `pkgsQuickUpd()` to populate enough information for serving vendor packages.
- **Slow async update** via `updateInstalledPackageDetails()` to enrich package entries and rewrite `package.json`.

## API reference

## Export

### `module.exports = uibPackages`

Exports a singleton `UibPackages` instance.

---

## Class: `UibPackages`

### Constructor

Initializes the instance and attempts to read npm’s global prefix immediately.

#### Behavior

- Calls `npmGetGlobalPrefix()`.
- Assigns the result to `this.globalPrefix`.
- The call is not awaited; `globalPrefix` will therefore receive a promise rather than a resolved string unless the surrounding runtime handles it elsewhere.

#### Important note

This is a notable implementation issue: `npmGetGlobalPrefix()` is declared `async`, but the constructor calls it synchronously. That means `this.globalPrefix` is likely a `Promise`, not a string.

---

### `async npmGetGlobalPrefix()`

Gets npm’s global install prefix by executing:

```bash
npm config get prefix
```

#### Returns

- `Promise<string>`: the raw output string from the command.

#### Side effects

- Mutates `this.npmCmdOpts.out` to `'bare'`.

#### Errors

- Throws a wrapped `Error` if `runOsCmd()` fails.
- Adds:
  - `all = ''`
  - `code = 3`
  - `command = 'npm config get prefix'`

---

### `setup()`

Configures the manager with runtime globals and prepares the uibuilder root package state.

#### Responsibilities

- Validates `uibGlobalConfig.RED` and `uibGlobalConfig.rootFolder`.
- Prevents repeated setup.
- Stores references to `RED`, `uib`, and `log`.
- Ensures the uibuilder root `package.json` exists.
- Calls `pkgCheck()`.
- Synchronizes the package metadata version with `this.uib.version`.
- Emits delayed warnings if dependency problems exist.
- Performs a quick in-memory package update.
- Kicks off asynchronous detailed metadata refresh.

#### Returns

- `void`

#### Side effects

- May create `package.json` from a template.
- May mutate `this.uibPackageJson`.
- Starts an async write to `package.json` via `updateInstalledPackageDetails()`.
- Sets `#isConfigured = true`.

#### Errors

- Throws if `uib.RED` is `null`.
- Throws if `uib.rootFolder` is `null`.

---

### `createBasicPj()`

Creates a minimal root `package.json` by copying a template file.

#### Behavior

Copies:

- source: `templates/uibroot-package.json`
- destination: `<uib.rootFolder>/package.json`

#### Returns

- `void`

#### Side effects

- Writes a new `package.json` file.
- Logs success or failure.

#### Errors

- Errors are caught and logged; the method does not rethrow.

---

### `pkgCheck()`

Runs `npm list` in the uibuilder root folder and normalizes the result.

#### Command executed

```bash
npm list --long --omit=dev --json --depth=0
```

#### Returns

- The parsed npm JSON object, with some normalization:
  - `dependencyDetails` saved separately from `out.dependencies`
  - `out.dependencies` replaced with `out._dependencies`
  - `extraneous` removed
  - `problems` moved to `this.dependencyProblems`

#### Side effects

- Sets:
  - `this.dependencyDetails`
  - `this.dependencyProblems` when npm reports problems

#### Errors

- If the npm command or JSON parse fails, the error is logged and execution continues with the partially initialized `out` value.
- The method does not rethrow; this means downstream code must be tolerant of incomplete results.

#### Important note

If JSON parsing fails, `out` may be undefined, but the method still proceeds to read `out.dependencies`. That is a potential runtime hazard.

---

### `pkgsQuickUpd()`

Performs a fast normalization of `package.json.uibuilder.packages`.

#### Responsibilities

- Ensures:
  - `dependencies` exists,
  - `uibuilder` exists,
  - `uibuilder.packages` exists.
- Removes package entries no longer listed in root dependencies.
- Adds missing package entries for dependencies.
- Assigns:
  - `installFolder`
  - `packageUrl`

#### Returns

- `void`

#### Side effects

- Mutates `this.uibPackageJson.uibuilder.packages` in memory.

#### Notes

- Uses `this.dependencyDetails[pkgName].path` when available.
- Falls back to `join(this.uib.rootFolder, 'node_modules', pkgName)`.

#### Risk

If `this.dependencyDetails[pkgName]` is missing, accessing `.path` will throw. The code assumes `pkgCheck()` populated details for every dependency.

---

### `async writePackageJson(folder, json)`

Writes a `package.json` file and makes a backup first.

#### Parameters

- `folder` (`string`): target folder
- `json` (`object`): JSON data to write

#### Behavior

- Copies `<folder>/package.json` to `<folder>/package.json.bak`
- Writes the new JSON file with 2-space indentation

#### Returns

- `Promise<void>`

#### Side effects

- Creates or updates:
  - `package.json.bak`
  - `package.json`

#### Errors

- Copy failures are logged but do not stop the write attempt.
- Write failures are logged.

---

### `async updIndividualPkgDetails(pkgName, dependencyDetails)`

Enriches one package entry in `uibPackageJson.uibuilder.packages`.

#### Parameters

- `pkgName` (`string`): package name
- `dependencyDetails` (`object`): npm `list` output for installed packages

#### Behavior

If the package is listed in root dependencies:

- Stores `spec` from `pj.dependencies[pkgName]`
- If npm reports the package as missing:
  - sets `missing = true`
  - sets `problems`
- Otherwise stores:
  - `installFolder`
  - `installedVersion`
  - `estimatedEntryPoint`
  - `homepage`
  - `packageUrl`
  - `url`
  - `scope` for scoped packages
  - `installedFrom`
  - `outdated`

#### `estimatedEntryPoint` resolution order

1. `browser` if it is a string
2. `jsdelivr`
3. `unpkg`
4. `main`
5. `?`

If the resolved entry point is `"none"`, it is converted to `?`.

#### Outdated version behavior

- If dependency spec contains `:`, the package is treated as non-npm-sourced:
  - `latestVersion = null`
  - `installedFrom` derived from the spec prefix
  - `outdated = {}`
- Otherwise it calls `npmOutdated(pkgName)` and parses the result.

#### Returns

- `Promise<void>`

#### Side effects

- Mutates `this.uibPackageJson.uibuilder.packages[pkgName]`.

#### Errors

- Throws if `this.uibPackageJson` is `null`.
- Throws if `pj.uibuilder`, `pj.uibuilder.packages`, or `pj.dependencies` are undefined.
- May log a warning if `npm outdated` output cannot be parsed.

#### Important note

For scoped packages, `pkg.scope` is derived using `pkg.packageUrl`, which is still set to `/' + pkgName`. This logic is somewhat unusual and should be reviewed carefully if scoped package URL behavior matters.

---

### `async updateInstalledPackageDetails()`

Refreshes detailed metadata for all installed packages and rewrites the root `package.json`.

#### Behavior

- Iterates over all keys in `this.dependencyDetails`.
- Calls `updIndividualPkgDetails()` for each package in parallel via `Promise.all`.
- Writes the updated `package.json` back to the root folder.

#### Returns

- `Promise<void>`

#### Side effects

- Mutates `this.uibPackageJson`.
- Writes `package.json`.

#### Notes

- This is the slower, asynchronous metadata refresh started from `setup()`.
- The write is not awaited in the final line, so the method returns before the file write necessarily completes.

---

### `getInstanceNode(url)`

Finds the Node-RED node associated with a uibuilder instance URL.

#### Parameters

- `url` (`string`): instance URL/name

#### Returns

- `uibNode | null`

#### Behavior

- Searches `this.uib.instances`.
- Uses `RED.nodes.getNode(key)` to resolve the node object.

#### Notes

- If multiple entries match, the last matching node wins.

---

### `getInstanceRootFolder(url)`

Gets the filesystem root folder for a uibuilder instance.

#### Parameters

- `url` (`string`): instance URL/name

#### Returns

- `string | null`

#### Errors

- Throws if `this.log` is undefined.
- Throws if `this.uib` is not available.
- Throws if `this.uib.RED` is `null`.

#### Behavior

- Calls `getInstanceNode(url)`.
- Returns `node.instanceFolder` when available.
- Logs a warning and returns `null` if no node is found.

---

### `getInstanceNpmScriptNames(url)`

Lists npm script names from an instance’s `package.json`.

#### Parameters

- `url` (`string`): instance URL/name

#### Returns

- `Array<string>`

#### Behavior

- Requires setup to have completed.
- Resolves the instance root folder.
- Reads `<rootFolder>/package.json` synchronously.
- Returns `Object.keys(pj.scripts || {})`.

#### Errors

- Logs and returns `[]` if `package.json` cannot be read.
- Returns `[]` if setup has not been called or the root folder cannot be found.

---

### `getPackagePath2(packageName, installRoot)`

Searches for an installed package folder under one or more root folders.

#### Parameters

- `packageName` (`string`)
- `installRoot` (`string | Array<string>`)

#### Returns

- `string | null`

#### Behavior

- Normalizes `installRoot` to an array.
- Checks each:
  - `<root>/node_modules/<packageName>`
- Returns the first matching path.

#### Errors

- Returns `null` and logs a warning if not found.
- Returns `null` if setup has not been called.

---

### `isPackageInstalled(packageName)`

Checks whether a package is listed in `uibPackageJson.uibuilder.packages`.

#### Parameters

- `packageName` (`string`)

#### Returns

- `boolean`

#### Behavior

- Does **not** verify physical installation.
- Only checks the in-memory package metadata object.

---

### `async npmInstallPackage(url, pkgName, tag = '', toLocation = '', action = 'install')`

Installs or updates a package using npm.

#### Parameters

- `url` (`string`): instance URL/name, used only in error messages
- `pkgName` (`string`): npm package name
- `tag` (`string`): version/tag/branch specifier, appended directly to `pkgName`
- `toLocation` (`string`): target folder; defaults to uibuilder root
- `action` (`'install' | 'update'`)

#### Command executed

Conceptually:

```bash
npm install <pkgName><tag> --no-fund --no-audit --no-update-notifier --save --production --color=false
```

or `npm update ...` when `action === 'update'`.

#### Returns

- `Promise<{all:string, code:number, command:string}>`

#### Side effects

- Runs npm in the target directory.
- Modifies `package.json` and `node_modules` through npm.
- Logs npm output on success.

#### Errors

- Wraps and rethrows command failures.
- Throws if npm returns a nonzero exit code.

---

### `async npmRemovePackage(pkgName)`

Uninstalls a package via npm.

#### Parameters

- `pkgName` (`string`)

#### Command executed

```bash
npm uninstall --save --color=false --no-fund --no-audit --no-update-notifier <pkgName>
```

#### Returns

- `Promise<{all:string, code:number, command:string}>`

#### Side effects

- Removes the dependency from the target `package.json`.
- Alters installed packages in `node_modules`.

#### Errors

- Wraps and rethrows command failures.
- Throws if npm returns a nonzero exit code.

---

### `async npmOutdated(pkgName)`

Checks whether a package is outdated.

#### Parameters

- `pkgName` (`string`)

#### Command executed

```bash
npm outdated --json <pkgName>
```

#### Returns

- `Promise<string | undefined>`

#### Behavior

- Returns the raw JSON string output from npm.
- Used by `updIndividualPkgDetails()` to build the `outdated` object.

#### Errors

- Wraps and rethrows command failures.

---

### `async npmUpdate(pkgName)`

Updates a package via npm.

#### Parameters

- `pkgName` (`string`)

#### Command executed

```bash
npm update --no-fund --no-audit --no-update-notifier --save --production --color=false <pkgName>
```

#### Returns

- `Promise<{all:string, code:number, command:string}>`

#### Side effects

- Updates package files and installed modules.

#### Errors

- Wraps and rethrows command failures.
- Throws if npm returns a nonzero exit code.

#### Note

The method is marked “Not yet in use” in the source.

---

### `npmRunScript(scriptName, url, streamOutput)`

Runs an npm script in the context of a uibuilder instance.

#### Parameters

- `scriptName` (`string`): npm script name
- `url` (`string`): instance URL/name
- `streamOutput` (`Function`, optional): called with output chunks as they arrive

#### Returns

- `Promise<{all:string, code:number, command:string, pid?: number}>`

#### Behavior

- Resolves the instance root folder.
- Runs:
  - `npm run <scriptName>` for most scripts
  - but omits `run` when `scriptName` is one of `outdated`, `update`, or `install`
- Adds flags:
  - `--long`
  - `--no-fund`
  - `--no-audit`
  - `--no-update-notifier`
  - `--no-progress`
  - `--color=false`
- Supports streaming output via `opts.stream`.
- Captures child-process reference via `opts.childProcess`.

#### Errors

- Throws if setup has not been called.
- Throws if `scriptName` is missing.
- Throws if the instance root folder cannot be found.
- Rejects if the spawned command exits with code greater than 1.
- Wraps lower-level command failures.

#### Important note

The returned promise is annotated with `pid`, but the code assigns it immediately after creating the promise. Because the child process reference is captured asynchronously, `pid` may be `null` at assignment time.

## Behavior details

## File and package workflow

### Root package setup

1. Check whether `<uib.rootFolder>/package.json` exists.
2. Copy a template if missing.
3. Run `npm list` to inspect installed packages.
4. Normalize package metadata in memory.
5. Update the root package version to match `this.uib.version`.
6. Update `uibuilder.packages` quickly for serving purposes.
7. Refresh detailed metadata asynchronously.
8. Write the updated `package.json` back to disk.

### Package metadata normalization

The module stores package information in two places:

- `dependencies`: package version/spec declarations
- `uibuilder.packages`: generated metadata for UI and runtime use

This module keeps them aligned but does not fully guarantee consistency if `pkgCheck()` fails or if asynchronous writes fail.

### npm child-process usage

All npm operations are performed through `runOsCmd()` or `runOsCmdSync()` from `./uiblib.cjs`.

This means:

- commands execute in child processes,
- results depend on the host machine’s npm installation,
- command behavior may vary with npm version and platform,
- timeouts and shell execution are controlled by `this.npmCmdOpts`.

## Error handling

The file uses a mix of strategies:

- **Hard failures**: throw immediately when required runtime state is missing.
- **Soft failures**: log the error and continue when package inspection or file write operations fail.
- **Wrapped command failures**: attach extra fields to errors from npm commands.

### Common error fields

When wrapping npm failures, the code often assigns:

- `all`
- `code`
- `command`

This preserves command output and exit information for upstream handlers.

### Missing runtime assumptions

Several methods assume prior setup and/or populated state. Failure to satisfy those assumptions can produce:

- thrown errors,
- warnings with `[]`/`null` fallback values,
- or downstream property-access failures if expected metadata is absent.

## Dependencies and integration points

### Local dependencies

- `node:path`

---

