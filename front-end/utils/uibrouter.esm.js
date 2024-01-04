var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// src/front-end-module/uibrouter.js
var _startDone;
var UibRouter = class {
  //#endregion --- ----- ---
  //#region --- Internal Methods ---
  /** Class constructor
   * @param {UibRouterConfig} routerConfig Configuration object
   */
  constructor(routerConfig2) {
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
    if (!fetch)
      throw new Error("[uibrouter:constructor] UibRouter requires `fetch`. Please use a current browser or load a fetch polyfill.");
    if (!routerConfig2)
      throw new Error("[uibrouter:constructor] No config provided");
    if (!routerConfig2.routes)
      throw new Error("[uibrouter:constructor] No routes provided in routerConfig");
    if (!routerConfig2.routeContainer)
      routerConfig2.routeContainer = "#uibroutecontainer";
    this.config = routerConfig2;
    if (!this.config.defaultRoute && this.config.routes[0] && this.config.routes[0].id)
      this.config.defaultRoute = this.config.routes[0].id;
    this._setRouteContainer();
    this._updateRouteIds();
    Promise.all(Object.values(routerConfig2.routes).filter((r) => r.type && r.type === "url").map(this._loadExternal)).then(this._appendExternalTemplates).then(() => {
      this._start();
      return true;
    }).catch((reason) => {
      console.error(reason);
    });
  }
  /** Save a reference to, and create if necessary, the HTML element to hold routes */
  _setRouteContainer() {
    const body = document.getElementsByTagName("body")[0];
    let routeContainerEl = this.routeContainerEl = document.querySelector(this.config.routeContainer);
    if (!routeContainerEl) {
      const tempContainer = document.createElement("div");
      tempContainer.setAttribute("id", this.config.routeContainer.replace("#", ""));
      body.append(tempContainer);
      routeContainerEl = this.routeContainerEl = document.querySelector(this.config.routeContainer);
    }
  }
  /** Load fetched external elements to templates tags under the head tag
   * @param {HTMLElement[]} loadedElements Array of loaded external elements to add as templates to the head tag
   */
  _appendExternalTemplates(loadedElements) {
    const head = document.getElementsByTagName("head")[0];
    loadedElements.forEach((element) => {
      if (Array.isArray(element)) {
        console.error(...element);
      } else {
        head.append(element);
      }
    });
  }
  /** Called once all external templates have been loaded */
  _start() {
    if (__privateGet(this, _startDone) === true)
      return;
    this.doRoute(this.keepHashFromUrl(window.location.hash));
    window.addEventListener("hashchange", (event) => this._hashChange(event));
    document.dispatchEvent(new CustomEvent("uibrouter:loaded"));
    if (uibuilder)
      uibuilder.set("uibrouter", "loaded");
    __privateSet(this, _startDone, true);
  }
  /** Called when the URL Hash changes
   * @param {HashChangeEvent} event URL Hash change event object
   */
  _hashChange(event) {
    this.doRoute(event);
  }
  /** Create DOM route content from a route template (internal or external)
   * Route templates have to be a `<template>` tag with an ID that matches the route id.
   * @param {string} routeId ID of the route definition to use to create the content
   * @returns {boolean} True if the route content was created successfully, false otherwise
   */
  _createRouteContent(routeId) {
    const rContent = document.querySelector(`#${routeId}`);
    if (!rContent) {
      console.error(`[uibrouter:createRouteContent] No route template found for route selector '#${routeId}'. Does the link url match a defined route id?`);
      return false;
    }
    const docFrag = rContent.content.cloneNode(true);
    if (this.isRouteExternal(routeId))
      this._applyScripts(docFrag);
    const tempContainer = document.createElement("div");
    tempContainer.dataset.route = routeId;
    tempContainer.append(docFrag);
    try {
      this.routeContainerEl.append(tempContainer);
    } catch (e) {
      console.error(`[uibrouter:createRouteContent] Failed to apply route id '${routeId}'. 
 ${e.message}`);
      return false;
    }
    return true;
  }
  /** Loads an external HTML file into a `<template>` tag, adding the router id as the template id.
   *  or returns an error array
   * @param {routeDefinition} routeDefinition Configuration for a single route
   * @returns {Promise<HTMLTemplateElement[]|[string,string,number,string]>} A promise that fulfills to an HTMLTemplateElement or an array containing error information
   */
  _loadExternal(routeDefinition) {
    const id = routeDefinition.id;
    return fetch(routeDefinition.src).then((response) => {
      if (response.ok === false)
        return [routeDefinition.id, routeDefinition.src, response.status, response.statusText];
      return response.text();
    }).then((htmlText) => {
      if (Array.isArray(htmlText))
        return htmlText;
      try {
        const chkTemplate = document.querySelector(`#${id}`);
        if (chkTemplate)
          chkTemplate.remove();
      } catch (e) {
      }
      const tempContainer = document.createElement("template");
      tempContainer.innerHTML = htmlText;
      tempContainer.setAttribute("id", id);
      return tempContainer;
    }).catch((error) => {
      console.error(`[uibrouter:loadHTML] Error loading route template HTML from ${routeDefinition.src}:`, error);
    });
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
  /** Update this.routeIds array from this.config (on start and after add/remove routes) */
  _updateRouteIds() {
    this.routeIds = new Set(Object.values(routerConfig.routes).map((r) => r.id));
  }
  //#endregion --- ----- --
  /** Process a routing request
   * @param {PointerEvent|MouseEvent|HashChangeEvent|TouchEvent|string} routeSource Either string containing route id or DOM Event object either click/touch on element containing `href="#routeid"` or Hash URL change event
   */
  doRoute(routeSource) {
    if (!routeSource)
      routeSource = this.config.defaultRoute;
    const container = this.routeContainerEl;
    if (!container)
      throw new Error("[uibrouter:doRoute] Cannot route, has router.setup() been called yet?");
    const currentHash = this.keepHashFromUrl(window.location.hash);
    if (!routeSource)
      routeSource = currentHash;
    let newRouteId, oldRouteId;
    if (typeof routeSource === "string") {
      newRouteId = this.keepHashFromUrl(routeSource);
      oldRouteId = currentHash;
      if (newRouteId === "" && this.config.defaultRoute)
        newRouteId = this.config.defaultRoute;
      if (newRouteId !== currentHash) {
        window.location.hash = `#${newRouteId}`;
        return;
      }
    } else if (routeSource.type === "hashchange") {
      const newUrl = routeSource.newURL;
      if (newUrl.includes("#")) {
        oldRouteId = this.keepHashFromUrl(routeSource.oldURL);
        newRouteId = this.keepHashFromUrl(newUrl);
      } else
        return;
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
      if (uibuilder)
        uibuilder.set("uibrouter", "route change failed");
      if (newRouteId === oldRouteId)
        oldRouteId = "";
      this.doRoute(oldRouteId || "");
      console.error(`[uibrouter:doRoute] No valid route found. Either pass a valid route name or an event from an element having an href of '#${newRouteId}'. Route id requested: '${newRouteId}'`);
      return;
    }
    if (this.config.hide) {
      if (oldRouteId) {
        const oldContent = document.querySelector(`div[data-route="${oldRouteId}"]`);
        if (oldContent)
          oldContent.style.display = "none";
      }
      const content = document.querySelector(`div[data-route="${newRouteId}"]`);
      if (content) {
        content.style.removeProperty("display");
        routeShown = true;
      } else {
        routeShown = this._createRouteContent(newRouteId);
      }
    } else {
      container.replaceChildren();
      routeShown = this._createRouteContent(newRouteId);
    }
    if (routeShown === false) {
      document.dispatchEvent(new CustomEvent("uibrouter:route-change-failed", { detail: { newRouteId, oldRouteId } }));
      if (uibuilder)
        uibuilder.set("uibrouter", "route change failed");
      window.location.hash = oldRouteId ? `#${oldRouteId}` : "";
      return;
    }
    this.currentRouteId = newRouteId;
    this.previousRouteId = oldRouteId;
    container.dataset.currentRoute = newRouteId;
    this.setCurrentMenuItems();
    document.dispatchEvent(new CustomEvent("uibrouter:route-changed", { detail: { newRouteId, oldRouteId } }));
    if (uibuilder) {
      uibuilder.set("uibrouter", "route changed");
      uibuilder.set("uibrouter_CurrentRoute", newRouteId);
      uibuilder.set("uibrouter_CurrentTitle", this.routeTitle());
      uibuilder.set("uibrouter_CurrentDescription", this.routeDescription());
      uibuilder.set("uibrouter_CurrentDetails", this.getRouteConfigById(newRouteId));
    }
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
    if (this.config.defaultRoute)
      this.doRoute(this.config.defaultRoute);
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
    if (!url)
      return "";
    return url.replace(/^.*#(.*)/, "$1").replace(/\?.*$/, "");
  }
  /** Return an array of route ids (to facilitate creation of menus)
   * @param {boolean} returnHash If true, returns id's with leading `#` to apply to href attributes else returns the id
   * @returns {string[]} Array of route id's or route url hashes
   */
  routeList(returnHash) {
    if (returnHash === true)
      return this.routeIds.map((r) => returnHash === true ? `#${r.id}` : r.id);
    return this.routeIds;
  }
  /** Add new route definitions to the existing ones
   * @param {routeDefinition|routeDefinition[]} routeDefn Single or array of route definitions to add
   */
  addRoutes(routeDefn) {
    if (!Array.isArray(routeDefn))
      routeDefn = [routeDefn];
    Promise.all(Object.values(routeDefn).filter((r) => r.type && r.type === "url").map(this._loadExternal)).then(this._appendExternalTemplates).then(() => {
      this.config.routes.push(...routeDefn);
      this._updateRouteIds();
      document.dispatchEvent(new CustomEvent("uibrouter:routes-added", { detail: routeDefn }));
      if (uibuilder)
        uibuilder.set("uibrouter", "routes added");
    });
  }
  //#region --- utils for page display & processing ---
  setCurrentMenuItems() {
    const items = document.querySelectorAll("li[data-route]");
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
  routeTitle() {
    const thisRoute = this.currentRoute() || {};
    return thisRoute.title || thisRoute.id || "[ROUTE NOT FOUND]";
  }
  routeDescription() {
    const thisRoute = this.currentRoute() || {};
    return thisRoute.description || thisRoute.id || "[ROUTE NOT FOUND]";
  }
  currentRoute() {
    return this.getRouteConfigById(this.currentRouteId);
  }
  //#endregion ---- ----- ----
  // TODO
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
  // deleteTemplates(templateIds) {
  //     if (!Array.isArray(templateIds)) templateIds = [templateIds]
  //     templateIds.forEach( templateid => {
  //         // TODO delete
  //     } )
  // }
  // TODO
  // reloadTemplates(templateIds) {
  //     if (!Array.isArray(templateIds)) templateIds = [templateIds]
  //     templateIds.forEach( templateid => {
  //         // TODO reload
  //     } )
  // }
};
_startDone = new WeakMap();
// eslint-disable-line no-unused-vars
//#region --- Variables ---
/** Class version */
__publicField(UibRouter, "version", "1.0.2");
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
