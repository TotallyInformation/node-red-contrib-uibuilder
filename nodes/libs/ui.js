const Ui = class Ui2 {
  //#region --- Class variables ---
  version = "6.9.0-node";
  // List of tags and attributes not in sanitise defaults but allowed in uibuilder.
  sanitiseExtraTags = ["uib-var"];
  sanitiseExtraAttribs = ["variable", "report", "undefined"];
  // Reference to DOM window - must be passed in the constructor
  // Allows for use of this library/class with `jsdom` in Node.JS as well as the browser.
  window;
  /** Log function - passed in constructor or will be a dummy function
   * @type {function}
   */
  static log;
  /** Options for Markdown-IT if available (set in constructor) */
  static mdOpts;
  /** Reference to pre-loaded Markdown-IT library */
  static md;
  //#endregion --- class variables ---
  /** Called when `new Ui(...)` is called
   * @param {globalThis} win Either the browser global window or jsdom dom.window
   * @param {function} [extLog] A function that returns a function for logging
   * @param {function} [jsonHighlight] A function that returns a highlighted HTML of JSON input
   */
  constructor(win, extLog, jsonHighlight) {
    if (win)
      this.window = win;
    else {
      throw new Error("Ui:constructor. Current environment does not include `window`, UI functions cannot be used.");
    }
    this.document = this.window.document;
    if (extLog)
      Ui2.log = extLog;
    else
      Ui2.log = function() {
        return function() {
        };
      };
    if (jsonHighlight)
      this.syntaxHighlight = jsonHighlight;
    else
      this.syntaxHighlight = function() {
      };
    if (window["markdownit"]) {
      Ui2.mdOpts = {
        html: true,
        xhtmlOut: false,
        linkify: true,
        _highlight: true,
        _strict: false,
        _view: "html",
        langPrefix: "language-",
        // NB: the highlightjs (hljs) library must be loaded before markdown-it for this to work
        highlight: function(str, lang) {
          if (lang && window["hljs"] && window["hljs"].getLanguage(lang)) {
            try {
              return `<pre class="">
                                    <code class="hljs border">${window["hljs"].highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
            } finally {
            }
          }
          return `<pre class="hljs border"><code>${Ui2.md.utils.escapeHtml(str).trim()}</code></pre>`;
        }
      };
      Ui2.md = window["markdownit"](Ui2.mdOpts);
    }
  }
  //#region ---- Internal Methods ----
  _markDownIt() {
    if (window["markdownit"]) {
      Ui2.mdOpts = {
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
                return `<pre><code class="hljs border language-${lang}" data-language="${lang}" title="Source language: '${lang}'">${window["hljs"].highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
              } finally {
              }
            } else {
              try {
                const high = window["hljs"].highlightAuto(str);
                return `<pre><code class="hljs border language-${high.language}" data-language="${high.language}" title="Source language estimated by HighlightJS: '${high.language}'">${high.value}</code></pre>`;
              } finally {
              }
            }
          }
          return `<pre><code class="border">${Ui2.md.utils.escapeHtml(str).trim()}</code></pre>`;
        }
      };
      Ui2.md = window["markdownit"](Ui2.mdOpts);
    }
  }
  /** Show a browser notification if the browser and the user allows it
   * @param {object} config Notification config data
   * @returns {Promise} Resolves on close or click event, returns the event.
   */
  _showNotification(config) {
    if (config.topic && !config.title)
      config.title = config.topic;
    if (!config.title)
      config.title = "uibuilder notification";
    if (config.payload && !config.body)
      config.body = config.payload;
    if (!config.body)
      config.body = " No message given.";
    try {
      const notify = new Notification(config.title, config);
      return new Promise((resolve, reject) => {
        notify.addEventListener("close", (ev) => {
          ev.currentTarget.userAction = "close";
          resolve(ev);
        });
        notify.addEventListener("click", (ev) => {
          ev.currentTarget.userAction = "click";
          resolve(ev);
        });
        notify.addEventListener("error", (ev) => {
          ev.currentTarget.userAction = "error";
          reject(ev);
        });
      });
    } catch (e) {
      return Promise.reject(new Error("Browser refused to create a Notification"));
    }
  }
  // Vue dynamic inserts Don't really work ...
  // _uiAddVue(ui, isRecurse) {
  //     // must be Vue
  //     // must have only 1 root element
  //     const compToAdd = ui.components[0]
  //     const newEl = this.document.createElement(compToAdd.type)
  //     if (!compToAdd.slot && ui.payload) compToAdd.slot = ui.payload
  //     this._uiComposeComponent(newEl, compToAdd)
  //     // If nested components, go again - but don't pass payload to sub-components
  //     if (compToAdd.components) {
  //         this._uiExtendEl(newEl, compToAdd.components)
  //     }
  //     console.log('MAGIC: ', this.magick, newEl, newEl.outerHTML)()
  //     this.set('magick', newEl.outerHTML)
  //     // if (compToAdd.id) newEl.setAttribute('ref', compToAdd.id)
  //     // if (elParent.id) newEl.setAttribute('data-parent', elParent.id)
  // }
  // TODO Add check if ID already exists
  // TODO Allow single add without using components array
  /** Handle incoming msg._ui add requests
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   * @param {boolean} isRecurse Is this a recursive call?
   */
  _uiAdd(ui, isRecurse) {
    Ui2.log("trace", "Ui:_uiManager:add", "Starting _uiAdd")();
    ui.components.forEach((compToAdd, i) => {
      Ui2.log("trace", `Ui:_uiAdd:components-forEach:${i}`, "Component to add: ", compToAdd)();
      let newEl;
      switch (compToAdd.type) {
        case "html": {
          compToAdd.ns = "html";
          newEl = this.document.createElement("div");
          break;
        }
        case "svg": {
          compToAdd.ns = "svg";
          newEl = this.document.createElementNS("http://www.w3.org/2000/svg", "svg");
          break;
        }
        default: {
          compToAdd.ns = "dom";
          newEl = this.document.createElement(compToAdd.type);
          break;
        }
      }
      if (!compToAdd.slot && ui.payload)
        compToAdd.slot = ui.payload;
      this._uiComposeComponent(newEl, compToAdd);
      let elParent;
      if (compToAdd.parentEl) {
        elParent = compToAdd.parentEl;
      } else if (ui.parentEl) {
        elParent = ui.parentEl;
      } else if (compToAdd.parent) {
        elParent = this.document.querySelector(compToAdd.parent);
      } else if (ui.parent) {
        elParent = this.document.querySelector(ui.parent);
      }
      if (!elParent) {
        Ui2.log("info", "Ui:_uiAdd", "No parent found, adding to body")();
        elParent = this.document.querySelector("body");
      }
      if (compToAdd.position && compToAdd.position === "first") {
        elParent.insertBefore(newEl, elParent.firstChild);
      } else if (compToAdd.position && Number.isInteger(Number(compToAdd.position))) {
        elParent.insertBefore(newEl, elParent.children[compToAdd.position]);
      } else {
        elParent.appendChild(newEl);
      }
      if (compToAdd.components) {
        this._uiExtendEl(newEl, compToAdd.components, compToAdd.ns);
      }
    });
  }
  // --- end of _uiAdd ---
  /** Enhance an HTML element that is being composed with ui data
   *  such as ID, attribs, event handlers, custom props, etc.
   * @param {*} el HTML Element to enhance
   * @param {*} comp Individual uibuilder ui component spec
   */
  _uiComposeComponent(el, comp) {
    if (comp.attributes) {
      Object.keys(comp.attributes).forEach((attrib) => {
        if (attrib === "class" && Array.isArray(comp.attributes[attrib]))
          comp.attributes[attrib].join(" ");
        Ui2.log("trace", "_uiComposeComponent:attributes-forEach", `Attribute: '${attrib}', value: '${comp.attributes[attrib]}'`)();
        if (attrib === "value")
          el.value = comp.attributes[attrib];
        if (attrib.startsWith("xlink:"))
          el.setAttributeNS("http://www.w3.org/1999/xlink", attrib, comp.attributes[attrib]);
        else
          el.setAttribute(attrib, comp.attributes[attrib]);
      });
    }
    if (comp.id)
      el.setAttribute("id", comp.id);
    if (comp.type === "svg") {
      el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
      el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    if (comp.events) {
      Object.keys(comp.events).forEach((type) => {
        if (type.toLowerCase === "onclick")
          type = "click";
        try {
          el.addEventListener(type, (evt) => {
            new Function("evt", `${comp.events[type]}(evt)`)(evt);
          });
        } catch (err) {
          Ui2.log("error", "Ui:_uiComposeComponent", `Add event '${type}' for element '${comp.type}': Cannot add event handler. ${err.message}`)();
        }
      });
    }
    if (comp.properties) {
      Object.keys(comp.properties).forEach((prop) => {
        el[prop] = comp.properties[prop];
      });
    }
    if (comp.slot) {
      this.replaceSlot(el, comp);
    }
    if (comp.slotMarkdown) {
      this.replaceSlotMarkdown(el, comp);
    }
  }
  /** Extend an HTML Element with appended elements using ui components
   * NOTE: This fn follows a strict hierarchy of added components.
   * @param {HTMLElement} parentEl The parent HTML Element we want to append to
   * @param {*} components The ui component(s) we want to add
   * @param {string} [ns] Optional. The namespace to use.
   */
  _uiExtendEl(parentEl, components, ns = "") {
    components.forEach((compToAdd, i) => {
      Ui2.log("trace", `Ui:_uiExtendEl:components-forEach:${i}`, compToAdd)();
      let newEl;
      compToAdd.ns = ns;
      if (compToAdd.ns === "html") {
        newEl = parentEl;
        parentEl.innerHTML = compToAdd.slot;
      } else if (compToAdd.ns === "svg") {
        newEl = this.document.createElementNS("http://www.w3.org/2000/svg", compToAdd.type);
        this._uiComposeComponent(newEl, compToAdd);
        parentEl.appendChild(newEl);
      } else {
        newEl = this.document.createElement(compToAdd.type === "html" ? "div" : compToAdd.type);
        this._uiComposeComponent(newEl, compToAdd);
        parentEl.appendChild(newEl);
      }
      if (compToAdd.components) {
        this._uiExtendEl(newEl, compToAdd.components, compToAdd.ns);
      }
    });
  }
  // TODO Add more error handling and parameter validation
  /** Handle incoming _ui load requests
   * Can load JavaScript modules, JavaScript scripts and CSS.
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   */
  _uiLoad(ui) {
    if (ui.components) {
      if (!Array.isArray(ui.components))
        ui.components = [ui.components];
      ui.components.forEach(async (component) => {
        import(component);
      });
    }
    if (ui.srcScripts) {
      if (!Array.isArray(ui.srcScripts))
        ui.srcScripts = [ui.srcScripts];
      ui.srcScripts.forEach((script) => {
        this.loadScriptSrc(script);
      });
    }
    if (ui.txtScripts) {
      if (!Array.isArray(ui.txtScripts))
        ui.txtScripts = [ui.txtScripts];
      this.loadScriptTxt(ui.txtScripts.join("\n"));
    }
    if (ui.srcStyles) {
      if (!Array.isArray(ui.srcStyles))
        ui.srcStyles = [ui.srcStyles];
      ui.srcStyles.forEach((sheet) => {
        this.loadStyleSrc(sheet);
      });
    }
    if (ui.txtStyles) {
      if (!Array.isArray(ui.txtStyles))
        ui.txtStyles = [ui.txtStyles];
      this.loadStyleTxt(ui.txtStyles.join("\n"));
    }
  }
  // --- end of _uiLoad ---
  /** Handle incoming _ui messages and loaded UI JSON files
   * Called from start()
   * @param {*} msg Standardised msg object containing a _ui property object
   */
  _uiManager(msg) {
    if (!msg._ui)
      return;
    if (!Array.isArray(msg._ui))
      msg._ui = [msg._ui];
    msg._ui.forEach((ui, i) => {
      if (ui.mode && !ui.method)
        ui.method = ui.mode;
      if (!ui.method) {
        Ui2.log("error", "Ui:_uiManager", `No method defined for msg._ui[${i}]. Ignoring. `, ui)();
        return;
      }
      ui.payload = msg.payload;
      ui.topic = msg.topic;
      switch (ui.method) {
        case "add": {
          this._uiAdd(ui, false);
          break;
        }
        case "remove": {
          this._uiRemove(ui, false);
          break;
        }
        case "removeAll": {
          this._uiRemove(ui, true);
          break;
        }
        case "replace": {
          this._uiReplace(ui);
          break;
        }
        case "update": {
          this._uiUpdate(ui);
          break;
        }
        case "load": {
          this._uiLoad(ui);
          break;
        }
        case "reload": {
          this._uiReload();
          break;
        }
        case "notify": {
          this.showDialog("notify", ui, msg);
          break;
        }
        case "alert": {
          this.showDialog("alert", ui, msg);
          break;
        }
        default: {
          Ui2.log("error", "Ui:_uiManager", `Invalid msg._ui[${i}].method (${ui.method}). Ignoring`)();
          break;
        }
      }
    });
  }
  // --- end of _uiManager ---
  /** Handle a reload request */
  _uiReload() {
    Ui2.log("trace", "Ui:uiManager:reload", "reloading")();
    location.reload();
  }
  // TODO Add better tests for failures (see comments)
  /** Handle incoming _ui remove requests
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   * @param {boolean} all Optional, default=false. If true, will remove ALL found elements, otherwise only the 1st is removed
   */
  _uiRemove(ui, all = false) {
    ui.components.forEach((compToRemove) => {
      let els;
      if (all !== true)
        els = [this.document.querySelector(compToRemove)];
      else
        els = this.document.querySelectorAll(compToRemove);
      els.forEach((el) => {
        try {
          el.remove();
        } catch (err) {
          Ui2.log("trace", "Ui:_uiRemove", `Could not remove. ${err.message}`)();
        }
      });
    });
  }
  // --- end of _uiRemove ---
  /** Handle incoming _ui replace requests
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   */
  _uiReplace(ui) {
    Ui2.log("trace", "Ui:_uiReplace", "Starting")();
    ui.components.forEach((compToReplace, i) => {
      Ui2.log("trace", `Ui:_uiReplace:components-forEach:${i}`, "Component to replace: ", compToReplace)();
      let elToReplace;
      if (compToReplace.id) {
        elToReplace = this.document.getElementById(compToReplace.id);
      } else if (compToReplace.selector || compToReplace.select) {
        elToReplace = this.document.querySelector(compToReplace.selector);
      } else if (compToReplace.name) {
        elToReplace = this.document.querySelector(`[name="${compToReplace.name}"]`);
      } else if (compToReplace.type) {
        elToReplace = this.document.querySelector(compToReplace.type);
      }
      Ui2.log("trace", `Ui:_uiReplace:components-forEach:${i}`, "Element to replace: ", elToReplace)();
      if (elToReplace === void 0 || elToReplace === null) {
        Ui2.log("trace", `Ui:_uiReplace:components-forEach:${i}:noReplace`, "Cannot find the DOM element. Adding instead.", compToReplace)();
        this._uiAdd({ components: [compToReplace] }, false);
        return;
      }
      let newEl;
      switch (compToReplace.type) {
        case "html": {
          compToReplace.ns = "html";
          newEl = this.document.createElement("div");
          break;
        }
        case "svg": {
          compToReplace.ns = "svg";
          newEl = this.document.createElementNS("http://www.w3.org/2000/svg", "svg");
          break;
        }
        default: {
          compToReplace.ns = "dom";
          newEl = this.document.createElement(compToReplace.type);
          break;
        }
      }
      this._uiComposeComponent(newEl, compToReplace);
      elToReplace.replaceWith(newEl);
      if (compToReplace.components) {
        this._uiExtendEl(newEl, compToReplace.components, compToReplace.ns);
      }
    });
  }
  // --- end of _uiReplace ---
  // TODO Allow single add without using components array
  // TODO Allow sub-components
  // TODO Add multi-slot capability
  /** Handle incoming _ui update requests
   * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
   */
  _uiUpdate(ui) {
    Ui2.log("trace", "UI:_uiUpdate:update", "Starting _uiUpdate", ui)();
    if (!ui.components)
      ui.components = [Object.assign({}, ui)];
    ui.components.forEach((compToUpd, i) => {
      Ui2.log("trace", "_uiUpdate:components-forEach", `Start loop #${i}`, compToUpd)();
      let elToUpd;
      if (compToUpd.parentEl) {
        elToUpd = compToUpd.parentEl;
      } else if (compToUpd.id) {
        elToUpd = this.document.querySelectorAll(`#${compToUpd.id}`);
      } else if (compToUpd.selector || compToUpd.select) {
        elToUpd = this.document.querySelectorAll(compToUpd.selector);
      } else if (compToUpd.name) {
        elToUpd = this.document.querySelectorAll(`[name="${compToUpd.name}"]`);
      } else if (compToUpd.type) {
        elToUpd = this.document.querySelectorAll(compToUpd.type);
      }
      if (elToUpd === void 0 || elToUpd.length < 1) {
        Ui2.log("warn", "Ui:_uiManager:update", "Cannot find the DOM element. Ignoring.", compToUpd)();
        return;
      }
      Ui2.log("trace", "_uiUpdate:components-forEach", `Element(s) to update. Count: ${elToUpd.length}`, elToUpd)();
      if (!compToUpd.slot && compToUpd.payload)
        compToUpd.slot = compToUpd.payload;
      elToUpd.forEach((el, j) => {
        Ui2.log("trace", "_uiUpdate:components-forEach", `Updating element #${j}`, el)();
        this._uiComposeComponent(el, compToUpd);
        if (compToUpd.components) {
          Ui2.log("trace", "_uiUpdate:nested-component", `Element #${j} - nested-component`, compToUpd, el)();
          const nc = { _ui: [] };
          compToUpd.components.forEach((nestedComp, k) => {
            const method = nestedComp.method || compToUpd.method || ui.method;
            if (nestedComp.method)
              delete nestedComp.method;
            if (!Array.isArray(nestedComp))
              nestedComp = [nestedComp];
            Ui2.log("trace", "_uiUpdate:nested-component", `Element #${j} - nested-component #${k}`, nestedComp)();
            nc._ui.push({
              method,
              parentEl: el,
              components: nestedComp
            });
          });
          Ui2.log("trace", "_uiUpdate:nested-component", `Element #${j} - nested-component new manager`, nc)();
          this._uiManager(nc);
        }
      });
    });
  }
  // --- end of _uiUpdate ---
  //#endregion ---- -------- ----
  //#region ---- External Methods ----
  /** Simplistic jQuery-like document CSS query selector, returns an HTML Element
   * NOTE that this fn returns the element itself. Use $$ to get the properties of 1 or more elements.
   * If the selected element is a <template>, returns the first child element.
   * type {HTMLElement}
   * @param {string} cssSelector A CSS Selector that identifies the element to return
   * @returns {HTMLElement|null} Selected HTML element or null
   */
  $(cssSelector) {
    let el = document.querySelector(cssSelector);
    if (!el) {
      Ui2.log(1, "Uib:$", `No element found for CSS selector ${cssSelector}`)();
      return null;
    }
    if (el.nodeName === "TEMPLATE") {
      el = el.content.firstElementChild;
      if (!el) {
        Ui2.log(0, "Uib:$", `Template selected for CSS selector ${cssSelector} but it is empty`)();
        return null;
      }
    }
    return el;
  }
  /** CSS query selector that returns ALL found selections. Matches the Chromium DevTools feature of the same name.
   * NOTE that this fn returns an array showing the PROPERTIES of the elements whereas $ returns the element itself
   * @param {string} cssSelector A CSS Selector that identifies the elements to return
   * @returns {HTMLElement[]} Array of DOM elements/nodes. Array is empty if selector is not found.
   */
  $$(cssSelector) {
    return Array.from(document.querySelectorAll(cssSelector));
  }
  /** Add 1 or several class names to an element
   * @param {string|string[]} classNames Single or array of classnames
   * @param {HTMLElement} el HTML Element to add class(es) to
   */
  addClass(classNames, el) {
    if (!Array.isArray(classNames))
      classNames = [classNames];
    if (el)
      el.classList.add(...classNames);
  }
  /** Converts markdown text input to HTML if the Markdown-IT library is loaded
   * Otherwise simply returns the text
   * @param {string} mdText The input markdown string
   * @returns {string} HTML (if Markdown-IT library loaded and parse successful) or original text
   */
  convertMarkdown(mdText) {
    if (!mdText)
      return "";
    if (!this.window["markdownit"])
      return mdText;
    if (!Ui2.md)
      this._markDownIt();
    try {
      return Ui2.md.render(mdText.trim());
    } catch (e) {
      Ui2.log(0, "uibuilder:convertMarkdown", `Could not render Markdown. ${e.message}`, e)();
    }
    return '<p class="border error">Could not render Markdown<p>';
  }
  /** Include HTML fragment, img, video, text, json, form data, pdf or anything else from an external file or API
   * Wraps the included object in a div tag.
   * PDF's, text or unknown MIME types are also wrapped in an iFrame.
   * @param {string} url The URL of the source file to include
   * @param {object} uiOptions Object containing properties recognised by the _uiReplace function. Must at least contain an id
   * param {string} uiOptions.id The HTML ID given to the wrapping DIV tag
   * param {string} uiOptions.parentSelector The CSS selector for a parent element to insert the new HTML under (defaults to 'body')
   * @returns {Promise<any>} Status
   */
  async include(url, uiOptions) {
    if (!fetch) {
      Ui2.log(0, "Ui:include", "Current environment does not include `fetch`, skipping.")();
      return "Current environment does not include `fetch`, skipping.";
    }
    if (!url) {
      Ui2.log(0, "Ui:include", "url parameter must be provided, skipping.")();
      return "url parameter must be provided, skipping.";
    }
    if (!uiOptions || !uiOptions.id) {
      Ui2.log(0, "Ui:include", "uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.")();
      return "uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.";
    }
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      Ui2.log(0, "Ui:include", `Fetch of file '${url}' failed. `, error.message)();
      return error.message;
    }
    if (!response.ok) {
      Ui2.log(0, "Ui:include", `Fetch of file '${url}' failed. Status='${response.statusText}'`)();
      return response.statusText;
    }
    const contentType = await response.headers.get("content-type");
    let type = null;
    if (contentType) {
      if (contentType.includes("text/html")) {
        type = "html";
      } else if (contentType.includes("application/json")) {
        type = "json";
      } else if (contentType.includes("multipart/form-data")) {
        type = "form";
      } else if (contentType.includes("image/")) {
        type = "image";
      } else if (contentType.includes("video/")) {
        type = "video";
      } else if (contentType.includes("application/pdf")) {
        type = "pdf";
      } else if (contentType.includes("text/plain")) {
        type = "text";
      }
    }
    let slot = "";
    let txtReturn = "Include successful";
    let data;
    switch (type) {
      case "html": {
        data = await response.text();
        slot = data;
        break;
      }
      case "json": {
        data = await response.json();
        slot = '<pre class="syntax-highlight">';
        slot += this.syntaxHighlight(data);
        slot += "</pre>";
        break;
      }
      case "form": {
        data = await response.formData();
        slot = '<pre class="syntax-highlight">';
        slot += this.syntaxHighlight(data);
        slot += "</pre>";
        break;
      }
      case "image": {
        data = await response.blob();
        slot = `<img src="${URL.createObjectURL(data)}">`;
        if (this.window["DOMPurify"]) {
          txtReturn = "Include successful. BUT DOMPurify loaded which may block its use.";
          Ui2.log("warn", "Ui:include:image", txtReturn)();
        }
        break;
      }
      case "video": {
        data = await response.blob();
        slot = `<video controls autoplay><source src="${URL.createObjectURL(data)}"></video>`;
        if (this.window["DOMPurify"]) {
          txtReturn = "Include successful. BUT DOMPurify loaded which may block its use.";
          Ui2.log("warn", "Ui:include:video", txtReturn)();
        }
        break;
      }
      case "pdf":
      case "text":
      default: {
        data = await response.blob();
        slot = `<iframe style="resize:both;width:inherit;height:inherit;" src="${URL.createObjectURL(data)}">`;
        if (this.window["DOMPurify"]) {
          txtReturn = "Include successful. BUT DOMPurify loaded which may block its use.";
          Ui2.log("warn", `Ui:include:${type}`, txtReturn)();
        }
        break;
      }
    }
    uiOptions.type = "div";
    uiOptions.slot = slot;
    if (!uiOptions.parent)
      uiOptions.parent = "body";
    if (!uiOptions.attributes)
      uiOptions.attributes = { class: "included" };
    this._uiReplace({
      components: [
        uiOptions
      ]
    });
    Ui2.log("trace", `Ui:include:${type}`, txtReturn)();
    return txtReturn;
  }
  // ---- End of include() ---- //
  /** Attach a new remote script to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} url The url to be used in the script src attribute
   */
  loadScriptSrc(url) {
    const newScript = this.document.createElement("script");
    newScript.src = url;
    newScript.async = false;
    this.document.head.appendChild(newScript);
  }
  /** Attach a new text script to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} textFn The text to be loaded as a script
   */
  loadScriptTxt(textFn) {
    const newScript = this.document.createElement("script");
    newScript.async = false;
    newScript.textContent = textFn;
    this.document.head.appendChild(newScript);
  }
  /** Attach a new remote stylesheet link to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} url The url to be used in the style link href attribute
   */
  loadStyleSrc(url) {
    const newStyle = this.document.createElement("link");
    newStyle.href = url;
    newStyle.rel = "stylesheet";
    newStyle.type = "text/css";
    this.document.head.appendChild(newStyle);
  }
  /** Attach a new text stylesheet to the end of HEAD synchronously
   * NOTE: It takes too long for most scripts to finish loading
   *       so this is pretty useless to work with the dynamic UI features directly.
   * @param {string} textFn The text to be loaded as a stylesheet
   */
  loadStyleTxt(textFn) {
    const newStyle = this.document.createElement("style");
    newStyle.textContent = textFn;
    this.document.head.appendChild(newStyle);
  }
  /** Load a dynamic UI from a JSON web reponse
   * @param {string} url URL that will return the ui JSON
   */
  loadui(url) {
    if (!fetch) {
      Ui2.log(0, "Ui:loadui", "Current environment does not include `fetch`, skipping.")();
      return;
    }
    if (!url) {
      Ui2.log(0, "Ui:loadui", "url parameter must be provided, skipping.")();
      return;
    }
    fetch(url).then((response) => {
      if (response.ok === false) {
        throw new Error(`Could not load '${url}'. Status ${response.status}, Error: ${response.statusText}`);
      }
      Ui2.log("trace", "Ui:loadui:then1", `Loaded '${url}'. Status ${response.status}, ${response.statusText}`)();
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError(`Fetch '${url}' did not return JSON, ignoring`);
      }
      return response.json();
    }).then((data) => {
      if (data !== void 0) {
        Ui2.log("trace", "Ui:loadui:then2", "Parsed JSON successfully obtained")();
        this._uiManager({ _ui: data });
        return true;
      }
      return false;
    }).catch((err) => {
      Ui2.log("warn", "Ui:loadui:catch", "Error. ", err)();
    });
  }
  // --- end of loadui
  /** Get standard data from a DOM node.
   * @param {*} node DOM node to examine
   * @param {string} cssSelector Identify the DOM element to get data from
   * @returns {object} Standardised data object
   */
  nodeGet(node, cssSelector) {
    const thisOut = {
      id: node.id === "" ? void 0 : node.id,
      name: node.name,
      children: node.childNodes.length,
      type: node.nodeName,
      attributes: void 0,
      isUserInput: node.validity ? true : false,
      // eslint-disable-line no-unneeded-ternary
      userInput: !node.validity ? void 0 : {
        // eslint-disable-line multiline-ternary
        value: node.value,
        validity: void 0,
        willValidate: node.willValidate,
        valueAsDate: node.valueAsDate,
        valueAsNumber: node.valueAsNumber,
        type: node.type
      }
    };
    if (["UL", "OL"].includes(node.nodeName)) {
      const listEntries = this.document.querySelectorAll(`${cssSelector} li`);
      if (listEntries) {
        thisOut.list = {
          "entries": listEntries.length
        };
      }
    }
    if (node.nodeName === "DL") {
      const listEntries = this.document.querySelectorAll(`${cssSelector} dt`);
      if (listEntries) {
        thisOut.list = {
          "entries": listEntries.length
        };
      }
    }
    if (node.nodeName === "TABLE") {
      const bodyEntries = this.document.querySelectorAll(`${cssSelector} > tbody > tr`);
      const headEntries = this.document.querySelectorAll(`${cssSelector} > thead > tr`);
      const cols = this.document.querySelectorAll(`${cssSelector} > tbody > tr:last-child > *`);
      if (bodyEntries || headEntries || cols) {
        thisOut.table = {
          "headRows": headEntries ? headEntries.length : 0,
          "bodyRows": bodyEntries ? bodyEntries.length : 0,
          "columns": cols ? cols.length : 0
        };
      }
    }
    if (node.nodeName !== "#text" && node.attributes && node.attributes.length > 0) {
      thisOut.attributes = {};
      for (const attrib of node.attributes) {
        if (attrib.name !== "id") {
          thisOut.attributes[attrib.name] = node.attributes[attrib.name].value;
        }
        if (attrib.name === "class")
          thisOut.classes = Array.from(node.classList);
      }
    }
    if (node.nodeName === "#text") {
      thisOut.text = node.textContent;
    }
    if (node.validity)
      thisOut.userInput.validity = {};
    for (const v in node.validity) {
      thisOut.userInput.validity[v] = node.validity[v];
    }
    return thisOut;
  }
  // --- end of nodeGet --- //
  /** Show a browser notification if possible. Returns a promise
   * Config can be a simple string, a Node-RED msg (topic as title, payload as body)
   * or a Notifications API options object + config.title string.
   * Config ref: https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
   * @param {object|string} config Notification config object or simple message string
   * @returns {Promise} Resolves on close or click event, returns the event.
   */
  async notification(config) {
    if (typeof config === "string") {
      config = { body: config };
    }
    if (typeof Notification === "undefined")
      return Promise.reject(new Error("Notifications not available in this browser"));
    let permit = Notification.permission;
    if (permit === "denied") {
      return Promise.reject(new Error("Notifications not permitted by user"));
    } else if (permit === "granted") {
      return this._showNotification(config);
    } else {
      permit = await Notification.requestPermission();
      if (permit === "granted") {
        return this._showNotification(config);
      }
      return Promise.reject(new Error("Notifications not permitted by user"));
    }
  }
  /** Remove All, 1 or more class names from an element
   * @param {undefined|null|""|string|string[]} classNames Single or array of classnames. If undefined, "" or null, remove all classes
   * @param {HTMLElement} el HTML Element to add class(es) to
   */
  removeClass(classNames, el) {
    if (!classNames) {
      el.removeAttribute("class");
      return;
    }
    if (!Array.isArray(classNames))
      classNames = [classNames];
    if (el)
      el.classList.remove(...classNames);
  }
  // TODO Add multi-slot
  /** Replace or add an HTML element's slot from text or an HTML string
   * Will use DOMPurify if that library has been loaded to window.
   * WARN: Executes <script> tags!
   * param {*} ui Single entry from the msg._ui property
   * @param {Element} el Reference to the element that we want to update
   * @param {*} component The component we are trying to add/replace
   */
  replaceSlot(el, component) {
    if (!component.slot)
      return;
    if (!el)
      return;
    if (this.window["DOMPurify"])
      component.slot = this.window["DOMPurify"].sanitize(component.slot);
    const tempFrag = document.createRange().createContextualFragment(component.slot);
    const elRange = document.createRange();
    elRange.selectNodeContents(el);
    elRange.deleteContents();
    el.append(tempFrag);
  }
  /** Replace or add an HTML element's slot from a Markdown string
   * Only does something if the markdownit library has been loaded to window.
   * Will use DOMPurify if that library has been loaded to window.
   * @param {Element} el Reference to the element that we want to update
   * @param {*} component The component we are trying to add/replace
   */
  replaceSlotMarkdown(el, component) {
    if (!el)
      return;
    if (!component.slotMarkdown)
      return;
    component.slotMarkdown = this.convertMarkdown(component.slotMarkdown);
    component.slotMarkdown = this.sanitiseHTML(component.slotMarkdown);
    el.innerHTML = component.slotMarkdown;
  }
  /** Sanitise HTML to make it safe - if the DOMPurify library is loaded
   * Otherwise just returns that HTML as-is.
   * @param {string} html The input HTML string
   * @returns {string} The sanitised HTML or the original if DOMPurify not loaded
   */
  sanitiseHTML(html) {
    if (!this.window["DOMPurify"])
      return html;
    return this.window["DOMPurify"].sanitize(html, { ADD_TAGS: this.sanitiseExtraTags, ADD_ATTR: this.sanitiseExtraAttribs });
  }
  /** Show a pop-over "toast" dialog or a modal alert // TODO - Allow notify to sit in corners rather than take over the screen
   * Refs: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/alertdialog.html,
   *       https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/dialog.html,
   *       https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
   * @param {"notify"|"alert"} type Dialog type
   * @param {object} ui standardised ui data
   * @param {object} [msg] msg.payload/msg.topic - only used if a string. Optional.
   * @returns {void}
   */
  showDialog(type, ui, msg) {
    let content = "";
    if (msg.payload && typeof msg.payload === "string")
      content += `<div>${msg.payload}</div>`;
    if (ui.content)
      content += `<div>${ui.content}</div>`;
    if (content === "") {
      Ui2.log(1, "Ui:showDialog", "Toast content is blank. Not shown.")();
      return;
    }
    if (!ui.title && msg.topic)
      ui.title = msg.topic;
    if (ui.title)
      content = `<p class="toast-head">${ui.title}</p><p>${content}</p>`;
    if (ui.noAutohide)
      ui.noAutoHide = ui.noAutohide;
    if (ui.noAutoHide)
      ui.autohide = !ui.noAutoHide;
    if (ui.autoHideDelay) {
      if (!ui.autohide)
        ui.autohide = true;
      ui.delay = ui.autoHideDelay;
    } else
      ui.autoHideDelay = 1e4;
    if (!Object.prototype.hasOwnProperty.call(ui, "autohide"))
      ui.autohide = true;
    if (type === "alert") {
      ui.modal = true;
      ui.autohide = false;
      content = `<svg viewBox="0 0 192.146 192.146" style="width:30;background-color:transparent;"><path d="M108.186 144.372c0 7.054-4.729 12.32-12.037 12.32h-.254c-7.054 0-11.92-5.266-11.92-12.32 0-7.298 5.012-12.31 12.174-12.31s11.91 4.992 12.037 12.31zM88.44 125.301h15.447l2.951-61.298H85.46l2.98 61.298zm101.932 51.733c-2.237 3.664-6.214 5.921-10.493 5.921H12.282c-4.426 0-8.51-2.384-10.698-6.233a12.34 12.34 0 0 1 .147-12.349l84.111-149.22c2.208-3.722 6.204-5.96 10.522-5.96h.332c4.445.107 8.441 2.618 10.513 6.546l83.515 149.229c1.993 3.8 1.905 8.363-.352 12.066zm-10.493-6.4L96.354 21.454l-84.062 149.18h167.587z" /></svg> ${content}`;
    }
    let toaster = this.document.getElementById("toaster");
    if (toaster === null) {
      toaster = this.document.createElement("div");
      toaster.id = "toaster";
      toaster.title = "Click to clear all notifcations";
      toaster.setAttribute("class", "toaster");
      toaster.setAttribute("role", "dialog");
      toaster.setAttribute("arial-label", "Toast message");
      toaster.onclick = function() {
        toaster.remove();
      };
      this.document.body.insertAdjacentElement("afterbegin", toaster);
    }
    const toast = this.document.createElement("div");
    toast.title = "Click to clear this notifcation";
    toast.setAttribute("class", `toast ${ui.variant ? ui.variant : ""} ${type}`);
    toast.innerHTML = content;
    toast.setAttribute("role", "alertdialog");
    if (ui.modal)
      toast.setAttribute("aria-modal", ui.modal);
    toast.onclick = function(evt) {
      evt.stopPropagation();
      toast.remove();
      if (toaster.childElementCount < 1)
        toaster.remove();
    };
    if (type === "alert") {
    }
    toaster.insertAdjacentElement(ui.appendToast === true ? "beforeend" : "afterbegin", toast);
    if (ui.autohide === true) {
      setInterval(() => {
        toast.remove();
        if (toaster.childElementCount < 1)
          toaster.remove();
      }, ui.autoHideDelay);
    }
  }
  // --- End of showDialog ---
  /** Directly manage UI via JSON
   * @param {object} json Either an object containing {_ui: {}} or simply simple {} containing ui instructions
   */
  ui(json) {
    let msg = {};
    if (json._ui)
      msg = json;
    else
      msg._ui = json;
    console.log(this);
    this._uiManager(msg);
  }
  /** Get data from the DOM. Returns selection of useful props unless a specific prop requested.
   * @param {string} cssSelector Identify the DOM element to get data from
   * @param {string} [propName] Optional. Specific name of property to get from the element
   * @returns {Array<*>} Array of objects containing either specific requested property or a selection of useful properties
   */
  uiGet(cssSelector, propName = null) {
    const selection = (
      /** @type {NodeListOf<HTMLInputElement>} */
      this.document.querySelectorAll(cssSelector)
    );
    const out = [];
    selection.forEach((node) => {
      if (propName) {
        if (propName === "classes")
          propName = "class";
        let prop = node.getAttribute(propName);
        if (prop === void 0 || prop === null) {
          try {
            prop = node[propName];
          } catch (error) {
          }
        }
        if (prop === void 0 || prop === null) {
          if (propName.toLowerCase() === "value")
            out.push(node.innerText);
          else
            out.push(`Property '${propName}' not found`);
        } else {
          const p = {};
          const cType = prop.constructor.name.toLowerCase();
          if (cType === "namednodemap") {
            for (const key of prop) {
              p[key.name] = prop[key.name].value;
            }
          } else if (!cType.includes("map")) {
            p[propName] = prop;
          } else {
            const p2 = {};
            for (const key in prop) {
              p2[key] = prop[key];
            }
          }
          if (p.class)
            p.classes = Array.from(node.classList);
          out.push(p);
        }
      } else {
        out.push(this.nodeGet(node, cssSelector));
      }
    });
    return out;
  }
  // --- end of uiGet --- //
  /** External alias for _uiComposeComponent
   * @param {*} el HTML Element to enhance
   * @param {*} comp Individual uibuilder ui component spec
   */
  uiEnhanceElement(el, comp) {
    this._uiComposeComponent(el, comp);
  }
  //#endregion ---- -------- ----
};
module.exports = Ui;
