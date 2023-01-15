(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value2) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key] = value2;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __publicField = (obj, key, value2) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value2);
    return value2;
  };
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value2) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value2);
  };
  var __privateSet = (obj, member, value2, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value2) : member.set(obj, value2);
    return value2;
  };
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value2) {
      __privateSet(obj, member, value2, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });

  // node_modules/engine.io-parser/build/esm/commons.js
  var PACKET_TYPES = /* @__PURE__ */ Object.create(null);
  PACKET_TYPES["open"] = "0";
  PACKET_TYPES["close"] = "1";
  PACKET_TYPES["ping"] = "2";
  PACKET_TYPES["pong"] = "3";
  PACKET_TYPES["message"] = "4";
  PACKET_TYPES["upgrade"] = "5";
  PACKET_TYPES["noop"] = "6";
  var PACKET_TYPES_REVERSE = /* @__PURE__ */ Object.create(null);
  Object.keys(PACKET_TYPES).forEach((key) => {
    PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
  });
  var ERROR_PACKET = { type: "error", data: "parser error" };

  // node_modules/engine.io-parser/build/esm/encodePacket.browser.js
  var withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]";
  var withNativeArrayBuffer = typeof ArrayBuffer === "function";
  var isView = (obj) => {
    return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
  };
  var encodePacket = ({ type, data }, supportsBinary, callback) => {
    if (withNativeBlob && data instanceof Blob) {
      if (supportsBinary) {
        return callback(data);
      } else {
        return encodeBlobAsBase64(data, callback);
      }
    } else if (withNativeArrayBuffer && (data instanceof ArrayBuffer || isView(data))) {
      if (supportsBinary) {
        return callback(data);
      } else {
        return encodeBlobAsBase64(new Blob([data]), callback);
      }
    }
    return callback(PACKET_TYPES[type] + (data || ""));
  };
  var encodeBlobAsBase64 = (data, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function() {
      const content = fileReader.result.split(",")[1];
      callback("b" + content);
    };
    return fileReader.readAsDataURL(data);
  };
  var encodePacket_browser_default = encodePacket;

  // node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
  for (let i2 = 0; i2 < chars.length; i2++) {
    lookup[chars.charCodeAt(i2)] = i2;
  }
  var decode = (base64) => {
    let bufferLength = base64.length * 0.75, len = base64.length, i2, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }
    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i2 = 0; i2 < len; i2 += 4) {
      encoded1 = lookup[base64.charCodeAt(i2)];
      encoded2 = lookup[base64.charCodeAt(i2 + 1)];
      encoded3 = lookup[base64.charCodeAt(i2 + 2)];
      encoded4 = lookup[base64.charCodeAt(i2 + 3)];
      bytes[p++] = encoded1 << 2 | encoded2 >> 4;
      bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
      bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return arraybuffer;
  };

  // node_modules/engine.io-parser/build/esm/decodePacket.browser.js
  var withNativeArrayBuffer2 = typeof ArrayBuffer === "function";
  var decodePacket = (encodedPacket, binaryType) => {
    if (typeof encodedPacket !== "string") {
      return {
        type: "message",
        data: mapBinary(encodedPacket, binaryType)
      };
    }
    const type = encodedPacket.charAt(0);
    if (type === "b") {
      return {
        type: "message",
        data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
      };
    }
    const packetType = PACKET_TYPES_REVERSE[type];
    if (!packetType) {
      return ERROR_PACKET;
    }
    return encodedPacket.length > 1 ? {
      type: PACKET_TYPES_REVERSE[type],
      data: encodedPacket.substring(1)
    } : {
      type: PACKET_TYPES_REVERSE[type]
    };
  };
  var decodeBase64Packet = (data, binaryType) => {
    if (withNativeArrayBuffer2) {
      const decoded = decode(data);
      return mapBinary(decoded, binaryType);
    } else {
      return { base64: true, data };
    }
  };
  var mapBinary = (data, binaryType) => {
    switch (binaryType) {
      case "blob":
        return data instanceof ArrayBuffer ? new Blob([data]) : data;
      case "arraybuffer":
      default:
        return data;
    }
  };
  var decodePacket_browser_default = decodePacket;

  // node_modules/engine.io-parser/build/esm/index.js
  var SEPARATOR = String.fromCharCode(30);
  var encodePayload = (packets, callback) => {
    const length2 = packets.length;
    const encodedPackets = new Array(length2);
    let count = 0;
    packets.forEach((packet, i2) => {
      encodePacket_browser_default(packet, false, (encodedPacket) => {
        encodedPackets[i2] = encodedPacket;
        if (++count === length2) {
          callback(encodedPackets.join(SEPARATOR));
        }
      });
    });
  };
  var decodePayload = (encodedPayload, binaryType) => {
    const encodedPackets = encodedPayload.split(SEPARATOR);
    const packets = [];
    for (let i2 = 0; i2 < encodedPackets.length; i2++) {
      const decodedPacket = decodePacket_browser_default(encodedPackets[i2], binaryType);
      packets.push(decodedPacket);
      if (decodedPacket.type === "error") {
        break;
      }
    }
    return packets;
  };
  var protocol = 4;

  // node_modules/@socket.io/component-emitter/index.mjs
  function Emitter(obj) {
    if (obj)
      return mixin(obj);
  }
  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }
    return obj;
  }
  Emitter.prototype.on = Emitter.prototype.addEventListener = function(event2, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks["$" + event2] = this._callbacks["$" + event2] || []).push(fn);
    return this;
  };
  Emitter.prototype.once = function(event2, fn) {
    function on2() {
      this.off(event2, on2);
      fn.apply(this, arguments);
    }
    on2.fn = fn;
    this.on(event2, on2);
    return this;
  };
  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event2, fn) {
    this._callbacks = this._callbacks || {};
    if (0 == arguments.length) {
      this._callbacks = {};
      return this;
    }
    var callbacks = this._callbacks["$" + event2];
    if (!callbacks)
      return this;
    if (1 == arguments.length) {
      delete this._callbacks["$" + event2];
      return this;
    }
    var cb;
    for (var i2 = 0; i2 < callbacks.length; i2++) {
      cb = callbacks[i2];
      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i2, 1);
        break;
      }
    }
    if (callbacks.length === 0) {
      delete this._callbacks["$" + event2];
    }
    return this;
  };
  Emitter.prototype.emit = function(event2) {
    this._callbacks = this._callbacks || {};
    var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event2];
    for (var i2 = 1; i2 < arguments.length; i2++) {
      args[i2 - 1] = arguments[i2];
    }
    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i2 = 0, len = callbacks.length; i2 < len; ++i2) {
        callbacks[i2].apply(this, args);
      }
    }
    return this;
  };
  Emitter.prototype.emitReserved = Emitter.prototype.emit;
  Emitter.prototype.listeners = function(event2) {
    this._callbacks = this._callbacks || {};
    return this._callbacks["$" + event2] || [];
  };
  Emitter.prototype.hasListeners = function(event2) {
    return !!this.listeners(event2).length;
  };

  // node_modules/engine.io-client/build/esm/globalThis.browser.js
  var globalThisShim = (() => {
    if (typeof self !== "undefined") {
      return self;
    } else if (typeof window !== "undefined") {
      return window;
    } else {
      return Function("return this")();
    }
  })();

  // node_modules/engine.io-client/build/esm/util.js
  function pick(obj, ...attr) {
    return attr.reduce((acc, k) => {
      if (obj.hasOwnProperty(k)) {
        acc[k] = obj[k];
      }
      return acc;
    }, {});
  }
  var NATIVE_SET_TIMEOUT = setTimeout;
  var NATIVE_CLEAR_TIMEOUT = clearTimeout;
  function installTimerFunctions(obj, opts) {
    if (opts.useNativeTimers) {
      obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
      obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
    } else {
      obj.setTimeoutFn = setTimeout.bind(globalThisShim);
      obj.clearTimeoutFn = clearTimeout.bind(globalThisShim);
    }
  }
  var BASE64_OVERHEAD = 1.33;
  function byteLength(obj) {
    if (typeof obj === "string") {
      return utf8Length(obj);
    }
    return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
  }
  function utf8Length(str) {
    let c = 0, length2 = 0;
    for (let i2 = 0, l = str.length; i2 < l; i2++) {
      c = str.charCodeAt(i2);
      if (c < 128) {
        length2 += 1;
      } else if (c < 2048) {
        length2 += 2;
      } else if (c < 55296 || c >= 57344) {
        length2 += 3;
      } else {
        i2++;
        length2 += 4;
      }
    }
    return length2;
  }

  // node_modules/engine.io-client/build/esm/transport.js
  var TransportError = class extends Error {
    constructor(reason, description, context) {
      super(reason);
      this.description = description;
      this.context = context;
      this.type = "TransportError";
    }
  };
  var Transport = class extends Emitter {
    constructor(opts) {
      super();
      this.writable = false;
      installTimerFunctions(this, opts);
      this.opts = opts;
      this.query = opts.query;
      this.readyState = "";
      this.socket = opts.socket;
    }
    onError(reason, description, context) {
      super.emitReserved("error", new TransportError(reason, description, context));
      return this;
    }
    open() {
      if ("closed" === this.readyState || "" === this.readyState) {
        this.readyState = "opening";
        this.doOpen();
      }
      return this;
    }
    close() {
      if ("opening" === this.readyState || "open" === this.readyState) {
        this.doClose();
        this.onClose();
      }
      return this;
    }
    send(packets) {
      if ("open" === this.readyState) {
        this.write(packets);
      } else {
      }
    }
    onOpen() {
      this.readyState = "open";
      this.writable = true;
      super.emitReserved("open");
    }
    onData(data) {
      const packet = decodePacket_browser_default(data, this.socket.binaryType);
      this.onPacket(packet);
    }
    onPacket(packet) {
      super.emitReserved("packet", packet);
    }
    onClose(details) {
      this.readyState = "closed";
      super.emitReserved("close", details);
    }
  };

  // node_modules/engine.io-client/build/esm/contrib/yeast.js
  var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
  var length = 64;
  var map = {};
  var seed = 0;
  var i = 0;
  var prev;
  function encode(num) {
    let encoded = "";
    do {
      encoded = alphabet[num % length] + encoded;
      num = Math.floor(num / length);
    } while (num > 0);
    return encoded;
  }
  function yeast() {
    const now = encode(+new Date());
    if (now !== prev)
      return seed = 0, prev = now;
    return now + "." + encode(seed++);
  }
  for (; i < length; i++)
    map[alphabet[i]] = i;

  // node_modules/engine.io-client/build/esm/contrib/parseqs.js
  function encode2(obj) {
    let str = "";
    for (let i2 in obj) {
      if (obj.hasOwnProperty(i2)) {
        if (str.length)
          str += "&";
        str += encodeURIComponent(i2) + "=" + encodeURIComponent(obj[i2]);
      }
    }
    return str;
  }
  function decode2(qs) {
    let qry = {};
    let pairs = qs.split("&");
    for (let i2 = 0, l = pairs.length; i2 < l; i2++) {
      let pair = pairs[i2].split("=");
      qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
  }

  // node_modules/engine.io-client/build/esm/contrib/has-cors.js
  var value = false;
  try {
    value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
  } catch (err) {
  }
  var hasCORS = value;

  // node_modules/engine.io-client/build/esm/transports/xmlhttprequest.browser.js
  function XHR(opts) {
    const xdomain = opts.xdomain;
    try {
      if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
        return new XMLHttpRequest();
      }
    } catch (e) {
    }
    if (!xdomain) {
      try {
        return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
      } catch (e) {
      }
    }
  }

  // node_modules/engine.io-client/build/esm/transports/polling.js
  function empty() {
  }
  var hasXHR2 = function() {
    const xhr = new XHR({
      xdomain: false
    });
    return null != xhr.responseType;
  }();
  var Polling = class extends Transport {
    constructor(opts) {
      super(opts);
      this.polling = false;
      if (typeof location !== "undefined") {
        const isSSL = "https:" === location.protocol;
        let port = location.port;
        if (!port) {
          port = isSSL ? "443" : "80";
        }
        this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
        this.xs = opts.secure !== isSSL;
      }
      const forceBase64 = opts && opts.forceBase64;
      this.supportsBinary = hasXHR2 && !forceBase64;
    }
    get name() {
      return "polling";
    }
    doOpen() {
      this.poll();
    }
    pause(onPause) {
      this.readyState = "pausing";
      const pause = () => {
        this.readyState = "paused";
        onPause();
      };
      if (this.polling || !this.writable) {
        let total = 0;
        if (this.polling) {
          total++;
          this.once("pollComplete", function() {
            --total || pause();
          });
        }
        if (!this.writable) {
          total++;
          this.once("drain", function() {
            --total || pause();
          });
        }
      } else {
        pause();
      }
    }
    poll() {
      this.polling = true;
      this.doPoll();
      this.emitReserved("poll");
    }
    onData(data) {
      const callback = (packet) => {
        if ("opening" === this.readyState && packet.type === "open") {
          this.onOpen();
        }
        if ("close" === packet.type) {
          this.onClose({ description: "transport closed by the server" });
          return false;
        }
        this.onPacket(packet);
      };
      decodePayload(data, this.socket.binaryType).forEach(callback);
      if ("closed" !== this.readyState) {
        this.polling = false;
        this.emitReserved("pollComplete");
        if ("open" === this.readyState) {
          this.poll();
        } else {
        }
      }
    }
    doClose() {
      const close = () => {
        this.write([{ type: "close" }]);
      };
      if ("open" === this.readyState) {
        close();
      } else {
        this.once("open", close);
      }
    }
    write(packets) {
      this.writable = false;
      encodePayload(packets, (data) => {
        this.doWrite(data, () => {
          this.writable = true;
          this.emitReserved("drain");
        });
      });
    }
    uri() {
      let query = this.query || {};
      const schema = this.opts.secure ? "https" : "http";
      let port = "";
      if (false !== this.opts.timestampRequests) {
        query[this.opts.timestampParam] = yeast();
      }
      if (!this.supportsBinary && !query.sid) {
        query.b64 = 1;
      }
      if (this.opts.port && ("https" === schema && Number(this.opts.port) !== 443 || "http" === schema && Number(this.opts.port) !== 80)) {
        port = ":" + this.opts.port;
      }
      const encodedQuery = encode2(query);
      const ipv6 = this.opts.hostname.indexOf(":") !== -1;
      return schema + "://" + (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) + port + this.opts.path + (encodedQuery.length ? "?" + encodedQuery : "");
    }
    request(opts = {}) {
      Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
      return new Request(this.uri(), opts);
    }
    doWrite(data, fn) {
      const req = this.request({
        method: "POST",
        data
      });
      req.on("success", fn);
      req.on("error", (xhrStatus, context) => {
        this.onError("xhr post error", xhrStatus, context);
      });
    }
    doPoll() {
      const req = this.request();
      req.on("data", this.onData.bind(this));
      req.on("error", (xhrStatus, context) => {
        this.onError("xhr poll error", xhrStatus, context);
      });
      this.pollXhr = req;
    }
  };
  var Request = class extends Emitter {
    constructor(uri, opts) {
      super();
      installTimerFunctions(this, opts);
      this.opts = opts;
      this.method = opts.method || "GET";
      this.uri = uri;
      this.async = false !== opts.async;
      this.data = void 0 !== opts.data ? opts.data : null;
      this.create();
    }
    create() {
      const opts = pick(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
      opts.xdomain = !!this.opts.xd;
      opts.xscheme = !!this.opts.xs;
      const xhr = this.xhr = new XHR(opts);
      try {
        xhr.open(this.method, this.uri, this.async);
        try {
          if (this.opts.extraHeaders) {
            xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
            for (let i2 in this.opts.extraHeaders) {
              if (this.opts.extraHeaders.hasOwnProperty(i2)) {
                xhr.setRequestHeader(i2, this.opts.extraHeaders[i2]);
              }
            }
          }
        } catch (e) {
        }
        if ("POST" === this.method) {
          try {
            xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
          } catch (e) {
          }
        }
        try {
          xhr.setRequestHeader("Accept", "*/*");
        } catch (e) {
        }
        if ("withCredentials" in xhr) {
          xhr.withCredentials = this.opts.withCredentials;
        }
        if (this.opts.requestTimeout) {
          xhr.timeout = this.opts.requestTimeout;
        }
        xhr.onreadystatechange = () => {
          if (4 !== xhr.readyState)
            return;
          if (200 === xhr.status || 1223 === xhr.status) {
            this.onLoad();
          } else {
            this.setTimeoutFn(() => {
              this.onError(typeof xhr.status === "number" ? xhr.status : 0);
            }, 0);
          }
        };
        xhr.send(this.data);
      } catch (e) {
        this.setTimeoutFn(() => {
          this.onError(e);
        }, 0);
        return;
      }
      if (typeof document !== "undefined") {
        this.index = Request.requestsCount++;
        Request.requests[this.index] = this;
      }
    }
    onError(err) {
      this.emitReserved("error", err, this.xhr);
      this.cleanup(true);
    }
    cleanup(fromError) {
      if ("undefined" === typeof this.xhr || null === this.xhr) {
        return;
      }
      this.xhr.onreadystatechange = empty;
      if (fromError) {
        try {
          this.xhr.abort();
        } catch (e) {
        }
      }
      if (typeof document !== "undefined") {
        delete Request.requests[this.index];
      }
      this.xhr = null;
    }
    onLoad() {
      const data = this.xhr.responseText;
      if (data !== null) {
        this.emitReserved("data", data);
        this.emitReserved("success");
        this.cleanup();
      }
    }
    abort() {
      this.cleanup();
    }
  };
  Request.requestsCount = 0;
  Request.requests = {};
  if (typeof document !== "undefined") {
    if (typeof attachEvent === "function") {
      attachEvent("onunload", unloadHandler);
    } else if (typeof addEventListener === "function") {
      const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
      addEventListener(terminationEvent, unloadHandler, false);
    }
  }
  function unloadHandler() {
    for (let i2 in Request.requests) {
      if (Request.requests.hasOwnProperty(i2)) {
        Request.requests[i2].abort();
      }
    }
  }

  // node_modules/engine.io-client/build/esm/transports/websocket-constructor.browser.js
  var nextTick = (() => {
    const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
    if (isPromiseAvailable) {
      return (cb) => Promise.resolve().then(cb);
    } else {
      return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
    }
  })();
  var WebSocket = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
  var usingBrowserWebSocket = true;
  var defaultBinaryType = "arraybuffer";

  // node_modules/engine.io-client/build/esm/transports/websocket.js
  var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
  var WS = class extends Transport {
    constructor(opts) {
      super(opts);
      this.supportsBinary = !opts.forceBase64;
    }
    get name() {
      return "websocket";
    }
    doOpen() {
      if (!this.check()) {
        return;
      }
      const uri = this.uri();
      const protocols = this.opts.protocols;
      const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
      if (this.opts.extraHeaders) {
        opts.headers = this.opts.extraHeaders;
      }
      try {
        this.ws = usingBrowserWebSocket && !isReactNative ? protocols ? new WebSocket(uri, protocols) : new WebSocket(uri) : new WebSocket(uri, protocols, opts);
      } catch (err) {
        return this.emitReserved("error", err);
      }
      this.ws.binaryType = this.socket.binaryType || defaultBinaryType;
      this.addEventListeners();
    }
    addEventListeners() {
      this.ws.onopen = () => {
        if (this.opts.autoUnref) {
          this.ws._socket.unref();
        }
        this.onOpen();
      };
      this.ws.onclose = (closeEvent) => this.onClose({
        description: "websocket connection closed",
        context: closeEvent
      });
      this.ws.onmessage = (ev) => this.onData(ev.data);
      this.ws.onerror = (e) => this.onError("websocket error", e);
    }
    write(packets) {
      this.writable = false;
      for (let i2 = 0; i2 < packets.length; i2++) {
        const packet = packets[i2];
        const lastPacket = i2 === packets.length - 1;
        encodePacket_browser_default(packet, this.supportsBinary, (data) => {
          const opts = {};
          if (!usingBrowserWebSocket) {
            if (packet.options) {
              opts.compress = packet.options.compress;
            }
            if (this.opts.perMessageDeflate) {
              const len = "string" === typeof data ? Buffer.byteLength(data) : data.length;
              if (len < this.opts.perMessageDeflate.threshold) {
                opts.compress = false;
              }
            }
          }
          try {
            if (usingBrowserWebSocket) {
              this.ws.send(data);
            } else {
              this.ws.send(data, opts);
            }
          } catch (e) {
          }
          if (lastPacket) {
            nextTick(() => {
              this.writable = true;
              this.emitReserved("drain");
            }, this.setTimeoutFn);
          }
        });
      }
    }
    doClose() {
      if (typeof this.ws !== "undefined") {
        this.ws.close();
        this.ws = null;
      }
    }
    uri() {
      let query = this.query || {};
      const schema = this.opts.secure ? "wss" : "ws";
      let port = "";
      if (this.opts.port && ("wss" === schema && Number(this.opts.port) !== 443 || "ws" === schema && Number(this.opts.port) !== 80)) {
        port = ":" + this.opts.port;
      }
      if (this.opts.timestampRequests) {
        query[this.opts.timestampParam] = yeast();
      }
      if (!this.supportsBinary) {
        query.b64 = 1;
      }
      const encodedQuery = encode2(query);
      const ipv6 = this.opts.hostname.indexOf(":") !== -1;
      return schema + "://" + (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) + port + this.opts.path + (encodedQuery.length ? "?" + encodedQuery : "");
    }
    check() {
      return !!WebSocket;
    }
  };

  // node_modules/engine.io-client/build/esm/transports/index.js
  var transports = {
    websocket: WS,
    polling: Polling
  };

  // node_modules/engine.io-client/build/esm/contrib/parseuri.js
  var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
  var parts = [
    "source",
    "protocol",
    "authority",
    "userInfo",
    "user",
    "password",
    "host",
    "port",
    "relative",
    "path",
    "directory",
    "file",
    "query",
    "anchor"
  ];
  function parse(str) {
    const src = str, b = str.indexOf("["), e = str.indexOf("]");
    if (b != -1 && e != -1) {
      str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
    }
    let m = re.exec(str || ""), uri = {}, i2 = 14;
    while (i2--) {
      uri[parts[i2]] = m[i2] || "";
    }
    if (b != -1 && e != -1) {
      uri.source = src;
      uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
      uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
      uri.ipv6uri = true;
    }
    uri.pathNames = pathNames(uri, uri["path"]);
    uri.queryKey = queryKey(uri, uri["query"]);
    return uri;
  }
  function pathNames(obj, path) {
    const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
    if (path.slice(0, 1) == "/" || path.length === 0) {
      names.splice(0, 1);
    }
    if (path.slice(-1) == "/") {
      names.splice(names.length - 1, 1);
    }
    return names;
  }
  function queryKey(uri, query) {
    const data = {};
    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
      if ($1) {
        data[$1] = $2;
      }
    });
    return data;
  }

  // node_modules/engine.io-client/build/esm/socket.js
  var Socket = class extends Emitter {
    constructor(uri, opts = {}) {
      super();
      if (uri && "object" === typeof uri) {
        opts = uri;
        uri = null;
      }
      if (uri) {
        uri = parse(uri);
        opts.hostname = uri.host;
        opts.secure = uri.protocol === "https" || uri.protocol === "wss";
        opts.port = uri.port;
        if (uri.query)
          opts.query = uri.query;
      } else if (opts.host) {
        opts.hostname = parse(opts.host).host;
      }
      installTimerFunctions(this, opts);
      this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
      if (opts.hostname && !opts.port) {
        opts.port = this.secure ? "443" : "80";
      }
      this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
      this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
      this.transports = opts.transports || ["polling", "websocket"];
      this.readyState = "";
      this.writeBuffer = [];
      this.prevBufferLen = 0;
      this.opts = Object.assign({
        path: "/engine.io",
        agent: false,
        withCredentials: false,
        upgrade: true,
        timestampParam: "t",
        rememberUpgrade: false,
        rejectUnauthorized: true,
        perMessageDeflate: {
          threshold: 1024
        },
        transportOptions: {},
        closeOnBeforeunload: true
      }, opts);
      this.opts.path = this.opts.path.replace(/\/$/, "") + "/";
      if (typeof this.opts.query === "string") {
        this.opts.query = decode2(this.opts.query);
      }
      this.id = null;
      this.upgrades = null;
      this.pingInterval = null;
      this.pingTimeout = null;
      this.pingTimeoutTimer = null;
      if (typeof addEventListener === "function") {
        if (this.opts.closeOnBeforeunload) {
          this.beforeunloadEventListener = () => {
            if (this.transport) {
              this.transport.removeAllListeners();
              this.transport.close();
            }
          };
          addEventListener("beforeunload", this.beforeunloadEventListener, false);
        }
        if (this.hostname !== "localhost") {
          this.offlineEventListener = () => {
            this.onClose("transport close", {
              description: "network connection lost"
            });
          };
          addEventListener("offline", this.offlineEventListener, false);
        }
      }
      this.open();
    }
    createTransport(name) {
      const query = Object.assign({}, this.opts.query);
      query.EIO = protocol;
      query.transport = name;
      if (this.id)
        query.sid = this.id;
      const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
        query,
        socket: this,
        hostname: this.hostname,
        secure: this.secure,
        port: this.port
      });
      return new transports[name](opts);
    }
    open() {
      let transport;
      if (this.opts.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1) {
        transport = "websocket";
      } else if (0 === this.transports.length) {
        this.setTimeoutFn(() => {
          this.emitReserved("error", "No transports available");
        }, 0);
        return;
      } else {
        transport = this.transports[0];
      }
      this.readyState = "opening";
      try {
        transport = this.createTransport(transport);
      } catch (e) {
        this.transports.shift();
        this.open();
        return;
      }
      transport.open();
      this.setTransport(transport);
    }
    setTransport(transport) {
      if (this.transport) {
        this.transport.removeAllListeners();
      }
      this.transport = transport;
      transport.on("drain", this.onDrain.bind(this)).on("packet", this.onPacket.bind(this)).on("error", this.onError.bind(this)).on("close", (reason) => this.onClose("transport close", reason));
    }
    probe(name) {
      let transport = this.createTransport(name);
      let failed = false;
      Socket.priorWebsocketSuccess = false;
      const onTransportOpen = () => {
        if (failed)
          return;
        transport.send([{ type: "ping", data: "probe" }]);
        transport.once("packet", (msg) => {
          if (failed)
            return;
          if ("pong" === msg.type && "probe" === msg.data) {
            this.upgrading = true;
            this.emitReserved("upgrading", transport);
            if (!transport)
              return;
            Socket.priorWebsocketSuccess = "websocket" === transport.name;
            this.transport.pause(() => {
              if (failed)
                return;
              if ("closed" === this.readyState)
                return;
              cleanup();
              this.setTransport(transport);
              transport.send([{ type: "upgrade" }]);
              this.emitReserved("upgrade", transport);
              transport = null;
              this.upgrading = false;
              this.flush();
            });
          } else {
            const err = new Error("probe error");
            err.transport = transport.name;
            this.emitReserved("upgradeError", err);
          }
        });
      };
      function freezeTransport() {
        if (failed)
          return;
        failed = true;
        cleanup();
        transport.close();
        transport = null;
      }
      const onerror = (err) => {
        const error = new Error("probe error: " + err);
        error.transport = transport.name;
        freezeTransport();
        this.emitReserved("upgradeError", error);
      };
      function onTransportClose() {
        onerror("transport closed");
      }
      function onclose() {
        onerror("socket closed");
      }
      function onupgrade(to) {
        if (transport && to.name !== transport.name) {
          freezeTransport();
        }
      }
      const cleanup = () => {
        transport.removeListener("open", onTransportOpen);
        transport.removeListener("error", onerror);
        transport.removeListener("close", onTransportClose);
        this.off("close", onclose);
        this.off("upgrading", onupgrade);
      };
      transport.once("open", onTransportOpen);
      transport.once("error", onerror);
      transport.once("close", onTransportClose);
      this.once("close", onclose);
      this.once("upgrading", onupgrade);
      transport.open();
    }
    onOpen() {
      this.readyState = "open";
      Socket.priorWebsocketSuccess = "websocket" === this.transport.name;
      this.emitReserved("open");
      this.flush();
      if ("open" === this.readyState && this.opts.upgrade && this.transport.pause) {
        let i2 = 0;
        const l = this.upgrades.length;
        for (; i2 < l; i2++) {
          this.probe(this.upgrades[i2]);
        }
      }
    }
    onPacket(packet) {
      if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
        this.emitReserved("packet", packet);
        this.emitReserved("heartbeat");
        switch (packet.type) {
          case "open":
            this.onHandshake(JSON.parse(packet.data));
            break;
          case "ping":
            this.resetPingTimeout();
            this.sendPacket("pong");
            this.emitReserved("ping");
            this.emitReserved("pong");
            break;
          case "error":
            const err = new Error("server error");
            err.code = packet.data;
            this.onError(err);
            break;
          case "message":
            this.emitReserved("data", packet.data);
            this.emitReserved("message", packet.data);
            break;
        }
      } else {
      }
    }
    onHandshake(data) {
      this.emitReserved("handshake", data);
      this.id = data.sid;
      this.transport.query.sid = data.sid;
      this.upgrades = this.filterUpgrades(data.upgrades);
      this.pingInterval = data.pingInterval;
      this.pingTimeout = data.pingTimeout;
      this.maxPayload = data.maxPayload;
      this.onOpen();
      if ("closed" === this.readyState)
        return;
      this.resetPingTimeout();
    }
    resetPingTimeout() {
      this.clearTimeoutFn(this.pingTimeoutTimer);
      this.pingTimeoutTimer = this.setTimeoutFn(() => {
        this.onClose("ping timeout");
      }, this.pingInterval + this.pingTimeout);
      if (this.opts.autoUnref) {
        this.pingTimeoutTimer.unref();
      }
    }
    onDrain() {
      this.writeBuffer.splice(0, this.prevBufferLen);
      this.prevBufferLen = 0;
      if (0 === this.writeBuffer.length) {
        this.emitReserved("drain");
      } else {
        this.flush();
      }
    }
    flush() {
      if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
        const packets = this.getWritablePackets();
        this.transport.send(packets);
        this.prevBufferLen = packets.length;
        this.emitReserved("flush");
      }
    }
    getWritablePackets() {
      const shouldCheckPayloadSize = this.maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
      if (!shouldCheckPayloadSize) {
        return this.writeBuffer;
      }
      let payloadSize = 1;
      for (let i2 = 0; i2 < this.writeBuffer.length; i2++) {
        const data = this.writeBuffer[i2].data;
        if (data) {
          payloadSize += byteLength(data);
        }
        if (i2 > 0 && payloadSize > this.maxPayload) {
          return this.writeBuffer.slice(0, i2);
        }
        payloadSize += 2;
      }
      return this.writeBuffer;
    }
    write(msg, options, fn) {
      this.sendPacket("message", msg, options, fn);
      return this;
    }
    send(msg, options, fn) {
      this.sendPacket("message", msg, options, fn);
      return this;
    }
    sendPacket(type, data, options, fn) {
      if ("function" === typeof data) {
        fn = data;
        data = void 0;
      }
      if ("function" === typeof options) {
        fn = options;
        options = null;
      }
      if ("closing" === this.readyState || "closed" === this.readyState) {
        return;
      }
      options = options || {};
      options.compress = false !== options.compress;
      const packet = {
        type,
        data,
        options
      };
      this.emitReserved("packetCreate", packet);
      this.writeBuffer.push(packet);
      if (fn)
        this.once("flush", fn);
      this.flush();
    }
    close() {
      const close = () => {
        this.onClose("forced close");
        this.transport.close();
      };
      const cleanupAndClose = () => {
        this.off("upgrade", cleanupAndClose);
        this.off("upgradeError", cleanupAndClose);
        close();
      };
      const waitForUpgrade = () => {
        this.once("upgrade", cleanupAndClose);
        this.once("upgradeError", cleanupAndClose);
      };
      if ("opening" === this.readyState || "open" === this.readyState) {
        this.readyState = "closing";
        if (this.writeBuffer.length) {
          this.once("drain", () => {
            if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          });
        } else if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      }
      return this;
    }
    onError(err) {
      Socket.priorWebsocketSuccess = false;
      this.emitReserved("error", err);
      this.onClose("transport error", err);
    }
    onClose(reason, description) {
      if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
        this.clearTimeoutFn(this.pingTimeoutTimer);
        this.transport.removeAllListeners("close");
        this.transport.close();
        this.transport.removeAllListeners();
        if (typeof removeEventListener === "function") {
          removeEventListener("beforeunload", this.beforeunloadEventListener, false);
          removeEventListener("offline", this.offlineEventListener, false);
        }
        this.readyState = "closed";
        this.id = null;
        this.emitReserved("close", reason, description);
        this.writeBuffer = [];
        this.prevBufferLen = 0;
      }
    }
    filterUpgrades(upgrades) {
      const filteredUpgrades = [];
      let i2 = 0;
      const j = upgrades.length;
      for (; i2 < j; i2++) {
        if (~this.transports.indexOf(upgrades[i2]))
          filteredUpgrades.push(upgrades[i2]);
      }
      return filteredUpgrades;
    }
  };
  Socket.protocol = protocol;

  // node_modules/engine.io-client/build/esm/index.js
  var protocol2 = Socket.protocol;

  // node_modules/socket.io-client/build/esm/url.js
  function url(uri, path = "", loc) {
    let obj = uri;
    loc = loc || typeof location !== "undefined" && location;
    if (null == uri)
      uri = loc.protocol + "//" + loc.host;
    if (typeof uri === "string") {
      if ("/" === uri.charAt(0)) {
        if ("/" === uri.charAt(1)) {
          uri = loc.protocol + uri;
        } else {
          uri = loc.host + uri;
        }
      }
      if (!/^(https?|wss?):\/\//.test(uri)) {
        if ("undefined" !== typeof loc) {
          uri = loc.protocol + "//" + uri;
        } else {
          uri = "https://" + uri;
        }
      }
      obj = parse(uri);
    }
    if (!obj.port) {
      if (/^(http|ws)$/.test(obj.protocol)) {
        obj.port = "80";
      } else if (/^(http|ws)s$/.test(obj.protocol)) {
        obj.port = "443";
      }
    }
    obj.path = obj.path || "/";
    const ipv6 = obj.host.indexOf(":") !== -1;
    const host = ipv6 ? "[" + obj.host + "]" : obj.host;
    obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
    obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
    return obj;
  }

  // node_modules/socket.io-parser/build/esm/index.js
  var esm_exports = {};
  __export(esm_exports, {
    Decoder: () => Decoder,
    Encoder: () => Encoder,
    PacketType: () => PacketType,
    protocol: () => protocol3
  });

  // node_modules/socket.io-parser/build/esm/is-binary.js
  var withNativeArrayBuffer3 = typeof ArrayBuffer === "function";
  var isView2 = (obj) => {
    return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
  };
  var toString = Object.prototype.toString;
  var withNativeBlob2 = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
  var withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
  function isBinary(obj) {
    return withNativeArrayBuffer3 && (obj instanceof ArrayBuffer || isView2(obj)) || withNativeBlob2 && obj instanceof Blob || withNativeFile && obj instanceof File;
  }
  function hasBinary(obj, toJSON) {
    if (!obj || typeof obj !== "object") {
      return false;
    }
    if (Array.isArray(obj)) {
      for (let i2 = 0, l = obj.length; i2 < l; i2++) {
        if (hasBinary(obj[i2])) {
          return true;
        }
      }
      return false;
    }
    if (isBinary(obj)) {
      return true;
    }
    if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) {
      return hasBinary(obj.toJSON(), true);
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
        return true;
      }
    }
    return false;
  }

  // node_modules/socket.io-parser/build/esm/binary.js
  function deconstructPacket(packet) {
    const buffers = [];
    const packetData = packet.data;
    const pack = packet;
    pack.data = _deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length;
    return { packet: pack, buffers };
  }
  function _deconstructPacket(data, buffers) {
    if (!data)
      return data;
    if (isBinary(data)) {
      const placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (Array.isArray(data)) {
      const newData = new Array(data.length);
      for (let i2 = 0; i2 < data.length; i2++) {
        newData[i2] = _deconstructPacket(data[i2], buffers);
      }
      return newData;
    } else if (typeof data === "object" && !(data instanceof Date)) {
      const newData = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          newData[key] = _deconstructPacket(data[key], buffers);
        }
      }
      return newData;
    }
    return data;
  }
  function reconstructPacket(packet, buffers) {
    packet.data = _reconstructPacket(packet.data, buffers);
    packet.attachments = void 0;
    return packet;
  }
  function _reconstructPacket(data, buffers) {
    if (!data)
      return data;
    if (data && data._placeholder === true) {
      const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
      if (isIndexValid) {
        return buffers[data.num];
      } else {
        throw new Error("illegal attachments");
      }
    } else if (Array.isArray(data)) {
      for (let i2 = 0; i2 < data.length; i2++) {
        data[i2] = _reconstructPacket(data[i2], buffers);
      }
    } else if (typeof data === "object") {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          data[key] = _reconstructPacket(data[key], buffers);
        }
      }
    }
    return data;
  }

  // node_modules/socket.io-parser/build/esm/index.js
  var protocol3 = 5;
  var PacketType;
  (function(PacketType2) {
    PacketType2[PacketType2["CONNECT"] = 0] = "CONNECT";
    PacketType2[PacketType2["DISCONNECT"] = 1] = "DISCONNECT";
    PacketType2[PacketType2["EVENT"] = 2] = "EVENT";
    PacketType2[PacketType2["ACK"] = 3] = "ACK";
    PacketType2[PacketType2["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
    PacketType2[PacketType2["BINARY_EVENT"] = 5] = "BINARY_EVENT";
    PacketType2[PacketType2["BINARY_ACK"] = 6] = "BINARY_ACK";
  })(PacketType || (PacketType = {}));
  var Encoder = class {
    constructor(replacer) {
      this.replacer = replacer;
    }
    encode(obj) {
      if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
        if (hasBinary(obj)) {
          obj.type = obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK;
          return this.encodeAsBinary(obj);
        }
      }
      return [this.encodeAsString(obj)];
    }
    encodeAsString(obj) {
      let str = "" + obj.type;
      if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) {
        str += obj.attachments + "-";
      }
      if (obj.nsp && "/" !== obj.nsp) {
        str += obj.nsp + ",";
      }
      if (null != obj.id) {
        str += obj.id;
      }
      if (null != obj.data) {
        str += JSON.stringify(obj.data, this.replacer);
      }
      return str;
    }
    encodeAsBinary(obj) {
      const deconstruction = deconstructPacket(obj);
      const pack = this.encodeAsString(deconstruction.packet);
      const buffers = deconstruction.buffers;
      buffers.unshift(pack);
      return buffers;
    }
  };
  var Decoder = class extends Emitter {
    constructor(reviver) {
      super();
      this.reviver = reviver;
    }
    add(obj) {
      let packet;
      if (typeof obj === "string") {
        if (this.reconstructor) {
          throw new Error("got plaintext data when reconstructing a packet");
        }
        packet = this.decodeString(obj);
        if (packet.type === PacketType.BINARY_EVENT || packet.type === PacketType.BINARY_ACK) {
          this.reconstructor = new BinaryReconstructor(packet);
          if (packet.attachments === 0) {
            super.emitReserved("decoded", packet);
          }
        } else {
          super.emitReserved("decoded", packet);
        }
      } else if (isBinary(obj) || obj.base64) {
        if (!this.reconstructor) {
          throw new Error("got binary data when not reconstructing a packet");
        } else {
          packet = this.reconstructor.takeBinaryData(obj);
          if (packet) {
            this.reconstructor = null;
            super.emitReserved("decoded", packet);
          }
        }
      } else {
        throw new Error("Unknown type: " + obj);
      }
    }
    decodeString(str) {
      let i2 = 0;
      const p = {
        type: Number(str.charAt(0))
      };
      if (PacketType[p.type] === void 0) {
        throw new Error("unknown packet type " + p.type);
      }
      if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
        const start = i2 + 1;
        while (str.charAt(++i2) !== "-" && i2 != str.length) {
        }
        const buf = str.substring(start, i2);
        if (buf != Number(buf) || str.charAt(i2) !== "-") {
          throw new Error("Illegal attachments");
        }
        p.attachments = Number(buf);
      }
      if ("/" === str.charAt(i2 + 1)) {
        const start = i2 + 1;
        while (++i2) {
          const c = str.charAt(i2);
          if ("," === c)
            break;
          if (i2 === str.length)
            break;
        }
        p.nsp = str.substring(start, i2);
      } else {
        p.nsp = "/";
      }
      const next = str.charAt(i2 + 1);
      if ("" !== next && Number(next) == next) {
        const start = i2 + 1;
        while (++i2) {
          const c = str.charAt(i2);
          if (null == c || Number(c) != c) {
            --i2;
            break;
          }
          if (i2 === str.length)
            break;
        }
        p.id = Number(str.substring(start, i2 + 1));
      }
      if (str.charAt(++i2)) {
        const payload = this.tryParse(str.substr(i2));
        if (Decoder.isPayloadValid(p.type, payload)) {
          p.data = payload;
        } else {
          throw new Error("invalid payload");
        }
      }
      return p;
    }
    tryParse(str) {
      try {
        return JSON.parse(str, this.reviver);
      } catch (e) {
        return false;
      }
    }
    static isPayloadValid(type, payload) {
      switch (type) {
        case PacketType.CONNECT:
          return typeof payload === "object";
        case PacketType.DISCONNECT:
          return payload === void 0;
        case PacketType.CONNECT_ERROR:
          return typeof payload === "string" || typeof payload === "object";
        case PacketType.EVENT:
        case PacketType.BINARY_EVENT:
          return Array.isArray(payload) && payload.length > 0;
        case PacketType.ACK:
        case PacketType.BINARY_ACK:
          return Array.isArray(payload);
      }
    }
    destroy() {
      if (this.reconstructor) {
        this.reconstructor.finishedReconstruction();
      }
    }
  };
  var BinaryReconstructor = class {
    constructor(packet) {
      this.packet = packet;
      this.buffers = [];
      this.reconPack = packet;
    }
    takeBinaryData(binData) {
      this.buffers.push(binData);
      if (this.buffers.length === this.reconPack.attachments) {
        const packet = reconstructPacket(this.reconPack, this.buffers);
        this.finishedReconstruction();
        return packet;
      }
      return null;
    }
    finishedReconstruction() {
      this.reconPack = null;
      this.buffers = [];
    }
  };

  // node_modules/socket.io-client/build/esm/on.js
  function on(obj, ev, fn) {
    obj.on(ev, fn);
    return function subDestroy() {
      obj.off(ev, fn);
    };
  }

  // node_modules/socket.io-client/build/esm/socket.js
  var RESERVED_EVENTS = Object.freeze({
    connect: 1,
    connect_error: 1,
    disconnect: 1,
    disconnecting: 1,
    newListener: 1,
    removeListener: 1
  });
  var Socket2 = class extends Emitter {
    constructor(io, nsp, opts) {
      super();
      this.connected = false;
      this.receiveBuffer = [];
      this.sendBuffer = [];
      this.ids = 0;
      this.acks = {};
      this.flags = {};
      this.io = io;
      this.nsp = nsp;
      if (opts && opts.auth) {
        this.auth = opts.auth;
      }
      if (this.io._autoConnect)
        this.open();
    }
    get disconnected() {
      return !this.connected;
    }
    subEvents() {
      if (this.subs)
        return;
      const io = this.io;
      this.subs = [
        on(io, "open", this.onopen.bind(this)),
        on(io, "packet", this.onpacket.bind(this)),
        on(io, "error", this.onerror.bind(this)),
        on(io, "close", this.onclose.bind(this))
      ];
    }
    get active() {
      return !!this.subs;
    }
    connect() {
      if (this.connected)
        return this;
      this.subEvents();
      if (!this.io["_reconnecting"])
        this.io.open();
      if ("open" === this.io._readyState)
        this.onopen();
      return this;
    }
    open() {
      return this.connect();
    }
    send(...args) {
      args.unshift("message");
      this.emit.apply(this, args);
      return this;
    }
    emit(ev, ...args) {
      if (RESERVED_EVENTS.hasOwnProperty(ev)) {
        throw new Error('"' + ev.toString() + '" is a reserved event name');
      }
      args.unshift(ev);
      const packet = {
        type: PacketType.EVENT,
        data: args
      };
      packet.options = {};
      packet.options.compress = this.flags.compress !== false;
      if ("function" === typeof args[args.length - 1]) {
        const id = this.ids++;
        const ack = args.pop();
        this._registerAckCallback(id, ack);
        packet.id = id;
      }
      const isTransportWritable = this.io.engine && this.io.engine.transport && this.io.engine.transport.writable;
      const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
      if (discardPacket) {
      } else if (this.connected) {
        this.notifyOutgoingListeners(packet);
        this.packet(packet);
      } else {
        this.sendBuffer.push(packet);
      }
      this.flags = {};
      return this;
    }
    _registerAckCallback(id, ack) {
      const timeout = this.flags.timeout;
      if (timeout === void 0) {
        this.acks[id] = ack;
        return;
      }
      const timer = this.io.setTimeoutFn(() => {
        delete this.acks[id];
        for (let i2 = 0; i2 < this.sendBuffer.length; i2++) {
          if (this.sendBuffer[i2].id === id) {
            this.sendBuffer.splice(i2, 1);
          }
        }
        ack.call(this, new Error("operation has timed out"));
      }, timeout);
      this.acks[id] = (...args) => {
        this.io.clearTimeoutFn(timer);
        ack.apply(this, [null, ...args]);
      };
    }
    packet(packet) {
      packet.nsp = this.nsp;
      this.io._packet(packet);
    }
    onopen() {
      if (typeof this.auth == "function") {
        this.auth((data) => {
          this.packet({ type: PacketType.CONNECT, data });
        });
      } else {
        this.packet({ type: PacketType.CONNECT, data: this.auth });
      }
    }
    onerror(err) {
      if (!this.connected) {
        this.emitReserved("connect_error", err);
      }
    }
    onclose(reason, description) {
      this.connected = false;
      delete this.id;
      this.emitReserved("disconnect", reason, description);
    }
    onpacket(packet) {
      const sameNamespace = packet.nsp === this.nsp;
      if (!sameNamespace)
        return;
      switch (packet.type) {
        case PacketType.CONNECT:
          if (packet.data && packet.data.sid) {
            const id = packet.data.sid;
            this.onconnect(id);
          } else {
            this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          }
          break;
        case PacketType.EVENT:
        case PacketType.BINARY_EVENT:
          this.onevent(packet);
          break;
        case PacketType.ACK:
        case PacketType.BINARY_ACK:
          this.onack(packet);
          break;
        case PacketType.DISCONNECT:
          this.ondisconnect();
          break;
        case PacketType.CONNECT_ERROR:
          this.destroy();
          const err = new Error(packet.data.message);
          err.data = packet.data.data;
          this.emitReserved("connect_error", err);
          break;
      }
    }
    onevent(packet) {
      const args = packet.data || [];
      if (null != packet.id) {
        args.push(this.ack(packet.id));
      }
      if (this.connected) {
        this.emitEvent(args);
      } else {
        this.receiveBuffer.push(Object.freeze(args));
      }
    }
    emitEvent(args) {
      if (this._anyListeners && this._anyListeners.length) {
        const listeners = this._anyListeners.slice();
        for (const listener of listeners) {
          listener.apply(this, args);
        }
      }
      super.emit.apply(this, args);
    }
    ack(id) {
      const self2 = this;
      let sent = false;
      return function(...args) {
        if (sent)
          return;
        sent = true;
        self2.packet({
          type: PacketType.ACK,
          id,
          data: args
        });
      };
    }
    onack(packet) {
      const ack = this.acks[packet.id];
      if ("function" === typeof ack) {
        ack.apply(this, packet.data);
        delete this.acks[packet.id];
      } else {
      }
    }
    onconnect(id) {
      this.id = id;
      this.connected = true;
      this.emitBuffered();
      this.emitReserved("connect");
    }
    emitBuffered() {
      this.receiveBuffer.forEach((args) => this.emitEvent(args));
      this.receiveBuffer = [];
      this.sendBuffer.forEach((packet) => {
        this.notifyOutgoingListeners(packet);
        this.packet(packet);
      });
      this.sendBuffer = [];
    }
    ondisconnect() {
      this.destroy();
      this.onclose("io server disconnect");
    }
    destroy() {
      if (this.subs) {
        this.subs.forEach((subDestroy) => subDestroy());
        this.subs = void 0;
      }
      this.io["_destroy"](this);
    }
    disconnect() {
      if (this.connected) {
        this.packet({ type: PacketType.DISCONNECT });
      }
      this.destroy();
      if (this.connected) {
        this.onclose("io client disconnect");
      }
      return this;
    }
    close() {
      return this.disconnect();
    }
    compress(compress) {
      this.flags.compress = compress;
      return this;
    }
    get volatile() {
      this.flags.volatile = true;
      return this;
    }
    timeout(timeout) {
      this.flags.timeout = timeout;
      return this;
    }
    onAny(listener) {
      this._anyListeners = this._anyListeners || [];
      this._anyListeners.push(listener);
      return this;
    }
    prependAny(listener) {
      this._anyListeners = this._anyListeners || [];
      this._anyListeners.unshift(listener);
      return this;
    }
    offAny(listener) {
      if (!this._anyListeners) {
        return this;
      }
      if (listener) {
        const listeners = this._anyListeners;
        for (let i2 = 0; i2 < listeners.length; i2++) {
          if (listener === listeners[i2]) {
            listeners.splice(i2, 1);
            return this;
          }
        }
      } else {
        this._anyListeners = [];
      }
      return this;
    }
    listenersAny() {
      return this._anyListeners || [];
    }
    onAnyOutgoing(listener) {
      this._anyOutgoingListeners = this._anyOutgoingListeners || [];
      this._anyOutgoingListeners.push(listener);
      return this;
    }
    prependAnyOutgoing(listener) {
      this._anyOutgoingListeners = this._anyOutgoingListeners || [];
      this._anyOutgoingListeners.unshift(listener);
      return this;
    }
    offAnyOutgoing(listener) {
      if (!this._anyOutgoingListeners) {
        return this;
      }
      if (listener) {
        const listeners = this._anyOutgoingListeners;
        for (let i2 = 0; i2 < listeners.length; i2++) {
          if (listener === listeners[i2]) {
            listeners.splice(i2, 1);
            return this;
          }
        }
      } else {
        this._anyOutgoingListeners = [];
      }
      return this;
    }
    listenersAnyOutgoing() {
      return this._anyOutgoingListeners || [];
    }
    notifyOutgoingListeners(packet) {
      if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
        const listeners = this._anyOutgoingListeners.slice();
        for (const listener of listeners) {
          listener.apply(this, packet.data);
        }
      }
    }
  };

  // node_modules/socket.io-client/build/esm/contrib/backo2.js
  function Backoff(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 1e4;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
  }
  Backoff.prototype.duration = function() {
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
      var rand = Math.random();
      var deviation = Math.floor(rand * this.jitter * ms);
      ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
  };
  Backoff.prototype.reset = function() {
    this.attempts = 0;
  };
  Backoff.prototype.setMin = function(min) {
    this.ms = min;
  };
  Backoff.prototype.setMax = function(max) {
    this.max = max;
  };
  Backoff.prototype.setJitter = function(jitter) {
    this.jitter = jitter;
  };

  // node_modules/socket.io-client/build/esm/manager.js
  var Manager = class extends Emitter {
    constructor(uri, opts) {
      var _a2;
      super();
      this.nsps = {};
      this.subs = [];
      if (uri && "object" === typeof uri) {
        opts = uri;
        uri = void 0;
      }
      opts = opts || {};
      opts.path = opts.path || "/socket.io";
      this.opts = opts;
      installTimerFunctions(this, opts);
      this.reconnection(opts.reconnection !== false);
      this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
      this.reconnectionDelay(opts.reconnectionDelay || 1e3);
      this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
      this.randomizationFactor((_a2 = opts.randomizationFactor) !== null && _a2 !== void 0 ? _a2 : 0.5);
      this.backoff = new Backoff({
        min: this.reconnectionDelay(),
        max: this.reconnectionDelayMax(),
        jitter: this.randomizationFactor()
      });
      this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
      this._readyState = "closed";
      this.uri = uri;
      const _parser = opts.parser || esm_exports;
      this.encoder = new _parser.Encoder();
      this.decoder = new _parser.Decoder();
      this._autoConnect = opts.autoConnect !== false;
      if (this._autoConnect)
        this.open();
    }
    reconnection(v) {
      if (!arguments.length)
        return this._reconnection;
      this._reconnection = !!v;
      return this;
    }
    reconnectionAttempts(v) {
      if (v === void 0)
        return this._reconnectionAttempts;
      this._reconnectionAttempts = v;
      return this;
    }
    reconnectionDelay(v) {
      var _a2;
      if (v === void 0)
        return this._reconnectionDelay;
      this._reconnectionDelay = v;
      (_a2 = this.backoff) === null || _a2 === void 0 ? void 0 : _a2.setMin(v);
      return this;
    }
    randomizationFactor(v) {
      var _a2;
      if (v === void 0)
        return this._randomizationFactor;
      this._randomizationFactor = v;
      (_a2 = this.backoff) === null || _a2 === void 0 ? void 0 : _a2.setJitter(v);
      return this;
    }
    reconnectionDelayMax(v) {
      var _a2;
      if (v === void 0)
        return this._reconnectionDelayMax;
      this._reconnectionDelayMax = v;
      (_a2 = this.backoff) === null || _a2 === void 0 ? void 0 : _a2.setMax(v);
      return this;
    }
    timeout(v) {
      if (!arguments.length)
        return this._timeout;
      this._timeout = v;
      return this;
    }
    maybeReconnectOnOpen() {
      if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) {
        this.reconnect();
      }
    }
    open(fn) {
      if (~this._readyState.indexOf("open"))
        return this;
      this.engine = new Socket(this.uri, this.opts);
      const socket = this.engine;
      const self2 = this;
      this._readyState = "opening";
      this.skipReconnect = false;
      const openSubDestroy = on(socket, "open", function() {
        self2.onopen();
        fn && fn();
      });
      const errorSub = on(socket, "error", (err) => {
        self2.cleanup();
        self2._readyState = "closed";
        this.emitReserved("error", err);
        if (fn) {
          fn(err);
        } else {
          self2.maybeReconnectOnOpen();
        }
      });
      if (false !== this._timeout) {
        const timeout = this._timeout;
        if (timeout === 0) {
          openSubDestroy();
        }
        const timer = this.setTimeoutFn(() => {
          openSubDestroy();
          socket.close();
          socket.emit("error", new Error("timeout"));
        }, timeout);
        if (this.opts.autoUnref) {
          timer.unref();
        }
        this.subs.push(function subDestroy() {
          clearTimeout(timer);
        });
      }
      this.subs.push(openSubDestroy);
      this.subs.push(errorSub);
      return this;
    }
    connect(fn) {
      return this.open(fn);
    }
    onopen() {
      this.cleanup();
      this._readyState = "open";
      this.emitReserved("open");
      const socket = this.engine;
      this.subs.push(on(socket, "ping", this.onping.bind(this)), on(socket, "data", this.ondata.bind(this)), on(socket, "error", this.onerror.bind(this)), on(socket, "close", this.onclose.bind(this)), on(this.decoder, "decoded", this.ondecoded.bind(this)));
    }
    onping() {
      this.emitReserved("ping");
    }
    ondata(data) {
      try {
        this.decoder.add(data);
      } catch (e) {
        this.onclose("parse error", e);
      }
    }
    ondecoded(packet) {
      nextTick(() => {
        this.emitReserved("packet", packet);
      }, this.setTimeoutFn);
    }
    onerror(err) {
      this.emitReserved("error", err);
    }
    socket(nsp, opts) {
      let socket = this.nsps[nsp];
      if (!socket) {
        socket = new Socket2(this, nsp, opts);
        this.nsps[nsp] = socket;
      }
      return socket;
    }
    _destroy(socket) {
      const nsps = Object.keys(this.nsps);
      for (const nsp of nsps) {
        const socket2 = this.nsps[nsp];
        if (socket2.active) {
          return;
        }
      }
      this._close();
    }
    _packet(packet) {
      const encodedPackets = this.encoder.encode(packet);
      for (let i2 = 0; i2 < encodedPackets.length; i2++) {
        this.engine.write(encodedPackets[i2], packet.options);
      }
    }
    cleanup() {
      this.subs.forEach((subDestroy) => subDestroy());
      this.subs.length = 0;
      this.decoder.destroy();
    }
    _close() {
      this.skipReconnect = true;
      this._reconnecting = false;
      this.onclose("forced close");
      if (this.engine)
        this.engine.close();
    }
    disconnect() {
      return this._close();
    }
    onclose(reason, description) {
      this.cleanup();
      this.backoff.reset();
      this._readyState = "closed";
      this.emitReserved("close", reason, description);
      if (this._reconnection && !this.skipReconnect) {
        this.reconnect();
      }
    }
    reconnect() {
      if (this._reconnecting || this.skipReconnect)
        return this;
      const self2 = this;
      if (this.backoff.attempts >= this._reconnectionAttempts) {
        this.backoff.reset();
        this.emitReserved("reconnect_failed");
        this._reconnecting = false;
      } else {
        const delay = this.backoff.duration();
        this._reconnecting = true;
        const timer = this.setTimeoutFn(() => {
          if (self2.skipReconnect)
            return;
          this.emitReserved("reconnect_attempt", self2.backoff.attempts);
          if (self2.skipReconnect)
            return;
          self2.open((err) => {
            if (err) {
              self2._reconnecting = false;
              self2.reconnect();
              this.emitReserved("reconnect_error", err);
            } else {
              self2.onreconnect();
            }
          });
        }, delay);
        if (this.opts.autoUnref) {
          timer.unref();
        }
        this.subs.push(function subDestroy() {
          clearTimeout(timer);
        });
      }
    }
    onreconnect() {
      const attempt = this.backoff.attempts;
      this._reconnecting = false;
      this.backoff.reset();
      this.emitReserved("reconnect", attempt);
    }
  };

  // node_modules/socket.io-client/build/esm/index.js
  var cache = {};
  function lookup2(uri, opts) {
    if (typeof uri === "object") {
      opts = uri;
      uri = void 0;
    }
    opts = opts || {};
    const parsed = url(uri, opts.path || "/socket.io");
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
    let io;
    if (newConnection) {
      io = new Manager(source, opts);
    } else {
      if (!cache[id]) {
        cache[id] = new Manager(source, opts);
      }
      io = cache[id];
    }
    if (parsed.query && !opts.query) {
      opts.query = parsed.queryKey;
    }
    return io.socket(parsed.path, opts);
  }
  Object.assign(lookup2, {
    Manager,
    Socket: Socket2,
    io: lookup2,
    connect: lookup2
  });

  // src/front-end-module/uibuilder.module.js
  var version = "6.1.0-iife";
  var isMinified = !/param/.test(function(param) {
  });
  var logLevel = isMinified ? 0 : 1;
  var LOG_STYLES = {
    error: {
      css: "background: red; color: black;",
      txtCss: "color: red; ",
      pre: "\u26D4 ",
      console: "error"
    },
    warn: {
      css: "background: darkorange; color: black;",
      txtCss: "color: darkorange; ",
      pre: "\u26A0 ",
      console: "warn"
    },
    info: {
      css: "background: aqua; color: black;",
      txtCss: "color: aqua;",
      pre: "\u2757 ",
      console: "info"
    },
    log: {
      css: "background: grey; color: yellow;",
      txtCss: "color: grey;",
      pre: "",
      console: "log"
    },
    debug: {
      css: "background: chartreuse; color: black;",
      txtCss: "color: chartreuse;",
      pre: "",
      console: "debug"
    },
    trace: {
      css: "background: indigo; color: yellow;",
      txtCss: "color: hotpink;",
      pre: "",
      console: "log"
    },
    names: ["error", "warn", "info", "log", "debug", "trace"],
    reset: "color: inherit;",
    head: "font-weight:bold; font-style:italic;",
    level: "font-weight:bold; border-radius: 3px; padding: 2px 5px; display:inline-block;"
  };
  function log() {
    const args = Array.prototype.slice.call(arguments);
    let level = args.shift();
    let strLevel;
    switch (level) {
      case "trace":
      case 5: {
        if (logLevel < 5)
          break;
        level = 5;
        strLevel = "trace";
        break;
      }
      case "debug":
      case 4: {
        if (logLevel < 4)
          break;
        level = 4;
        strLevel = "debug";
        break;
      }
      case "log":
      case 3: {
        if (logLevel < 3)
          break;
        level = 3;
        strLevel = "log";
        break;
      }
      case "info":
      case "":
      case 2: {
        if (logLevel < 2)
          break;
        level = 2;
        strLevel = "info";
        break;
      }
      case "warn":
      case 1: {
        if (logLevel < 1)
          break;
        level = 1;
        strLevel = "warn";
        break;
      }
      case "error":
      case "err":
      case 0: {
        if (logLevel < 0)
          break;
        level = 0;
        strLevel = "error";
        break;
      }
      default: {
        level = -1;
        break;
      }
    }
    if (strLevel === void 0)
      return function() {
      };
    const head = args.shift();
    return Function.prototype.bind.call(
      console[LOG_STYLES[strLevel].console],
      console,
      `%c${LOG_STYLES[strLevel].pre}${strLevel}%c [${head}]`,
      `${LOG_STYLES.level} ${LOG_STYLES[strLevel].css}`,
      `${LOG_STYLES.head} ${LOG_STYLES[strLevel].txtCss}`,
      ...args
    );
  }
  function makeMeAnObject(thing, property) {
    if (!property)
      property = "payload";
    if (typeof property !== "string") {
      log("warn", "uibuilderfe:makeMeAnObject", `WARNING: property parameter must be a string and not: ${typeof property}`)();
      property = "payload";
    }
    let out = {};
    if (thing !== null && thing.constructor.name === "Object") {
      out = thing;
    } else if (thing !== null) {
      out[property] = thing;
    }
    return out;
  }
  function urlJoin() {
    const paths = Array.prototype.slice.call(arguments);
    const url2 = "/" + paths.map(function(e) {
      return e.replace(/^\/|\/$/g, "");
    }).filter(function(e) {
      return e;
    }).join("/");
    return url2.replace("//", "/");
  }
  var _connectedNum, _pingInterval, _propChangeCallbacks, _msgRecvdByTopicCallbacks, _isVue, _timerid, _MsgHandler, _a;
  var Uib = (_a = class {
    constructor() {
      __privateAdd(this, _connectedNum, 0);
      __publicField(this, "_ioChannels", { control: "uiBuilderControl", client: "uiBuilderClient", server: "uiBuilder" });
      __privateAdd(this, _pingInterval, void 0);
      __privateAdd(this, _propChangeCallbacks, {});
      __privateAdd(this, _msgRecvdByTopicCallbacks, {});
      __privateAdd(this, _isVue, false);
      __privateAdd(this, _timerid, null);
      __privateAdd(this, _MsgHandler, void 0);
      __publicField(this, "_socket");
      __publicField(this, "clientId", "");
      __publicField(this, "cookies", {});
      __publicField(this, "ctrlMsg", {});
      __publicField(this, "ioConnected", false);
      __publicField(this, "msg", {});
      __publicField(this, "msgsSent", 0);
      __publicField(this, "msgsReceived", 0);
      __publicField(this, "msgsSentCtrl", 0);
      __publicField(this, "msgsCtrlReceived", 0);
      __publicField(this, "sentCtrlMsg", {});
      __publicField(this, "sentMsg", {});
      __publicField(this, "serverTimeOffset", null);
      __publicField(this, "socketError", null);
      __publicField(this, "online", null);
      __publicField(this, "lastNavType", "");
      __publicField(this, "tabId", "");
      __publicField(this, "isVisible", false);
      __publicField(this, "originator", "");
      __publicField(this, "topic");
      __publicField(this, "autoSendReady", true);
      __publicField(this, "httpNodeRoot", "");
      __publicField(this, "ioNamespace", "");
      __publicField(this, "ioPath", "");
      __publicField(this, "retryFactor", 1.5);
      __publicField(this, "retryMs", 2e3);
      __publicField(this, "storePrefix", "uib_");
      __publicField(this, "started", false);
      __publicField(this, "socketOptions", {
        path: this.ioPath,
        transports: ["polling", "websocket"],
        auth: {
          clientVersion: version,
          clientId: this.clientId,
          pathName: window.location.pathname,
          pageName: void 0,
          tabId: void 0,
          lastNavType: void 0
        },
        transportOptions: {
          polling: {
            extraHeaders: {
              "x-clientid": `${_a._meta.displayName}; ${_a._meta.type}; ${_a._meta.version}; ${this.clientId}`
            }
          }
        }
      });
      __publicField(this, "$", document.querySelector.bind(document));
      log("trace", "Uib:constructor", "Starting")();
      window.addEventListener("offline", (e) => {
        this.set("online", false);
        this.set("ioConnected", false);
        log("warn", "Browser", "DISCONNECTED from network")();
      });
      window.addEventListener("online", (e) => {
        this.set("online", true);
        log("warn", "Browser", "Reconnected to network")();
        this._checkConnect();
      });
      document.cookie.split(";").forEach((c) => {
        const splitC = c.split("=");
        this.cookies[splitC[0].trim()] = splitC[1];
      });
      this.clientId = this.cookies["uibuilder-client-id"];
      log("trace", "Uib:constructor", "Client ID: ", this.clientId)();
      this.tabId = window.sessionStorage.getItem("tabId");
      if (!this.tabId) {
        this.tabId = "t" + Math.floor(Math.random() * 1e6);
        window.sessionStorage.setItem("tabId", this.tabId);
      }
      document.addEventListener("load", () => {
        this.set("isVisible", true);
      });
      document.addEventListener("visibilitychange", () => {
        this.set("isVisible", document.visibilityState === "visible");
        this.sendCtrl({ uibuilderCtrl: "visibility", isVisible: this.isVisible });
      });
      this.ioNamespace = this._getIOnamespace();
      if ("uibuilder-webRoot" in this.cookies) {
        this.httpNodeRoot = this.cookies["uibuilder-webRoot"];
        log("trace", "Uib:constructor", `httpNodeRoot set by cookie to "${this.httpNodeRoot}"`)();
      } else {
        const fullPath = window.location.pathname.split("/").filter(function(t) {
          return t.trim() !== "";
        });
        if (fullPath.length > 0 && fullPath[fullPath.length - 1].endsWith(".html"))
          fullPath.pop();
        fullPath.pop();
        this.httpNodeRoot = "/" + fullPath.join("/");
        log("trace", "[Uib:constructor]", `httpNodeRoot set by URL parsing to "${this.httpNodeRoot}". NOTE: This may fail for pages in sub-folders.`)();
      }
      this.ioPath = urlJoin(this.httpNodeRoot, _a._meta.displayName, "vendor", "socket.io");
      log("trace", "Uib:constructor", `ioPath: "${this.ioPath}"`)();
      this.pageName = window.location.pathname.replace(`${this.ioNamespace}/`, "");
      if (this.pageName.endsWith("/"))
        this.pageName += "index.html";
      if (this.pageName === "")
        this.pageName = "index.html";
      this._dispatchCustomEvent("uibuilder:constructorComplete");
      log("trace", "Uib:constructor", "Ending")();
    }
    get meta() {
      return _a._meta;
    }
    set logLevel(level) {
      logLevel = level;
      console.log("%c\u2757 info%c [logLevel]", `${LOG_STYLES.level} ${LOG_STYLES.info.css}`, `${LOG_STYLES.head} ${LOG_STYLES.info.txtCss}`, `Set to ${level} (${LOG_STYLES.names[level]})`);
    }
    get logLevel() {
      return logLevel;
    }
    set(prop, val) {
      if (prop.startsWith("_") || prop.startsWith("#")) {
        log("warn", "Uib:set", `Cannot use set() on protected property "${prop}"`)();
        return;
      }
      this[prop] = val;
      log("trace", "Uib:set", `prop set - prop: ${prop}, val: `, val)();
      this._dispatchCustomEvent("uibuilder:propertyChanged", { "prop": prop, "value": val });
      return val;
    }
    get(prop) {
      if (prop.startsWith("_") || prop.startsWith("#")) {
        log("warn", "Uib:get", `Cannot use get() on protected property "${prop}"`)();
        return;
      }
      if (prop === "version")
        return _a._meta.version;
      if (prop === "msgsCtrl")
        return this.msgsCtrlReceived;
      if (prop === "reconnections")
        return __privateGet(this, _connectedNum);
      if (this[prop] === void 0) {
        log("warn", "Uib:get", `get() - property "${prop}" does not exist`)();
      }
      return this[prop];
    }
    _dispatchCustomEvent(title, details) {
      const event2 = new CustomEvent(title, { detail: details });
      document.dispatchEvent(event2);
    }
    onChange(prop, callback) {
      if (!__privateGet(this, _propChangeCallbacks)[prop])
        __privateGet(this, _propChangeCallbacks)[prop] = { _nextRef: 1 };
      else
        __privateGet(this, _propChangeCallbacks)[prop]._nextRef++;
      const nextCbRef = __privateGet(this, _propChangeCallbacks)[prop]._nextRef;
      const propChangeCallback = __privateGet(this, _propChangeCallbacks)[prop][nextCbRef] = function propChangeCallback2(e) {
        if (prop === e.detail.prop) {
          const value2 = e.detail.value;
          callback.call(value2, value2);
        }
      };
      document.addEventListener("uibuilder:propertyChanged", propChangeCallback);
      return nextCbRef;
    }
    cancelChange(prop, cbRef) {
      document.removeEventListener("uibuilder:propertyChanged", __privateGet(this, _propChangeCallbacks)[prop][cbRef]);
      delete __privateGet(this, _propChangeCallbacks)[prop][cbRef];
    }
    onTopic(topic, callback) {
      if (!__privateGet(this, _msgRecvdByTopicCallbacks)[topic])
        __privateGet(this, _msgRecvdByTopicCallbacks)[topic] = { _nextRef: 1 };
      else
        __privateGet(this, _msgRecvdByTopicCallbacks)[topic]._nextRef++;
      const nextCbRef = __privateGet(this, _msgRecvdByTopicCallbacks)[topic]._nextRef;
      const msgRecvdEvtCallback = __privateGet(this, _msgRecvdByTopicCallbacks)[topic][nextCbRef] = function msgRecvdEvtCallback2(e) {
        const msg = e.detail;
        if (msg.topic === topic) {
          callback.call(msg, msg);
        }
      };
      document.addEventListener("uibuilder:stdMsgReceived", msgRecvdEvtCallback);
      return nextCbRef;
    }
    cancelTopic(topic, cbRef) {
      document.removeEventListener("uibuilder:stdMsgReceived", __privateGet(this, _msgRecvdByTopicCallbacks)[topic][cbRef]);
      delete __privateGet(this, _msgRecvdByTopicCallbacks)[topic][cbRef];
    }
    _checkTimestamp(receivedMsg) {
      if (Object.prototype.hasOwnProperty.call(receivedMsg, "serverTimestamp")) {
        const serverTimestamp = new Date(receivedMsg.serverTimestamp);
        const offset = Math.round((new Date() - serverTimestamp) / 36e5);
        if (offset !== this.serverTimeOffset) {
          log("trace", `Uib:checkTimestamp:${this._ioChannels.server} (server)`, `Offset changed to: ${offset} from: ${this.serverTimeOffset}`)();
          this.set("serverTimeOffset", offset);
        }
      }
    }
    setOriginator(originator = "") {
      this.set("originator", originator);
    }
    setStore(id, value2) {
      if (typeof value2 === "object") {
        try {
          value2 = JSON.stringify(value2);
        } catch (e) {
          log("error", "Uib:setStore", "Cannot stringify object, not storing. ", e)();
          return false;
        }
      }
      try {
        localStorage.setItem(this.storePrefix + id, value2);
        return true;
      } catch (e) {
        log("error", "Uib:setStore", "Cannot write to localStorage. ", e)();
        return false;
      }
    }
    getStore(id) {
      try {
        return JSON.parse(localStorage.getItem(this.storePrefix + id));
      } catch (e) {
        return localStorage.getItem(this.storePrefix + id);
      }
    }
    removeStore(id) {
      try {
        localStorage.removeItem(this.storePrefix + id);
      } catch (e) {
      }
    }
    setPing(ms = 0) {
      const oReq = new XMLHttpRequest();
      oReq.addEventListener("load", () => {
        const headers = oReq.getAllResponseHeaders().split("\r\n");
        const elapsedTime = Number(new Date()) - Number(oReq.responseURL.split("=")[1]);
        this.set("ping", {
          success: !!(oReq.status === 201 || oReq.status === 204),
          status: oReq.status,
          headers,
          url: oReq.responseURL,
          elapsedTime
        });
      });
      if (__privateGet(this, _pingInterval)) {
        clearInterval(__privateGet(this, _pingInterval));
        __privateSet(this, _pingInterval, void 0);
      }
      oReq.open("GET", `${this.httpNodeRoot}/uibuilder/ping?t=${Number(new Date())}`);
      oReq.send();
      if (ms > 0) {
        __privateSet(this, _pingInterval, setInterval(() => {
          oReq.open("GET", `${this.httpNodeRoot}/uibuilder/ping?t=${Number(new Date())}`);
          oReq.send();
        }, ms));
      }
    }
    log() {
      log(...arguments)();
    }
    syntaxHighlight(json) {
      json = JSON.stringify(json, void 0, 4);
      json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function(match) {
        let cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return '<span class="' + cls + '">' + match + "</span>";
      });
      return json;
    }
    ui(json) {
      let msg = {};
      if (json._ui)
        msg = json;
      else
        msg._ui = json;
      this._uiManager(msg);
    }
    replaceSlot(el, component) {
      if (!component.slot)
        return;
      if (window["DOMPurify"])
        component.slot = window["DOMPurify"].sanitize(component.slot);
      el.innerHTML = component.slot;
    }
    replaceSlotMarkdown(el, component) {
      if (!window["markdownit"])
        return;
      if (!component.slotMarkdown)
        return;
      const opts = {
        html: true,
        linkify: true,
        _highlight: true,
        langPrefix: "language-",
        highlight(str, lang) {
          if (lang && window["hljs"] && window["hljs"].getLanguage(lang)) {
            try {
              return `<pre class="highlight" data-language="${lang.toUpperCase()}">
                                <code class="language-${lang}">${window["hljs"].highlightAuto(str).value}</code></pre>`;
            } finally {
            }
          }
          return `<pre class="highlight"><code>${md.utils.escapeHtml(str)}</code></pre>`;
        }
      };
      const md = window["markdownit"](opts);
      component.slotMarkdown = md.render(component.slotMarkdown);
      if (window["DOMPurify"])
        component.slotMarkdown = window["DOMPurify"].sanitize(component.slotMarkdown);
      el.innerHTML = component.slotMarkdown;
    }
    loadScriptSrc(url2) {
      const newScript = document.createElement("script");
      newScript.src = url2;
      newScript.async = false;
      document.head.appendChild(newScript);
    }
    loadStyleSrc(url2) {
      const newStyle = document.createElement("link");
      newStyle.href = url2;
      newStyle.rel = "stylesheet";
      newStyle.type = "text/css";
      document.head.appendChild(newStyle);
    }
    loadScriptTxt(textFn) {
      const newScript = document.createElement("script");
      newScript.async = false;
      newScript.textContent = textFn;
      document.head.appendChild(newScript);
    }
    loadStyleTxt(textFn) {
      const newStyle = document.createElement("style");
      newStyle.textContent = textFn;
      document.head.appendChild(newStyle);
    }
    showDialog(type, ui, msg) {
      let content = "";
      if (msg.payload && typeof msg.payload === "string")
        content += msg.payload;
      if (ui.content)
        content += ui.content;
      if (content === "") {
        log(1, "Uib:showDialog", "Toast content is blank. Not shown.")();
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
      let toaster = document.getElementById("toaster");
      if (toaster === null) {
        toaster = document.createElement("div");
        toaster.id = "toaster";
        toaster.title = "Click to clear all notifcations";
        toaster.setAttribute("class", "toaster");
        toaster.setAttribute("role", "dialog");
        toaster.setAttribute("arial-label", "Toast message");
        toaster.onclick = function() {
          toaster.remove();
        };
        document.body.insertAdjacentElement("afterbegin", toaster);
      }
      const toast = document.createElement("div");
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
    loadui(url2) {
      fetch(url2).then((response) => {
        if (response.ok === false) {
          throw new Error(`Could not load '${url2}'. Status ${response.status}, Error: ${response.statusText}`);
        }
        log("trace", "Uib:loadui:then1", `Loaded '${url2}'. Status ${response.status}, ${response.statusText}`)();
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError(`Fetch '${url2}' did not return JSON, ignoring`);
        }
        return response.json();
      }).then((data) => {
        if (data !== void 0) {
          log("trace", "Uib:loadui:then2", "Parsed JSON successfully obtained")();
          this._uiManager({ _ui: data });
          return true;
        }
        return false;
      }).catch((err) => {
        log("warn", "Uib:loadui:catch", "Error. ", err)();
      });
    }
    _uiComposeComponent(el, comp) {
      if (comp.attributes) {
        Object.keys(comp.attributes).forEach((attrib) => {
          el.setAttribute(attrib, comp.attributes[attrib]);
        });
      }
      if (comp.id)
        el.setAttribute("id", comp.id);
      if (comp.events) {
        Object.keys(comp.events).forEach((type) => {
          if (type.toLowerCase === "onclick")
            type = "click";
          try {
            el.addEventListener(type, (evt) => {
              new Function("evt", `${comp.events[type]}(evt)`)(evt);
            });
          } catch (err) {
            log("error", "Uib:_uiComposeComponent", `Add event '${type}' for element '${comp.type}': Cannot add event handler. ${err.message}`)();
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
    _uiExtendEl(parentEl, components) {
      components.forEach((compToAdd, i2) => {
        const newEl = document.createElement(compToAdd.type);
        this._uiComposeComponent(newEl, compToAdd);
        parentEl.appendChild(newEl);
        if (compToAdd.components) {
          this._uiExtendEl(newEl, compToAdd.components);
        }
      });
    }
    _uiAdd(ui, isRecurse) {
      log("trace", "Uib:_uiManager:add", "Starting _uiAdd")();
      ui.components.forEach((compToAdd, i2) => {
        const newEl = document.createElement(compToAdd.type);
        if (!compToAdd.slot && ui.payload)
          compToAdd.slot = ui.payload;
        this._uiComposeComponent(newEl, compToAdd);
        let elParent;
        if (compToAdd.parentEl) {
          elParent = compToAdd.parentEl;
        } else if (ui.parentEl) {
          elParent = ui.parentEl;
        } else if (compToAdd.parent) {
          elParent = document.querySelector(compToAdd.parent);
        } else if (ui.parent) {
          elParent = document.querySelector(ui.parent);
        }
        if (!elParent) {
          log("info", "Uib:_uiAdd", "No parent found, adding to body")();
          elParent = document.querySelector("body");
        }
        elParent.appendChild(newEl);
        if (compToAdd.components) {
          this._uiExtendEl(newEl, compToAdd.components);
        }
      });
    }
    _uiRemove(ui) {
      ui.components.forEach((compToRemove) => {
        try {
          document.querySelector(compToRemove).remove();
        } catch (err) {
          log("trace", "Uib:_uiRemove", `Could not remove. ${err.message}`)();
        }
      });
    }
    _uiUpdate(ui) {
      log("trace", "Uib:_uiManager:update", "Starting _uiUpdate")();
      if (!ui.components)
        ui.components = [Object.assign({}, ui)];
      ui.components.forEach((compToUpd, i2) => {
        log("trace", "_uiUpdate:components-forEach", `Component #${i2}`, compToUpd)();
        let elToUpd;
        if (compToUpd.id) {
          elToUpd = document.querySelectorAll(`#${compToUpd.id}`);
        } else if (compToUpd.selector || compToUpd.select) {
          elToUpd = document.querySelectorAll(compToUpd.selector);
        } else if (compToUpd.name) {
          elToUpd = document.querySelectorAll(`[name="${compToUpd.name}"]`);
        } else if (compToUpd.type) {
          elToUpd = document.querySelectorAll(compToUpd.type);
        }
        if (elToUpd === void 0 || elToUpd.length < 1) {
          log("warn", "Uib:_uiManager:update", "Cannot find the DOM element. Ignoring.", compToUpd)();
          return;
        }
        log("trace", "_uiUpdate:components-forEach", `Element(s) to update. Count: ${elToUpd.length}`, elToUpd)();
        if (compToUpd.properties) {
          Object.keys(compToUpd.properties).forEach((prop) => {
            elToUpd.forEach((el) => {
              el[prop] = compToUpd.properties[prop];
            });
          });
        }
        if (compToUpd.events) {
          Object.keys(compToUpd.events).forEach((type) => {
            if (type.toLowerCase === "onclick")
              type = "click";
            elToUpd.forEach((el) => {
              try {
                el.addEventListener(type, (evt) => {
                  new Function("evt", `${compToUpd.events[type]}(evt)`)(evt);
                });
              } catch (err) {
                log("error", "Uib:_uiAdd", `Add event '${type}' for element '${compToUpd.type}': Cannot add event handler. ${err.message}`)();
              }
            });
          });
        }
        if (compToUpd.attributes) {
          Object.keys(compToUpd.attributes).forEach((attrib) => {
            elToUpd.forEach((el) => {
              el.setAttribute(attrib, compToUpd.attributes[attrib]);
            });
          });
        }
        if (!compToUpd.slot && compToUpd.payload)
          compToUpd.slot = compToUpd.payload;
        if (compToUpd.slot) {
          elToUpd.forEach((el) => {
            this.replaceSlot(el, compToUpd);
          });
        }
        if (compToUpd.slotMarkdown) {
          elToUpd.forEach((el) => {
            this.replaceSlotMarkdown(el, compToUpd);
          });
        }
        if (compToUpd.components) {
          elToUpd.forEach((el) => {
            log("trace", "_uiUpdate:components", "el", el)();
            this._uiUpdate({
              method: ui.method,
              parentEl: el,
              components: compToUpd.components
            });
          });
        }
      });
    }
    _uiLoad(ui) {
      if (ui.components) {
        if (!Array.isArray(ui.components))
          ui.components = [ui.components];
        ui.components.forEach(async (component) => {
          await import(component);
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
    _uiReload() {
      log("trace", "Uib:uiManager:reload", "reloading")();
      location.reload();
    }
    _uiManager(msg) {
      if (!msg._ui)
        return;
      if (!Array.isArray(msg._ui))
        msg._ui = [msg._ui];
      msg._ui.forEach((ui, i2) => {
        if (!ui.method) {
          log("warn", "Uib:_uiManager", `No method defined for msg._ui[${i2}]. Ignoring`)();
          return;
        }
        ui.payload = msg.payload;
        ui.topic = msg.topic;
        this._dispatchCustomEvent(
          `uibuilder:msg:_ui:${ui.method}${ui.id ? `:${ui.id}` : ""}`,
          ui
        );
        switch (ui.method) {
          case "add": {
            this._uiAdd(ui, false);
            break;
          }
          case "remove": {
            this._uiRemove(ui);
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
            log("error", "Uib:_uiManager", `Invalid msg._ui[${i2}].method (${ui.method}). Ignoring`)();
            break;
          }
        }
      });
    }
    _send(msgToSend, channel, originator = "") {
      if (channel === null || channel === void 0)
        channel = this._ioChannels.client;
      if (channel === this._ioChannels.client) {
        msgToSend = makeMeAnObject(msgToSend, "payload");
      } else if (channel === this._ioChannels.control) {
        msgToSend = makeMeAnObject(msgToSend, "uibuilderCtrl");
        if (!Object.prototype.hasOwnProperty.call(msgToSend, "uibuilderCtrl")) {
          msgToSend.uibuilderCtrl = "manual send";
        }
        msgToSend.from = "client";
      }
      msgToSend._socketId = this._socket.id;
      this.socketOptions.auth.tabId = this.tabId;
      this.socketOptions.auth.lastNavType = this.lastNavType;
      this.socketOptions.auth.connectedNum = __privateGet(this, _connectedNum);
      let numMsgs;
      if (channel === this._ioChannels.client) {
        this.set("sentMsg", msgToSend);
        numMsgs = this.set("msgsSent", ++this.msgsSent);
      } else if (channel === this._ioChannels.control) {
        this.set("sentCtrlMsg", msgToSend);
        numMsgs = this.set("msgsSentCtrl", ++this.msgsSentCtrl);
      }
      if (originator === "" && this.originator !== "")
        originator = this.originator;
      if (originator !== "")
        Object.assign(msgToSend, { "_uib": { "originator": originator } });
      if (!Object.prototype.hasOwnProperty.call(msgToSend, "topic")) {
        if (this.topic !== void 0)
          msgToSend.topic = this.topic;
        else {
          if (Object.prototype.hasOwnProperty.call(this, "msg") && Object.prototype.hasOwnProperty.call(this.msg, "topic")) {
            msgToSend.topic = this.msg.topic;
          }
        }
      }
      log("debug", "Uib:_send", ` Channel '${channel}'. Sending msg #${numMsgs}`, msgToSend)();
      this._socket.emit(channel, msgToSend);
    }
    send(msg, originator = "") {
      this._send(msg, this._ioChannels.client, originator);
    }
    sendCtrl(msg) {
      this._send(msg, this._ioChannels.control);
    }
    eventSend(domevent, originator = "") {
      if (this.$attrs) {
        log("error", "Uib:eventSend", "`this` has been usurped by VueJS. Make sure that you wrap the call in a function: `doEvent: function (event) { uibuilder.eventSend(event) },`")();
        return;
      }
      if (!domevent && !event) {
        log("warn", "Uib:eventSend", "Neither the domevent nor the hidden event properties are set. You probably called this function directly rather than applying to an on click event.")();
        return;
      }
      if (!domevent || !domevent.constructor)
        domevent = event;
      if (!domevent.constructor.name.endsWith("Event") || !domevent.currentTarget) {
        log("warn", "Uib:eventSend", `ARGUMENT NOT A DOM EVENT - use data attributes not function arguments to pass data. Arg Type: ${domevent.constructor.name}`, domevent)();
        return;
      }
      const target = domevent.currentTarget;
      const props = {};
      Object.keys(target).forEach((key) => {
        if (key.startsWith("_"))
          return;
        props[key] = target[key];
      });
      const ignoreAttribs = ["class", "id", "name"];
      const attribs = Object.assign(
        {},
        ...Array.from(
          target.attributes,
          ({ name, value: value2 }) => {
            if (!ignoreAttribs.includes(name)) {
              return { [name]: value2 };
            }
            return void 0;
          }
        )
      );
      const msg = {
        payload: target.dataset,
        _ui: {
          type: "eventSend",
          id: target.id !== "" ? target.id : void 0,
          name: target.name !== "" ? target.name : void 0,
          slotText: target.textContent !== "" ? target.textContent.substring(0, 255) : void 0,
          props,
          attribs,
          classes: Array.from(target.classList),
          event: domevent.type,
          altKey: domevent.altKey,
          ctrlKey: domevent.ctrlKey,
          shiftKey: domevent.shiftKey,
          metaKey: domevent.metaKey,
          pointerType: domevent.pointerType,
          nodeName: target.nodeName,
          clientId: this.clientId,
          pageName: this.pageName,
          tabId: this.tabId
        }
      };
      log("trace", "Uib:eventSend", "Sending msg to Node-RED", msg)();
      if (target.dataset.length === 0)
        log("warn", "Uib:eventSend", "No payload in msg. data-* attributes should be used.")();
      this._send(msg, this._ioChannels.client, originator);
    }
    _msgRcvdEvents(msg) {
      this._dispatchCustomEvent("uibuilder:stdMsgReceived", msg);
      if (msg.topic)
        this._dispatchCustomEvent(`uibuilder:msg:topic:${msg.topic}`, msg);
      if (msg._uib) {
        if (msg._uib.reload === true) {
          log("trace", "Uib:_msgRcvdEvents:_uib:reload", "reloading")();
          location.reload();
          return;
        }
        if (msg._uib.componentRef === "globalNotification") {
          this.showDialog("notify", msg._uib.options, msg);
        }
        if (msg._uib.componentRef === "globalAlert") {
          this.showDialog("alert", msg._uib.options, msg);
        }
      }
      if (msg._ui) {
        log("trace", "Uib:_msgRcvdEvents:_ui", "Calling _uiManager")();
        this._dispatchCustomEvent("uibuilder:msg:_ui", msg);
        this._uiManager(msg);
      }
    }
    _stdMsgFromServer(receivedMsg) {
      receivedMsg = makeMeAnObject(receivedMsg, "payload");
      this._checkTimestamp(receivedMsg);
      this.set("msg", receivedMsg);
      this.set("msgsReceived", ++this.msgsReceived);
      this._msgRcvdEvents(receivedMsg);
      log("info", "Uib:ioSetup:stdMsgFromServer", `Channel '${this._ioChannels.server}'. Received msg #${this.msgsReceived}.`, receivedMsg)();
    }
    _ctrlMsgFromServer(receivedCtrlMsg) {
      if (receivedCtrlMsg === null) {
        receivedCtrlMsg = {};
      } else if (typeof receivedCtrlMsg !== "object") {
        const msg = {};
        msg["uibuilderCtrl:" + this._ioChannels.control] = receivedCtrlMsg;
        receivedCtrlMsg = msg;
      }
      this._checkTimestamp(receivedCtrlMsg);
      this.set("ctrlMsg", receivedCtrlMsg);
      this.set("msgsCtrlReceived", ++this.msgsCtrlReceived);
      log("trace", "Uib:ioSetup:_ctrlMsgFromServer", `Channel '${this._ioChannels.control}'. Received control msg #${this.msgsCtrlReceived}`, receivedCtrlMsg)();
      switch (receivedCtrlMsg.uibuilderCtrl) {
        case "shutdown": {
          log("info", `Uib:ioSetup:${this._ioChannels.control}`, '\u274C Received "shutdown" from server')();
          this.set("serverShutdown", void 0);
          break;
        }
        case "client connect": {
          log("trace", `Uib:ioSetup:${this._ioChannels.control}`, 'Received "client connect" from server')();
          log("info", `Uib:ioSetup:${this._ioChannels.control}`, `\u2705 Server connected. Version: ${receivedCtrlMsg.version}
Server time: ${receivedCtrlMsg.serverTimestamp}, Sever time offset: ${this.serverTimeOffset} hours`)();
          if (!_a._meta.version.startsWith(receivedCtrlMsg.version.split("-")[0])) {
            log("warn", `Uib:ioSetup:${this._ioChannels.control}`, `Server version (${receivedCtrlMsg.version}) not the same as the client version (${_a._meta.version})`)();
          }
          if (this.autoSendReady === true) {
            log("trace", `Uib:ioSetup:${this._ioChannels.control}/client connect`, "Auto-sending ready-for-content/replay msg to server");
          }
          break;
        }
        default: {
          log("trace", `uibuilderfe:ioSetup:${this._ioChannels.control}`, `Received ${receivedCtrlMsg.uibuilderCtrl} from server`);
        }
      }
    }
    beaconLog(txtToSend, logLevel2) {
      if (!logLevel2)
        logLevel2 = "debug";
      navigator.sendBeacon("./_clientLog", `${logLevel2}::${txtToSend}`);
    }
    logToServer() {
      this.sendCtrl({
        uibuilderCtrl: "client log message",
        payload: arguments,
        _socketId: this._socket.id,
        clientId: this.clientId,
        tabId: this.tabId,
        pageName: this.pageName,
        connections: __privateGet(this, _connectedNum),
        lastNavType: this.lastNavType
      });
    }
    _getIOnamespace() {
      let ioNamespace;
      ioNamespace = this.cookies["uibuilder-namespace"];
      if (ioNamespace === void 0 || ioNamespace === "") {
        const u = window.location.pathname.split("/").filter(function(t) {
          return t.trim() !== "";
        });
        if (u.length > 0 && u[u.length - 1].endsWith(".html"))
          u.pop();
        ioNamespace = u.pop();
        log("trace", "uibuilder.module.js:getIOnamespace", `Socket.IO namespace found via url path: ${ioNamespace}`)();
      } else {
        log("trace", "uibuilder.module.js:getIOnamespace", `Socket.IO namespace found via cookie: ${ioNamespace}`)();
      }
      ioNamespace = "/" + ioNamespace;
      log("trace", "uibuilder.module.js:getIOnamespace", `Final Socket.IO namespace: ${ioNamespace}`)();
      return ioNamespace;
    }
    _checkConnect(delay, factor, depth = 1) {
      if (navigator.onLine === false)
        return;
      if (!delay)
        delay = this.retryMs;
      if (!factor)
        factor = this.retryFactor;
      log("trace", "Uib:checkConnect", `Checking connection. Connected: ${this._socket.connected}. Timer: ${__privateGet(this, _timerid)}. Depth: ${depth}. Delay: ${delay}. Factor: ${factor}`, this._socket)();
      if (this._socket.connected === true) {
        if (__privateGet(this, _timerid)) {
          window.clearTimeout(__privateGet(this, _timerid));
          __privateSet(this, _timerid, null);
        }
        this.set("ioConnected", true);
        this.set("socketError", null);
        return true;
      }
      this.set("ioConnected", false);
      if (__privateGet(this, _timerid))
        window.clearTimeout(__privateGet(this, _timerid));
      __privateSet(this, _timerid, window.setTimeout(() => {
        log("warn", "Uib:checkConnect:setTimeout", `Socket.IO reconnection attempt. Current delay: ${delay}. Depth: ${depth}`)();
        this._socket.close();
        this._socket.connect();
        __privateSet(this, _timerid, null);
        this._checkConnect(delay * factor, factor, depth++);
      }, delay));
      return false;
    }
    _ioSetup() {
      if (lookup2 === void 0) {
        log("error", "Uib:ioSetup", "Socket.IO client not loaded, Node-RED comms will not work")();
        return false;
      }
      if (this._socket) {
        log("trace", "Uib:ioSetup", "Removing listeners in preparation for redoing Socket.IO connections")();
        if (__privateGet(this, _timerid)) {
          window.clearTimeout(__privateGet(this, _timerid));
          __privateSet(this, _timerid, null);
        }
        this._socket.close();
        this._socket.offAny();
        this._socket = void 0;
        this.set("ioConnected", false);
      }
      this.socketOptions.path = this.ioPath;
      this.socketOptions.auth.pageName = this.pageName;
      this.socketOptions.auth.clientId = this.clientId;
      this.socketOptions.transportOptions.polling.extraHeaders["x-clientid"] = `${_a._meta.displayName}; ${_a._meta.type}; ${_a._meta.version}; ${this.clientId}`;
      this.socketOptions.auth.tabId = this.tabId;
      this.socketOptions.auth.lastNavType = this.lastNavType;
      this.socketOptions.auth.connectedNum = __privateGet(this, _connectedNum);
      log("trace", "Uib:ioSetup", `About to create IO object. Transports: [${this.socketOptions.transports.join(", ")}]`)();
      this._socket = lookup2(this.ioNamespace, this.socketOptions);
      this._socket.on("connect", () => {
        __privateWrapper(this, _connectedNum)._++;
        this.socketOptions.auth.connectedNum = __privateGet(this, _connectedNum);
        this.socketOptions.auth.lastNavType = this.lastNavType;
        this.socketOptions.auth.tabId = this.tabId;
        this.socketOptions.auth.more = this.tabId;
        log("info", "Uib:ioSetup", `\u2705 SOCKET CONNECTED. Connection count: ${__privateGet(this, _connectedNum)}
Namespace: ${this.ioNamespace}`)();
        this._dispatchCustomEvent("uibuilder:socket:connected", __privateGet(this, _connectedNum));
        this._checkConnect();
      });
      this._socket.on(this._ioChannels.server, this._stdMsgFromServer.bind(this));
      this._socket.on(this._ioChannels.control, this._ctrlMsgFromServer.bind(this));
      this._socket.on("disconnect", (reason) => {
        log("info", "Uib:ioSetup:socket-disconnect", `\u26D4 Socket Disconnected. Reason: ${reason}`)();
        this._dispatchCustomEvent("uibuilder:socket:disconnected", reason);
        this._checkConnect();
      });
      this._socket.on("connect_error", (err) => {
        if (navigator.onLine === false)
          return;
        log("error", "Uib:ioSetup:connect_error", `\u274C Socket.IO Connect Error. Reason: ${err.message}`, err)();
        this.set("ioConnected", false);
        this.set("socketError", err);
        this._dispatchCustomEvent("uibuilder:socket:disconnected", err);
      });
      this._socket.on("error", (err) => {
        log("error", "Uib:ioSetup:error", `\u274C Socket.IO Error. Reason: ${err.message}`, err)();
        this.set("ioConnected", false);
        this.set("socketError", err);
        this._dispatchCustomEvent("uibuilder:socket:disconnected", err);
      });
      this._checkConnect();
      return true;
    }
    start(options) {
      log("trace", "Uib:start", "Starting")();
      if (__privateGet(this, _MsgHandler))
        this.cancelChange("msg", __privateGet(this, _MsgHandler));
      if (this.started === true) {
        log("info", "Uib:start", "Start function already called. Resetting Socket.IO and msg handler.")();
      }
      log("log", "Uib:start", "Cookies: ", this.cookies, `
Client ID: ${this.clientId}`)();
      log("trace", "Uib:start", "ioNamespace: ", this.ioNamespace, `
ioPath: ${this.ioPath}`)();
      if (options) {
        if (options.ioNamespace !== void 0 && options.ioNamespace !== null && options.ioNamespace !== "")
          this.ioNamespace = options.ioNamespace;
        if (options.ioPath !== void 0 && options.ioPath !== null && options.ioPath !== "")
          this.ioPath = options.ioPath;
      }
      if (document.styleSheets.length > 1 || document.styleSheets.length === 0 && document.styleSheets[0].cssRules.length === 0) {
        log("info", "Uib:start", "Styles already loaded so not loading uibuilder default styles.")();
      } else {
        if (options && options.loadStylesheet === false)
          log("info", "Uib:start", "No styles loaded & options.loadStylesheet === false.")();
        else {
          log("info", "Uib:start", "No styles loaded, loading uibuilder default styles.")();
          this.loadStyleSrc(`${this.httpNodeRoot}/uibuilder/uib-brand.css`);
        }
      }
      const [entry] = performance.getEntriesByType("navigation");
      this.set("lastNavType", entry.type);
      this.started = this._ioSetup();
      if (this.started === true) {
        log("trace", "Uib:start", "Start completed. Socket.IO client library loaded.")();
      } else {
        log("error", "Uib:start", "Start completed. ERROR: Socket.IO client library NOT LOADED.")();
      }
      if (window["Vue"])
        __privateSet(this, _isVue, true);
      this._dispatchCustomEvent("uibuilder:startComplete");
    }
  }, _connectedNum = new WeakMap(), _pingInterval = new WeakMap(), _propChangeCallbacks = new WeakMap(), _msgRecvdByTopicCallbacks = new WeakMap(), _isVue = new WeakMap(), _timerid = new WeakMap(), _MsgHandler = new WeakMap(), __publicField(_a, "_meta", {
    version,
    type: "module",
    displayName: "uibuilder"
  }), _a);
  var uibuilder = new Uib();
  if (!window["uibuilder"]) {
    window["uibuilder"] = uibuilder;
  } else {
    log("error", "uibuilder.module.js", "uibuilder already assigned to window. Have you tried to load it more than once?");
  }
  if (!window["$"]) {
    window["$"] = document.querySelector.bind(document);
  } else {
    log("warn", "uibuilder.module.js", "Cannot allocate the global `$`, it is already in use");
  }
  var uibuilder_module_default = uibuilder;
  uibuilder.start();
})();
