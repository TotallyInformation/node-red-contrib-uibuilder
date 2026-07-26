---
title: Road map for the package-mgt.cjs library
description: |
  This page is a working document to track the development of the package-mgt.cjs library. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development. It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-07-22 16:56:33
author: Julian Knight (Totally Information)
---

* uibRoot package.json - add check if dependencies blank but `node_modules` is not empty, if so, repopulate? Need to decide when to check - on commit at least.

## 2026-07-22 AI Issues found in `nodes/libs/package-mgt.cjs`

### 1. `globalPrefix` is set to a **Promise**, not a string

**Reason:** The constructor assigns `this.globalPrefix = this.npmGetGlobalPrefix()`, but `npmGetGlobalPrefix()` is `async`, so it returns a promise. The property is documented as a string, but it will hold a pending promise unless awaited. This can break any later code that assumes `globalPrefix` is immediately usable.  
**Possible fix:** Make the constructor synchronous by not calling the async function there, or initialize `globalPrefix` in an async setup step and `await` it.

### 2. `npmGetGlobalPrefix()` mutates shared command options

**Reason:** It assigns `const opts = this.npmCmdOpts` and then changes `opts.out = 'bare'`. Because `opts` is the same object as `this.npmCmdOpts`, later npm commands inherit that modified output mode unexpectedly. That is a state-leak bug.  
**Possible fix:** Clone the options first, e.g. `const opts = { ...this.npmCmdOpts }`.

### 3. `pkgCheck()` can leave `out` undefined on command failure

**Reason:** If `runOsCmdSync()` or `JSON.parse()` throws, the catch block only logs the error. Execution continues and later code does `out.dependencies`, `out._dependencies`, etc., which will throw if `out` is undefined.  
**Possible fix:** Return early on failure or initialize `out` to a safe default object before the `try`.

### 4. `pkgCheck()` assumes npm output always has `dependencies`

**Reason:** The code unconditionally accesses `out.dependencies`, but `npm list --json` can omit or restructure fields depending on errors, missing modules, or npm version behavior. This can crash on valid-but-unexpected output.  
**Possible fix:** Guard all property access, e.g. `this.dependencyDetails = out?.dependencies || {}`.

### 5. `pkgsQuickUpd()` assumes `this.dependencyDetails[pkgName]` always exists

**Reason:** It does `this.dependencyDetails[pkgName].path` without checking whether `this.dependencyDetails[pkgName]` is defined. If npm did not return a dependency entry, this becomes a `TypeError`.  
**Possible fix:** Use optional chaining and a fallback, e.g. `this.dependencyDetails?.[pkgName]?.path || ...`.

### 6. `pkgsQuickUpd()` mutates package metadata without persisting it

**Reason:** The function updates `this.uibPackageJson.uibuilder.packages`, but the commented-out write means the in-memory state is changed while the file is not saved. That may be intentional, but it is inconsistent with the comment and can lead to surprising behavior if callers expect the file to be updated.  
**Possible fix:** Either restore the write step or update the documentation/comments to clearly state that this is in-memory only.

### 7. `createBasicPj()` has a malformed log message and likely typo

**Reason:** The trace message contains `uibuilder[:package-mgt:createBasicPj]`, which appears malformed. This is not a runtime bug, but it reduces log quality and makes troubleshooting harder.  
**Possible fix:** Correct the string formatting.

### 8. `updateInstalledPackageDetails()` writes asynchronously without awaiting the write

**Reason:** It calls `this.writePackageJson(rootFolder, pj)` but does not `await` it. Since the method itself is `async`, callers may assume the file write has completed when the promise resolves, but it may still be in progress.  
**Possible fix:** `await this.writePackageJson(rootFolder, pj)`.

### 9. `writePackageJson()` backup failure does not stop the write

**Reason:** If creating the `.bak` copy fails, the function logs an error but still proceeds to overwrite the main `package.json`. If the backup is important for rollback safety, this weakens recovery guarantees.  
**Possible fix:** If backup creation is required, return/throw on backup failure before writing the main file.

### 10. `npmInstallPackage()` and `npmUpdate()` use `--production` with `--save`

**Reason:** These commands are tailored to production dependencies, but `--save` is legacy behavior and npm versions differ in how they treat it. In modern npm, package saving behavior is usually controlled by default install semantics and lockfile handling. This can cause inconsistent dependency recording across environments.  
**Possible fix:** Review the intended npm version support and replace legacy flags with the current preferred install/update workflow.

### 11. `npmInstallPackage()` and `npmUpdate()` may expose the app to supply-chain risk by running package lifecycle scripts

**Reason:** These functions invoke `npm install` / `npm update` directly. npm install scripts can execute arbitrary code during dependency installation, which is a known supply-chain risk. OWASP recommends considering `ignore-scripts=true` to reduce malicious module attack surface.[1][5][6]  
**Possible fix:** Add an option to run installs with `--ignore-scripts` or support a hardened install mode by default for untrusted packages.

### 12. `npmInstallPackage()`/`npmRemovePackage()` modify dependencies without integrity checks

