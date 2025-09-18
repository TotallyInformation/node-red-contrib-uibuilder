var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

// src/front-end-module/uibrouter.mjs
var _instanceExists, _startDone;
var _UibRouter = class _UibRouter {
  // #endregion --- ----- ---
  // #region --- Internal Methods ---
  /** Class constructor
   * @param {UibRouterConfig} routerConfig Configuration object
   */
  constructor(routerConfig) {
    /** Configuration settings @type {UibRouterConfig} */
    __publicField(this, "config");
    /** Reference to the container DOM element - set in setup() @type {HTMLDivElement} */
    __publicField(this, "routeContainerEl");
    /** The current route id after doRoute() has been called */
    __publicField(this, "currentRouteId");
    /** The previous route id after doRoute() has been called */
    __publicField(this, "previousRouteId");
    /** Array of route ID's (created in constructor) */
    __publicField(this, "routeIds", []);
    /** Internal only. Set to true when the _start() method has been called */
    __privateAdd(this, _startDone, false);
    __publicField(this, "safety", 0);
    __publicField(this, "uibuilder", false);
    if (__privateGet(_UibRouter, _instanceExists)) throw new Error("[uibrouter:constructor] Only 1 instance of a UibRouter may exist on the page.");
    if (!fetch) throw new Error("[uibrouter:constructor] UibRouter requires `fetch`. Please use a current browser or load a fetch polyfill.");
    if (!routerConfig) throw new Error("[uibrouter:constructor] No config provided");
    if (!routerConfig.routes) throw new Error("[uibrouter:constructor] No routes provided in routerConfig");
    this.config = routerConfig;
    if (!this.config.defaultRoute && this.config.routes[0] && this.config.routes[0].id) this.config.defaultRoute = this.config.routes[0].id;
    if (!this.config.hide) this.config.hide = false;
    if (!this.config.templateLoadAll) this.config.templateLoadAll = false;
    if (!this.config.templateUnload) this.config.templateUnload = true;
    this._normaliseRouteDefns(this.config.routes);
    if (window["markdownit"]) this._markdownIt();
    if (window["uibuilder"]) {
      this.uibuilder = true;
      uibuilder.set("uibrouterinstance", this);
    }
    this._setRouteContainer();
    if (this.config.otherLoad) this.loadOther(this.config.otherLoad);
    this._updateRouteIds();
    if (this.config.routeMenus) this.createMenus(this.config.routeMenus);
    if (this.config.templateLoadAll === false) {
      this._start();
    } else {
      console.info("[uibrouter] Pre-loading all external templates");
      Promise.allSettled(
        Object.values(routerConfig.routes).filter((r) => r.type && r.type === "url").map(this._loadExternal)
      ).then((results) => {
        results.filter((res) => res.status === "rejected").forEach((res) => {
          console.error(res.reason);
        });
        results.filter((res) => res.status === "fulfilled").forEach((res) => {
          console.log("allSettled results", res, results);
          this._appendExternalTemplates(res.value);
        });
        this._start();
        return true;
      }).catch((reason) => {
        console.error(reason);
      });
    }
    __privateSet(_UibRouter, _instanceExists, true);
  }
  /** Save a reference to, and create if necessary, the HTML element to hold routes
   * @throws if the route container could not be set
   */
  _setRouteContainer() {
    if (!this.config.routeContainer) {
      this.config.routeContainer = "#uibdefaultroutecontainer";
      console.warn("[uibrouter:constructor] No route container defined in config, using default: `#uibdefaultroutecontainer`");
    }
    const routeContainerEl = this.routeContainerEl = document.querySelector(this.config.routeContainer);
    if (!routeContainerEl) {
      if (this.config.routeContainer === "#uibdefaultroutecontainer") {
        const tempContainer = document.createElement("div");
        tempContainer.setAttribute("id", this.config.routeContainer.replace("#", ""));
        document.body.append(tempContainer);
        console.warn("[uibrouter:_setRouteContainer] Route container element with CSS selector '".concat(this.config.routeContainer, "' not found in HTML. Created a new element attached to body."));
      } else {
        throw new Error("[uibrouter] Route container element with CSS selector '".concat(this.config.routeContainer, "' not found in HTML. Cannot proceed."));
      }
    }
    this.routeContainerEl = document.querySelector(this.config.routeContainer);
  }
  /** Apply fetched external elements to templates tags under the head tag
   * @param {HTMLElement[]} loadedElements Array of loaded external elements to add as templates to the head tag
   * @returns {number} Count of load errors
   */
  _appendExternalTemplates(loadedElements) {
    if (!Array.isArray(loadedElements)) loadedElements = [loadedElements];
    const head = document.getElementsByTagName("head")[0];
    let errors = 0;
    loadedElements.forEach((element) => {
      if (Array.isArray(element)) {
        console.error(...element);
        errors++;
      } else {
        head.append(element);
      }
    });
    return errors;
  }
  /** Called once all external templates have been loaded */
  async _start() {
    if (__privateGet(this, _startDone) === true) return;
    await this.doRoute(this.keepHashFromUrl(window.location.hash));
    window.addEventListener("hashchange", (event) => this._hashChange(event));
    document.dispatchEvent(new CustomEvent("uibrouter:loaded"));
    if (this.uibuilder) uibuilder.set("uibrouter", "loaded");
    __privateSet(this, _startDone, true);
  }
  /** Called when the URL Hash changes
   * @param {HashChangeEvent} event URL Hash change event object
   */
  _hashChange(event) {
    this.doRoute(event);
  }
  /** Loads an external HTML file into a `<template>` tag, adding the router id as the template id. Or throws.
   * @param {routeDefinition} routeDefinition Configuration for a single route
   * @returns {HTMLTemplateElement[]} An HTMLTemplateElement that will provide the route content
   */
  async _loadExternal(routeDefinition) {
    if (!routeDefinition) throw new Error("[uibrouter:loadExternal] Error loading route template. No route definition provided.");
    if (!routeDefinition.src) {
      if (!routeDefinition.type || routeDefinition.type && routeDefinition.type !== "url") routeDefinition.src = routeDefinition.id;
      else throw new Error("[uibrouter:loadExternal] Error loading route template. `src` property not defined");
    }
    const id = routeDefinition.id;
    let response;
    try {
      response = await fetch(routeDefinition.src);
    } catch (e) {
      throw new Error("[uibrouter:loadExternal] Error loading route template HTML for route: ".concat(routeDefinition.id, ", src: ").concat(routeDefinition.src, ". Error: ").concat(e.message), e);
    }
    if (response.ok === false) throw new Error("[uibrouter:loadExternal] Fetch failed to return data for route: ".concat(routeDefinition.id, ", src: ").concat(routeDefinition.src, ". Status: ").concat(response.statusText, " (").concat(response.status, ")"), [routeDefinition.id, routeDefinition.src, response.status, response.statusText]);
    let htmlText = await response.text();
    if (window["markdownit"] && routeDefinition.format === "md") {
      htmlText = this.renderMarkdown(htmlText);
    }
    try {
      const chkTemplate = document.querySelector("#".concat(id));
      if (chkTemplate) chkTemplate.remove();
    } catch (e) {
    }
    const tempContainer = document.createElement("template");
    tempContainer.innerHTML = htmlText;
    tempContainer.setAttribute("id", id);
    return tempContainer;
  }
  /** Remove/re-apply scripts in a container Element so that they are executed.
   * @param {HTMLElement} tempContainer HTML Element of container to process
   */
  _applyScripts(tempContainer) {
    const scripts = tempContainer.querySelectorAll("script");
    scripts.forEach((scr) => {
      const newScript = document.createElement("script");
      newScript.textContent = scr.innerText;
      tempContainer.append(newScript);
      scr.remove();
    });
  }
  /** Set up the MarkdownIT library if loaded */
  _markdownIt() {
    if (!window["markdownit"]) return;
    if (!this.config.mdPlugins && window["uibuilder"] && window["uibuilder"].ui_md_plugins) this.config.mdPlugins = window["uibuilder"].ui_md_plugins;
    _UibRouter.mdOpts = {
      html: true,
      xhtmlOut: false,
      linkify: true,
      _highlight: true,
      _strict: false,
      _view: "html",
      langPrefix: "language-",
      // NB: the highlightjs (hljs) library must be loaded before markdown-it for this to work
      highlight: function(str, lang) {
        if (window["hljs"]) {
          if (lang && window["hljs"].getLanguage(lang)) {
            try {
              return '<pre><code class="hljs border language-'.concat(lang, '" data-language="').concat(lang, '" title="Source language: \'').concat(lang, "'\">").concat(window["hljs"].highlight(str, { language: lang, ignoreIllegals: true }).value, "</code></pre>");
            } finally {
            }
          } else {
            try {
              const high = window["hljs"].highlightAuto(str);
              return '<pre><code class="hljs border language-'.concat(high.language, '" data-language="').concat(high.language, '" title="Source language estimated by HighlightJS: \'').concat(high.language, "'\">").concat(high.value, "</code></pre>");
            } finally {
            }
          }
        }
        return '<pre><code class="border">'.concat(Ui.md.utils.escapeHtml(str).trim(), "</code></pre>");
      }
    };
    _UibRouter.md = window["markdownit"](_UibRouter.mdOpts);
    if (this.config.mdPlugins) {
      if (!Array.isArray(this.config.mdPlugins)) {
        console.error("[uibrouter:_markDownIt:plugins] Could not load plugins, config.mdPlugins is not an array");
        return;
      }
      this.config.mdPlugins.forEach((plugin) => {
        if (typeof plugin === "string") {
          _UibRouter.md.use(window[plugin]);
        } else {
          const name = Object.keys(plugin)[0];
          _UibRouter.md.use(window[name], plugin[name]);
        }
      });
    }
  }
  /** Normalise route definition arrays
   * @param {Array<routeDefinition>} routeDefns Route definitions to normalise
   */
  _normaliseRouteDefns(routeDefns) {
    if (!Array.isArray(routeDefns)) routeDefns = [routeDefns];
    routeDefns.forEach((defn) => {
      let fmt = defn.format || "html";
      fmt = fmt.toLowerCase();
      if (fmt === "markdown") fmt = "md";
      defn.format = fmt;
    });
  }
  /** Update this.routeIds array from this.config (on start and after add/remove routes) */
  _updateRouteIds() {
    this.routeIds = new Set(Object.values(this.config.routes).map((r) => r.id));
  }
  /** If uibuilder in use, report on route change
   * @param {string} newRouteId The route id now shown
   */
  _uibRouteChange(newRouteId) {
    if (!this.uibuilder || !newRouteId) return;
    uibuilder.set("uibrouter", "route changed");
    uibuilder.set("uibrouter_CurrentRoute", newRouteId);
    uibuilder.set("uibrouter_CurrentTitle", this.routeTitle());
    uibuilder.set("uibrouter_CurrentDescription", this.routeDescription());
    uibuilder.set("uibrouter_CurrentDetails", this.getRouteConfigById(newRouteId));
    uibuilder.sendCtrl({
      uibuilderCtrl: "route change",
      routeId: newRouteId,
      title: this.routeTitle(),
      description: this.routeDescription(),
      details: this.getRouteConfigById(newRouteId)
    });
  }
  // #endregion --- ----- --
  /** Create requested navigation menus
   * @param {Array<routeMenu>} menus Array of menu definitions. Each entry is a routeMenu object
   */
  createMenus(menus) {
    if (!Array.isArray(menus) || menus.length < 1) {
      console.warn("[uibrouter:createMenus] No valid routeMenus array provided or is empty");
      return;
    }
    menus.forEach((menu) => {
      if (!menu.id) {
        console.warn("[uibrouter:createMenus] Invalid menu definition: ".concat(JSON.stringify(menu)));
        return;
      }
      const menuContainer = document.getElementById(menu.id);
      if (!menuContainer) {
        console.warn("[uibrouter:createMenus] Menu container with id '".concat(menu.id, "' not found."));
        return;
      }
      menuContainer.style.position = "relative";
      menuContainer.innerHTML = "";
      const navEl = document.createElement("nav");
      if (menu == null ? void 0 : menu.label) navEl.setAttribute("aria-label", menu.label);
      if ((menu == null ? void 0 : menu.menuType) !== "vertical") navEl.classList.add("horizontal");
      else navEl.classList.add("vertical");
      const btnEl = document.createElement("button");
      btnEl.classList.add("menu-toggle");
      btnEl.innerHTML = '\n                <svg viewBox="0 0 0.8 0.8" xmlns="http://www.w3.org/2000/svg">\n                    <path d="M0.1 0.15h0.6a0.05 0.05 0 0 1 0 0.1H0.1a0.05 0.05 0 1 1 0 -0.1m0 0.2h0.6a0.05 0.05 0 0 1 0 0.1H0.1a0.05 0.05 0 1 1 0 -0.1m0 0.2h0.6a0.05 0.05 0 0 1 0 0.1H0.1a0.05 0.05 0 0 1 0 -0.1"/>\n                </svg>\n            ';
      navEl.appendChild(btnEl);
      const ulEl = document.createElement("ul");
      ulEl.classList.add("routemenu");
      ulEl.setAttribute("role", "menubar");
      this.config.routes.forEach((route) => {
        if (!route.id) return;
        const liEl = document.createElement("li");
        liEl.setAttribute("role", "none");
        const aEl = document.createElement("a");
        aEl.setAttribute("role", "menuitem");
        aEl.setAttribute("href", "#".concat(route.id));
        aEl.setAttribute("data-route", route.id);
        aEl.innerText = (route == null ? void 0 : route.title) || route.id;
        liEl.appendChild(aEl);
        ulEl.appendChild(liEl);
      });
      navEl.appendChild(ulEl);
      menuContainer.appendChild(navEl);
      this.setCurrentMenuItems();
      navEl.addEventListener("mouseup", (e) => {
        if (window.innerWidth > 600) return;
        if (ulEl.contains(e.target)) return;
        toggleMenu();
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth > 600) {
          closeMenu();
        }
      });
      function toggleMenu() {
        if (navEl.getAttribute("aria-expanded") === "true") {
          closeMenu();
        } else {
          setTimeout(() => {
            navEl.setAttribute("aria-expanded", true);
            btnEl.setAttribute("aria-expanded", true);
            document.addEventListener("mouseup", closeMenu);
          }, 0);
        }
      }
      function closeMenu() {
        navEl.setAttribute("aria-expanded", false);
        btnEl.setAttribute("aria-expanded", false);
        document.addEventListener("mouseup", closeMenu);
      }
    });
  }
  /** Process a routing request
   * All errors throw so make sure to try/catch calls to this method.
   * @param {PointerEvent|MouseEvent|HashChangeEvent|TouchEvent|string} routeSource Either string containing route id or DOM Event object either click/touch on element containing `href="#routeid"` or Hash URL change event
   * @throws {Error} If the safety protocol is triggered (too many route bounces) or if no valid route found
   */
  async doRoute(routeSource) {
    if (this.safety > 10) throw new Error("\u{1F6AB} [uibrouter:doRoute] Safety protocol triggered, too many route bounces");
    if (!this.config.routes || this.config.routes < 1) return;
    if (!routeSource) routeSource = this.config.defaultRoute;
    const container = this.routeContainerEl;
    if (!container) throw new Error("[uibrouter:doRoute] Cannot route, has router.setup() been called yet?");
    const currentHash = this.keepHashFromUrl(window.location.hash);
    if (!routeSource) routeSource = currentHash;
    let newRouteId, oldRouteId;
    if (typeof routeSource === "string") {
      newRouteId = this.keepHashFromUrl(routeSource);
      oldRouteId = currentHash;
      if (newRouteId === "" && this.config.defaultRoute) newRouteId = this.config.defaultRoute;
      if (newRouteId !== currentHash) {
        window.location.hash = "#".concat(newRouteId);
        return;
      }
    } else if (routeSource.type === "hashchange") {
      const newUrl = routeSource.newURL;
      if (newUrl.includes("#")) {
        oldRouteId = this.keepHashFromUrl(routeSource.oldURL);
        newRouteId = this.keepHashFromUrl(newUrl);
      } else return;
    } else {
      oldRouteId = currentHash;
      try {
        newRouteId = this.keepHashFromUrl(routeSource.target.attributes.href.value);
      } catch (e) {
        throw new Error("[uibrouter:doRoute] No valid route found. Event.target does not have an href attribute");
      }
    }
    let routeShown = false;
    if (!newRouteId || !this.routeIds.has(newRouteId)) {
      document.dispatchEvent(new CustomEvent("uibrouter:route-change-failed", { detail: { newRouteId, oldRouteId } }));
      if (this.uibuilder) uibuilder.set("uibrouter", "route change failed");
      if (newRouteId === oldRouteId) oldRouteId = "";
      console.error("[uibrouter:doRoute] No valid route found. Either pass a valid route name or an event from an element having an href of '#".concat(newRouteId, "'. Route id requested: '").concat(newRouteId, "'"));
      this.safety++;
      this.doRoute(oldRouteId || "");
      return;
    }
    if (this.config.hide) {
      if (oldRouteId) {
        const oldContent = document.querySelector('div[data-route="'.concat(oldRouteId, '"]'));
        if (oldContent) oldContent.style.display = "none";
      }
      const content = document.querySelector('div[data-route="'.concat(newRouteId, '"]'));
      if (content) {
        content.style.removeProperty("display");
        routeShown = true;
      } else {
        try {
          routeShown = await this.loadRoute(newRouteId);
        } catch (e) {
          console.error("[uibrouter:doRoute] ", e);
          routeShown = false;
        }
      }
    } else {
      container.replaceChildren();
      try {
        routeShown = await this.loadRoute(newRouteId);
      } catch (e) {
        console.error("[uibrouter:doRoute] ", e);
        routeShown = false;
      }
    }
    if (routeShown === false) {
      document.dispatchEvent(new CustomEvent("uibrouter:route-change-failed", { detail: { newRouteId, oldRouteId } }));
      if (this.uibuilder) uibuilder.set("uibrouter", "route change failed");
      if (newRouteId === oldRouteId) oldRouteId = "";
      console.error("[uibrouter:doRoute] Route content for '".concat(newRouteId, "' could not be shown, reverting to old route '").concat(oldRouteId, "'"));
      this.safety++;
      this.doRoute(oldRouteId || "");
      return;
    }
    this.safety = 0;
    if (this.config.templateUnload) this.unloadTemplate(oldRouteId);
    this.currentRouteId = newRouteId;
    this.previousRouteId = oldRouteId;
    container.dataset.currentRoute = newRouteId;
    this.setCurrentMenuItems();
    document.dispatchEvent(new CustomEvent("uibrouter:route-changed", { detail: { newRouteId, oldRouteId } }));
    this._uibRouteChange(newRouteId);
  }
  /** Load other external files and apply to specific parents (mostly used for externally defined menus)
   * @param {otherLoadDefinition|Array<otherLoadDefinition>} extOther Required. Array of objects defining what to load and where
   * @throws {Error} If no extOther provided or if fetch fails
   */
  loadOther(extOther) {
    if (!extOther) throw new Error("[uibrouter:loadOther] At least 1 load definition must be provided");
    if (!Array.isArray(extOther)) extOther = [extOther];
    extOther.forEach(async (f) => {
      const parent = document.querySelector(f.container);
      if (!parent) {
        console.warn("[uibrouter:loadOther] Parent container '".concat(f.container, "' not found for '").concat(f.id, "'"));
        return;
      }
      let response;
      try {
        response = await fetch(f.src);
      } catch (e) {
        throw new Error("[uibrouter:loadOther] Error loading template HTML for '".concat(f.id, "', src: '").concat(f.src, "'. Error: ").concat(e.message), e);
      }
      if (response.ok === false) throw new Error("[uibrouter:loadOther] Fetch failed to return data '".concat(f.id, "', src: '").concat(f.src, "'. Status: ").concat(response.statusText, " (").concat(response.status, ")"), [f.id, f.src, response.status, response.statusText]);
      const htmlText = await response.text();
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = htmlText;
      tempContainer.id = f.id;
      parent.append(tempContainer);
      this._applyScripts(parent.lastChild);
    });
  }
  /** Async method to create DOM route content from a route template (internal or external) - loads external templates if not already loaded
   * Route templates have to be a `<template>` tag with an ID that matches the route id.
   * Scripts in the template are run at this point.
   * All errors throw so make sure to try/catch calls to this method.
   * @param {string} routeId ID of the route definition to use to create the content
   * @param {HTMLElement} [routeParentEl] OPTIONAL, default=this.routeContainerEl (master route container). Reference to an HTML Element to which the route content will added as a child.
   * @returns {boolean} True if the route content was created successfully, false otherwise
   */
  async loadRoute(routeId, routeParentEl) {
    if (!routeParentEl) routeParentEl = this.routeContainerEl;
    let rContent;
    try {
      rContent = await this.ensureTemplate(routeId);
    } catch (e) {
      throw new Error("[uibrouter:loadRoute] No template for route id '".concat(routeId, "'. \n ").concat(e.message));
    }
    const docFrag = rContent.content.cloneNode(true);
    this._applyScripts(docFrag);
    const tempContainer = document.createElement("div");
    tempContainer.dataset.route = routeId;
    tempContainer.append(docFrag);
    try {
      routeParentEl.append(tempContainer);
    } catch (e) {
      throw new Error("[uibrouter:loadRoute] Failed to apply route id '".concat(routeId, "'. \n ").concat(e.message));
    }
    document.dispatchEvent(new CustomEvent("uibrouter:route-loaded", { routeId }));
    return true;
  }
  /** Async method to ensure that a template element exists for a given route id
   *  If route is external, will try to load if it doesn't exist.
   * All errors throw so make sure to try/catch calls to this method.
   * @param {string} routeId A single route ID
   * @returns {HTMLTemplateElement} A reference to the HTML Template element
   */
  async ensureTemplate(routeId) {
    if (!routeId || !this.routeIds.has(routeId)) throw new Error("[uibrouter:ensureTemplate] No valid route id provided. Route ID: '".concat(routeId, "'"));
    let rContent = document.querySelector("#".concat(routeId));
    if (!rContent) {
      const r = this.getRouteConfigById(routeId);
      if (r.type && r.type === "url") {
        let loadedEls;
        try {
          loadedEls = await this._loadExternal(r);
        } catch (e) {
          throw new Error(e.message, e);
        }
        if (!loadedEls) throw new Error("[uibrouter:ensureTemplate] No route template found for route selector '#".concat(routeId, "'. Does the link url match a defined route id?"));
        this._appendExternalTemplates(loadedEls);
        rContent = document.querySelector("#".concat(routeId));
        if (!rContent) throw new Error("[uibrouter:ensureTemplate] No valid route template found for external route selector '#".concat(routeId, "'"));
      } else {
        throw new Error("[uibrouter:ensureTemplate] No route template found for internal route selector '#".concat(routeId, "'. Ensure that a template element with the matching ID exists in the HTML."));
      }
    }
    return rContent;
  }
  /** Return a route config given a route id (returns undefined if route not found)
   * @param {string} routeId Route ID to search for
   * @returns {routeDefinition|undefined} Route config for found id else undefined
   */
  getRouteConfigById(routeId) {
    return Object.values(this.config.routes).filter((r) => r.id === routeId)[0];
  }
  /** Return true if the given route is external, false otherwise
   * Used to correctly (re)apply script tags when cloning the template to the DOM (createRouteContent)
   * @param {string} routeId Route ID to check
   * @returns {boolean} True if the given route is external, false otherwise
   */
  isRouteExternal(routeId) {
    const routeConfig = this.getRouteConfigById(routeId);
    return !!(routeConfig && routeConfig.type === "url");
  }
  /** Go to the default route if it has been specified */
  defaultRoute() {
    if (this.config.defaultRoute) this.doRoute(this.config.defaultRoute);
  }
  /** Remove the hash from the browser URL */
  removeHash() {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }
  /** Empty the current container and remove url hash - does not trigger a route change */
  noRoute() {
    this.removeHash();
    this.routeContainerEl.replaceChildren();
  }
  /** Only keep anything after the # & ignoring query params
   * @param {string} url URL to extract the hash from
   * @returns {string} Just the route id
   */
  keepHashFromUrl(url) {
    if (!url) return "";
    return url.replace(/^.*#(.*)/, "$1").replace(/\?.*$/, "");
  }
  /** Return an array of route ids (to facilitate creation of menus)
   * @param {boolean} returnHash If true, returns id's with leading `#` to apply to href attributes else returns the id
   * @returns {string[]} Array of route id's or route url hashes
   */
  routeList(returnHash) {
    const routeIds = [...this.routeIds];
    if (returnHash === true) {
      return routeIds.map((r) => {
        return returnHash === true ? "#".concat(r.id) : r.id;
      });
    }
    return [...this.routeIds];
  }
  /** Add new route definitions to the existing ones
   * @param {routeDefinition|routeDefinition[]} routeDefn Single or array of route definitions to add
   */
  addRoutes(routeDefn) {
    if (!Array.isArray(routeDefn)) routeDefn = [routeDefn];
    this._normaliseRouteDefns(routeDefn);
    this.config.routes.push(...routeDefn);
    this._updateRouteIds();
    if (this.config.routeMenus) this.createMenus(this.config.routeMenus);
    document.dispatchEvent(new CustomEvent("uibrouter:routes-added", { detail: routeDefn }));
    if (this.uibuilder) uibuilder.set("uibrouter", "routes added");
    if (this.config.templateLoadAll) {
      Promise.allSettled(
        Object.values(routeDefn).filter((r) => r.type && r.type === "url").map(this._loadExternal)
      ).then((results) => {
        results.filter((res) => res.status === "rejected").forEach((res) => {
          console.error(res.reason);
        });
        this.config.routes.push(...routeDefn);
        this._updateRouteIds();
        document.dispatchEvent(new CustomEvent("uibrouter:routes-added", { detail: routeDefn }));
        if (this.uibuilder) uibuilder.set("uibrouter", "routes added");
        return true;
      }).catch((reason) => {
        console.error(reason);
      });
    }
  }
  /** Remove a template from the DOM (optionally external templates only)
   * @param {string} routeId REQUIRED. The route id of the template to remove (templates are ID's by their route id)
   * @param {boolean=} externalOnly OPTIONAL, default=true. If true only remove if routeId is an external template
   */
  unloadTemplate(routeId, externalOnly) {
    if (!externalOnly) externalOnly = true;
    if (!routeId || !this.isRouteExternal(routeId)) return;
    if (externalOnly === true && !this.isRouteExternal(routeId)) return;
    const chkTemplate = document.querySelector("#".concat(routeId));
    if (chkTemplate) chkTemplate.remove();
  }
  /** Remove ALL templates from the DOM (optionally external templates only)
   * @param {Array<string>=} templateIds OPTIONAL, default=ALL. Array of template (route) id's to remove
   * @param {boolean=} externalOnly OPTIONAL, default=true. If true only remove if routeId is an external template
   */
  deleteTemplates(templateIds, externalOnly) {
    if (!externalOnly) externalOnly = true;
    if (!templateIds || templateIds === "*") templateIds = [...this.routeIds];
    if (!Array.isArray(templateIds)) templateIds = [templateIds];
    templateIds.forEach((routeId) => {
      if (externalOnly === true && !this.isRouteExternal(routeId)) return;
      this.unloadTemplate(routeId, externalOnly);
    });
  }
  // #region --- utils for page display & processing ---
  /** Mark/unmark menu items to highlight the currently shown route */
  setCurrentMenuItems() {
    const items = document.querySelectorAll("li[data-route], a[data-route]");
    items.forEach((item) => {
      if (item.dataset.route === this.currentRouteId) {
        item.classList.add("currentRoute");
        item.setAttribute("aria-current", "page");
      } else {
        item.classList.remove("currentRoute");
        item.removeAttribute("aria-current");
      }
    });
  }
  /** Return the title of the current route
   * @returns {string} Current route title
   */
  routeTitle() {
    const thisRoute = this.currentRoute() || {};
    return thisRoute.title || thisRoute.id || "[ROUTE NOT FOUND]";
  }
  /** Return the description of the current route
   * @returns {string} Current route description
   */
  routeDescription() {
    const thisRoute = this.currentRoute() || {};
    return thisRoute.description || thisRoute.id || "[ROUTE NOT FOUND]";
  }
  /** Return the current route configuration
   * @returns {object} Current route configuration
   */
  currentRoute() {
    return this.getRouteConfigById(this.currentRouteId);
  }
  /** Use Markdown-IT to render Markdown to HTML
   * https://markdown-it.github.io/markdown-it
   * @param {string} mdText Markdown string
   * @returns {string|undefined} HTML rendering of the Markdown input
   */
  renderMarkdown(mdText) {
    if (!window["markdownit"]) return;
    if (!_UibRouter.md) this._markdownIt();
    try {
      return _UibRouter.md.render(mdText.trim());
    } catch (e) {
      console.error("[uibrouter:renderMarkdown] Could not render Markdown. ".concat(e.message), e);
      return '<p class="border error">Could not render Markdown<p>';
    }
  }
  // #endregion ---- ----- ----
  // TODO:
  // deleteRoutes(aRoutes) {
  //     // Delete all if no list provided
  //     if (!aRoutes) aRoutes = this.config.routes
  //     if (!Array.isArray(aRoutes)) aRoutes = [aRoutes]
  //     console.log('to be deleted', this.config.routes.filter(r => aRoutes.includes(r.id)))
  //     console.log('to be retained', this.config.routes.filter(r => !aRoutes.includes(r.id)))
  //     // TODO actually remove the unwanted route templates
  //     // TODO remove from the config: this.config.routes = this.config.routes.filter(r => !aRoutes.includes(r.id))
  //     // ? Optional future upgrade - attempt to also remove any links to this route?
  // }
  // TODO
  // reloadTemplates(templateIds) {
  //     if (!Array.isArray(templateIds)) templateIds = [templateIds]
  //     templateIds.forEach( templateid => {
  //         // TODO reload
  //     } )
  // }
};
_instanceExists = new WeakMap();
_startDone = new WeakMap();
// #region --- Variables ---
/** Class version */
__publicField(_UibRouter, "version", "7.5.0-src");
/** Ensures only 1 class instance on a page */
__privateAdd(_UibRouter, _instanceExists, false);
/** Options for Markdown-IT if available (set in constructor) */
__publicField(_UibRouter, "mdOpts");
/** Reference to pre-loaded Markdown-IT library */
__publicField(_UibRouter, "md");
var UibRouter = _UibRouter;
var uibrouter_default = UibRouter;
if (!window["UibRouter"]) {
  window["UibRouter"] = UibRouter;
} else {
  console.warn("`UibRouter` already assigned to window. Have you tried to load it more than once?");
}
export {
  UibRouter,
  uibrouter_default as default
};