**Reason:** The code installs/uninstalls packages directly from npm and trusts the registry result. Security guidance recommends pinning versions, using lockfiles, reviewing dependency changes, and auditing dependencies to reduce supply-chain risk.[2][6][8]  
**Possible fix:** Fix unknown, though a practical improvement would be to validate package versions against a lockfile or run `npm audit` after changes.

### 13. `npmOutdated()` can throw for expected npm states but the caller treats it like a normal result

**Reason:** `updIndividualPkgDetails()` calls `await this.npmOutdated(pkgName) ?? '{}'`, but `npm outdated` often exits non-zero or returns non-JSON in edge cases. If parsing fails, the function logs a warning and keeps going, which can leave `pkg.outdated` in an inconsistent shape.  
**Possible fix:** Normalize the return value to a consistent object shape, even on error.

### 14. `updIndividualPkgDetails()` can crash if `dependencyDetails` is missing entries

**Reason:** It assigns `const lsp = dependencyDetails[pkgName]` and then immediately reads properties like `lsp.missing`. If the package is absent from the dependency report, this is a null/undefined dereference.  
**Possible fix:** Guard with `if (!lsp) { ... }` before accessing its fields.

### 15. `updIndividualPkgDetails()` overwrites the package entry unconditionally

**Reason:** `packages[pkgName] = {}` destroys any pre-existing metadata on that package and then rebuilds it. If another part of the application stores extra package metadata there, it will be lost.  
**Possible fix:** Merge into the existing object instead of replacing it.

### 16. `npmRunScript()` builds an invalid `npm` command for normal scripts in some cases

**Reason:** The args array uses `!['outdated', 'update', 'install'].includes(scriptName) ? 'run' : ''`. If `scriptName` is one of those words, the command becomes `npm  outdated ...` or similar, which is not a valid script invocation and may run the wrong npm subcommand behavior.  
**Possible fix:** Separate npm lifecycle commands from custom scripts and call the correct subcommand explicitly.

### 17. `npmRunScript()` passes `--long` to arbitrary scripts

**Reason:** `--long` is an npm CLI option, not a script option. When using `npm run <script>`, options after the script name are passed to the script, but placing `--long` there may break scripts that do not expect it.  
**Possible fix:** Remove `--long` unless the target script specifically needs it.

### 18. `npmRunScript()` returns `promise.pid` before the child process is guaranteed to exist

**Reason:** `opts.childProcess` sets `childProcessRef` asynchronously, but `promise.pid = childProcessRef ? childProcessRef.pid : null` is assigned immediately. In practice this can often be `null` even when a process exists.  
**Possible fix:** Expose the child-process reference through the resolved result or attach it after `runOsCmd` creates it.

### 19. `npmRunScript()` documentation says the promise has `.kill()`, but no kill method is attached

**Reason:** The JSDoc says “with .kill() method,” but the implementation only sets `pid`. There is no `.kill()` on the returned promise. This is a contract mismatch and likely a bug in the API design.  
**Possible fix:** Either implement `.kill()` or remove that promise contract from the documentation.

### 20. `getInstanceNode()` can return the wrong node if multiple entries share the same URL

**Reason:** It loops through all instances and keeps assigning `node` whenever `value === url`, so the last match wins. If duplicates exist, results are ambiguous.  
**Possible fix:** Return immediately on first match or enforce unique URLs.

### 21. Several methods rely on `this.log` and `this.uib` without fully enforcing initialization order

**Reason:** Some methods check `this.#isConfigured`, while others only check `this.log` or `this.uib`. This inconsistent guard strategy can cause runtime errors if methods are called out of sequence.  
**Possible fix:** Standardize initialization checks across all public methods.

### 22. Error handling is inconsistent and sometimes suppresses failures

**Reason:** In methods like `pkgCheck()` and `writePackageJson()`, errors are logged but execution continues. In other methods, errors are thrown. This inconsistency makes failure behavior difficult to reason about and may hide problems until later crashes occur.  
**Possible fix:** Normalize the error strategy: either fail fast or return structured error objects consistently.

### 23. The package management flow may overwrite user changes to `package.json`

**Reason:** `setup()` and `updateInstalledPackageDetails()` rewrite the root `package.json` after reading and mutating it. If the file contains user-added metadata outside the fields this code manages, those changes can be lost if the object is replaced or not preserved carefully.  
**Possible fix:** Merge only the managed subtrees and preserve unrelated fields.

### 24. Some comments and naming are inconsistent or misleading

**Reason:** Examples include `pkgCheck` vs `pkgCheckCmd`, `packagedetails` vs `packages`, and the comment in `npmInstallPackage()` saying “NOTE: This fn does not update the list of packages” while the surrounding flow clearly does update package metadata later. These inconsistencies increase maintenance risk.  
**Possible fix:** Update comments to match actual behavior.

### 25. The code may be vulnerable to dependency confusion if used with unscoped internal packages

**Reason:** The library installs packages by name and constructs URLs directly from package names. OWASP recommends using scoped internal package names and explicitly routing scopes to private registries to reduce dependency-confusion risk.[1][5]  
**Possible fix:** Prefer scoped private packages and enforce registry configuration for internal dependencies.
