/** @file Bundled DEGIT for uibuilder (ESM) */
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn2, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
  } catch (e4) {
    throw err = [e4], e4;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/degit/dist/utils-DTdqQ6KU.js
import { createRequire as e } from "node:module";
import t from "node:fs";
import n from "node:path";
import r from "node:os";
import i from "node:https";
import * as a from "node:url";
function A(e4, t3) {
  let r2 = n.resolve(e4, t3), i3 = n.relative(e4, r2);
  if (!(i3 === `` || i3.startsWith(`..`) || n.isAbsolute(i3))) return r2;
}
function j(e4, n2) {
  try {
    let n3 = t.lstatSync(e4);
    if (n3.isSymbolicLink()) throw new k(`destination is a symlink: ${e4}`, { code: `ENOTDIR` });
    if (!n3.isDirectory()) throw new k(`destination is not a directory: ${e4}`, { code: `ENOTDIR` });
    return true;
  } catch (e5) {
    if (e5 instanceof k) throw e5;
    if ((e5 instanceof Error ? e5.code : void 0) !== `ENOENT`) throw new k(`could not stat destination: ${e5 instanceof Error ? e5.message : String(e5)}`, { code: `COULD_NOT_STAT`, original: e5 });
  }
  if (!n2) throw new k(`destination does not exist: ${e4}`, { code: `MISSING_DEST` });
  return false;
}
function M(e4) {
  try {
    return JSON.parse(t.readFileSync(e4, `utf8`));
  } catch {
    return null;
  }
}
function N(e4) {
  t.mkdirSync(e4, { recursive: true });
}
function P(e4, n2, r2) {
  return new Promise((o3, s3) => {
    let c3 = e4;
    if (r2) {
      let t3 = a.parse(e4);
      c3 = { agent: (0, D.default)(r2), hostname: t3.host, path: t3.path };
    }
    i.get(c3, (e5) => {
      let i3 = e5.statusCode;
      i3 >= 400 ? (e5.resume(), s3({ code: i3, message: e5.statusMessage })) : i3 >= 300 ? (e5.resume(), P(e5.headers.location, n2, r2).then(o3, s3)) : e5.pipe(t.createWriteStream(n2)).on(`finish`, () => o3()).on(`error`, s3);
    }).on(`error`, s3);
  });
}
function F(e4, r2) {
  let i3 = n.join(e4, `tmp`);
  t.rmSync(i3, { force: true, recursive: true }), N(i3);
  let a3 = [];
  for (let e5 of t.readdirSync(r2)) {
    let o3 = n.join(r2, e5), s3 = n.join(i3, e5), c3 = t.lstatSync(o3), l3 = c3.isDirectory();
    if (c3.isSymbolicLink()) {
      let e6 = t.readlinkSync(o3), n2 = false;
      try {
        n2 = t.statSync(o3).isDirectory();
      } catch {
      }
      t.symlinkSync(e6, s3, n2 ? `dir` : `file`);
    } else l3 ? t.cpSync(o3, s3, { recursive: true, dereference: false }) : t.copyFileSync(o3, s3);
    a3.push({ filePath: o3, isDir: l3 });
  }
  return a3;
}
function I(e4) {
  for (let { filePath: n2, isDir: r2 } of e4) t.rmSync(n2, { force: true, recursive: r2 });
}
function L(e4, r2, i3 = true) {
  let a3 = n.join(e4, `tmp`), o3 = new Set(t.readdirSync(a3));
  if (!i3) for (let e5 of t.readdirSync(r2)) o3.has(e5) || t.rmSync(n.join(r2, e5), { force: true, recursive: true });
  let s3 = !i3, c3 = [], l3 = [], u3 = [];
  for (let e5 of o3) {
    let r3 = t.lstatSync(n.join(a3, e5));
    r3.isDirectory() ? c3.push(e5) : r3.isSymbolicLink() ? l3.push(e5) : u3.push(e5);
  }
  for (let e5 of [...c3, ...l3, ...u3]) {
    let i4 = n.join(a3, e5), o4 = n.join(r2, e5);
    c3.includes(e5) ? (z(o4, true, false, s3), t.cpSync(i4, o4, { force: true, recursive: true, dereference: false }), t.rmSync(i4, { force: true, recursive: true })) : l3.includes(e5) ? R(i4, o4, a3) : (z(o4, false, false, s3), t.copyFileSync(i4, o4), t.unlinkSync(i4));
  }
  t.rmSync(a3, { force: true, recursive: true });
}
function R(e4, r2, i3) {
  z(r2, false, true, false);
  let a3 = t.readlinkSync(e4), o3 = n.isAbsolute(a3) ? a3 : n.resolve(n.dirname(e4), a3), s3 = n.isAbsolute(a3) ? a3 : n.resolve(n.dirname(r2), a3), c3 = n.relative(i3, o3), l3 = !c3.startsWith(`..`) && !n.isAbsolute(c3), u3 = false;
  try {
    u3 = t.statSync(s3).isDirectory();
  } catch {
    if (l3) try {
      u3 = t.statSync(o3).isDirectory();
    } catch {
    }
  }
  t.symlinkSync(a3, r2, u3 ? `dir` : `file`), t.unlinkSync(e4);
}
function z(e4, n2, r2 = false, i3 = false) {
  let a3 = false, o3 = false, s3 = false;
  try {
    let n3 = t.lstatSync(e4);
    o3 = n3.isDirectory(), s3 = n3.isSymbolicLink(), a3 = true;
  } catch {
  }
  a3 && (i3 || s3 || o3 !== n2 || r2) && t.rmSync(e4, { force: true, recursive: true });
}
function B({ env: e4 = process.env, homedir: t3 = r.homedir(), platform: i3 = process.platform } = {}) {
  return i3 === `win32` ? n.join(e4.LOCALAPPDATA ?? n.join(t3, `AppData`, `Local`), `degit`) : i3 === `darwin` ? n.join(t3, `Library`, `Caches`, `degit`) : n.join(e4.XDG_CACHE_HOME ?? n.join(t3, `.cache`), `degit`);
}
var o, s, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, V;
var init_utils_DTdqQ6KU = __esm({
  "../../node_modules/degit/dist/utils-DTdqQ6KU.js"() {
    o = Object.create;
    s = Object.defineProperty;
    c = Object.getOwnPropertyDescriptor;
    l = Object.getOwnPropertyNames;
    u = Object.getPrototypeOf;
    d = Object.prototype.hasOwnProperty;
    f = (e4, t3) => () => (t3 || (e4((t3 = { exports: {} }).exports, t3), e4 = null), t3.exports);
    p = (e4, t3, n2, r2) => {
      if (t3 && typeof t3 == `object` || typeof t3 == `function`) for (var i3 = l(t3), a3 = 0, o3 = i3.length, u3; a3 < o3; a3++) u3 = i3[a3], !d.call(e4, u3) && u3 !== n2 && s(e4, u3, { get: ((e5) => t3[e5]).bind(null, u3), enumerable: !(r2 = c(t3, u3)) || r2.enumerable });
      return e4;
    };
    m = (e4, t3, n2) => (n2 = e4 == null ? {} : o(u(e4)), p(t3 || !e4 || !e4.__esModule ? s(n2, `default`, { value: e4, enumerable: true }) : n2, e4));
    h = e(import.meta.url);
    g = f(((e4, t3) => {
      var n2 = 1e3, r2 = n2 * 60, i3 = r2 * 60, a3 = i3 * 24, o3 = a3 * 7, s3 = a3 * 365.25;
      t3.exports = function(e5, t4) {
        t4 ||= {};
        var n3 = typeof e5;
        if (n3 === `string` && e5.length > 0) return c3(e5);
        if (n3 === `number` && isFinite(e5)) return t4.long ? u3(e5) : l3(e5);
        throw Error(`val is not a non-empty string or a valid number. val=` + JSON.stringify(e5));
      };
      function c3(e5) {
        if (e5 = String(e5), !(e5.length > 100)) {
          var t4 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e5);
          if (t4) {
            var c4 = parseFloat(t4[1]);
            switch ((t4[2] || `ms`).toLowerCase()) {
              case `years`:
              case `year`:
              case `yrs`:
              case `yr`:
              case `y`:
                return c4 * s3;
              case `weeks`:
              case `week`:
              case `w`:
                return c4 * o3;
              case `days`:
              case `day`:
              case `d`:
                return c4 * a3;
              case `hours`:
              case `hour`:
              case `hrs`:
              case `hr`:
              case `h`:
                return c4 * i3;
              case `minutes`:
              case `minute`:
              case `mins`:
              case `min`:
              case `m`:
                return c4 * r2;
              case `seconds`:
              case `second`:
              case `secs`:
              case `sec`:
              case `s`:
                return c4 * n2;
              case `milliseconds`:
              case `millisecond`:
              case `msecs`:
              case `msec`:
              case `ms`:
                return c4;
              default:
                return;
            }
          }
        }
      }
      function l3(e5) {
        var t4 = Math.abs(e5);
        return t4 >= a3 ? Math.round(e5 / a3) + `d` : t4 >= i3 ? Math.round(e5 / i3) + `h` : t4 >= r2 ? Math.round(e5 / r2) + `m` : t4 >= n2 ? Math.round(e5 / n2) + `s` : e5 + `ms`;
      }
      function u3(e5) {
        var t4 = Math.abs(e5);
        return t4 >= a3 ? d3(e5, t4, a3, `day`) : t4 >= i3 ? d3(e5, t4, i3, `hour`) : t4 >= r2 ? d3(e5, t4, r2, `minute`) : t4 >= n2 ? d3(e5, t4, n2, `second`) : e5 + ` ms`;
      }
      function d3(e5, t4, n3, r3) {
        var i4 = t4 >= n3 * 1.5;
        return Math.round(e5 / n3) + ` ` + r3 + (i4 ? `s` : ``);
      }
    }));
    _ = f(((e4, t3) => {
      function n2(e5) {
        n3.debug = n3, n3.default = n3, n3.coerce = c3, n3.disable = o3, n3.enable = i3, n3.enabled = s3, n3.humanize = g(), n3.destroy = l3, Object.keys(e5).forEach((t5) => {
          n3[t5] = e5[t5];
        }), n3.names = [], n3.skips = [], n3.formatters = {};
        function t4(e6) {
          let t5 = 0;
          for (let n4 = 0; n4 < e6.length; n4++) t5 = (t5 << 5) - t5 + e6.charCodeAt(n4), t5 |= 0;
          return n3.colors[Math.abs(t5) % n3.colors.length];
        }
        n3.selectColor = t4;
        function n3(e6) {
          let t5, i4 = null, a4, o4;
          function s4(...e7) {
            if (!s4.enabled) return;
            let r3 = s4, i5 = Number(/* @__PURE__ */ new Date());
            r3.diff = i5 - (t5 || i5), r3.prev = t5, r3.curr = i5, t5 = i5, e7[0] = n3.coerce(e7[0]), typeof e7[0] != `string` && e7.unshift(`%O`);
            let a5 = 0;
            e7[0] = e7[0].replace(/%([a-zA-Z%])/g, (t6, i6) => {
              if (t6 === `%%`) return `%`;
              a5++;
              let o5 = n3.formatters[i6];
              if (typeof o5 == `function`) {
                let n4 = e7[a5];
                t6 = o5.call(r3, n4), e7.splice(a5, 1), a5--;
              }
              return t6;
            }), n3.formatArgs.call(r3, e7), (r3.log || n3.log).apply(r3, e7);
          }
          return s4.namespace = e6, s4.useColors = n3.useColors(), s4.color = n3.selectColor(e6), s4.extend = r2, s4.destroy = n3.destroy, Object.defineProperty(s4, `enabled`, { enumerable: true, configurable: false, get: () => i4 === null ? (a4 !== n3.namespaces && (a4 = n3.namespaces, o4 = n3.enabled(e6)), o4) : i4, set: (e7) => {
            i4 = e7;
          } }), typeof n3.init == `function` && n3.init(s4), s4;
        }
        function r2(e6, t5) {
          let r3 = n3(this.namespace + (t5 === void 0 ? `:` : t5) + e6);
          return r3.log = this.log, r3;
        }
        function i3(e6) {
          n3.save(e6), n3.namespaces = e6, n3.names = [], n3.skips = [];
          let t5 = (typeof e6 == `string` ? e6 : ``).trim().replace(/\s+/g, `,`).split(`,`).filter(Boolean);
          for (let e7 of t5) e7[0] === `-` ? n3.skips.push(e7.slice(1)) : n3.names.push(e7);
        }
        function a3(e6, t5) {
          let n4 = 0, r3 = 0, i4 = -1, a4 = 0;
          for (; n4 < e6.length; ) if (r3 < t5.length && (t5[r3] === e6[n4] || t5[r3] === `*`)) t5[r3] === `*` ? (i4 = r3, a4 = n4, r3++) : (n4++, r3++);
          else if (i4 !== -1) r3 = i4 + 1, a4++, n4 = a4;
          else return false;
          for (; r3 < t5.length && t5[r3] === `*`; ) r3++;
          return r3 === t5.length;
        }
        function o3() {
          let e6 = [...n3.names, ...n3.skips.map((e7) => `-` + e7)].join(`,`);
          return n3.enable(``), e6;
        }
        function s3(e6) {
          for (let t5 of n3.skips) if (a3(e6, t5)) return false;
          for (let t5 of n3.names) if (a3(e6, t5)) return true;
          return false;
        }
        function c3(e6) {
          return e6 instanceof Error ? e6.stack || e6.message : e6;
        }
        function l3() {
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
        return n3.enable(n3.load()), n3;
      }
      t3.exports = n2;
    }));
    v = f(((e4, t3) => {
      e4.formatArgs = r2, e4.save = i3, e4.load = a3, e4.useColors = n2, e4.storage = o3(), e4.destroy = /* @__PURE__ */ (() => {
        let e5 = false;
        return () => {
          e5 || (e5 = true, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
        };
      })(), e4.colors = `#0000CC.#0000FF.#0033CC.#0033FF.#0066CC.#0066FF.#0099CC.#0099FF.#00CC00.#00CC33.#00CC66.#00CC99.#00CCCC.#00CCFF.#3300CC.#3300FF.#3333CC.#3333FF.#3366CC.#3366FF.#3399CC.#3399FF.#33CC00.#33CC33.#33CC66.#33CC99.#33CCCC.#33CCFF.#6600CC.#6600FF.#6633CC.#6633FF.#66CC00.#66CC33.#9900CC.#9900FF.#9933CC.#9933FF.#99CC00.#99CC33.#CC0000.#CC0033.#CC0066.#CC0099.#CC00CC.#CC00FF.#CC3300.#CC3333.#CC3366.#CC3399.#CC33CC.#CC33FF.#CC6600.#CC6633.#CC9900.#CC9933.#CCCC00.#CCCC33.#FF0000.#FF0033.#FF0066.#FF0099.#FF00CC.#FF00FF.#FF3300.#FF3333.#FF3366.#FF3399.#FF33CC.#FF33FF.#FF6600.#FF6633.#FF9900.#FF9933.#FFCC00.#FFCC33`.split(`.`);
      function n2() {
        if (typeof window < `u` && window.process && (window.process.type === `renderer` || window.process.__nwjs)) return true;
        if (typeof navigator < `u` && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return false;
        let e5;
        return typeof document < `u` && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window < `u` && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator < `u` && navigator.userAgent && (e5 = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(e5[1], 10) >= 31 || typeof navigator < `u` && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
      }
      function r2(e5) {
        if (e5[0] = (this.useColors ? `%c` : ``) + this.namespace + (this.useColors ? ` %c` : ` `) + e5[0] + (this.useColors ? `%c ` : ` `) + `+` + t3.exports.humanize(this.diff), !this.useColors) return;
        let n3 = `color: ` + this.color;
        e5.splice(1, 0, n3, `color: inherit`);
        let r3 = 0, i4 = 0;
        e5[0].replace(/%[a-zA-Z%]/g, (e6) => {
          e6 !== `%%` && (r3++, e6 === `%c` && (i4 = r3));
        }), e5.splice(i4, 0, n3);
      }
      e4.log = console.debug || console.log || (() => {
      });
      function i3(t4) {
        try {
          t4 ? e4.storage.setItem(`debug`, t4) : e4.storage.removeItem(`debug`);
        } catch {
        }
      }
      function a3() {
        let t4;
        try {
          t4 = e4.storage.getItem(`debug`) || e4.storage.getItem(`DEBUG`);
        } catch {
        }
        return !t4 && typeof process < `u` && `env` in process && (t4 = process.env.DEBUG), t4;
      }
      function o3() {
        try {
          return localStorage;
        } catch {
        }
      }
      t3.exports = _()(e4);
      let { formatters: s3 } = t3.exports;
      s3.j = function(e5) {
        try {
          return JSON.stringify(e5);
        } catch (e6) {
          return `[UnexpectedJSONParseError]: ` + e6.message;
        }
      };
    }));
    y = f(((e4, t3) => {
      t3.exports = (e5, t4 = process.argv) => {
        let n2 = e5.startsWith(`-`) ? `` : e5.length === 1 ? `-` : `--`, r2 = t4.indexOf(n2 + e5), i3 = t4.indexOf(`--`);
        return r2 !== -1 && (i3 === -1 || r2 < i3);
      };
    }));
    b = f(((e4, t3) => {
      let n2 = h(`os`), r2 = h(`tty`), i3 = y(), { env: a3 } = process, o3;
      i3(`no-color`) || i3(`no-colors`) || i3(`color=false`) || i3(`color=never`) ? o3 = 0 : (i3(`color`) || i3(`colors`) || i3(`color=true`) || i3(`color=always`)) && (o3 = 1), `FORCE_COLOR` in a3 && (o3 = a3.FORCE_COLOR === `true` ? 1 : a3.FORCE_COLOR === `false` ? 0 : a3.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(a3.FORCE_COLOR, 10), 3));
      function s3(e5) {
        return e5 === 0 ? false : { level: e5, hasBasic: true, has256: e5 >= 2, has16m: e5 >= 3 };
      }
      function c3(e5, t4) {
        if (o3 === 0) return 0;
        if (i3(`color=16m`) || i3(`color=full`) || i3(`color=truecolor`)) return 3;
        if (i3(`color=256`)) return 2;
        if (e5 && !t4 && o3 === void 0) return 0;
        let r3 = o3 || 0;
        if (a3.TERM === `dumb`) return r3;
        if (process.platform === `win32`) {
          let e6 = n2.release().split(`.`);
          return Number(e6[0]) >= 10 && Number(e6[2]) >= 10586 ? Number(e6[2]) >= 14931 ? 3 : 2 : 1;
        }
        if (`CI` in a3) return [`TRAVIS`, `CIRCLECI`, `APPVEYOR`, `GITLAB_CI`, `GITHUB_ACTIONS`, `BUILDKITE`].some((e6) => e6 in a3) || a3.CI_NAME === `codeship` ? 1 : r3;
        if (`TEAMCITY_VERSION` in a3) return +!!/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(a3.TEAMCITY_VERSION);
        if (a3.COLORTERM === `truecolor`) return 3;
        if (`TERM_PROGRAM` in a3) {
          let e6 = parseInt((a3.TERM_PROGRAM_VERSION || ``).split(`.`)[0], 10);
          switch (a3.TERM_PROGRAM) {
            case `iTerm.app`:
              return e6 >= 3 ? 3 : 2;
            case `Apple_Terminal`:
              return 2;
          }
        }
        return /-256(color)?$/i.test(a3.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(a3.TERM) || `COLORTERM` in a3 ? 1 : r3;
      }
      function l3(e5) {
        return s3(c3(e5, e5 && e5.isTTY));
      }
      t3.exports = { supportsColor: l3, stdout: s3(c3(true, r2.isatty(1))), stderr: s3(c3(true, r2.isatty(2))) };
    }));
    x = f(((e4, t3) => {
      let n2 = h(`tty`), r2 = h(`util`);
      e4.init = u3, e4.log = s3, e4.formatArgs = a3, e4.save = c3, e4.load = l3, e4.useColors = i3, e4.destroy = r2.deprecate(() => {
      }, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."), e4.colors = [6, 2, 3, 4, 5, 1];
      try {
        let t4 = b();
        t4 && (t4.stderr || t4).level >= 2 && (e4.colors = [20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221]);
      } catch {
      }
      e4.inspectOpts = Object.keys(process.env).filter((e5) => /^debug_/i.test(e5)).reduce((e5, t4) => {
        let n3 = t4.substring(6).toLowerCase().replace(/_([a-z])/g, (e6, t5) => t5.toUpperCase()), r3 = process.env[t4];
        return r3 = /^(yes|on|true|enabled)$/i.test(r3) ? true : /^(no|off|false|disabled)$/i.test(r3) ? false : r3 === `null` ? null : Number(r3), e5[n3] = r3, e5;
      }, {});
      function i3() {
        return `colors` in e4.inspectOpts ? !!e4.inspectOpts.colors : n2.isatty(process.stderr.fd);
      }
      function a3(e5) {
        let { namespace: n3, useColors: r3 } = this;
        if (r3) {
          let r4 = this.color, i4 = `\x1B[3` + (r4 < 8 ? r4 : `8;5;` + r4), a4 = `  ${i4};1m${n3} \x1B[0m`;
          e5[0] = a4 + e5[0].split(`
`).join(`
` + a4), e5.push(i4 + `m+` + t3.exports.humanize(this.diff) + `\x1B[0m`);
        } else e5[0] = o3() + n3 + ` ` + e5[0];
      }
      function o3() {
        return e4.inspectOpts.hideDate ? `` : (/* @__PURE__ */ new Date()).toISOString() + ` `;
      }
      function s3(...t4) {
        return process.stderr.write(r2.formatWithOptions(e4.inspectOpts, ...t4) + `
`);
      }
      function c3(e5) {
        e5 ? process.env.DEBUG = e5 : delete process.env.DEBUG;
      }
      function l3() {
        return process.env.DEBUG;
      }
      function u3(t4) {
        t4.inspectOpts = {};
        let n3 = Object.keys(e4.inspectOpts);
        for (let r3 = 0; r3 < n3.length; r3++) t4.inspectOpts[n3[r3]] = e4.inspectOpts[n3[r3]];
      }
      t3.exports = _()(e4);
      let { formatters: d3 } = t3.exports;
      d3.o = function(e5) {
        return this.inspectOpts.colors = this.useColors, r2.inspect(e5, this.inspectOpts).split(`
`).map((e6) => e6.trim()).join(` `);
      }, d3.O = function(e5) {
        return this.inspectOpts.colors = this.useColors, r2.inspect(e5, this.inspectOpts);
      };
    }));
    S = f(((e4, t3) => {
      typeof process > `u` || process.type === `renderer` || process.browser === true || process.__nwjs ? t3.exports = v() : t3.exports = x();
    }));
    C = f(((e4) => {
      Object.defineProperty(e4, `__esModule`, { value: true });
      function t3(e5) {
        return function(t4, n2) {
          return new Promise((r2, i3) => {
            e5.call(this, t4, n2, (e6, t5) => {
              e6 ? i3(e6) : r2(t5);
            });
          });
        };
      }
      e4.default = t3;
    }));
    w = f(((e4, t3) => {
      var n2 = e4 && e4.__importDefault || function(e5) {
        return e5 && e5.__esModule ? e5 : { default: e5 };
      };
      let r2 = h(`events`), i3 = n2(S()), a3 = n2(C()), o3 = i3.default(`agent-base`);
      function s3(e5) {
        return !!e5 && typeof e5.addRequest == `function`;
      }
      function c3() {
        let { stack: e5 } = Error();
        return typeof e5 == `string` ? e5.split(`
`).some((e6) => e6.indexOf(`(https.js:`) !== -1 || e6.indexOf(`node:https:`) !== -1) : false;
      }
      function l3(e5, t4) {
        return new l3.Agent(e5, t4);
      }
      (function(e5) {
        class t4 extends r2.EventEmitter {
          constructor(e6, t5) {
            super();
            let n3 = t5;
            typeof e6 == `function` ? this.callback = e6 : e6 && (n3 = e6), this.timeout = null, n3 && typeof n3.timeout == `number` && (this.timeout = n3.timeout), this.maxFreeSockets = 1, this.maxSockets = 1, this.maxTotalSockets = 1 / 0, this.sockets = {}, this.freeSockets = {}, this.requests = {}, this.options = {};
          }
          get defaultPort() {
            return typeof this.explicitDefaultPort == `number` ? this.explicitDefaultPort : c3() ? 443 : 80;
          }
          set defaultPort(e6) {
            this.explicitDefaultPort = e6;
          }
          get protocol() {
            return typeof this.explicitProtocol == `string` ? this.explicitProtocol : c3() ? `https:` : `http:`;
          }
          set protocol(e6) {
            this.explicitProtocol = e6;
          }
          callback(e6, t5, n3) {
            throw Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
          }
          addRequest(e6, t5) {
            let n3 = Object.assign({}, t5);
            typeof n3.secureEndpoint != `boolean` && (n3.secureEndpoint = c3()), n3.host ??= `localhost`, n3.port ??= n3.secureEndpoint ? 443 : 80, n3.protocol ??= n3.secureEndpoint ? `https:` : `http:`, n3.host && n3.path && delete n3.path, delete n3.agent, delete n3.hostname, delete n3._defaultAgent, delete n3.defaultPort, delete n3.createConnection, e6._last = true, e6.shouldKeepAlive = false;
            let r3 = false, i4 = null, l4 = n3.timeout || this.timeout, u3 = (t6) => {
              e6._hadError ||= (e6.emit(`error`, t6), true);
            }, d3 = () => {
              i4 = null, r3 = true;
              let e7 = Error(`A "socket" was not created for HTTP request before ${l4}ms`);
              e7.code = `ETIMEOUT`, u3(e7);
            }, f3 = (e7) => {
              r3 || (i4 !== null && (clearTimeout(i4), i4 = null), u3(e7));
            }, p3 = (t6) => {
              if (!r3) {
                if (i4 != null && (clearTimeout(i4), i4 = null), s3(t6)) {
                  o3(`Callback returned another Agent instance %o`, t6.constructor.name), t6.addRequest(e6, n3);
                  return;
                }
                if (t6) {
                  t6.once(`free`, () => {
                    this.freeSocket(t6, n3);
                  }), e6.onSocket(t6);
                  return;
                }
                u3(Error(`no Duplex stream was returned to agent-base for \`${e6.method} ${e6.path}\``));
              }
            };
            if (typeof this.callback != `function`) {
              u3(Error("`callback` is not defined"));
              return;
            }
            this.promisifiedCallback || (this.callback.length >= 3 ? (o3(`Converting legacy callback function to promise`), this.promisifiedCallback = a3.default(this.callback)) : this.promisifiedCallback = this.callback), typeof l4 == `number` && l4 > 0 && (i4 = setTimeout(d3, l4)), `port` in n3 && typeof n3.port != `number` && (n3.port = Number(n3.port));
            try {
              o3(`Resolving socket for %o request: %o`, n3.protocol, `${e6.method} ${e6.path}`), Promise.resolve(this.promisifiedCallback(e6, n3)).then(p3, f3);
            } catch (e7) {
              Promise.reject(e7).catch(f3);
            }
          }
          freeSocket(e6, t5) {
            o3(`Freeing socket %o %o`, e6.constructor.name, t5), e6.destroy();
          }
          destroy() {
            o3(`Destroying agent %o`, this.constructor.name);
          }
        }
        e5.Agent = t4, e5.prototype = e5.Agent.prototype;
      })(l3 ||= {}), t3.exports = l3;
    }));
    T = f(((e4) => {
      var t3 = e4 && e4.__importDefault || function(e5) {
        return e5 && e5.__esModule ? e5 : { default: e5 };
      };
      Object.defineProperty(e4, `__esModule`, { value: true });
      let n2 = t3(S()).default(`https-proxy-agent:parse-proxy-response`);
      function r2(e5) {
        return new Promise((t4, r3) => {
          let i3 = 0, a3 = [];
          function o3() {
            let t5 = e5.read();
            t5 ? d3(t5) : e5.once(`readable`, o3);
          }
          function s3() {
            e5.removeListener(`end`, l3), e5.removeListener(`error`, u3), e5.removeListener(`close`, c3), e5.removeListener(`readable`, o3);
          }
          function c3(e6) {
            n2(`onclose had error %o`, e6);
          }
          function l3() {
            n2(`onend`);
          }
          function u3(e6) {
            s3(), n2(`onerror %o`, e6), r3(e6);
          }
          function d3(e6) {
            a3.push(e6), i3 += e6.length;
            let r4 = Buffer.concat(a3, i3);
            if (r4.indexOf(`\r
\r
`) === -1) {
              n2(`have not received end of HTTP headers yet...`), o3();
              return;
            }
            let s4 = r4.toString(`ascii`, 0, r4.indexOf(`\r
`)), c4 = +s4.split(` `)[1];
            n2(`got proxy server response: %o`, s4), t4({ statusCode: c4, buffered: r4 });
          }
          e5.on(`error`, u3), e5.on(`close`, c3), e5.on(`end`, l3), o3();
        });
      }
      e4.default = r2;
    }));
    E = f(((e4) => {
      var t3 = e4 && e4.__awaiter || function(e5, t4, n3, r3) {
        function i4(e6) {
          return e6 instanceof n3 ? e6 : new n3(function(t5) {
            t5(e6);
          });
        }
        return new (n3 ||= Promise)(function(n4, a4) {
          function o4(e6) {
            try {
              c4(r3.next(e6));
            } catch (e7) {
              a4(e7);
            }
          }
          function s4(e6) {
            try {
              c4(r3.throw(e6));
            } catch (e7) {
              a4(e7);
            }
          }
          function c4(e6) {
            e6.done ? n4(e6.value) : i4(e6.value).then(o4, s4);
          }
          c4((r3 = r3.apply(e5, t4 || [])).next());
        });
      }, n2 = e4 && e4.__importDefault || function(e5) {
        return e5 && e5.__esModule ? e5 : { default: e5 };
      };
      Object.defineProperty(e4, `__esModule`, { value: true });
      let r2 = n2(h(`net`)), i3 = n2(h(`tls`)), a3 = n2(h(`url`)), o3 = n2(h(`assert`)), s3 = n2(S()), c3 = w(), l3 = n2(T()), u3 = s3.default(`https-proxy-agent:agent`);
      e4.default = class extends c3.Agent {
        constructor(e5) {
          let t4;
          if (t4 = typeof e5 == `string` ? a3.default.parse(e5) : e5, !t4) throw Error("an HTTP(S) proxy server `host` and `port` must be specified!");
          u3(`creating new HttpsProxyAgent instance: %o`, t4), super(t4);
          let n3 = Object.assign({}, t4);
          this.secureProxy = t4.secureProxy || p3(n3.protocol), n3.host = n3.hostname || n3.host, typeof n3.port == `string` && (n3.port = parseInt(n3.port, 10)), !n3.port && n3.host && (n3.port = this.secureProxy ? 443 : 80), this.secureProxy && !(`ALPNProtocols` in n3) && (n3.ALPNProtocols = [`http 1.1`]), n3.host && n3.path && (delete n3.path, delete n3.pathname), this.proxy = n3;
        }
        callback(e5, n3) {
          return t3(this, void 0, void 0, function* () {
            let { proxy: t4, secureProxy: a4 } = this, s4;
            a4 ? (u3("Creating `tls.Socket`: %o", t4), s4 = i3.default.connect(t4)) : (u3("Creating `net.Socket`: %o", t4), s4 = r2.default.connect(t4));
            let c4 = Object.assign({}, t4.headers), p4 = `CONNECT ${`${n3.host}:${n3.port}`} HTTP/1.1\r
`;
            t4.auth && (c4[`Proxy-Authorization`] = `Basic ${Buffer.from(t4.auth).toString(`base64`)}`);
            let { host: h4, port: g4, secureEndpoint: _4 } = n3;
            f3(g4, _4) || (h4 += `:${g4}`), c4.Host = h4, c4.Connection = `close`;
            for (let e6 of Object.keys(c4)) p4 += `${e6}: ${c4[e6]}\r
`;
            let v4 = l3.default(s4);
            s4.write(`${p4}\r
`);
            let { statusCode: y4, buffered: b4 } = yield v4;
            if (y4 === 200) {
              if (e5.once(`socket`, d3), n3.secureEndpoint) {
                let e6 = n3.servername || n3.host;
                if (!e6) throw Error(`Could not determine "servername"`);
                return u3(`Upgrading socket connection to TLS`), i3.default.connect(Object.assign(Object.assign({}, m4(n3, `host`, `hostname`, `path`, `port`)), { socket: s4, servername: e6 }));
              }
              return s4;
            }
            s4.destroy();
            let x4 = new r2.default.Socket();
            return x4.readable = true, e5.once(`socket`, (e6) => {
              u3(`replaying proxy buffer for failed request`), o3.default(e6.listenerCount(`data`) > 0), e6.push(b4), e6.push(null);
            }), x4;
          });
        }
      };
      function d3(e5) {
        e5.resume();
      }
      function f3(e5, t4) {
        return !!(!t4 && e5 === 80 || t4 && e5 === 443);
      }
      function p3(e5) {
        return typeof e5 == `string` ? /^https:?$/i.test(e5) : false;
      }
      function m4(e5, ...t4) {
        let n3 = {}, r3;
        for (r3 in e5) t4.includes(r3) || (n3[r3] = e5[r3]);
        return n3;
      }
    }));
    D = m(f(((e4, t3) => {
      let n2 = (e4 && e4.__importDefault || function(e5) {
        return e5 && e5.__esModule ? e5 : { default: e5 };
      })(E());
      function r2(e5) {
        return new n2.default(e5);
      }
      (function(e5) {
        e5.HttpsProxyAgent = n2.default, e5.prototype = n2.default.prototype;
      })(r2 ||= {}), t3.exports = r2;
    }))(), 1);
    O = `degit.json`;
    k = class extends Error {
      code;
      constructor(e4, t3 = {}) {
        super(e4), Object.assign(this, t3);
      }
    };
    V = B();
  }
});

// ../../node_modules/degit/dist/client-8slZtdoy.js
var client_8slZtdoy_exports = {};
__export(client_8slZtdoy_exports, {
  defaultGitClient: () => Kt
});
import i2 from "node:fs";
import a2 from "node:path";
import { execFile as o2, spawn as s2 } from "node:child_process";
import { promisify as c2 } from "node:util";
function vt(e4) {
  let t3 = [e4];
  return { next() {
    return Promise.resolve({ done: t3.length === 0, value: t3.pop() });
  }, return() {
    return t3 = [], {};
  }, [Symbol.asyncIterator]() {
    return this;
  } };
}
function yt(e4) {
  return e4[Symbol.asyncIterator] ? e4[Symbol.asyncIterator]() : e4[Symbol.iterator] ? e4[Symbol.iterator]() : e4.next ? e4 : vt(e4);
}
async function bt(e4, t3) {
  let n2 = yt(e4);
  for (; ; ) {
    let { value: e5, done: r2 } = await n2.next();
    if (e5 && await t3(e5), r2) break;
  }
  n2.return && n2.return();
}
function xt(e4) {
  let { PassThrough: t3 } = ht(), n2 = new t3();
  return setTimeout(async () => {
    await bt(e4, (e5) => n2.write(e5)), n2.end();
  }, 1), n2;
}
async function St(e4) {
  let t3 = 0, n2 = [];
  await bt(e4, (e5) => {
    n2.push(e5), t3 += e5.byteLength;
  });
  let r2 = new Uint8Array(t3), i3 = 0;
  for (let e5 of n2) r2.set(e5, i3), i3 += e5.byteLength;
  return r2;
}
function Ct(e4) {
  let t3 = Object.getOwnPropertyDescriptor(e4, Symbol.asyncIterator);
  if (t3 && t3.enumerable) return e4;
  let n2 = false, r2 = [], i3 = {};
  return e4.on(`data`, (e5) => {
    r2.push(e5), i3.resolve && (i3.resolve({ value: r2.shift(), done: false }), i3 = {});
  }), e4.on(`error`, (e5) => {
    i3.reject && (i3.reject(e5), i3 = {});
  }), e4.on(`end`, () => {
    n2 = true, i3.resolve && (i3.resolve({ done: true }), i3 = {});
  }), { next() {
    return new Promise((e5, t4) => {
      if (r2.length === 0 && n2) return e5({ done: true });
      if (r2.length > 0) return e5({ value: r2.shift(), done: false });
      r2.length === 0 && !n2 && (i3 = { resolve: e5, reject: t4 });
    });
  }, return() {
    e4.removeAllListeners(), e4.destroy && e4.destroy();
  }, [Symbol.asyncIterator]() {
    return this;
  } };
}
async function wt({ onProgress: e4, url: t3, method: n2 = `GET`, headers: r2 = {}, agent: i3, body: a3 }) {
  return a3 && Array.isArray(a3) ? a3 = Buffer.from(await St(a3)) : a3 &&= xt(a3), new Promise((e5, o3) => {
    (0, _t.default)({ url: t3, method: n2, headers: r2, agent: i3, body: a3 }, (t4, n3) => {
      if (t4) return o3(t4);
      try {
        let t5 = Ct(n3);
        e5({ url: n3.url, method: n3.method, statusCode: n3.statusCode, statusMessage: n3.statusMessage, body: t5, headers: n3.headers });
      } catch (e6) {
        o3(e6);
      }
    });
  });
}
function Et(e4, t3 = e4.transport) {
  return t3 === `ssh` ? e4.ssh : e4.url;
}
function Dt(e4) {
  return /^[0-9a-f]{7,40}$/iu.test(e4);
}
function Ot(e4) {
  return e4.startsWith(`refs/heads/`) ? e4.slice(11) : e4.startsWith(`refs/tags/`) ? e4.slice(10) : e4;
}
function kt(e4) {
  if (!e4 || typeof e4 != `object`) return false;
  let t3 = `${e4.code || ``} ${e4.message || ``}`.toLowerCase();
  return t3.includes(`ssh`) && (t3.includes(`agent`) || t3.includes(`key`) || t3.includes(`identity`) || t3.includes(`publickey`) || t3.includes(`authentication`));
}
function At(e4) {
  return !e4 || typeof e4 != `object` ? false : e4.code === `ENOENT`;
}
function jt(e4, t3) {
  return new k(`SSH authentication failed for ${e4.url}. Start ssh-agent and add a key, or use the HTTPS source instead.`, { code: `SSH_NO_KEY`, original: t3, url: e4.url });
}
function Mt(e4, t3) {
  return new k(`git is not installed. Install git to clone ${e4.url}.`, { code: `GIT_NOT_FOUND`, original: t3, url: e4.url });
}
function Nt(e4, t3) {
  if (e4 === `HEAD`) return { hash: t3, type: `HEAD` };
  let n2 = /refs\/([^/]+)\/(.+)/u.exec(e4);
  if (!n2) throw new k(`could not parse ${e4}`, { code: `BAD_REF` });
  return { hash: t3, name: n2[2], type: n2[1] === `heads` ? `branch` : n2[1] === `refs` ? `ref` : n2[1] };
}
function Pt(e4) {
  let t3 = String(e4.ref || e4.name || ``), n2 = String(e4.oid || e4.hash || ``);
  if (!(!t3 || !n2)) return Nt(t3, n2);
}
function Ft(e4) {
  let t3 = /* @__PURE__ */ new Set();
  return e4.filter((e5) => {
    let n2 = e5.type === `HEAD` ? `HEAD` : e5.name ? `${e5.type}:${e5.name}` : e5.hash;
    return t3.has(n2) ? false : (t3.add(n2), true);
  });
}
function It(e4) {
  let t3 = /* @__PURE__ */ new Map(), n2 = /* @__PURE__ */ new Map();
  for (let r2 of e4.split(/\r?\n/u)) {
    let e5 = r2.trim();
    if (!e5) continue;
    let i3 = /^ref:\s+(.+)\t(.+)$/u.exec(e5);
    if (i3) {
      n2.set(i3[2], i3[1]);
      continue;
    }
    let a3 = e5.indexOf(`	`);
    if (a3 === -1) continue;
    let o3 = e5.slice(0, a3), s3 = e5.slice(a3 + 1);
    t3.set(s3, Nt(s3, o3));
  }
  for (let [e5, r2] of n2) {
    if (e5 !== `HEAD`) continue;
    let n3 = t3.get(r2);
    n3 && t3.set(`HEAD`, { hash: n3.hash, type: `HEAD` });
  }
  return Ft([...t3.values()]);
}
function Lt(e4) {
  return Ft(e4.flatMap((e5) => {
    let t3 = Pt(e5);
    return t3 ? [t3] : [];
  }));
}
function Rt(e4) {
  let t3 = Ot(e4);
  return t3 === `HEAD` ? {} : Dt(t3) ? { checkoutRef: t3 } : t3.startsWith(`refs/heads/`) ? { cloneRef: t3.slice(11), singleBranch: true } : t3.startsWith(`refs/tags/`) ? { cloneRef: t3.slice(10), singleBranch: true } : t3.startsWith(`refs/`) ? { checkoutRef: t3 } : { cloneRef: t3, checkoutRef: t3, singleBranch: true };
}
function Vt(e4) {
  return new Promise((t3, n2) => {
    let r2 = s2(`git`, [`ls-remote`, `--symref`, Et(e4)], { stdio: [`ignore`, `pipe`, `pipe`] }), i3 = r2.stdout, a3 = r2.stderr;
    if (!i3 || !a3) {
      n2(Error(`could not start git ls-remote`));
      return;
    }
    let o3 = ``, c3 = ``;
    i3.setEncoding(`utf8`), a3.setEncoding(`utf8`), i3.on(`data`, (e5) => {
      o3 += e5;
    }), a3.on(`data`, (e5) => {
      c3 += e5;
    }), r2.once(`error`, n2), r2.once(`close`, (e5) => {
      if (e5 !== 0) {
        let t4 = Error(c3.trim() || `git ls-remote exited with code ${e5}`);
        t4.code = e5 ?? `GIT_LS_REMOTE_FAILED`, n2(t4);
        return;
      }
      t3(It(o3));
    });
  });
}
async function Ht(e4) {
  let t3 = Et(e4);
  try {
    let e5 = Lt(await gt.listServerRefs({ http: Bt, peelTags: true, symrefs: true, url: t3 }));
    if (e5.length > 0) return e5;
  } catch {
  }
  try {
    let e5 = Lt((await gt.getRemoteInfo2({ http: Bt, protocolVersion: 1, url: t3 })).refs || []);
    if (e5.length > 0) return e5;
  } catch {
  }
  return Vt(e4);
}
async function Ut(e4, t3, n2, r2 = e4.transport) {
  let o3 = Rt(n2 || e4.ref), s3 = [`clone`, `--depth`, `1`];
  o3.cloneRef && (s3.push(`--branch`, o3.cloneRef), o3.singleBranch && s3.push(`--single-branch`)), s3.push(Et(e4, r2), t3), await zt(`git`, s3), o3.checkoutRef && await zt(`git`, [`-C`, t3, `checkout`, `--force`, o3.checkoutRef]), i2.rmSync(a2.join(t3, `.git`), { force: true, recursive: true });
}
async function Wt(e4, t3, n2, r2 = e4.transport) {
  let o3 = Et(e4, r2), s3 = Rt(n2 || e4.ref), c3 = s3.cloneRef && !Dt(s3.cloneRef) ? s3.cloneRef : void 0, l3 = s3.checkoutRef || (c3 ? void 0 : Ot(n2 || e4.ref));
  try {
    await gt.clone({ fs: i2, http: Bt, dir: t3, depth: 1, ref: c3, singleBranch: !!c3, url: o3 });
  } catch (i3) {
    if (r2 !== `https`) throw i3;
    await Ut(e4, t3, n2, r2);
    return;
  }
  l3 && l3 !== `HEAD` && await gt.checkout({ force: true, fs: i2, dir: t3, ref: l3 }), i2.rmSync(a2.join(t3, `.git`), { force: true, recursive: true });
}
function Gt(e4, t3, n2, i3) {
  throw n2 === `ssh` && At(t3) ? Mt(e4, t3) : n2 === `ssh` && kt(t3) ? jt(e4, t3) : new k(`could not ${i3} ${e4.url}`, { code: `COULD_NOT_FETCH`, original: t3, url: e4.url });
}
var l2, u2, d2, f2, p2, m2, h2, g2, _2, v2, y2, b2, x2, S2, C2, w2, T2, E2, D2, O2, k2, A2, j2, M2, N2, P2, F2, ee, I2, L2, R2, te, ne, z2, B2, V2, H, re, ie, ae, U, W, oe, se, G, K, ce, le, q, ue, J, Y, X, Z, de, Q, fe, pe, $, me, he, ge, _e, ve, ye, be, xe, Se, Ce, we, Te, Ee, De, Oe, ke, Ae, je, Me, Ne, Pe, Fe, Ie, Le, Re, ze, Be, Ve, He, Ue, We, Ge, Ke, qe, Je, Ye, Xe, Ze, Qe, $e, et, tt, nt, rt, it, at, ot, st, ct, lt, ut, dt, ft, pt, mt, ht, gt, _t, Tt, zt, Bt, Kt;
var init_client_8slZtdoy = __esm({
  "../../node_modules/degit/dist/client-8slZtdoy.js"() {
    init_utils_DTdqQ6KU();
    l2 = f(((e4, t3) => {
      var n2 = function(e5) {
        if (e5 ||= {}, this.Promise = e5.Promise || Promise, this.queues = /* @__PURE__ */ Object.create(null), this.domainReentrant = e5.domainReentrant || false, this.domainReentrant) {
          if (typeof process > `u` || process.domain === void 0) throw Error("Domain-reentrant locks require `process.domain` to exist. Please flip `opts.domainReentrant = false`, use a NodeJS version that still implements Domain, or install a browser polyfill.");
          this.domains = /* @__PURE__ */ Object.create(null);
        }
        this.timeout = e5.timeout || n2.DEFAULT_TIMEOUT, this.maxOccupationTime = e5.maxOccupationTime || n2.DEFAULT_MAX_OCCUPATION_TIME, this.maxExecutionTime = e5.maxExecutionTime || n2.DEFAULT_MAX_EXECUTION_TIME, e5.maxPending === 1 / 0 || Number.isInteger(e5.maxPending) && e5.maxPending >= 0 ? this.maxPending = e5.maxPending : this.maxPending = n2.DEFAULT_MAX_PENDING;
      };
      n2.DEFAULT_TIMEOUT = 0, n2.DEFAULT_MAX_OCCUPATION_TIME = 0, n2.DEFAULT_MAX_EXECUTION_TIME = 0, n2.DEFAULT_MAX_PENDING = 1e3, n2.prototype.acquire = function(e5, t4, n3, r2) {
        if (Array.isArray(e5)) return this._acquireBatch(e5, t4, n3, r2);
        if (typeof t4 != `function`) throw Error(`You must pass a function to execute`);
        var i3 = null, a3 = null, o3 = null;
        typeof n3 != `function` && (r2 = n3, n3 = null, o3 = new this.Promise(function(e6, t5) {
          i3 = e6, a3 = t5;
        })), r2 ||= {};
        var s3 = false, c3 = null, l3 = null, u3 = null, d3 = this, f3 = function(t5, r3, c4) {
          l3 &&= (clearTimeout(l3), null), u3 &&= (clearTimeout(u3), null), t5 && (d3.queues[e5] && d3.queues[e5].length === 0 && delete d3.queues[e5], d3.domainReentrant && delete d3.domains[e5]), s3 ||= (o3 ? r3 ? a3(r3) : i3(c4) : typeof n3 == `function` && n3(r3, c4), true), t5 && d3.queues[e5] && d3.queues[e5].length > 0 && d3.queues[e5].shift()();
        }, p3 = function(n4) {
          if (s3) return f3(n4);
          c3 &&= (clearTimeout(c3), null), d3.domainReentrant && n4 && (d3.domains[e5] = process.domain);
          var i4 = r2.maxExecutionTime || d3.maxExecutionTime;
          if (i4 && (u3 = setTimeout(function() {
            d3.queues[e5] && f3(n4, Error(`Maximum execution time is exceeded ` + e5));
          }, i4)), t4.length === 1) {
            var a4 = false;
            try {
              t4(function(e6, t5) {
                a4 || (a4 = true, f3(n4, e6, t5));
              });
            } catch (e6) {
              a4 || (a4 = true, f3(n4, e6));
            }
          } else d3._promiseTry(function() {
            return t4();
          }).then(function(e6) {
            f3(n4, void 0, e6);
          }, function(e6) {
            f3(n4, e6);
          });
        };
        d3.domainReentrant && process.domain && (p3 = process.domain.bind(p3));
        var m4 = r2.maxPending || d3.maxPending;
        if (!d3.queues[e5]) d3.queues[e5] = [], p3(true);
        else if (d3.domainReentrant && process.domain && process.domain === d3.domains[e5]) p3(false);
        else if (d3.queues[e5].length >= m4) f3(false, Error(`Too many pending tasks in queue ` + e5));
        else {
          var h4 = function() {
            p3(true);
          };
          r2.skipQueue ? d3.queues[e5].unshift(h4) : d3.queues[e5].push(h4);
          var g4 = r2.timeout || d3.timeout;
          g4 && (c3 = setTimeout(function() {
            c3 = null, f3(false, Error(`async-lock timed out in queue ` + e5));
          }, g4));
        }
        var _4 = r2.maxOccupationTime || d3.maxOccupationTime;
        if (_4 && (l3 = setTimeout(function() {
          d3.queues[e5] && f3(false, Error(`Maximum occupation time is exceeded in queue ` + e5));
        }, _4)), o3) return o3;
      }, n2.prototype._acquireBatch = function(e5, t4, n3, r2) {
        typeof n3 != `function` && (r2 = n3, n3 = null);
        var i3 = this, a3 = function(e6, t5) {
          return function(n4) {
            i3.acquire(e6, t5, n4, r2);
          };
        }, o3 = e5.reduceRight(function(e6, t5) {
          return a3(t5, e6);
        }, t4);
        if (typeof n3 == `function`) o3(n3);
        else return new this.Promise(function(e6, t5) {
          o3.length === 1 ? o3(function(n4, r3) {
            n4 ? t5(n4) : e6(r3);
          }) : e6(o3());
        });
      }, n2.prototype.isBusy = function(e5) {
        return e5 ? !!this.queues[e5] : Object.keys(this.queues).length > 0;
      }, n2.prototype._promiseTry = function(e5) {
        try {
          return this.Promise.resolve(e5());
        } catch (e6) {
          return this.Promise.reject(e6);
        }
      }, t3.exports = n2;
    }));
    u2 = f(((e4, t3) => {
      t3.exports = l2();
    }));
    d2 = f(((e4, t3) => {
      typeof Object.create == `function` ? t3.exports = function(e5, t4) {
        t4 && (e5.super_ = t4, e5.prototype = Object.create(t4.prototype, { constructor: { value: e5, enumerable: false, writable: true, configurable: true } }));
      } : t3.exports = function(e5, t4) {
        if (t4) {
          e5.super_ = t4;
          var n2 = function() {
          };
          n2.prototype = t4.prototype, e5.prototype = new n2(), e5.prototype.constructor = e5;
        }
      };
    }));
    f2 = f(((e4, t3) => {
      try {
        var r2 = h(`util`);
        if (typeof r2.inherits != `function`) throw ``;
        t3.exports = r2.inherits;
      } catch {
        t3.exports = d2();
      }
    }));
    p2 = f(((e4, t3) => {
      var r2 = h(`buffer`), i3 = r2.Buffer;
      function a3(e5, t4) {
        for (var n2 in e5) t4[n2] = e5[n2];
      }
      i3.from && i3.alloc && i3.allocUnsafe && i3.allocUnsafeSlow ? t3.exports = r2 : (a3(r2, e4), e4.Buffer = o3);
      function o3(e5, t4, n2) {
        return i3(e5, t4, n2);
      }
      o3.prototype = Object.create(i3.prototype), a3(i3, o3), o3.from = function(e5, t4, n2) {
        if (typeof e5 == `number`) throw TypeError(`Argument must not be a number`);
        return i3(e5, t4, n2);
      }, o3.alloc = function(e5, t4, n2) {
        if (typeof e5 != `number`) throw TypeError(`Argument must be a number`);
        var r3 = i3(e5);
        return t4 === void 0 ? r3.fill(0) : typeof n2 == `string` ? r3.fill(t4, n2) : r3.fill(t4), r3;
      }, o3.allocUnsafe = function(e5) {
        if (typeof e5 != `number`) throw TypeError(`Argument must be a number`);
        return i3(e5);
      }, o3.allocUnsafeSlow = function(e5) {
        if (typeof e5 != `number`) throw TypeError(`Argument must be a number`);
        return r2.SlowBuffer(e5);
      };
    }));
    m2 = f(((e4, t3) => {
      var n2 = {}.toString;
      t3.exports = Array.isArray || function(e5) {
        return n2.call(e5) == `[object Array]`;
      };
    }));
    h2 = f(((e4, t3) => {
      t3.exports = TypeError;
    }));
    g2 = f(((e4, t3) => {
      t3.exports = Object;
    }));
    _2 = f(((e4, t3) => {
      t3.exports = Error;
    }));
    v2 = f(((e4, t3) => {
      t3.exports = EvalError;
    }));
    y2 = f(((e4, t3) => {
      t3.exports = RangeError;
    }));
    b2 = f(((e4, t3) => {
      t3.exports = ReferenceError;
    }));
    x2 = f(((e4, t3) => {
      t3.exports = SyntaxError;
    }));
    S2 = f(((e4, t3) => {
      t3.exports = URIError;
    }));
    C2 = f(((e4, t3) => {
      t3.exports = Math.abs;
    }));
    w2 = f(((e4, t3) => {
      t3.exports = Math.floor;
    }));
    T2 = f(((e4, t3) => {
      t3.exports = Math.max;
    }));
    E2 = f(((e4, t3) => {
      t3.exports = Math.min;
    }));
    D2 = f(((e4, t3) => {
      t3.exports = Math.pow;
    }));
    O2 = f(((e4, t3) => {
      t3.exports = Math.round;
    }));
    k2 = f(((e4, t3) => {
      t3.exports = Number.isNaN || function(e5) {
        return e5 !== e5;
      };
    }));
    A2 = f(((e4, t3) => {
      var n2 = k2();
      t3.exports = function(e5) {
        return n2(e5) || e5 === 0 ? e5 : e5 < 0 ? -1 : 1;
      };
    }));
    j2 = f(((e4, t3) => {
      t3.exports = Object.getOwnPropertyDescriptor;
    }));
    M2 = f(((e4, t3) => {
      var n2 = j2();
      if (n2) try {
        n2([], `length`);
      } catch {
        n2 = null;
      }
      t3.exports = n2;
    }));
    N2 = f(((e4, t3) => {
      var n2 = Object.defineProperty || false;
      if (n2) try {
        n2({}, `a`, { value: 1 });
      } catch {
        n2 = false;
      }
      t3.exports = n2;
    }));
    P2 = f(((e4, t3) => {
      t3.exports = function() {
        if (typeof Symbol != `function` || typeof Object.getOwnPropertySymbols != `function`) return false;
        if (typeof Symbol.iterator == `symbol`) return true;
        var e5 = {}, t4 = /* @__PURE__ */ Symbol(`test`), n2 = Object(t4);
        if (typeof t4 == `string` || Object.prototype.toString.call(t4) !== `[object Symbol]` || Object.prototype.toString.call(n2) !== `[object Symbol]`) return false;
        var r2 = 42;
        for (var i3 in e5[t4] = r2, e5) return false;
        if (typeof Object.keys == `function` && Object.keys(e5).length !== 0 || typeof Object.getOwnPropertyNames == `function` && Object.getOwnPropertyNames(e5).length !== 0) return false;
        var a3 = Object.getOwnPropertySymbols(e5);
        if (a3.length !== 1 || a3[0] !== t4 || !Object.prototype.propertyIsEnumerable.call(e5, t4)) return false;
        if (typeof Object.getOwnPropertyDescriptor == `function`) {
          var o3 = Object.getOwnPropertyDescriptor(e5, t4);
          if (o3.value !== r2 || o3.enumerable !== true) return false;
        }
        return true;
      };
    }));
    F2 = f(((e4, t3) => {
      var n2 = typeof Symbol < `u` && Symbol, r2 = P2();
      t3.exports = function() {
        return typeof n2 != `function` || typeof Symbol != `function` || typeof n2(`foo`) != `symbol` || typeof /* @__PURE__ */ Symbol(`bar`) != `symbol` ? false : r2();
      };
    }));
    ee = f(((e4, t3) => {
      t3.exports = typeof Reflect < `u` && Reflect.getPrototypeOf || null;
    }));
    I2 = f(((e4, t3) => {
      t3.exports = g2().getPrototypeOf || null;
    }));
    L2 = f(((e4, t3) => {
      var n2 = `Function.prototype.bind called on incompatible `, r2 = Object.prototype.toString, i3 = Math.max, a3 = `[object Function]`, o3 = function(e5, t4) {
        for (var n3 = [], r3 = 0; r3 < e5.length; r3 += 1) n3[r3] = e5[r3];
        for (var i4 = 0; i4 < t4.length; i4 += 1) n3[i4 + e5.length] = t4[i4];
        return n3;
      }, s3 = function(e5, t4) {
        for (var n3 = [], r3 = t4 || 0, i4 = 0; r3 < e5.length; r3 += 1, i4 += 1) n3[i4] = e5[r3];
        return n3;
      }, c3 = function(e5, t4) {
        for (var n3 = ``, r3 = 0; r3 < e5.length; r3 += 1) n3 += e5[r3], r3 + 1 < e5.length && (n3 += t4);
        return n3;
      };
      t3.exports = function(e5) {
        var t4 = this;
        if (typeof t4 != `function` || r2.apply(t4) !== a3) throw TypeError(n2 + t4);
        for (var l3 = s3(arguments, 1), u3, d3 = function() {
          if (this instanceof u3) {
            var n3 = t4.apply(this, o3(l3, arguments));
            return Object(n3) === n3 ? n3 : this;
          }
          return t4.apply(e5, o3(l3, arguments));
        }, f3 = i3(0, t4.length - l3.length), p3 = [], m4 = 0; m4 < f3; m4++) p3[m4] = `$` + m4;
        if (u3 = Function(`binder`, `return function (` + c3(p3, `,`) + `){ return binder.apply(this,arguments); }`)(d3), t4.prototype) {
          var h4 = function() {
          };
          h4.prototype = t4.prototype, u3.prototype = new h4(), h4.prototype = null;
        }
        return u3;
      };
    }));
    R2 = f(((e4, t3) => {
      var n2 = L2();
      t3.exports = Function.prototype.bind || n2;
    }));
    te = f(((e4, t3) => {
      t3.exports = Function.prototype.call;
    }));
    ne = f(((e4, t3) => {
      t3.exports = Function.prototype.apply;
    }));
    z2 = f(((e4, t3) => {
      t3.exports = typeof Reflect < `u` && Reflect && Reflect.apply;
    }));
    B2 = f(((e4, t3) => {
      var n2 = R2(), r2 = ne(), i3 = te();
      t3.exports = z2() || n2.call(i3, r2);
    }));
    V2 = f(((e4, t3) => {
      var n2 = R2(), r2 = h2(), i3 = te(), a3 = B2();
      t3.exports = function(e5) {
        if (e5.length < 1 || typeof e5[0] != `function`) throw new r2(`a function is required`);
        return a3(n2, i3, e5);
      };
    }));
    H = f(((e4, t3) => {
      var n2 = V2(), r2 = M2(), i3;
      try {
        i3 = [].__proto__ === Array.prototype;
      } catch (e5) {
        if (!e5 || typeof e5 != `object` || !(`code` in e5) || e5.code !== `ERR_PROTO_ACCESS`) throw e5;
      }
      var a3 = !!i3 && r2 && r2(Object.prototype, `__proto__`), o3 = Object, s3 = o3.getPrototypeOf;
      t3.exports = a3 && typeof a3.get == `function` ? n2([a3.get]) : typeof s3 == `function` ? function(e5) {
        return s3(e5 == null ? e5 : o3(e5));
      } : false;
    }));
    re = f(((e4, t3) => {
      var n2 = ee(), r2 = I2(), i3 = H();
      t3.exports = n2 ? function(e5) {
        return n2(e5);
      } : r2 ? function(e5) {
        if (!e5 || typeof e5 != `object` && typeof e5 != `function`) throw TypeError(`getProto: not an object`);
        return r2(e5);
      } : i3 ? function(e5) {
        return i3(e5);
      } : null;
    }));
    ie = f(((e4, t3) => {
      var n2 = Function.prototype.call, r2 = Object.prototype.hasOwnProperty;
      t3.exports = R2().call(n2, r2);
    }));
    ae = f(((e4, t3) => {
      var n2, r2 = g2(), i3 = _2(), a3 = v2(), o3 = y2(), s3 = b2(), c3 = x2(), l3 = h2(), u3 = S2(), d3 = C2(), f3 = w2(), p3 = T2(), m4 = E2(), k4 = D2(), j4 = O2(), P4 = A2(), L4 = Function, z4 = function(e5) {
        try {
          return L4(`"use strict"; return (` + e5 + `).constructor;`)();
        } catch {
        }
      }, B4 = M2(), V4 = N2(), H3 = function() {
        throw new l3();
      }, ae3 = B4 ? (function() {
        try {
          return arguments.callee, H3;
        } catch {
          try {
            return B4(arguments, `callee`).get;
          } catch {
            return H3;
          }
        }
      })() : H3, U3 = F2()(), W3 = re(), oe3 = I2(), se3 = ee(), G3 = ne(), K3 = te(), ce3 = {}, le3 = typeof Uint8Array > `u` || !W3 ? n2 : W3(Uint8Array), q3 = { __proto__: null, "%AggregateError%": typeof AggregateError > `u` ? n2 : AggregateError, "%Array%": Array, "%ArrayBuffer%": typeof ArrayBuffer > `u` ? n2 : ArrayBuffer, "%ArrayIteratorPrototype%": U3 && W3 ? W3([][Symbol.iterator]()) : n2, "%AsyncFromSyncIteratorPrototype%": n2, "%AsyncFunction%": ce3, "%AsyncGenerator%": ce3, "%AsyncGeneratorFunction%": ce3, "%AsyncIteratorPrototype%": ce3, "%Atomics%": typeof Atomics > `u` ? n2 : Atomics, "%BigInt%": typeof BigInt > `u` ? n2 : BigInt, "%BigInt64Array%": typeof BigInt64Array > `u` ? n2 : BigInt64Array, "%BigUint64Array%": typeof BigUint64Array > `u` ? n2 : BigUint64Array, "%Boolean%": Boolean, "%DataView%": typeof DataView > `u` ? n2 : DataView, "%Date%": Date, "%decodeURI%": decodeURI, "%decodeURIComponent%": decodeURIComponent, "%encodeURI%": encodeURI, "%encodeURIComponent%": encodeURIComponent, "%Error%": i3, "%eval%": eval, "%EvalError%": a3, "%Float16Array%": typeof Float16Array > `u` ? n2 : Float16Array, "%Float32Array%": typeof Float32Array > `u` ? n2 : Float32Array, "%Float64Array%": typeof Float64Array > `u` ? n2 : Float64Array, "%FinalizationRegistry%": typeof FinalizationRegistry > `u` ? n2 : FinalizationRegistry, "%Function%": L4, "%GeneratorFunction%": ce3, "%Int8Array%": typeof Int8Array > `u` ? n2 : Int8Array, "%Int16Array%": typeof Int16Array > `u` ? n2 : Int16Array, "%Int32Array%": typeof Int32Array > `u` ? n2 : Int32Array, "%isFinite%": isFinite, "%isNaN%": isNaN, "%IteratorPrototype%": U3 && W3 ? W3(W3([][Symbol.iterator]())) : n2, "%JSON%": typeof JSON == `object` ? JSON : n2, "%Map%": typeof Map > `u` ? n2 : Map, "%MapIteratorPrototype%": typeof Map > `u` || !U3 || !W3 ? n2 : W3((/* @__PURE__ */ new Map())[Symbol.iterator]()), "%Math%": Math, "%Number%": Number, "%Object%": r2, "%Object.getOwnPropertyDescriptor%": B4, "%parseFloat%": parseFloat, "%parseInt%": parseInt, "%Promise%": typeof Promise > `u` ? n2 : Promise, "%Proxy%": typeof Proxy > `u` ? n2 : Proxy, "%RangeError%": o3, "%ReferenceError%": s3, "%Reflect%": typeof Reflect > `u` ? n2 : Reflect, "%RegExp%": RegExp, "%Set%": typeof Set > `u` ? n2 : Set, "%SetIteratorPrototype%": typeof Set > `u` || !U3 || !W3 ? n2 : W3((/* @__PURE__ */ new Set())[Symbol.iterator]()), "%SharedArrayBuffer%": typeof SharedArrayBuffer > `u` ? n2 : SharedArrayBuffer, "%String%": String, "%StringIteratorPrototype%": U3 && W3 ? W3(``[Symbol.iterator]()) : n2, "%Symbol%": U3 ? Symbol : n2, "%SyntaxError%": c3, "%ThrowTypeError%": ae3, "%TypedArray%": le3, "%TypeError%": l3, "%Uint8Array%": typeof Uint8Array > `u` ? n2 : Uint8Array, "%Uint8ClampedArray%": typeof Uint8ClampedArray > `u` ? n2 : Uint8ClampedArray, "%Uint16Array%": typeof Uint16Array > `u` ? n2 : Uint16Array, "%Uint32Array%": typeof Uint32Array > `u` ? n2 : Uint32Array, "%URIError%": u3, "%WeakMap%": typeof WeakMap > `u` ? n2 : WeakMap, "%WeakRef%": typeof WeakRef > `u` ? n2 : WeakRef, "%WeakSet%": typeof WeakSet > `u` ? n2 : WeakSet, "%Function.prototype.call%": K3, "%Function.prototype.apply%": G3, "%Object.defineProperty%": V4, "%Object.getPrototypeOf%": oe3, "%Math.abs%": d3, "%Math.floor%": f3, "%Math.max%": p3, "%Math.min%": m4, "%Math.pow%": k4, "%Math.round%": j4, "%Math.sign%": P4, "%Reflect.getPrototypeOf%": se3 };
      if (W3) try {
        null.error;
      } catch (e5) {
        q3[`%Error.prototype%`] = W3(W3(e5));
      }
      var ue3 = function e5(t4) {
        var n3;
        if (t4 === `%AsyncFunction%`) n3 = z4(`async function () {}`);
        else if (t4 === `%GeneratorFunction%`) n3 = z4(`function* () {}`);
        else if (t4 === `%AsyncGeneratorFunction%`) n3 = z4(`async function* () {}`);
        else if (t4 === `%AsyncGenerator%`) {
          var r3 = e5(`%AsyncGeneratorFunction%`);
          r3 && (n3 = r3.prototype);
        } else if (t4 === `%AsyncIteratorPrototype%`) {
          var i4 = e5(`%AsyncGenerator%`);
          i4 && W3 && (n3 = W3(i4.prototype));
        }
        return q3[t4] = n3, n3;
      }, J3 = { __proto__: null, "%ArrayBufferPrototype%": [`ArrayBuffer`, `prototype`], "%ArrayPrototype%": [`Array`, `prototype`], "%ArrayProto_entries%": [`Array`, `prototype`, `entries`], "%ArrayProto_forEach%": [`Array`, `prototype`, `forEach`], "%ArrayProto_keys%": [`Array`, `prototype`, `keys`], "%ArrayProto_values%": [`Array`, `prototype`, `values`], "%AsyncFunctionPrototype%": [`AsyncFunction`, `prototype`], "%AsyncGenerator%": [`AsyncGeneratorFunction`, `prototype`], "%AsyncGeneratorPrototype%": [`AsyncGeneratorFunction`, `prototype`, `prototype`], "%BooleanPrototype%": [`Boolean`, `prototype`], "%DataViewPrototype%": [`DataView`, `prototype`], "%DatePrototype%": [`Date`, `prototype`], "%ErrorPrototype%": [`Error`, `prototype`], "%EvalErrorPrototype%": [`EvalError`, `prototype`], "%Float32ArrayPrototype%": [`Float32Array`, `prototype`], "%Float64ArrayPrototype%": [`Float64Array`, `prototype`], "%FunctionPrototype%": [`Function`, `prototype`], "%Generator%": [`GeneratorFunction`, `prototype`], "%GeneratorPrototype%": [`GeneratorFunction`, `prototype`, `prototype`], "%Int8ArrayPrototype%": [`Int8Array`, `prototype`], "%Int16ArrayPrototype%": [`Int16Array`, `prototype`], "%Int32ArrayPrototype%": [`Int32Array`, `prototype`], "%JSONParse%": [`JSON`, `parse`], "%JSONStringify%": [`JSON`, `stringify`], "%MapPrototype%": [`Map`, `prototype`], "%NumberPrototype%": [`Number`, `prototype`], "%ObjectPrototype%": [`Object`, `prototype`], "%ObjProto_toString%": [`Object`, `prototype`, `toString`], "%ObjProto_valueOf%": [`Object`, `prototype`, `valueOf`], "%PromisePrototype%": [`Promise`, `prototype`], "%PromiseProto_then%": [`Promise`, `prototype`, `then`], "%Promise_all%": [`Promise`, `all`], "%Promise_reject%": [`Promise`, `reject`], "%Promise_resolve%": [`Promise`, `resolve`], "%RangeErrorPrototype%": [`RangeError`, `prototype`], "%ReferenceErrorPrototype%": [`ReferenceError`, `prototype`], "%RegExpPrototype%": [`RegExp`, `prototype`], "%SetPrototype%": [`Set`, `prototype`], "%SharedArrayBufferPrototype%": [`SharedArrayBuffer`, `prototype`], "%StringPrototype%": [`String`, `prototype`], "%SymbolPrototype%": [`Symbol`, `prototype`], "%SyntaxErrorPrototype%": [`SyntaxError`, `prototype`], "%TypedArrayPrototype%": [`TypedArray`, `prototype`], "%TypeErrorPrototype%": [`TypeError`, `prototype`], "%Uint8ArrayPrototype%": [`Uint8Array`, `prototype`], "%Uint8ClampedArrayPrototype%": [`Uint8ClampedArray`, `prototype`], "%Uint16ArrayPrototype%": [`Uint16Array`, `prototype`], "%Uint32ArrayPrototype%": [`Uint32Array`, `prototype`], "%URIErrorPrototype%": [`URIError`, `prototype`], "%WeakMapPrototype%": [`WeakMap`, `prototype`], "%WeakSetPrototype%": [`WeakSet`, `prototype`] }, Y3 = R2(), X3 = ie(), Z3 = Y3.call(K3, Array.prototype.concat), de3 = Y3.call(G3, Array.prototype.splice), Q3 = Y3.call(K3, String.prototype.replace), fe3 = Y3.call(K3, String.prototype.slice), pe3 = Y3.call(K3, RegExp.prototype.exec), $3 = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, me3 = /\\(\\)?/g, he3 = function(e5) {
        var t4 = fe3(e5, 0, 1), n3 = fe3(e5, -1);
        if (t4 === `%` && n3 !== `%`) throw new c3("invalid intrinsic syntax, expected closing `%`");
        if (n3 === `%` && t4 !== `%`) throw new c3("invalid intrinsic syntax, expected opening `%`");
        var r3 = [];
        return Q3(e5, $3, function(e6, t5, n4, i4) {
          r3[r3.length] = n4 ? Q3(i4, me3, `$1`) : t5 || e6;
        }), r3;
      }, ge3 = function(e5, t4) {
        var n3 = e5, r3;
        if (X3(J3, n3) && (r3 = J3[n3], n3 = `%` + r3[0] + `%`), X3(q3, n3)) {
          var i4 = q3[n3];
          if (i4 === ce3 && (i4 = ue3(n3)), i4 === void 0 && !t4) throw new l3(`intrinsic ` + e5 + ` exists, but is not available. Please file an issue!`);
          return { alias: r3, name: n3, value: i4 };
        }
        throw new c3(`intrinsic ` + e5 + ` does not exist!`);
      };
      t3.exports = function(e5, t4) {
        if (typeof e5 != `string` || e5.length === 0) throw new l3(`intrinsic name must be a non-empty string`);
        if (arguments.length > 1 && typeof t4 != `boolean`) throw new l3(`"allowMissing" argument must be a boolean`);
        if (pe3(/^%?[^%]*%?$/, e5) === null) throw new c3("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
        var n3 = he3(e5), r3 = n3.length > 0 ? n3[0] : ``, i4 = ge3(`%` + r3 + `%`, t4), a4 = i4.name, o4 = i4.value, s4 = false, u4 = i4.alias;
        u4 && (r3 = u4[0], de3(n3, Z3([0, 1], u4)));
        for (var d4 = 1, f4 = true; d4 < n3.length; d4 += 1) {
          var p4 = n3[d4], m5 = fe3(p4, 0, 1), h4 = fe3(p4, -1);
          if ((m5 === `"` || m5 === `'` || m5 === "`" || h4 === `"` || h4 === `'` || h4 === "`") && m5 !== h4) throw new c3(`property names with quotes must have matching quotes`);
          if ((p4 === `constructor` || !f4) && (s4 = true), r3 += `.` + p4, a4 = `%` + r3 + `%`, X3(q3, a4)) o4 = q3[a4];
          else if (o4 != null) {
            if (!(p4 in o4)) {
              if (!t4) throw new l3(`base intrinsic for ` + e5 + ` exists, but the property is not available.`);
              return;
            }
            if (B4 && d4 + 1 >= n3.length) {
              var g4 = B4(o4, p4);
              f4 = !!g4, o4 = f4 && `get` in g4 && !(`originalValue` in g4.get) ? g4.get : o4[p4];
            } else f4 = X3(o4, p4), o4 = o4[p4];
            f4 && !s4 && (q3[a4] = o4);
          }
        }
        return o4;
      };
    }));
    U = f(((e4, t3) => {
      var n2 = ae(), r2 = V2(), i3 = r2([n2(`%String.prototype.indexOf%`)]);
      t3.exports = function(e5, t4) {
        var a3 = n2(e5, !!t4);
        return typeof a3 == `function` && i3(e5, `.prototype.`) > -1 ? r2([a3]) : a3;
      };
    }));
    W = f(((e4, t3) => {
      var n2 = Function.prototype.toString, r2 = typeof Reflect == `object` && Reflect !== null && Reflect.apply, i3, a3;
      if (typeof r2 == `function` && typeof Object.defineProperty == `function`) try {
        i3 = Object.defineProperty({}, `length`, { get: function() {
          throw a3;
        } }), a3 = {}, r2(function() {
          throw 42;
        }, null, i3);
      } catch (e5) {
        e5 !== a3 && (r2 = null);
      }
      else r2 = null;
      var o3 = /^\s*class\b/, s3 = function(e5) {
        try {
          var t4 = n2.call(e5);
          return o3.test(t4);
        } catch {
          return false;
        }
      }, c3 = function(e5) {
        try {
          return s3(e5) ? false : (n2.call(e5), true);
        } catch {
          return false;
        }
      }, l3 = Object.prototype.toString, u3 = `[object Object]`, d3 = `[object Function]`, f3 = `[object GeneratorFunction]`, p3 = `[object HTMLAllCollection]`, m4 = `[object HTML document.all class]`, h4 = `[object HTMLCollection]`, g4 = typeof Symbol == `function` && !!Symbol.toStringTag, _4 = !(0 in [,]), v4 = function() {
        return false;
      };
      if (typeof document == `object`) {
        var y4 = document.all;
        l3.call(y4) === l3.call(document.all) && (v4 = function(e5) {
          if ((_4 || !e5) && (e5 === void 0 || typeof e5 == `object`)) try {
            var t4 = l3.call(e5);
            return (t4 === p3 || t4 === m4 || t4 === h4 || t4 === u3) && e5(``) == null;
          } catch {
          }
          return false;
        });
      }
      t3.exports = r2 ? function(e5) {
        if (v4(e5)) return true;
        if (!e5 || typeof e5 != `function` && typeof e5 != `object`) return false;
        try {
          r2(e5, null, i3);
        } catch (e6) {
          if (e6 !== a3) return false;
        }
        return !s3(e5) && c3(e5);
      } : function(e5) {
        if (v4(e5)) return true;
        if (!e5 || typeof e5 != `function` && typeof e5 != `object`) return false;
        if (g4) return c3(e5);
        if (s3(e5)) return false;
        var t4 = l3.call(e5);
        return t4 !== d3 && t4 !== f3 && !/^\[object HTML/.test(t4) ? false : c3(e5);
      };
    }));
    oe = f(((e4, t3) => {
      var n2 = W(), r2 = Object.prototype.toString, i3 = Object.prototype.hasOwnProperty, a3 = function(e5, t4, n3) {
        for (var r3 = 0, a4 = e5.length; r3 < a4; r3++) i3.call(e5, r3) && (n3 == null ? t4(e5[r3], r3, e5) : t4.call(n3, e5[r3], r3, e5));
      }, o3 = function(e5, t4, n3) {
        for (var r3 = 0, i4 = e5.length; r3 < i4; r3++) n3 == null ? t4(e5.charAt(r3), r3, e5) : t4.call(n3, e5.charAt(r3), r3, e5);
      }, s3 = function(e5, t4, n3) {
        for (var r3 in e5) i3.call(e5, r3) && (n3 == null ? t4(e5[r3], r3, e5) : t4.call(n3, e5[r3], r3, e5));
      };
      function c3(e5) {
        return r2.call(e5) === `[object Array]`;
      }
      t3.exports = function(e5, t4, r3) {
        if (!n2(t4)) throw TypeError(`iterator must be a function`);
        var i4;
        arguments.length >= 3 && (i4 = r3), c3(e5) ? a3(e5, t4, i4) : typeof e5 == `string` ? o3(e5, t4, i4) : s3(e5, t4, i4);
      };
    }));
    se = f(((e4, t3) => {
      t3.exports = [`Float16Array`, `Float32Array`, `Float64Array`, `Int8Array`, `Int16Array`, `Int32Array`, `Uint8Array`, `Uint8ClampedArray`, `Uint16Array`, `Uint32Array`, `BigInt64Array`, `BigUint64Array`];
    }));
    G = f(((e4, t3) => {
      var n2 = se(), r2 = typeof globalThis > `u` ? global : globalThis;
      t3.exports = function() {
        for (var e5 = [], t4 = 0; t4 < n2.length; t4++) typeof r2[n2[t4]] == `function` && (e5[e5.length] = n2[t4]);
        return e5;
      };
    }));
    K = f(((e4, t3) => {
      var n2 = N2(), r2 = x2(), i3 = h2(), a3 = M2();
      t3.exports = function(e5, t4, o3) {
        if (!e5 || typeof e5 != `object` && typeof e5 != `function`) throw new i3("`obj` must be an object or a function`");
        if (typeof t4 != `string` && typeof t4 != `symbol`) throw new i3("`property` must be a string or a symbol`");
        if (arguments.length > 3 && typeof arguments[3] != `boolean` && arguments[3] !== null) throw new i3("`nonEnumerable`, if provided, must be a boolean or null");
        if (arguments.length > 4 && typeof arguments[4] != `boolean` && arguments[4] !== null) throw new i3("`nonWritable`, if provided, must be a boolean or null");
        if (arguments.length > 5 && typeof arguments[5] != `boolean` && arguments[5] !== null) throw new i3("`nonConfigurable`, if provided, must be a boolean or null");
        if (arguments.length > 6 && typeof arguments[6] != `boolean`) throw new i3("`loose`, if provided, must be a boolean");
        var s3 = arguments.length > 3 ? arguments[3] : null, c3 = arguments.length > 4 ? arguments[4] : null, l3 = arguments.length > 5 ? arguments[5] : null, u3 = arguments.length > 6 ? arguments[6] : false, d3 = !!a3 && a3(e5, t4);
        if (n2) n2(e5, t4, { configurable: l3 === null && d3 ? d3.configurable : !l3, enumerable: s3 === null && d3 ? d3.enumerable : !s3, value: o3, writable: c3 === null && d3 ? d3.writable : !c3 });
        else if (u3 || !s3 && !c3 && !l3) e5[t4] = o3;
        else throw new r2(`This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.`);
      };
    }));
    ce = f(((e4, t3) => {
      var n2 = N2(), r2 = function() {
        return !!n2;
      };
      r2.hasArrayLengthDefineBug = function() {
        if (!n2) return null;
        try {
          return n2([], `length`, { value: 1 }).length !== 1;
        } catch {
          return true;
        }
      }, t3.exports = r2;
    }));
    le = f(((e4, t3) => {
      var n2 = ae(), r2 = K(), i3 = ce()(), a3 = M2(), o3 = h2(), s3 = n2(`%Math.floor%`);
      t3.exports = function(e5, t4) {
        if (typeof e5 != `function`) throw new o3("`fn` is not a function");
        if (typeof t4 != `number` || t4 < 0 || t4 > 4294967295 || s3(t4) !== t4) throw new o3("`length` must be a positive 32-bit integer");
        var n3 = arguments.length > 2 && !!arguments[2], c3 = true, l3 = true;
        if (`length` in e5 && a3) {
          var u3 = a3(e5, `length`);
          u3 && !u3.configurable && (c3 = false), u3 && !u3.writable && (l3 = false);
        }
        return (c3 || l3 || !n3) && (i3 ? r2(e5, `length`, t4, true, true) : r2(e5, `length`, t4)), e5;
      };
    }));
    q = f(((e4, t3) => {
      var n2 = R2(), r2 = ne(), i3 = B2();
      t3.exports = function() {
        return i3(n2, r2, arguments);
      };
    }));
    ue = f(((e4, t3) => {
      var n2 = le(), r2 = N2(), i3 = V2(), a3 = q();
      t3.exports = function(e5) {
        var t4 = i3(arguments), r3 = 1 + e5.length - (arguments.length - 1);
        return n2(t4, r3 > 0 ? r3 : 0, true);
      }, r2 ? r2(t3.exports, `apply`, { value: a3 }) : t3.exports.apply = a3;
    }));
    J = f(((e4, t3) => {
      var n2 = P2();
      t3.exports = function() {
        return n2() && !!Symbol.toStringTag;
      };
    }));
    Y = f(((e4, t3) => {
      var n2 = oe(), r2 = G(), i3 = ue(), a3 = U(), o3 = M2(), s3 = re(), c3 = a3(`Object.prototype.toString`), l3 = J()(), u3 = typeof globalThis > `u` ? global : globalThis, d3 = r2(), f3 = a3(`String.prototype.slice`), p3 = a3(`Array.prototype.indexOf`, true) || function(e5, t4) {
        for (var n3 = 0; n3 < e5.length; n3 += 1) if (e5[n3] === t4) return n3;
        return -1;
      }, m4 = { __proto__: null };
      l3 && o3 && s3 ? n2(d3, function(e5) {
        var t4 = new u3[e5]();
        if (Symbol.toStringTag in t4 && s3) {
          var n3 = s3(t4), r3 = o3(n3, Symbol.toStringTag);
          if (!r3 && n3 && (r3 = o3(s3(n3), Symbol.toStringTag)), r3 && r3.get) {
            var a4 = i3(r3.get);
            m4[`$` + e5] = a4;
          }
        }
      }) : n2(d3, function(e5) {
        var t4 = new u3[e5](), n3 = t4.slice || t4.set;
        if (n3) {
          var r3 = i3(n3);
          m4[`$` + e5] = r3;
        }
      });
      var h4 = function(e5) {
        var t4 = false;
        return n2(m4, function(n3, r3) {
          if (!t4) try {
            `$` + n3(e5) === r3 && (t4 = f3(r3, 1));
          } catch {
          }
        }), t4;
      }, g4 = function(e5) {
        var t4 = false;
        return n2(m4, function(n3, r3) {
          if (!t4) try {
            n3(e5), t4 = f3(r3, 1);
          } catch {
          }
        }), t4;
      };
      t3.exports = function(e5) {
        if (!e5 || typeof e5 != `object`) return false;
        if (!l3) {
          var t4 = f3(c3(e5), 8, -1);
          return p3(d3, t4) > -1 ? t4 : t4 === `Object` ? g4(e5) : false;
        }
        return o3 ? h4(e5) : null;
      };
    }));
    X = f(((e4, t3) => {
      var n2 = Y();
      t3.exports = function(e5) {
        return !!n2(e5);
      };
    }));
    Z = f(((e4, t3) => {
      var n2 = h2(), r2 = U()(`TypedArray.prototype.buffer`, true), i3 = X();
      t3.exports = r2 || function(e5) {
        if (!i3(e5)) throw new n2(`Not a Typed Array`);
        return e5.buffer;
      };
    }));
    de = f(((e4, t3) => {
      var n2 = p2().Buffer, r2 = m2(), i3 = Z(), a3 = ArrayBuffer.isView || function(e5) {
        try {
          return i3(e5), true;
        } catch {
          return false;
        }
      }, o3 = typeof Uint8Array < `u`, s3 = typeof ArrayBuffer < `u` && typeof Uint8Array < `u`, c3 = s3 && (n2.prototype instanceof Uint8Array || n2.TYPED_ARRAY_SUPPORT);
      t3.exports = function(e5, t4) {
        if (n2.isBuffer(e5)) return e5.constructor && !(`isBuffer` in e5) ? n2.from(e5) : e5;
        if (typeof e5 == `string`) return n2.from(e5, t4);
        if (s3 && a3(e5)) {
          if (e5.byteLength === 0) return n2.alloc(0);
          if (c3) {
            var i4 = n2.from(e5.buffer, e5.byteOffset, e5.byteLength);
            if (i4.byteLength === e5.byteLength) return i4;
          }
          var l3 = e5 instanceof Uint8Array ? e5 : new Uint8Array(e5.buffer, e5.byteOffset, e5.byteLength), u3 = n2.from(l3);
          if (u3.length === e5.byteLength) return u3;
        }
        if (o3 && e5 instanceof Uint8Array) return n2.from(e5);
        var d3 = r2(e5);
        if (d3) for (var f3 = 0; f3 < e5.length; f3 += 1) {
          var p3 = e5[f3];
          if (typeof p3 != `number` || p3 < 0 || p3 > 255 || ~~p3 !== p3) throw RangeError(`Array items must be numbers in the range 0-255.`);
        }
        if (d3 || n2.isBuffer(e5) && e5.constructor && typeof e5.constructor.isBuffer == `function` && e5.constructor.isBuffer(e5)) return n2.from(e5);
        throw TypeError(`The "data" argument must be a string, an Array, a Buffer, a Uint8Array, or a DataView.`);
      };
    }));
    Q = f(((e4, t3) => {
      var n2 = p2().Buffer, r2 = de();
      function i3(e5, t4) {
        this._block = n2.alloc(e5), this._finalSize = t4, this._blockSize = e5, this._len = 0;
      }
      i3.prototype.update = function(e5, t4) {
        e5 = r2(e5, t4 || `utf8`);
        for (var n3 = this._block, i4 = this._blockSize, a3 = e5.length, o3 = this._len, s3 = 0; s3 < a3; ) {
          for (var c3 = o3 % i4, l3 = Math.min(a3 - s3, i4 - c3), u3 = 0; u3 < l3; u3++) n3[c3 + u3] = e5[s3 + u3];
          o3 += l3, s3 += l3, o3 % i4 === 0 && this._update(n3);
        }
        return this._len += a3, this;
      }, i3.prototype.digest = function(e5) {
        var t4 = this._len % this._blockSize;
        this._block[t4] = 128, this._block.fill(0, t4 + 1), t4 >= this._finalSize && (this._update(this._block), this._block.fill(0));
        var n3 = this._len * 8;
        if (n3 <= 4294967295) this._block.writeUInt32BE(n3, this._blockSize - 4);
        else {
          var r3 = (n3 & 4294967295) >>> 0, i4 = (n3 - r3) / 4294967296;
          this._block.writeUInt32BE(i4, this._blockSize - 8), this._block.writeUInt32BE(r3, this._blockSize - 4);
        }
        this._update(this._block);
        var a3 = this._hash();
        return e5 ? a3.toString(e5) : a3;
      }, i3.prototype._update = function() {
        throw Error(`_update must be implemented by subclass`);
      }, t3.exports = i3;
    }));
    fe = f(((e4, t3) => {
      var n2 = f2(), r2 = Q(), i3 = p2().Buffer, a3 = [1518500249, 1859775393, -1894007588, -899497514], o3 = Array(80);
      function s3() {
        this.init(), this._w = o3, r2.call(this, 64, 56);
      }
      n2(s3, r2), s3.prototype.init = function() {
        return this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520, this;
      };
      function c3(e5) {
        return e5 << 1 | e5 >>> 31;
      }
      function l3(e5) {
        return e5 << 5 | e5 >>> 27;
      }
      function u3(e5) {
        return e5 << 30 | e5 >>> 2;
      }
      function d3(e5, t4, n3, r3) {
        return e5 === 0 ? t4 & n3 | ~t4 & r3 : e5 === 2 ? t4 & n3 | t4 & r3 | n3 & r3 : t4 ^ n3 ^ r3;
      }
      s3.prototype._update = function(e5) {
        for (var t4 = this._w, n3 = this._a | 0, r3 = this._b | 0, i4 = this._c | 0, o4 = this._d | 0, s4 = this._e | 0, f3 = 0; f3 < 16; ++f3) t4[f3] = e5.readInt32BE(f3 * 4);
        for (; f3 < 80; ++f3) t4[f3] = c3(t4[f3 - 3] ^ t4[f3 - 8] ^ t4[f3 - 14] ^ t4[f3 - 16]);
        for (var p3 = 0; p3 < 80; ++p3) {
          var m4 = ~~(p3 / 20), h4 = l3(n3) + d3(m4, r3, i4, o4) + s4 + t4[p3] + a3[m4] | 0;
          s4 = o4, o4 = i4, i4 = u3(r3), r3 = n3, n3 = h4;
        }
        this._a = n3 + this._a | 0, this._b = r3 + this._b | 0, this._c = i4 + this._c | 0, this._d = o4 + this._d | 0, this._e = s4 + this._e | 0;
      }, s3.prototype._hash = function() {
        var e5 = i3.allocUnsafe(20);
        return e5.writeInt32BE(this._a | 0, 0), e5.writeInt32BE(this._b | 0, 4), e5.writeInt32BE(this._c | 0, 8), e5.writeInt32BE(this._d | 0, 12), e5.writeInt32BE(this._e | 0, 16), e5;
      }, t3.exports = s3;
    }));
    pe = f(((e4) => {
      (function(t3) {
        typeof DO_NOT_EXPORT_CRC > `u` ? typeof e4 == `object` ? t3(e4) : typeof define == `function` && define.amd ? define(function() {
          var e5 = {};
          return t3(e5), e5;
        }) : t3({}) : t3({});
      })(function(e5) {
        e5.version = `1.2.2`;
        function t3() {
          for (var e6 = 0, t4 = Array(256), n3 = 0; n3 != 256; ++n3) e6 = n3, e6 = e6 & 1 ? -306674912 ^ e6 >>> 1 : e6 >>> 1, e6 = e6 & 1 ? -306674912 ^ e6 >>> 1 : e6 >>> 1, e6 = e6 & 1 ? -306674912 ^ e6 >>> 1 : e6 >>> 1, e6 = e6 & 1 ? -306674912 ^ e6 >>> 1 : e6 >>> 1, e6 = e6 & 1 ? -306674912 ^ e6 >>> 1 : e6 >>> 1, e6 = e6 & 1 ? -306674912 ^ e6 >>> 1 : e6 >>> 1, e6 = e6 & 1 ? -306674912 ^ e6 >>> 1 : e6 >>> 1, e6 = e6 & 1 ? -306674912 ^ e6 >>> 1 : e6 >>> 1, t4[n3] = e6;
          return typeof Int32Array < `u` ? new Int32Array(t4) : t4;
        }
        var n2 = t3();
        function r2(e6) {
          var t4 = 0, n3 = 0, r3 = 0, i4 = typeof Int32Array < `u` ? new Int32Array(4096) : Array(4096);
          for (r3 = 0; r3 != 256; ++r3) i4[r3] = e6[r3];
          for (r3 = 0; r3 != 256; ++r3) for (n3 = e6[r3], t4 = 256 + r3; t4 < 4096; t4 += 256) n3 = i4[t4] = n3 >>> 8 ^ e6[n3 & 255];
          var a4 = [];
          for (r3 = 1; r3 != 16; ++r3) a4[r3 - 1] = typeof Int32Array < `u` ? i4.subarray(r3 * 256, r3 * 256 + 256) : i4.slice(r3 * 256, r3 * 256 + 256);
          return a4;
        }
        var i3 = r2(n2), a3 = i3[0], o3 = i3[1], s3 = i3[2], c3 = i3[3], l3 = i3[4], u3 = i3[5], d3 = i3[6], f3 = i3[7], p3 = i3[8], m4 = i3[9], h4 = i3[10], g4 = i3[11], _4 = i3[12], v4 = i3[13], y4 = i3[14];
        function b4(e6, t4) {
          for (var r3 = t4 ^ -1, i4 = 0, a4 = e6.length; i4 < a4; ) r3 = r3 >>> 8 ^ n2[(r3 ^ e6.charCodeAt(i4++)) & 255];
          return ~r3;
        }
        function x4(e6, t4) {
          for (var r3 = t4 ^ -1, i4 = e6.length - 15, b5 = 0; b5 < i4; ) r3 = y4[e6[b5++] ^ r3 & 255] ^ v4[e6[b5++] ^ r3 >> 8 & 255] ^ _4[e6[b5++] ^ r3 >> 16 & 255] ^ g4[e6[b5++] ^ r3 >>> 24] ^ h4[e6[b5++]] ^ m4[e6[b5++]] ^ p3[e6[b5++]] ^ f3[e6[b5++]] ^ d3[e6[b5++]] ^ u3[e6[b5++]] ^ l3[e6[b5++]] ^ c3[e6[b5++]] ^ s3[e6[b5++]] ^ o3[e6[b5++]] ^ a3[e6[b5++]] ^ n2[e6[b5++]];
          for (i4 += 15; b5 < i4; ) r3 = r3 >>> 8 ^ n2[(r3 ^ e6[b5++]) & 255];
          return ~r3;
        }
        function S4(e6, t4) {
          for (var r3 = t4 ^ -1, i4 = 0, a4 = e6.length, o4 = 0, s4 = 0; i4 < a4; ) o4 = e6.charCodeAt(i4++), o4 < 128 ? r3 = r3 >>> 8 ^ n2[(r3 ^ o4) & 255] : o4 < 2048 ? (r3 = r3 >>> 8 ^ n2[(r3 ^ (192 | o4 >> 6 & 31)) & 255], r3 = r3 >>> 8 ^ n2[(r3 ^ (128 | o4 & 63)) & 255]) : o4 >= 55296 && o4 < 57344 ? (o4 = (o4 & 1023) + 64, s4 = e6.charCodeAt(i4++) & 1023, r3 = r3 >>> 8 ^ n2[(r3 ^ (240 | o4 >> 8 & 7)) & 255], r3 = r3 >>> 8 ^ n2[(r3 ^ (128 | o4 >> 2 & 63)) & 255], r3 = r3 >>> 8 ^ n2[(r3 ^ (128 | s4 >> 6 & 15 | (o4 & 3) << 4)) & 255], r3 = r3 >>> 8 ^ n2[(r3 ^ (128 | s4 & 63)) & 255]) : (r3 = r3 >>> 8 ^ n2[(r3 ^ (224 | o4 >> 12 & 15)) & 255], r3 = r3 >>> 8 ^ n2[(r3 ^ (128 | o4 >> 6 & 63)) & 255], r3 = r3 >>> 8 ^ n2[(r3 ^ (128 | o4 & 63)) & 255]);
          return ~r3;
        }
        e5.table = n2, e5.bstr = b4, e5.buf = x4, e5.str = S4;
      });
    }));
    $ = f(((e4) => {
      var t3 = typeof Uint8Array < `u` && typeof Uint16Array < `u` && typeof Int32Array < `u`;
      function n2(e5, t4) {
        return Object.prototype.hasOwnProperty.call(e5, t4);
      }
      e4.assign = function(e5) {
        for (var t4 = Array.prototype.slice.call(arguments, 1); t4.length; ) {
          var r3 = t4.shift();
          if (r3) {
            if (typeof r3 != `object`) throw TypeError(r3 + `must be non-object`);
            for (var i4 in r3) n2(r3, i4) && (e5[i4] = r3[i4]);
          }
        }
        return e5;
      }, e4.shrinkBuf = function(e5, t4) {
        return e5.length === t4 ? e5 : e5.subarray ? e5.subarray(0, t4) : (e5.length = t4, e5);
      };
      var r2 = { arraySet: function(e5, t4, n3, r3, i4) {
        if (t4.subarray && e5.subarray) {
          e5.set(t4.subarray(n3, n3 + r3), i4);
          return;
        }
        for (var a3 = 0; a3 < r3; a3++) e5[i4 + a3] = t4[n3 + a3];
      }, flattenChunks: function(e5) {
        var t4, n3, r3 = 0, i4, a3, o3;
        for (t4 = 0, n3 = e5.length; t4 < n3; t4++) r3 += e5[t4].length;
        for (o3 = new Uint8Array(r3), i4 = 0, t4 = 0, n3 = e5.length; t4 < n3; t4++) a3 = e5[t4], o3.set(a3, i4), i4 += a3.length;
        return o3;
      } }, i3 = { arraySet: function(e5, t4, n3, r3, i4) {
        for (var a3 = 0; a3 < r3; a3++) e5[i4 + a3] = t4[n3 + a3];
      }, flattenChunks: function(e5) {
        return [].concat.apply([], e5);
      } };
      e4.setTyped = function(t4) {
        t4 ? (e4.Buf8 = Uint8Array, e4.Buf16 = Uint16Array, e4.Buf32 = Int32Array, e4.assign(e4, r2)) : (e4.Buf8 = Array, e4.Buf16 = Array, e4.Buf32 = Array, e4.assign(e4, i3));
      }, e4.setTyped(t3);
    }));
    me = f(((e4) => {
      var t3 = $(), n2 = 4, r2 = 0, i3 = 1, a3 = 2;
      function o3(e5) {
        for (var t4 = e5.length; --t4 >= 0; ) e5[t4] = 0;
      }
      var s3 = 0, c3 = 1, l3 = 2, u3 = 3, d3 = 258, f3 = 29, p3 = 256, m4 = p3 + 1 + f3, h4 = 30, g4 = 19, _4 = 2 * m4 + 1, v4 = 15, y4 = 16, b4 = 7, x4 = 256, S4 = 16, C4 = 17, w4 = 18, T4 = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], E4 = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], D4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], O4 = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], k4 = 512, A4 = Array((m4 + 2) * 2);
      o3(A4);
      var j4 = Array(h4 * 2);
      o3(j4);
      var M4 = Array(k4);
      o3(M4);
      var N4 = Array(d3 - u3 + 1);
      o3(N4);
      var P4 = Array(f3);
      o3(P4);
      var F4 = Array(h4);
      o3(F4);
      function ee3(e5, t4, n3, r3, i4) {
        this.static_tree = e5, this.extra_bits = t4, this.extra_base = n3, this.elems = r3, this.max_length = i4, this.has_stree = e5 && e5.length;
      }
      var I4, L4, R4;
      function te3(e5, t4) {
        this.dyn_tree = e5, this.max_code = 0, this.stat_desc = t4;
      }
      function ne3(e5) {
        return e5 < 256 ? M4[e5] : M4[256 + (e5 >>> 7)];
      }
      function z4(e5, t4) {
        e5.pending_buf[e5.pending++] = t4 & 255, e5.pending_buf[e5.pending++] = t4 >>> 8 & 255;
      }
      function B4(e5, t4, n3) {
        e5.bi_valid > y4 - n3 ? (e5.bi_buf |= t4 << e5.bi_valid & 65535, z4(e5, e5.bi_buf), e5.bi_buf = t4 >> y4 - e5.bi_valid, e5.bi_valid += n3 - y4) : (e5.bi_buf |= t4 << e5.bi_valid & 65535, e5.bi_valid += n3);
      }
      function V4(e5, t4, n3) {
        B4(e5, n3[t4 * 2], n3[t4 * 2 + 1]);
      }
      function H3(e5, t4) {
        var n3 = 0;
        do
          n3 |= e5 & 1, e5 >>>= 1, n3 <<= 1;
        while (--t4 > 0);
        return n3 >>> 1;
      }
      function re3(e5) {
        e5.bi_valid === 16 ? (z4(e5, e5.bi_buf), e5.bi_buf = 0, e5.bi_valid = 0) : e5.bi_valid >= 8 && (e5.pending_buf[e5.pending++] = e5.bi_buf & 255, e5.bi_buf >>= 8, e5.bi_valid -= 8);
      }
      function ie3(e5, t4) {
        var n3 = t4.dyn_tree, r3 = t4.max_code, i4 = t4.stat_desc.static_tree, a4 = t4.stat_desc.has_stree, o4 = t4.stat_desc.extra_bits, s4 = t4.stat_desc.extra_base, c4 = t4.stat_desc.max_length, l4, u4, d4, f4, p4, m5, h5 = 0;
        for (f4 = 0; f4 <= v4; f4++) e5.bl_count[f4] = 0;
        for (n3[e5.heap[e5.heap_max] * 2 + 1] = 0, l4 = e5.heap_max + 1; l4 < _4; l4++) u4 = e5.heap[l4], f4 = n3[n3[u4 * 2 + 1] * 2 + 1] + 1, f4 > c4 && (f4 = c4, h5++), n3[u4 * 2 + 1] = f4, !(u4 > r3) && (e5.bl_count[f4]++, p4 = 0, u4 >= s4 && (p4 = o4[u4 - s4]), m5 = n3[u4 * 2], e5.opt_len += m5 * (f4 + p4), a4 && (e5.static_len += m5 * (i4[u4 * 2 + 1] + p4)));
        if (h5 !== 0) {
          do {
            for (f4 = c4 - 1; e5.bl_count[f4] === 0; ) f4--;
            e5.bl_count[f4]--, e5.bl_count[f4 + 1] += 2, e5.bl_count[c4]--, h5 -= 2;
          } while (h5 > 0);
          for (f4 = c4; f4 !== 0; f4--) for (u4 = e5.bl_count[f4]; u4 !== 0; ) d4 = e5.heap[--l4], !(d4 > r3) && (n3[d4 * 2 + 1] !== f4 && (e5.opt_len += (f4 - n3[d4 * 2 + 1]) * n3[d4 * 2], n3[d4 * 2 + 1] = f4), u4--);
        }
      }
      function ae3(e5, t4, n3) {
        var r3 = Array(v4 + 1), i4 = 0, a4, o4;
        for (a4 = 1; a4 <= v4; a4++) r3[a4] = i4 = i4 + n3[a4 - 1] << 1;
        for (o4 = 0; o4 <= t4; o4++) {
          var s4 = e5[o4 * 2 + 1];
          s4 !== 0 && (e5[o4 * 2] = H3(r3[s4]++, s4));
        }
      }
      function U3() {
        var e5, t4, n3, r3, i4, a4 = Array(v4 + 1);
        for (n3 = 0, r3 = 0; r3 < f3 - 1; r3++) for (P4[r3] = n3, e5 = 0; e5 < 1 << T4[r3]; e5++) N4[n3++] = r3;
        for (N4[n3 - 1] = r3, i4 = 0, r3 = 0; r3 < 16; r3++) for (F4[r3] = i4, e5 = 0; e5 < 1 << E4[r3]; e5++) M4[i4++] = r3;
        for (i4 >>= 7; r3 < h4; r3++) for (F4[r3] = i4 << 7, e5 = 0; e5 < 1 << E4[r3] - 7; e5++) M4[256 + i4++] = r3;
        for (t4 = 0; t4 <= v4; t4++) a4[t4] = 0;
        for (e5 = 0; e5 <= 143; ) A4[e5 * 2 + 1] = 8, e5++, a4[8]++;
        for (; e5 <= 255; ) A4[e5 * 2 + 1] = 9, e5++, a4[9]++;
        for (; e5 <= 279; ) A4[e5 * 2 + 1] = 7, e5++, a4[7]++;
        for (; e5 <= 287; ) A4[e5 * 2 + 1] = 8, e5++, a4[8]++;
        for (ae3(A4, m4 + 1, a4), e5 = 0; e5 < h4; e5++) j4[e5 * 2 + 1] = 5, j4[e5 * 2] = H3(e5, 5);
        I4 = new ee3(A4, T4, p3 + 1, m4, v4), L4 = new ee3(j4, E4, 0, h4, v4), R4 = new ee3([], D4, 0, g4, b4);
      }
      function W3(e5) {
        var t4;
        for (t4 = 0; t4 < m4; t4++) e5.dyn_ltree[t4 * 2] = 0;
        for (t4 = 0; t4 < h4; t4++) e5.dyn_dtree[t4 * 2] = 0;
        for (t4 = 0; t4 < g4; t4++) e5.bl_tree[t4 * 2] = 0;
        e5.dyn_ltree[x4 * 2] = 1, e5.opt_len = e5.static_len = 0, e5.last_lit = e5.matches = 0;
      }
      function oe3(e5) {
        e5.bi_valid > 8 ? z4(e5, e5.bi_buf) : e5.bi_valid > 0 && (e5.pending_buf[e5.pending++] = e5.bi_buf), e5.bi_buf = 0, e5.bi_valid = 0;
      }
      function se3(e5, n3, r3, i4) {
        oe3(e5), i4 && (z4(e5, r3), z4(e5, ~r3)), t3.arraySet(e5.pending_buf, e5.window, n3, r3, e5.pending), e5.pending += r3;
      }
      function G3(e5, t4, n3, r3) {
        var i4 = t4 * 2, a4 = n3 * 2;
        return e5[i4] < e5[a4] || e5[i4] === e5[a4] && r3[t4] <= r3[n3];
      }
      function K3(e5, t4, n3) {
        for (var r3 = e5.heap[n3], i4 = n3 << 1; i4 <= e5.heap_len && (i4 < e5.heap_len && G3(t4, e5.heap[i4 + 1], e5.heap[i4], e5.depth) && i4++, !G3(t4, r3, e5.heap[i4], e5.depth)); ) e5.heap[n3] = e5.heap[i4], n3 = i4, i4 <<= 1;
        e5.heap[n3] = r3;
      }
      function ce3(e5, t4, n3) {
        var r3, i4, a4 = 0, o4, s4;
        if (e5.last_lit !== 0) do
          r3 = e5.pending_buf[e5.d_buf + a4 * 2] << 8 | e5.pending_buf[e5.d_buf + a4 * 2 + 1], i4 = e5.pending_buf[e5.l_buf + a4], a4++, r3 === 0 ? V4(e5, i4, t4) : (o4 = N4[i4], V4(e5, o4 + p3 + 1, t4), s4 = T4[o4], s4 !== 0 && (i4 -= P4[o4], B4(e5, i4, s4)), r3--, o4 = ne3(r3), V4(e5, o4, n3), s4 = E4[o4], s4 !== 0 && (r3 -= F4[o4], B4(e5, r3, s4)));
        while (a4 < e5.last_lit);
        V4(e5, x4, t4);
      }
      function le3(e5, t4) {
        var n3 = t4.dyn_tree, r3 = t4.stat_desc.static_tree, i4 = t4.stat_desc.has_stree, a4 = t4.stat_desc.elems, o4, s4, c4 = -1, l4;
        for (e5.heap_len = 0, e5.heap_max = _4, o4 = 0; o4 < a4; o4++) n3[o4 * 2] === 0 ? n3[o4 * 2 + 1] = 0 : (e5.heap[++e5.heap_len] = c4 = o4, e5.depth[o4] = 0);
        for (; e5.heap_len < 2; ) l4 = e5.heap[++e5.heap_len] = c4 < 2 ? ++c4 : 0, n3[l4 * 2] = 1, e5.depth[l4] = 0, e5.opt_len--, i4 && (e5.static_len -= r3[l4 * 2 + 1]);
        for (t4.max_code = c4, o4 = e5.heap_len >> 1; o4 >= 1; o4--) K3(e5, n3, o4);
        l4 = a4;
        do
          o4 = e5.heap[1], e5.heap[1] = e5.heap[e5.heap_len--], K3(e5, n3, 1), s4 = e5.heap[1], e5.heap[--e5.heap_max] = o4, e5.heap[--e5.heap_max] = s4, n3[l4 * 2] = n3[o4 * 2] + n3[s4 * 2], e5.depth[l4] = (e5.depth[o4] >= e5.depth[s4] ? e5.depth[o4] : e5.depth[s4]) + 1, n3[o4 * 2 + 1] = n3[s4 * 2 + 1] = l4, e5.heap[1] = l4++, K3(e5, n3, 1);
        while (e5.heap_len >= 2);
        e5.heap[--e5.heap_max] = e5.heap[1], ie3(e5, t4), ae3(n3, c4, e5.bl_count);
      }
      function q3(e5, t4, n3) {
        var r3, i4 = -1, a4, o4 = t4[1], s4 = 0, c4 = 7, l4 = 4;
        for (o4 === 0 && (c4 = 138, l4 = 3), t4[(n3 + 1) * 2 + 1] = 65535, r3 = 0; r3 <= n3; r3++) a4 = o4, o4 = t4[(r3 + 1) * 2 + 1], !(++s4 < c4 && a4 === o4) && (s4 < l4 ? e5.bl_tree[a4 * 2] += s4 : a4 === 0 ? s4 <= 10 ? e5.bl_tree[C4 * 2]++ : e5.bl_tree[w4 * 2]++ : (a4 !== i4 && e5.bl_tree[a4 * 2]++, e5.bl_tree[S4 * 2]++), s4 = 0, i4 = a4, o4 === 0 ? (c4 = 138, l4 = 3) : a4 === o4 ? (c4 = 6, l4 = 3) : (c4 = 7, l4 = 4));
      }
      function ue3(e5, t4, n3) {
        var r3, i4 = -1, a4, o4 = t4[1], s4 = 0, c4 = 7, l4 = 4;
        for (o4 === 0 && (c4 = 138, l4 = 3), r3 = 0; r3 <= n3; r3++) if (a4 = o4, o4 = t4[(r3 + 1) * 2 + 1], !(++s4 < c4 && a4 === o4)) {
          if (s4 < l4) do
            V4(e5, a4, e5.bl_tree);
          while (--s4 !== 0);
          else a4 === 0 ? s4 <= 10 ? (V4(e5, C4, e5.bl_tree), B4(e5, s4 - 3, 3)) : (V4(e5, w4, e5.bl_tree), B4(e5, s4 - 11, 7)) : (a4 !== i4 && (V4(e5, a4, e5.bl_tree), s4--), V4(e5, S4, e5.bl_tree), B4(e5, s4 - 3, 2));
          s4 = 0, i4 = a4, o4 === 0 ? (c4 = 138, l4 = 3) : a4 === o4 ? (c4 = 6, l4 = 3) : (c4 = 7, l4 = 4);
        }
      }
      function J3(e5) {
        var t4;
        for (q3(e5, e5.dyn_ltree, e5.l_desc.max_code), q3(e5, e5.dyn_dtree, e5.d_desc.max_code), le3(e5, e5.bl_desc), t4 = g4 - 1; t4 >= 3 && e5.bl_tree[O4[t4] * 2 + 1] === 0; t4--) ;
        return e5.opt_len += 3 * (t4 + 1) + 5 + 5 + 4, t4;
      }
      function Y3(e5, t4, n3, r3) {
        var i4;
        for (B4(e5, t4 - 257, 5), B4(e5, n3 - 1, 5), B4(e5, r3 - 4, 4), i4 = 0; i4 < r3; i4++) B4(e5, e5.bl_tree[O4[i4] * 2 + 1], 3);
        ue3(e5, e5.dyn_ltree, t4 - 1), ue3(e5, e5.dyn_dtree, n3 - 1);
      }
      function X3(e5) {
        var t4 = 4093624447, n3;
        for (n3 = 0; n3 <= 31; n3++, t4 >>>= 1) if (t4 & 1 && e5.dyn_ltree[n3 * 2] !== 0) return r2;
        if (e5.dyn_ltree[18] !== 0 || e5.dyn_ltree[20] !== 0 || e5.dyn_ltree[26] !== 0) return i3;
        for (n3 = 32; n3 < p3; n3++) if (e5.dyn_ltree[n3 * 2] !== 0) return i3;
        return r2;
      }
      var Z3 = false;
      function de3(e5) {
        Z3 ||= (U3(), true), e5.l_desc = new te3(e5.dyn_ltree, I4), e5.d_desc = new te3(e5.dyn_dtree, L4), e5.bl_desc = new te3(e5.bl_tree, R4), e5.bi_buf = 0, e5.bi_valid = 0, W3(e5);
      }
      function Q3(e5, t4, n3, r3) {
        B4(e5, (s3 << 1) + +!!r3, 3), se3(e5, t4, n3, true);
      }
      function fe3(e5) {
        B4(e5, c3 << 1, 3), V4(e5, x4, A4), re3(e5);
      }
      function pe3(e5, t4, r3, i4) {
        var o4, s4, u4 = 0;
        e5.level > 0 ? (e5.strm.data_type === a3 && (e5.strm.data_type = X3(e5)), le3(e5, e5.l_desc), le3(e5, e5.d_desc), u4 = J3(e5), o4 = e5.opt_len + 3 + 7 >>> 3, s4 = e5.static_len + 3 + 7 >>> 3, s4 <= o4 && (o4 = s4)) : o4 = s4 = r3 + 5, r3 + 4 <= o4 && t4 !== -1 ? Q3(e5, t4, r3, i4) : e5.strategy === n2 || s4 === o4 ? (B4(e5, (c3 << 1) + +!!i4, 3), ce3(e5, A4, j4)) : (B4(e5, (l3 << 1) + +!!i4, 3), Y3(e5, e5.l_desc.max_code + 1, e5.d_desc.max_code + 1, u4 + 1), ce3(e5, e5.dyn_ltree, e5.dyn_dtree)), W3(e5), i4 && oe3(e5);
      }
      function me3(e5, t4, n3) {
        return e5.pending_buf[e5.d_buf + e5.last_lit * 2] = t4 >>> 8 & 255, e5.pending_buf[e5.d_buf + e5.last_lit * 2 + 1] = t4 & 255, e5.pending_buf[e5.l_buf + e5.last_lit] = n3 & 255, e5.last_lit++, t4 === 0 ? e5.dyn_ltree[n3 * 2]++ : (e5.matches++, t4--, e5.dyn_ltree[(N4[n3] + p3 + 1) * 2]++, e5.dyn_dtree[ne3(t4) * 2]++), e5.last_lit === e5.lit_bufsize - 1;
      }
      e4._tr_init = de3, e4._tr_stored_block = Q3, e4._tr_flush_block = pe3, e4._tr_tally = me3, e4._tr_align = fe3;
    }));
    he = f(((e4, t3) => {
      function n2(e5, t4, n3, r2) {
        for (var i3 = e5 & 65535 | 0, a3 = e5 >>> 16 & 65535 | 0, o3 = 0; n3 !== 0; ) {
          o3 = n3 > 2e3 ? 2e3 : n3, n3 -= o3;
          do
            i3 = i3 + t4[r2++] | 0, a3 = a3 + i3 | 0;
          while (--o3);
          i3 %= 65521, a3 %= 65521;
        }
        return i3 | a3 << 16 | 0;
      }
      t3.exports = n2;
    }));
    ge = f(((e4, t3) => {
      function n2() {
        for (var e5, t4 = [], n3 = 0; n3 < 256; n3++) {
          e5 = n3;
          for (var r3 = 0; r3 < 8; r3++) e5 = e5 & 1 ? 3988292384 ^ e5 >>> 1 : e5 >>> 1;
          t4[n3] = e5;
        }
        return t4;
      }
      var r2 = n2();
      function i3(e5, t4, n3, i4) {
        var a3 = r2, o3 = i4 + n3;
        e5 ^= -1;
        for (var s3 = i4; s3 < o3; s3++) e5 = e5 >>> 8 ^ a3[(e5 ^ t4[s3]) & 255];
        return e5 ^ -1;
      }
      t3.exports = i3;
    }));
    _e = f(((e4, t3) => {
      t3.exports = { 2: `need dictionary`, 1: `stream end`, 0: ``, "-1": `file error`, "-2": `stream error`, "-3": `data error`, "-4": `insufficient memory`, "-5": `buffer error`, "-6": `incompatible version` };
    }));
    ve = f(((e4) => {
      var t3 = $(), n2 = me(), r2 = he(), i3 = ge(), a3 = _e(), o3 = 0, s3 = 1, c3 = 3, l3 = 4, u3 = 5, d3 = 0, f3 = 1, p3 = -2, m4 = -3, h4 = -5, g4 = -1, _4 = 1, v4 = 2, y4 = 3, b4 = 4, x4 = 0, S4 = 2, C4 = 8, w4 = 9, T4 = 15, E4 = 8, D4 = 286, O4 = 30, k4 = 19, A4 = 2 * D4 + 1, j4 = 15, M4 = 3, N4 = 258, P4 = N4 + M4 + 1, F4 = 32, ee3 = 42, I4 = 69, L4 = 73, R4 = 91, te3 = 103, ne3 = 113, z4 = 666, B4 = 1, V4 = 2, H3 = 3, re3 = 4, ie3 = 3;
      function ae3(e5, t4) {
        return e5.msg = a3[t4], t4;
      }
      function U3(e5) {
        return (e5 << 1) - (e5 > 4 ? 9 : 0);
      }
      function W3(e5) {
        for (var t4 = e5.length; --t4 >= 0; ) e5[t4] = 0;
      }
      function oe3(e5) {
        var n3 = e5.state, r3 = n3.pending;
        r3 > e5.avail_out && (r3 = e5.avail_out), r3 !== 0 && (t3.arraySet(e5.output, n3.pending_buf, n3.pending_out, r3, e5.next_out), e5.next_out += r3, n3.pending_out += r3, e5.total_out += r3, e5.avail_out -= r3, n3.pending -= r3, n3.pending === 0 && (n3.pending_out = 0));
      }
      function se3(e5, t4) {
        n2._tr_flush_block(e5, e5.block_start >= 0 ? e5.block_start : -1, e5.strstart - e5.block_start, t4), e5.block_start = e5.strstart, oe3(e5.strm);
      }
      function G3(e5, t4) {
        e5.pending_buf[e5.pending++] = t4;
      }
      function K3(e5, t4) {
        e5.pending_buf[e5.pending++] = t4 >>> 8 & 255, e5.pending_buf[e5.pending++] = t4 & 255;
      }
      function ce3(e5, n3, a4, o4) {
        var s4 = e5.avail_in;
        return s4 > o4 && (s4 = o4), s4 === 0 ? 0 : (e5.avail_in -= s4, t3.arraySet(n3, e5.input, e5.next_in, s4, a4), e5.state.wrap === 1 ? e5.adler = r2(e5.adler, n3, s4, a4) : e5.state.wrap === 2 && (e5.adler = i3(e5.adler, n3, s4, a4)), e5.next_in += s4, e5.total_in += s4, s4);
      }
      function le3(e5, t4) {
        var n3 = e5.max_chain_length, r3 = e5.strstart, i4, a4, o4 = e5.prev_length, s4 = e5.nice_match, c4 = e5.strstart > e5.w_size - P4 ? e5.strstart - (e5.w_size - P4) : 0, l4 = e5.window, u4 = e5.w_mask, d4 = e5.prev, f4 = e5.strstart + N4, p4 = l4[r3 + o4 - 1], m5 = l4[r3 + o4];
        e5.prev_length >= e5.good_match && (n3 >>= 2), s4 > e5.lookahead && (s4 = e5.lookahead);
        do {
          if (i4 = t4, l4[i4 + o4] !== m5 || l4[i4 + o4 - 1] !== p4 || l4[i4] !== l4[r3] || l4[++i4] !== l4[r3 + 1]) continue;
          r3 += 2, i4++;
          do
            ;
          while (l4[++r3] === l4[++i4] && l4[++r3] === l4[++i4] && l4[++r3] === l4[++i4] && l4[++r3] === l4[++i4] && l4[++r3] === l4[++i4] && l4[++r3] === l4[++i4] && l4[++r3] === l4[++i4] && l4[++r3] === l4[++i4] && r3 < f4);
          if (a4 = N4 - (f4 - r3), r3 = f4 - N4, a4 > o4) {
            if (e5.match_start = t4, o4 = a4, a4 >= s4) break;
            p4 = l4[r3 + o4 - 1], m5 = l4[r3 + o4];
          }
        } while ((t4 = d4[t4 & u4]) > c4 && --n3 !== 0);
        return o4 <= e5.lookahead ? o4 : e5.lookahead;
      }
      function q3(e5) {
        var n3 = e5.w_size, r3, i4, a4, o4, s4;
        do {
          if (o4 = e5.window_size - e5.lookahead - e5.strstart, e5.strstart >= n3 + (n3 - P4)) {
            t3.arraySet(e5.window, e5.window, n3, n3, 0), e5.match_start -= n3, e5.strstart -= n3, e5.block_start -= n3, i4 = e5.hash_size, r3 = i4;
            do
              a4 = e5.head[--r3], e5.head[r3] = a4 >= n3 ? a4 - n3 : 0;
            while (--i4);
            i4 = n3, r3 = i4;
            do
              a4 = e5.prev[--r3], e5.prev[r3] = a4 >= n3 ? a4 - n3 : 0;
            while (--i4);
            o4 += n3;
          }
          if (e5.strm.avail_in === 0) break;
          if (i4 = ce3(e5.strm, e5.window, e5.strstart + e5.lookahead, o4), e5.lookahead += i4, e5.lookahead + e5.insert >= M4) for (s4 = e5.strstart - e5.insert, e5.ins_h = e5.window[s4], e5.ins_h = (e5.ins_h << e5.hash_shift ^ e5.window[s4 + 1]) & e5.hash_mask; e5.insert && (e5.ins_h = (e5.ins_h << e5.hash_shift ^ e5.window[s4 + M4 - 1]) & e5.hash_mask, e5.prev[s4 & e5.w_mask] = e5.head[e5.ins_h], e5.head[e5.ins_h] = s4, s4++, e5.insert--, !(e5.lookahead + e5.insert < M4)); ) ;
        } while (e5.lookahead < P4 && e5.strm.avail_in !== 0);
      }
      function ue3(e5, t4) {
        var n3 = 65535;
        for (n3 > e5.pending_buf_size - 5 && (n3 = e5.pending_buf_size - 5); ; ) {
          if (e5.lookahead <= 1) {
            if (q3(e5), e5.lookahead === 0 && t4 === o3) return B4;
            if (e5.lookahead === 0) break;
          }
          e5.strstart += e5.lookahead, e5.lookahead = 0;
          var r3 = e5.block_start + n3;
          if ((e5.strstart === 0 || e5.strstart >= r3) && (e5.lookahead = e5.strstart - r3, e5.strstart = r3, se3(e5, false), e5.strm.avail_out === 0) || e5.strstart - e5.block_start >= e5.w_size - P4 && (se3(e5, false), e5.strm.avail_out === 0)) return B4;
        }
        return e5.insert = 0, t4 === l3 ? (se3(e5, true), e5.strm.avail_out === 0 ? H3 : re3) : (e5.strstart > e5.block_start && (se3(e5, false), e5.strm.avail_out), B4);
      }
      function J3(e5, t4) {
        for (var r3, i4; ; ) {
          if (e5.lookahead < P4) {
            if (q3(e5), e5.lookahead < P4 && t4 === o3) return B4;
            if (e5.lookahead === 0) break;
          }
          if (r3 = 0, e5.lookahead >= M4 && (e5.ins_h = (e5.ins_h << e5.hash_shift ^ e5.window[e5.strstart + M4 - 1]) & e5.hash_mask, r3 = e5.prev[e5.strstart & e5.w_mask] = e5.head[e5.ins_h], e5.head[e5.ins_h] = e5.strstart), r3 !== 0 && e5.strstart - r3 <= e5.w_size - P4 && (e5.match_length = le3(e5, r3)), e5.match_length >= M4) if (i4 = n2._tr_tally(e5, e5.strstart - e5.match_start, e5.match_length - M4), e5.lookahead -= e5.match_length, e5.match_length <= e5.max_lazy_match && e5.lookahead >= M4) {
            e5.match_length--;
            do
              e5.strstart++, e5.ins_h = (e5.ins_h << e5.hash_shift ^ e5.window[e5.strstart + M4 - 1]) & e5.hash_mask, r3 = e5.prev[e5.strstart & e5.w_mask] = e5.head[e5.ins_h], e5.head[e5.ins_h] = e5.strstart;
            while (--e5.match_length !== 0);
            e5.strstart++;
          } else e5.strstart += e5.match_length, e5.match_length = 0, e5.ins_h = e5.window[e5.strstart], e5.ins_h = (e5.ins_h << e5.hash_shift ^ e5.window[e5.strstart + 1]) & e5.hash_mask;
          else i4 = n2._tr_tally(e5, 0, e5.window[e5.strstart]), e5.lookahead--, e5.strstart++;
          if (i4 && (se3(e5, false), e5.strm.avail_out === 0)) return B4;
        }
        return e5.insert = e5.strstart < M4 - 1 ? e5.strstart : M4 - 1, t4 === l3 ? (se3(e5, true), e5.strm.avail_out === 0 ? H3 : re3) : e5.last_lit && (se3(e5, false), e5.strm.avail_out === 0) ? B4 : V4;
      }
      function Y3(e5, t4) {
        for (var r3, i4, a4; ; ) {
          if (e5.lookahead < P4) {
            if (q3(e5), e5.lookahead < P4 && t4 === o3) return B4;
            if (e5.lookahead === 0) break;
          }
          if (r3 = 0, e5.lookahead >= M4 && (e5.ins_h = (e5.ins_h << e5.hash_shift ^ e5.window[e5.strstart + M4 - 1]) & e5.hash_mask, r3 = e5.prev[e5.strstart & e5.w_mask] = e5.head[e5.ins_h], e5.head[e5.ins_h] = e5.strstart), e5.prev_length = e5.match_length, e5.prev_match = e5.match_start, e5.match_length = M4 - 1, r3 !== 0 && e5.prev_length < e5.max_lazy_match && e5.strstart - r3 <= e5.w_size - P4 && (e5.match_length = le3(e5, r3), e5.match_length <= 5 && (e5.strategy === _4 || e5.match_length === M4 && e5.strstart - e5.match_start > 4096) && (e5.match_length = M4 - 1)), e5.prev_length >= M4 && e5.match_length <= e5.prev_length) {
            a4 = e5.strstart + e5.lookahead - M4, i4 = n2._tr_tally(e5, e5.strstart - 1 - e5.prev_match, e5.prev_length - M4), e5.lookahead -= e5.prev_length - 1, e5.prev_length -= 2;
            do
              ++e5.strstart <= a4 && (e5.ins_h = (e5.ins_h << e5.hash_shift ^ e5.window[e5.strstart + M4 - 1]) & e5.hash_mask, r3 = e5.prev[e5.strstart & e5.w_mask] = e5.head[e5.ins_h], e5.head[e5.ins_h] = e5.strstart);
            while (--e5.prev_length !== 0);
            if (e5.match_available = 0, e5.match_length = M4 - 1, e5.strstart++, i4 && (se3(e5, false), e5.strm.avail_out === 0)) return B4;
          } else if (e5.match_available) {
            if (i4 = n2._tr_tally(e5, 0, e5.window[e5.strstart - 1]), i4 && se3(e5, false), e5.strstart++, e5.lookahead--, e5.strm.avail_out === 0) return B4;
          } else e5.match_available = 1, e5.strstart++, e5.lookahead--;
        }
        return e5.match_available &&= (i4 = n2._tr_tally(e5, 0, e5.window[e5.strstart - 1]), 0), e5.insert = e5.strstart < M4 - 1 ? e5.strstart : M4 - 1, t4 === l3 ? (se3(e5, true), e5.strm.avail_out === 0 ? H3 : re3) : e5.last_lit && (se3(e5, false), e5.strm.avail_out === 0) ? B4 : V4;
      }
      function X3(e5, t4) {
        for (var r3, i4, a4, s4, c4 = e5.window; ; ) {
          if (e5.lookahead <= N4) {
            if (q3(e5), e5.lookahead <= N4 && t4 === o3) return B4;
            if (e5.lookahead === 0) break;
          }
          if (e5.match_length = 0, e5.lookahead >= M4 && e5.strstart > 0 && (a4 = e5.strstart - 1, i4 = c4[a4], i4 === c4[++a4] && i4 === c4[++a4] && i4 === c4[++a4])) {
            s4 = e5.strstart + N4;
            do
              ;
            while (i4 === c4[++a4] && i4 === c4[++a4] && i4 === c4[++a4] && i4 === c4[++a4] && i4 === c4[++a4] && i4 === c4[++a4] && i4 === c4[++a4] && i4 === c4[++a4] && a4 < s4);
            e5.match_length = N4 - (s4 - a4), e5.match_length > e5.lookahead && (e5.match_length = e5.lookahead);
          }
          if (e5.match_length >= M4 ? (r3 = n2._tr_tally(e5, 1, e5.match_length - M4), e5.lookahead -= e5.match_length, e5.strstart += e5.match_length, e5.match_length = 0) : (r3 = n2._tr_tally(e5, 0, e5.window[e5.strstart]), e5.lookahead--, e5.strstart++), r3 && (se3(e5, false), e5.strm.avail_out === 0)) return B4;
        }
        return e5.insert = 0, t4 === l3 ? (se3(e5, true), e5.strm.avail_out === 0 ? H3 : re3) : e5.last_lit && (se3(e5, false), e5.strm.avail_out === 0) ? B4 : V4;
      }
      function Z3(e5, t4) {
        for (var r3; ; ) {
          if (e5.lookahead === 0 && (q3(e5), e5.lookahead === 0)) {
            if (t4 === o3) return B4;
            break;
          }
          if (e5.match_length = 0, r3 = n2._tr_tally(e5, 0, e5.window[e5.strstart]), e5.lookahead--, e5.strstart++, r3 && (se3(e5, false), e5.strm.avail_out === 0)) return B4;
        }
        return e5.insert = 0, t4 === l3 ? (se3(e5, true), e5.strm.avail_out === 0 ? H3 : re3) : e5.last_lit && (se3(e5, false), e5.strm.avail_out === 0) ? B4 : V4;
      }
      function de3(e5, t4, n3, r3, i4) {
        this.good_length = e5, this.max_lazy = t4, this.nice_length = n3, this.max_chain = r3, this.func = i4;
      }
      var Q3 = [new de3(0, 0, 0, 0, ue3), new de3(4, 4, 8, 4, J3), new de3(4, 5, 16, 8, J3), new de3(4, 6, 32, 32, J3), new de3(4, 4, 16, 16, Y3), new de3(8, 16, 32, 32, Y3), new de3(8, 16, 128, 128, Y3), new de3(8, 32, 128, 256, Y3), new de3(32, 128, 258, 1024, Y3), new de3(32, 258, 258, 4096, Y3)];
      function fe3(e5) {
        e5.window_size = 2 * e5.w_size, W3(e5.head), e5.max_lazy_match = Q3[e5.level].max_lazy, e5.good_match = Q3[e5.level].good_length, e5.nice_match = Q3[e5.level].nice_length, e5.max_chain_length = Q3[e5.level].max_chain, e5.strstart = 0, e5.block_start = 0, e5.lookahead = 0, e5.insert = 0, e5.match_length = e5.prev_length = M4 - 1, e5.match_available = 0, e5.ins_h = 0;
      }
      function pe3() {
        this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = C4, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new t3.Buf16(A4 * 2), this.dyn_dtree = new t3.Buf16((2 * O4 + 1) * 2), this.bl_tree = new t3.Buf16((2 * k4 + 1) * 2), W3(this.dyn_ltree), W3(this.dyn_dtree), W3(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new t3.Buf16(j4 + 1), this.heap = new t3.Buf16(2 * D4 + 1), W3(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new t3.Buf16(2 * D4 + 1), W3(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
      }
      function ve3(e5) {
        var t4;
        return !e5 || !e5.state ? ae3(e5, p3) : (e5.total_in = e5.total_out = 0, e5.data_type = S4, t4 = e5.state, t4.pending = 0, t4.pending_out = 0, t4.wrap < 0 && (t4.wrap = -t4.wrap), t4.status = t4.wrap ? ee3 : ne3, e5.adler = t4.wrap === 2 ? 0 : 1, t4.last_flush = o3, n2._tr_init(t4), d3);
      }
      function ye3(e5) {
        var t4 = ve3(e5);
        return t4 === d3 && fe3(e5.state), t4;
      }
      function be3(e5, t4) {
        return !e5 || !e5.state || e5.state.wrap !== 2 ? p3 : (e5.state.gzhead = t4, d3);
      }
      function xe3(e5, n3, r3, i4, a4, o4) {
        if (!e5) return p3;
        var s4 = 1;
        if (n3 === g4 && (n3 = 6), i4 < 0 ? (s4 = 0, i4 = -i4) : i4 > 15 && (s4 = 2, i4 -= 16), a4 < 1 || a4 > w4 || r3 !== C4 || i4 < 8 || i4 > 15 || n3 < 0 || n3 > 9 || o4 < 0 || o4 > b4) return ae3(e5, p3);
        i4 === 8 && (i4 = 9);
        var c4 = new pe3();
        return e5.state = c4, c4.strm = e5, c4.wrap = s4, c4.gzhead = null, c4.w_bits = i4, c4.w_size = 1 << c4.w_bits, c4.w_mask = c4.w_size - 1, c4.hash_bits = a4 + 7, c4.hash_size = 1 << c4.hash_bits, c4.hash_mask = c4.hash_size - 1, c4.hash_shift = ~~((c4.hash_bits + M4 - 1) / M4), c4.window = new t3.Buf8(c4.w_size * 2), c4.head = new t3.Buf16(c4.hash_size), c4.prev = new t3.Buf16(c4.w_size), c4.lit_bufsize = 1 << a4 + 6, c4.pending_buf_size = c4.lit_bufsize * 4, c4.pending_buf = new t3.Buf8(c4.pending_buf_size), c4.d_buf = 1 * c4.lit_bufsize, c4.l_buf = 3 * c4.lit_bufsize, c4.level = n3, c4.strategy = o4, c4.method = r3, ye3(e5);
      }
      function Se3(e5, t4) {
        return xe3(e5, t4, C4, T4, E4, x4);
      }
      function Ce3(e5, t4) {
        var r3, a4, m5, g5;
        if (!e5 || !e5.state || t4 > u3 || t4 < 0) return e5 ? ae3(e5, p3) : p3;
        if (a4 = e5.state, !e5.output || !e5.input && e5.avail_in !== 0 || a4.status === z4 && t4 !== l3) return ae3(e5, e5.avail_out === 0 ? h4 : p3);
        if (a4.strm = e5, r3 = a4.last_flush, a4.last_flush = t4, a4.status === ee3) if (a4.wrap === 2) e5.adler = 0, G3(a4, 31), G3(a4, 139), G3(a4, 8), a4.gzhead ? (G3(a4, +!!a4.gzhead.text + (a4.gzhead.hcrc ? 2 : 0) + (a4.gzhead.extra ? 4 : 0) + (a4.gzhead.name ? 8 : 0) + (a4.gzhead.comment ? 16 : 0)), G3(a4, a4.gzhead.time & 255), G3(a4, a4.gzhead.time >> 8 & 255), G3(a4, a4.gzhead.time >> 16 & 255), G3(a4, a4.gzhead.time >> 24 & 255), G3(a4, a4.level === 9 ? 2 : a4.strategy >= v4 || a4.level < 2 ? 4 : 0), G3(a4, a4.gzhead.os & 255), a4.gzhead.extra && a4.gzhead.extra.length && (G3(a4, a4.gzhead.extra.length & 255), G3(a4, a4.gzhead.extra.length >> 8 & 255)), a4.gzhead.hcrc && (e5.adler = i3(e5.adler, a4.pending_buf, a4.pending, 0)), a4.gzindex = 0, a4.status = I4) : (G3(a4, 0), G3(a4, 0), G3(a4, 0), G3(a4, 0), G3(a4, 0), G3(a4, a4.level === 9 ? 2 : a4.strategy >= v4 || a4.level < 2 ? 4 : 0), G3(a4, ie3), a4.status = ne3);
        else {
          var _5 = C4 + (a4.w_bits - 8 << 4) << 8, b5 = -1;
          b5 = a4.strategy >= v4 || a4.level < 2 ? 0 : a4.level < 6 ? 1 : a4.level === 6 ? 2 : 3, _5 |= b5 << 6, a4.strstart !== 0 && (_5 |= F4), _5 += 31 - _5 % 31, a4.status = ne3, K3(a4, _5), a4.strstart !== 0 && (K3(a4, e5.adler >>> 16), K3(a4, e5.adler & 65535)), e5.adler = 1;
        }
        if (a4.status === I4) if (a4.gzhead.extra) {
          for (m5 = a4.pending; a4.gzindex < (a4.gzhead.extra.length & 65535) && !(a4.pending === a4.pending_buf_size && (a4.gzhead.hcrc && a4.pending > m5 && (e5.adler = i3(e5.adler, a4.pending_buf, a4.pending - m5, m5)), oe3(e5), m5 = a4.pending, a4.pending === a4.pending_buf_size)); ) G3(a4, a4.gzhead.extra[a4.gzindex] & 255), a4.gzindex++;
          a4.gzhead.hcrc && a4.pending > m5 && (e5.adler = i3(e5.adler, a4.pending_buf, a4.pending - m5, m5)), a4.gzindex === a4.gzhead.extra.length && (a4.gzindex = 0, a4.status = L4);
        } else a4.status = L4;
        if (a4.status === L4) if (a4.gzhead.name) {
          m5 = a4.pending;
          do {
            if (a4.pending === a4.pending_buf_size && (a4.gzhead.hcrc && a4.pending > m5 && (e5.adler = i3(e5.adler, a4.pending_buf, a4.pending - m5, m5)), oe3(e5), m5 = a4.pending, a4.pending === a4.pending_buf_size)) {
              g5 = 1;
              break;
            }
            g5 = a4.gzindex < a4.gzhead.name.length ? a4.gzhead.name.charCodeAt(a4.gzindex++) & 255 : 0, G3(a4, g5);
          } while (g5 !== 0);
          a4.gzhead.hcrc && a4.pending > m5 && (e5.adler = i3(e5.adler, a4.pending_buf, a4.pending - m5, m5)), g5 === 0 && (a4.gzindex = 0, a4.status = R4);
        } else a4.status = R4;
        if (a4.status === R4) if (a4.gzhead.comment) {
          m5 = a4.pending;
          do {
            if (a4.pending === a4.pending_buf_size && (a4.gzhead.hcrc && a4.pending > m5 && (e5.adler = i3(e5.adler, a4.pending_buf, a4.pending - m5, m5)), oe3(e5), m5 = a4.pending, a4.pending === a4.pending_buf_size)) {
              g5 = 1;
              break;
            }
            g5 = a4.gzindex < a4.gzhead.comment.length ? a4.gzhead.comment.charCodeAt(a4.gzindex++) & 255 : 0, G3(a4, g5);
          } while (g5 !== 0);
          a4.gzhead.hcrc && a4.pending > m5 && (e5.adler = i3(e5.adler, a4.pending_buf, a4.pending - m5, m5)), g5 === 0 && (a4.status = te3);
        } else a4.status = te3;
        if (a4.status === te3 && (a4.gzhead.hcrc ? (a4.pending + 2 > a4.pending_buf_size && oe3(e5), a4.pending + 2 <= a4.pending_buf_size && (G3(a4, e5.adler & 255), G3(a4, e5.adler >> 8 & 255), e5.adler = 0, a4.status = ne3)) : a4.status = ne3), a4.pending !== 0) {
          if (oe3(e5), e5.avail_out === 0) return a4.last_flush = -1, d3;
        } else if (e5.avail_in === 0 && U3(t4) <= U3(r3) && t4 !== l3) return ae3(e5, h4);
        if (a4.status === z4 && e5.avail_in !== 0) return ae3(e5, h4);
        if (e5.avail_in !== 0 || a4.lookahead !== 0 || t4 !== o3 && a4.status !== z4) {
          var x5 = a4.strategy === v4 ? Z3(a4, t4) : a4.strategy === y4 ? X3(a4, t4) : Q3[a4.level].func(a4, t4);
          if ((x5 === H3 || x5 === re3) && (a4.status = z4), x5 === B4 || x5 === H3) return e5.avail_out === 0 && (a4.last_flush = -1), d3;
          if (x5 === V4 && (t4 === s3 ? n2._tr_align(a4) : t4 !== u3 && (n2._tr_stored_block(a4, 0, 0, false), t4 === c3 && (W3(a4.head), a4.lookahead === 0 && (a4.strstart = 0, a4.block_start = 0, a4.insert = 0))), oe3(e5), e5.avail_out === 0)) return a4.last_flush = -1, d3;
        }
        return t4 === l3 ? a4.wrap <= 0 ? f3 : (a4.wrap === 2 ? (G3(a4, e5.adler & 255), G3(a4, e5.adler >> 8 & 255), G3(a4, e5.adler >> 16 & 255), G3(a4, e5.adler >> 24 & 255), G3(a4, e5.total_in & 255), G3(a4, e5.total_in >> 8 & 255), G3(a4, e5.total_in >> 16 & 255), G3(a4, e5.total_in >> 24 & 255)) : (K3(a4, e5.adler >>> 16), K3(a4, e5.adler & 65535)), oe3(e5), a4.wrap > 0 && (a4.wrap = -a4.wrap), a4.pending === 0 ? f3 : d3) : d3;
      }
      function we3(e5) {
        var t4;
        return !e5 || !e5.state ? p3 : (t4 = e5.state.status, t4 !== ee3 && t4 !== I4 && t4 !== L4 && t4 !== R4 && t4 !== te3 && t4 !== ne3 && t4 !== z4 ? ae3(e5, p3) : (e5.state = null, t4 === ne3 ? ae3(e5, m4) : d3));
      }
      function Te3(e5, n3) {
        var i4 = n3.length, a4, o4, s4, c4, l4, u4, f4, m5;
        if (!e5 || !e5.state || (a4 = e5.state, c4 = a4.wrap, c4 === 2 || c4 === 1 && a4.status !== ee3 || a4.lookahead)) return p3;
        for (c4 === 1 && (e5.adler = r2(e5.adler, n3, i4, 0)), a4.wrap = 0, i4 >= a4.w_size && (c4 === 0 && (W3(a4.head), a4.strstart = 0, a4.block_start = 0, a4.insert = 0), m5 = new t3.Buf8(a4.w_size), t3.arraySet(m5, n3, i4 - a4.w_size, a4.w_size, 0), n3 = m5, i4 = a4.w_size), l4 = e5.avail_in, u4 = e5.next_in, f4 = e5.input, e5.avail_in = i4, e5.next_in = 0, e5.input = n3, q3(a4); a4.lookahead >= M4; ) {
          o4 = a4.strstart, s4 = a4.lookahead - (M4 - 1);
          do
            a4.ins_h = (a4.ins_h << a4.hash_shift ^ a4.window[o4 + M4 - 1]) & a4.hash_mask, a4.prev[o4 & a4.w_mask] = a4.head[a4.ins_h], a4.head[a4.ins_h] = o4, o4++;
          while (--s4);
          a4.strstart = o4, a4.lookahead = M4 - 1, q3(a4);
        }
        return a4.strstart += a4.lookahead, a4.block_start = a4.strstart, a4.insert = a4.lookahead, a4.lookahead = 0, a4.match_length = a4.prev_length = M4 - 1, a4.match_available = 0, e5.next_in = u4, e5.input = f4, e5.avail_in = l4, a4.wrap = c4, d3;
      }
      e4.deflateInit = Se3, e4.deflateInit2 = xe3, e4.deflateReset = ye3, e4.deflateResetKeep = ve3, e4.deflateSetHeader = be3, e4.deflate = Ce3, e4.deflateEnd = we3, e4.deflateSetDictionary = Te3, e4.deflateInfo = `pako deflate (from Nodeca project)`;
    }));
    ye = f(((e4) => {
      var t3 = $(), n2 = true, r2 = true;
      try {
        String.fromCharCode.apply(null, [0]);
      } catch {
        n2 = false;
      }
      try {
        String.fromCharCode.apply(null, new Uint8Array(1));
      } catch {
        r2 = false;
      }
      for (var i3 = new t3.Buf8(256), a3 = 0; a3 < 256; a3++) i3[a3] = a3 >= 252 ? 6 : a3 >= 248 ? 5 : a3 >= 240 ? 4 : a3 >= 224 ? 3 : a3 >= 192 ? 2 : 1;
      i3[254] = i3[254] = 1, e4.string2buf = function(e5) {
        var n3, r3, i4, a4, o4, s3 = e5.length, c3 = 0;
        for (a4 = 0; a4 < s3; a4++) r3 = e5.charCodeAt(a4), (r3 & 64512) == 55296 && a4 + 1 < s3 && (i4 = e5.charCodeAt(a4 + 1), (i4 & 64512) == 56320 && (r3 = 65536 + (r3 - 55296 << 10) + (i4 - 56320), a4++)), c3 += r3 < 128 ? 1 : r3 < 2048 ? 2 : r3 < 65536 ? 3 : 4;
        for (n3 = new t3.Buf8(c3), o4 = 0, a4 = 0; o4 < c3; a4++) r3 = e5.charCodeAt(a4), (r3 & 64512) == 55296 && a4 + 1 < s3 && (i4 = e5.charCodeAt(a4 + 1), (i4 & 64512) == 56320 && (r3 = 65536 + (r3 - 55296 << 10) + (i4 - 56320), a4++)), r3 < 128 ? n3[o4++] = r3 : r3 < 2048 ? (n3[o4++] = 192 | r3 >>> 6, n3[o4++] = 128 | r3 & 63) : r3 < 65536 ? (n3[o4++] = 224 | r3 >>> 12, n3[o4++] = 128 | r3 >>> 6 & 63, n3[o4++] = 128 | r3 & 63) : (n3[o4++] = 240 | r3 >>> 18, n3[o4++] = 128 | r3 >>> 12 & 63, n3[o4++] = 128 | r3 >>> 6 & 63, n3[o4++] = 128 | r3 & 63);
        return n3;
      };
      function o3(e5, i4) {
        if (i4 < 65534 && (e5.subarray && r2 || !e5.subarray && n2)) return String.fromCharCode.apply(null, t3.shrinkBuf(e5, i4));
        for (var a4 = ``, o4 = 0; o4 < i4; o4++) a4 += String.fromCharCode(e5[o4]);
        return a4;
      }
      e4.buf2binstring = function(e5) {
        return o3(e5, e5.length);
      }, e4.binstring2buf = function(e5) {
        for (var n3 = new t3.Buf8(e5.length), r3 = 0, i4 = n3.length; r3 < i4; r3++) n3[r3] = e5.charCodeAt(r3);
        return n3;
      }, e4.buf2string = function(e5, t4) {
        var n3, r3, a4, s3, c3 = t4 || e5.length, l3 = Array(c3 * 2);
        for (r3 = 0, n3 = 0; n3 < c3; ) {
          if (a4 = e5[n3++], a4 < 128) {
            l3[r3++] = a4;
            continue;
          }
          if (s3 = i3[a4], s3 > 4) {
            l3[r3++] = 65533, n3 += s3 - 1;
            continue;
          }
          for (a4 &= s3 === 2 ? 31 : s3 === 3 ? 15 : 7; s3 > 1 && n3 < c3; ) a4 = a4 << 6 | e5[n3++] & 63, s3--;
          if (s3 > 1) {
            l3[r3++] = 65533;
            continue;
          }
          a4 < 65536 ? l3[r3++] = a4 : (a4 -= 65536, l3[r3++] = 55296 | a4 >> 10 & 1023, l3[r3++] = 56320 | a4 & 1023);
        }
        return o3(l3, r3);
      }, e4.utf8border = function(e5, t4) {
        var n3;
        for (t4 ||= e5.length, t4 > e5.length && (t4 = e5.length), n3 = t4 - 1; n3 >= 0 && (e5[n3] & 192) == 128; ) n3--;
        return n3 < 0 || n3 === 0 ? t4 : n3 + i3[e5[n3]] > t4 ? n3 : t4;
      };
    }));
    be = f(((e4, t3) => {
      function n2() {
        this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = ``, this.state = null, this.data_type = 2, this.adler = 0;
      }
      t3.exports = n2;
    }));
    xe = f(((e4) => {
      var t3 = ve(), n2 = $(), r2 = ye(), i3 = _e(), a3 = be(), o3 = Object.prototype.toString, s3 = 0, c3 = 4, l3 = 0, u3 = 1, d3 = 2, f3 = -1, p3 = 0, m4 = 8;
      function h4(e5) {
        if (!(this instanceof h4)) return new h4(e5);
        this.options = n2.assign({ level: f3, method: m4, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: p3, to: `` }, e5 || {});
        var s4 = this.options;
        s4.raw && s4.windowBits > 0 ? s4.windowBits = -s4.windowBits : s4.gzip && s4.windowBits > 0 && s4.windowBits < 16 && (s4.windowBits += 16), this.err = 0, this.msg = ``, this.ended = false, this.chunks = [], this.strm = new a3(), this.strm.avail_out = 0;
        var c4 = t3.deflateInit2(this.strm, s4.level, s4.method, s4.windowBits, s4.memLevel, s4.strategy);
        if (c4 !== l3) throw Error(i3[c4]);
        if (s4.header && t3.deflateSetHeader(this.strm, s4.header), s4.dictionary) {
          var u4 = typeof s4.dictionary == `string` ? r2.string2buf(s4.dictionary) : o3.call(s4.dictionary) === `[object ArrayBuffer]` ? new Uint8Array(s4.dictionary) : s4.dictionary;
          if (c4 = t3.deflateSetDictionary(this.strm, u4), c4 !== l3) throw Error(i3[c4]);
          this._dict_set = true;
        }
      }
      h4.prototype.push = function(e5, i4) {
        var a4 = this.strm, f4 = this.options.chunkSize, p4, m5;
        if (this.ended) return false;
        m5 = i4 === ~~i4 ? i4 : i4 === true ? c3 : s3, typeof e5 == `string` ? a4.input = r2.string2buf(e5) : o3.call(e5) === `[object ArrayBuffer]` ? a4.input = new Uint8Array(e5) : a4.input = e5, a4.next_in = 0, a4.avail_in = a4.input.length;
        do {
          if (a4.avail_out === 0 && (a4.output = new n2.Buf8(f4), a4.next_out = 0, a4.avail_out = f4), p4 = t3.deflate(a4, m5), p4 !== u3 && p4 !== l3) return this.onEnd(p4), this.ended = true, false;
          (a4.avail_out === 0 || a4.avail_in === 0 && (m5 === c3 || m5 === d3)) && (this.options.to === `string` ? this.onData(r2.buf2binstring(n2.shrinkBuf(a4.output, a4.next_out))) : this.onData(n2.shrinkBuf(a4.output, a4.next_out)));
        } while ((a4.avail_in > 0 || a4.avail_out === 0) && p4 !== u3);
        return m5 === c3 ? (p4 = t3.deflateEnd(this.strm), this.onEnd(p4), this.ended = true, p4 === l3) : m5 === d3 ? (this.onEnd(l3), a4.avail_out = 0, true) : true;
      }, h4.prototype.onData = function(e5) {
        this.chunks.push(e5);
      }, h4.prototype.onEnd = function(e5) {
        e5 === l3 && (this.options.to === `string` ? this.result = this.chunks.join(``) : this.result = n2.flattenChunks(this.chunks)), this.chunks = [], this.err = e5, this.msg = this.strm.msg;
      };
      function g4(e5, t4) {
        var n3 = new h4(t4);
        if (n3.push(e5, true), n3.err) throw n3.msg || i3[n3.err];
        return n3.result;
      }
      function _4(e5, t4) {
        return t4 ||= {}, t4.raw = true, g4(e5, t4);
      }
      function v4(e5, t4) {
        return t4 ||= {}, t4.gzip = true, g4(e5, t4);
      }
      e4.Deflate = h4, e4.deflate = g4, e4.deflateRaw = _4, e4.gzip = v4;
    }));
    Se = f(((e4, t3) => {
      var n2 = 30, r2 = 12;
      t3.exports = function(e5, t4) {
        var i3 = e5.state, a3 = e5.next_in, o3, s3, c3, l3, u3, d3, f3, p3, m4, h4, g4, _4, v4, y4, b4, x4, S4, C4, w4, T4, E4, D4 = e5.input, O4;
        o3 = a3 + (e5.avail_in - 5), s3 = e5.next_out, O4 = e5.output, c3 = s3 - (t4 - e5.avail_out), l3 = s3 + (e5.avail_out - 257), u3 = i3.dmax, d3 = i3.wsize, f3 = i3.whave, p3 = i3.wnext, m4 = i3.window, h4 = i3.hold, g4 = i3.bits, _4 = i3.lencode, v4 = i3.distcode, y4 = (1 << i3.lenbits) - 1, b4 = (1 << i3.distbits) - 1;
        top: do {
          g4 < 15 && (h4 += D4[a3++] << g4, g4 += 8, h4 += D4[a3++] << g4, g4 += 8), x4 = _4[h4 & y4];
          dolen: for (; ; ) {
            if (S4 = x4 >>> 24, h4 >>>= S4, g4 -= S4, S4 = x4 >>> 16 & 255, S4 === 0) O4[s3++] = x4 & 65535;
            else if (S4 & 16) {
              C4 = x4 & 65535, S4 &= 15, S4 && (g4 < S4 && (h4 += D4[a3++] << g4, g4 += 8), C4 += h4 & (1 << S4) - 1, h4 >>>= S4, g4 -= S4), g4 < 15 && (h4 += D4[a3++] << g4, g4 += 8, h4 += D4[a3++] << g4, g4 += 8), x4 = v4[h4 & b4];
              dodist: for (; ; ) {
                if (S4 = x4 >>> 24, h4 >>>= S4, g4 -= S4, S4 = x4 >>> 16 & 255, S4 & 16) {
                  if (w4 = x4 & 65535, S4 &= 15, g4 < S4 && (h4 += D4[a3++] << g4, g4 += 8, g4 < S4 && (h4 += D4[a3++] << g4, g4 += 8)), w4 += h4 & (1 << S4) - 1, w4 > u3) {
                    e5.msg = `invalid distance too far back`, i3.mode = n2;
                    break top;
                  }
                  if (h4 >>>= S4, g4 -= S4, S4 = s3 - c3, w4 > S4) {
                    if (S4 = w4 - S4, S4 > f3 && i3.sane) {
                      e5.msg = `invalid distance too far back`, i3.mode = n2;
                      break top;
                    }
                    if (T4 = 0, E4 = m4, p3 === 0) {
                      if (T4 += d3 - S4, S4 < C4) {
                        C4 -= S4;
                        do
                          O4[s3++] = m4[T4++];
                        while (--S4);
                        T4 = s3 - w4, E4 = O4;
                      }
                    } else if (p3 < S4) {
                      if (T4 += d3 + p3 - S4, S4 -= p3, S4 < C4) {
                        C4 -= S4;
                        do
                          O4[s3++] = m4[T4++];
                        while (--S4);
                        if (T4 = 0, p3 < C4) {
                          S4 = p3, C4 -= S4;
                          do
                            O4[s3++] = m4[T4++];
                          while (--S4);
                          T4 = s3 - w4, E4 = O4;
                        }
                      }
                    } else if (T4 += p3 - S4, S4 < C4) {
                      C4 -= S4;
                      do
                        O4[s3++] = m4[T4++];
                      while (--S4);
                      T4 = s3 - w4, E4 = O4;
                    }
                    for (; C4 > 2; ) O4[s3++] = E4[T4++], O4[s3++] = E4[T4++], O4[s3++] = E4[T4++], C4 -= 3;
                    C4 && (O4[s3++] = E4[T4++], C4 > 1 && (O4[s3++] = E4[T4++]));
                  } else {
                    T4 = s3 - w4;
                    do
                      O4[s3++] = O4[T4++], O4[s3++] = O4[T4++], O4[s3++] = O4[T4++], C4 -= 3;
                    while (C4 > 2);
                    C4 && (O4[s3++] = O4[T4++], C4 > 1 && (O4[s3++] = O4[T4++]));
                  }
                } else if (S4 & 64) {
                  e5.msg = `invalid distance code`, i3.mode = n2;
                  break top;
                } else {
                  x4 = v4[(x4 & 65535) + (h4 & (1 << S4) - 1)];
                  continue dodist;
                }
                break;
              }
            } else if (!(S4 & 64)) {
              x4 = _4[(x4 & 65535) + (h4 & (1 << S4) - 1)];
              continue dolen;
            } else if (S4 & 32) {
              i3.mode = r2;
              break top;
            } else {
              e5.msg = `invalid literal/length code`, i3.mode = n2;
              break top;
            }
            break;
          }
        } while (a3 < o3 && s3 < l3);
        C4 = g4 >> 3, a3 -= C4, g4 -= C4 << 3, h4 &= (1 << g4) - 1, e5.next_in = a3, e5.next_out = s3, e5.avail_in = a3 < o3 ? 5 + (o3 - a3) : 5 - (a3 - o3), e5.avail_out = s3 < l3 ? 257 + (l3 - s3) : 257 - (s3 - l3), i3.hold = h4, i3.bits = g4;
      };
    }));
    Ce = f(((e4, t3) => {
      var n2 = $(), r2 = 15, i3 = 852, a3 = 592, o3 = 0, s3 = 1, c3 = 2, l3 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], u3 = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], d3 = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], f3 = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
      t3.exports = function(e5, t4, p3, m4, h4, g4, _4, v4) {
        var y4 = v4.bits, b4 = 0, x4 = 0, S4 = 0, C4 = 0, w4 = 0, T4 = 0, E4 = 0, D4 = 0, O4 = 0, k4 = 0, A4, j4, M4, N4, P4, F4 = null, ee3 = 0, I4, L4 = new n2.Buf16(r2 + 1), R4 = new n2.Buf16(r2 + 1), te3 = null, ne3 = 0, z4, B4, V4;
        for (b4 = 0; b4 <= r2; b4++) L4[b4] = 0;
        for (x4 = 0; x4 < m4; x4++) L4[t4[p3 + x4]]++;
        for (w4 = y4, C4 = r2; C4 >= 1 && L4[C4] === 0; C4--) ;
        if (w4 > C4 && (w4 = C4), C4 === 0) return h4[g4++] = 20971520, h4[g4++] = 20971520, v4.bits = 1, 0;
        for (S4 = 1; S4 < C4 && L4[S4] === 0; S4++) ;
        for (w4 < S4 && (w4 = S4), D4 = 1, b4 = 1; b4 <= r2; b4++) if (D4 <<= 1, D4 -= L4[b4], D4 < 0) return -1;
        if (D4 > 0 && (e5 === o3 || C4 !== 1)) return -1;
        for (R4[1] = 0, b4 = 1; b4 < r2; b4++) R4[b4 + 1] = R4[b4] + L4[b4];
        for (x4 = 0; x4 < m4; x4++) t4[p3 + x4] !== 0 && (_4[R4[t4[p3 + x4]]++] = x4);
        if (e5 === o3 ? (F4 = te3 = _4, I4 = 19) : e5 === s3 ? (F4 = l3, ee3 -= 257, te3 = u3, ne3 -= 257, I4 = 256) : (F4 = d3, te3 = f3, I4 = -1), k4 = 0, x4 = 0, b4 = S4, P4 = g4, T4 = w4, E4 = 0, M4 = -1, O4 = 1 << w4, N4 = O4 - 1, e5 === s3 && O4 > i3 || e5 === c3 && O4 > a3) return 1;
        for (; ; ) {
          z4 = b4 - E4, _4[x4] < I4 ? (B4 = 0, V4 = _4[x4]) : _4[x4] > I4 ? (B4 = te3[ne3 + _4[x4]], V4 = F4[ee3 + _4[x4]]) : (B4 = 96, V4 = 0), A4 = 1 << b4 - E4, j4 = 1 << T4, S4 = j4;
          do
            j4 -= A4, h4[P4 + (k4 >> E4) + j4] = z4 << 24 | B4 << 16 | V4 | 0;
          while (j4 !== 0);
          for (A4 = 1 << b4 - 1; k4 & A4; ) A4 >>= 1;
          if (A4 === 0 ? k4 = 0 : (k4 &= A4 - 1, k4 += A4), x4++, --L4[b4] === 0) {
            if (b4 === C4) break;
            b4 = t4[p3 + _4[x4]];
          }
          if (b4 > w4 && (k4 & N4) !== M4) {
            for (E4 === 0 && (E4 = w4), P4 += S4, T4 = b4 - E4, D4 = 1 << T4; T4 + E4 < C4 && (D4 -= L4[T4 + E4], !(D4 <= 0)); ) T4++, D4 <<= 1;
            if (O4 += 1 << T4, e5 === s3 && O4 > i3 || e5 === c3 && O4 > a3) return 1;
            M4 = k4 & N4, h4[M4] = w4 << 24 | T4 << 16 | P4 - g4 | 0;
          }
        }
        return k4 !== 0 && (h4[P4 + k4] = b4 - E4 << 24 | 4194304), v4.bits = w4, 0;
      };
    }));
    we = f(((e4) => {
      var t3 = $(), n2 = he(), r2 = ge(), i3 = Se(), a3 = Ce(), o3 = 0, s3 = 1, c3 = 2, l3 = 4, u3 = 5, d3 = 6, f3 = 0, p3 = 1, m4 = 2, h4 = -2, g4 = -3, _4 = -4, v4 = -5, y4 = 8, b4 = 1, x4 = 2, S4 = 3, C4 = 4, w4 = 5, T4 = 6, E4 = 7, D4 = 8, O4 = 9, k4 = 10, A4 = 11, j4 = 12, M4 = 13, N4 = 14, P4 = 15, F4 = 16, ee3 = 17, I4 = 18, L4 = 19, R4 = 20, te3 = 21, ne3 = 22, z4 = 23, B4 = 24, V4 = 25, H3 = 26, re3 = 27, ie3 = 28, ae3 = 29, U3 = 30, W3 = 31, oe3 = 32, se3 = 852, G3 = 592, K3 = 15;
      function ce3(e5) {
        return (e5 >>> 24 & 255) + (e5 >>> 8 & 65280) + ((e5 & 65280) << 8) + ((e5 & 255) << 24);
      }
      function le3() {
        this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new t3.Buf16(320), this.work = new t3.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
      }
      function q3(e5) {
        var n3;
        return !e5 || !e5.state ? h4 : (n3 = e5.state, e5.total_in = e5.total_out = n3.total = 0, e5.msg = ``, n3.wrap && (e5.adler = n3.wrap & 1), n3.mode = b4, n3.last = 0, n3.havedict = 0, n3.dmax = 32768, n3.head = null, n3.hold = 0, n3.bits = 0, n3.lencode = n3.lendyn = new t3.Buf32(se3), n3.distcode = n3.distdyn = new t3.Buf32(G3), n3.sane = 1, n3.back = -1, f3);
      }
      function ue3(e5) {
        var t4;
        return !e5 || !e5.state ? h4 : (t4 = e5.state, t4.wsize = 0, t4.whave = 0, t4.wnext = 0, q3(e5));
      }
      function J3(e5, t4) {
        var n3, r3;
        return !e5 || !e5.state || (r3 = e5.state, t4 < 0 ? (n3 = 0, t4 = -t4) : (n3 = (t4 >> 4) + 1, t4 < 48 && (t4 &= 15)), t4 && (t4 < 8 || t4 > 15)) ? h4 : (r3.window !== null && r3.wbits !== t4 && (r3.window = null), r3.wrap = n3, r3.wbits = t4, ue3(e5));
      }
      function Y3(e5, t4) {
        var n3, r3;
        return e5 ? (r3 = new le3(), e5.state = r3, r3.window = null, n3 = J3(e5, t4), n3 !== f3 && (e5.state = null), n3) : h4;
      }
      function X3(e5) {
        return Y3(e5, K3);
      }
      var Z3 = true, de3, Q3;
      function fe3(e5) {
        if (Z3) {
          var n3;
          for (de3 = new t3.Buf32(512), Q3 = new t3.Buf32(32), n3 = 0; n3 < 144; ) e5.lens[n3++] = 8;
          for (; n3 < 256; ) e5.lens[n3++] = 9;
          for (; n3 < 280; ) e5.lens[n3++] = 7;
          for (; n3 < 288; ) e5.lens[n3++] = 8;
          for (a3(s3, e5.lens, 0, 288, de3, 0, e5.work, { bits: 9 }), n3 = 0; n3 < 32; ) e5.lens[n3++] = 5;
          a3(c3, e5.lens, 0, 32, Q3, 0, e5.work, { bits: 5 }), Z3 = false;
        }
        e5.lencode = de3, e5.lenbits = 9, e5.distcode = Q3, e5.distbits = 5;
      }
      function pe3(e5, n3, r3, i4) {
        var a4, o4 = e5.state;
        return o4.window === null && (o4.wsize = 1 << o4.wbits, o4.wnext = 0, o4.whave = 0, o4.window = new t3.Buf8(o4.wsize)), i4 >= o4.wsize ? (t3.arraySet(o4.window, n3, r3 - o4.wsize, o4.wsize, 0), o4.wnext = 0, o4.whave = o4.wsize) : (a4 = o4.wsize - o4.wnext, a4 > i4 && (a4 = i4), t3.arraySet(o4.window, n3, r3 - i4, a4, o4.wnext), i4 -= a4, i4 ? (t3.arraySet(o4.window, n3, r3 - i4, i4, 0), o4.wnext = i4, o4.whave = o4.wsize) : (o4.wnext += a4, o4.wnext === o4.wsize && (o4.wnext = 0), o4.whave < o4.wsize && (o4.whave += a4))), 0;
      }
      function me3(e5, se4) {
        var G4, K4, le4, q4, ue4, J4, Y4, X4, Z4, de4, Q4, $3, me4, he3, ge3 = 0, _e4, ve4, ye4, be3, xe3, Se3, Ce3, we3, Te3 = new t3.Buf8(4), Ee3, De3, Oe3 = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        if (!e5 || !e5.state || !e5.output || !e5.input && e5.avail_in !== 0) return h4;
        G4 = e5.state, G4.mode === j4 && (G4.mode = M4), ue4 = e5.next_out, le4 = e5.output, Y4 = e5.avail_out, q4 = e5.next_in, K4 = e5.input, J4 = e5.avail_in, X4 = G4.hold, Z4 = G4.bits, de4 = J4, Q4 = Y4, we3 = f3;
        inf_leave: for (; ; ) switch (G4.mode) {
          case b4:
            if (G4.wrap === 0) {
              G4.mode = M4;
              break;
            }
            for (; Z4 < 16; ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            if (G4.wrap & 2 && X4 === 35615) {
              G4.check = 0, Te3[0] = X4 & 255, Te3[1] = X4 >>> 8 & 255, G4.check = r2(G4.check, Te3, 2, 0), X4 = 0, Z4 = 0, G4.mode = x4;
              break;
            }
            if (G4.flags = 0, G4.head && (G4.head.done = false), !(G4.wrap & 1) || (((X4 & 255) << 8) + (X4 >> 8)) % 31) {
              e5.msg = `incorrect header check`, G4.mode = U3;
              break;
            }
            if ((X4 & 15) !== y4) {
              e5.msg = `unknown compression method`, G4.mode = U3;
              break;
            }
            if (X4 >>>= 4, Z4 -= 4, Ce3 = (X4 & 15) + 8, G4.wbits === 0) G4.wbits = Ce3;
            else if (Ce3 > G4.wbits) {
              e5.msg = `invalid window size`, G4.mode = U3;
              break;
            }
            G4.dmax = 1 << Ce3, e5.adler = G4.check = 1, G4.mode = X4 & 512 ? k4 : j4, X4 = 0, Z4 = 0;
            break;
          case x4:
            for (; Z4 < 16; ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            if (G4.flags = X4, (G4.flags & 255) !== y4) {
              e5.msg = `unknown compression method`, G4.mode = U3;
              break;
            }
            if (G4.flags & 57344) {
              e5.msg = `unknown header flags set`, G4.mode = U3;
              break;
            }
            G4.head && (G4.head.text = X4 >> 8 & 1), G4.flags & 512 && (Te3[0] = X4 & 255, Te3[1] = X4 >>> 8 & 255, G4.check = r2(G4.check, Te3, 2, 0)), X4 = 0, Z4 = 0, G4.mode = S4;
          case S4:
            for (; Z4 < 32; ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            G4.head && (G4.head.time = X4), G4.flags & 512 && (Te3[0] = X4 & 255, Te3[1] = X4 >>> 8 & 255, Te3[2] = X4 >>> 16 & 255, Te3[3] = X4 >>> 24 & 255, G4.check = r2(G4.check, Te3, 4, 0)), X4 = 0, Z4 = 0, G4.mode = C4;
          case C4:
            for (; Z4 < 16; ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            G4.head && (G4.head.xflags = X4 & 255, G4.head.os = X4 >> 8), G4.flags & 512 && (Te3[0] = X4 & 255, Te3[1] = X4 >>> 8 & 255, G4.check = r2(G4.check, Te3, 2, 0)), X4 = 0, Z4 = 0, G4.mode = w4;
          case w4:
            if (G4.flags & 1024) {
              for (; Z4 < 16; ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              G4.length = X4, G4.head && (G4.head.extra_len = X4), G4.flags & 512 && (Te3[0] = X4 & 255, Te3[1] = X4 >>> 8 & 255, G4.check = r2(G4.check, Te3, 2, 0)), X4 = 0, Z4 = 0;
            } else G4.head && (G4.head.extra = null);
            G4.mode = T4;
          case T4:
            if (G4.flags & 1024 && ($3 = G4.length, $3 > J4 && ($3 = J4), $3 && (G4.head && (Ce3 = G4.head.extra_len - G4.length, G4.head.extra || (G4.head.extra = Array(G4.head.extra_len)), t3.arraySet(G4.head.extra, K4, q4, $3, Ce3)), G4.flags & 512 && (G4.check = r2(G4.check, K4, $3, q4)), J4 -= $3, q4 += $3, G4.length -= $3), G4.length)) break inf_leave;
            G4.length = 0, G4.mode = E4;
          case E4:
            if (G4.flags & 2048) {
              if (J4 === 0) break inf_leave;
              $3 = 0;
              do
                Ce3 = K4[q4 + $3++], G4.head && Ce3 && G4.length < 65536 && (G4.head.name += String.fromCharCode(Ce3));
              while (Ce3 && $3 < J4);
              if (G4.flags & 512 && (G4.check = r2(G4.check, K4, $3, q4)), J4 -= $3, q4 += $3, Ce3) break inf_leave;
            } else G4.head && (G4.head.name = null);
            G4.length = 0, G4.mode = D4;
          case D4:
            if (G4.flags & 4096) {
              if (J4 === 0) break inf_leave;
              $3 = 0;
              do
                Ce3 = K4[q4 + $3++], G4.head && Ce3 && G4.length < 65536 && (G4.head.comment += String.fromCharCode(Ce3));
              while (Ce3 && $3 < J4);
              if (G4.flags & 512 && (G4.check = r2(G4.check, K4, $3, q4)), J4 -= $3, q4 += $3, Ce3) break inf_leave;
            } else G4.head && (G4.head.comment = null);
            G4.mode = O4;
          case O4:
            if (G4.flags & 512) {
              for (; Z4 < 16; ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              if (X4 !== (G4.check & 65535)) {
                e5.msg = `header crc mismatch`, G4.mode = U3;
                break;
              }
              X4 = 0, Z4 = 0;
            }
            G4.head && (G4.head.hcrc = G4.flags >> 9 & 1, G4.head.done = true), e5.adler = G4.check = 0, G4.mode = j4;
            break;
          case k4:
            for (; Z4 < 32; ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            e5.adler = G4.check = ce3(X4), X4 = 0, Z4 = 0, G4.mode = A4;
          case A4:
            if (G4.havedict === 0) return e5.next_out = ue4, e5.avail_out = Y4, e5.next_in = q4, e5.avail_in = J4, G4.hold = X4, G4.bits = Z4, m4;
            e5.adler = G4.check = 1, G4.mode = j4;
          case j4:
            if (se4 === u3 || se4 === d3) break inf_leave;
          case M4:
            if (G4.last) {
              X4 >>>= Z4 & 7, Z4 -= Z4 & 7, G4.mode = re3;
              break;
            }
            for (; Z4 < 3; ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            switch (G4.last = X4 & 1, X4 >>>= 1, --Z4, X4 & 3) {
              case 0:
                G4.mode = N4;
                break;
              case 1:
                if (fe3(G4), G4.mode = R4, se4 === d3) {
                  X4 >>>= 2, Z4 -= 2;
                  break inf_leave;
                }
                break;
              case 2:
                G4.mode = ee3;
                break;
              case 3:
                e5.msg = `invalid block type`, G4.mode = U3;
            }
            X4 >>>= 2, Z4 -= 2;
            break;
          case N4:
            for (X4 >>>= Z4 & 7, Z4 -= Z4 & 7; Z4 < 32; ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            if ((X4 & 65535) != (X4 >>> 16 ^ 65535)) {
              e5.msg = `invalid stored block lengths`, G4.mode = U3;
              break;
            }
            if (G4.length = X4 & 65535, X4 = 0, Z4 = 0, G4.mode = P4, se4 === d3) break inf_leave;
          case P4:
            G4.mode = F4;
          case F4:
            if ($3 = G4.length, $3) {
              if ($3 > J4 && ($3 = J4), $3 > Y4 && ($3 = Y4), $3 === 0) break inf_leave;
              t3.arraySet(le4, K4, q4, $3, ue4), J4 -= $3, q4 += $3, Y4 -= $3, ue4 += $3, G4.length -= $3;
              break;
            }
            G4.mode = j4;
            break;
          case ee3:
            for (; Z4 < 14; ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            if (G4.nlen = (X4 & 31) + 257, X4 >>>= 5, Z4 -= 5, G4.ndist = (X4 & 31) + 1, X4 >>>= 5, Z4 -= 5, G4.ncode = (X4 & 15) + 4, X4 >>>= 4, Z4 -= 4, G4.nlen > 286 || G4.ndist > 30) {
              e5.msg = `too many length or distance symbols`, G4.mode = U3;
              break;
            }
            G4.have = 0, G4.mode = I4;
          case I4:
            for (; G4.have < G4.ncode; ) {
              for (; Z4 < 3; ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              G4.lens[Oe3[G4.have++]] = X4 & 7, X4 >>>= 3, Z4 -= 3;
            }
            for (; G4.have < 19; ) G4.lens[Oe3[G4.have++]] = 0;
            if (G4.lencode = G4.lendyn, G4.lenbits = 7, Ee3 = { bits: G4.lenbits }, we3 = a3(o3, G4.lens, 0, 19, G4.lencode, 0, G4.work, Ee3), G4.lenbits = Ee3.bits, we3) {
              e5.msg = `invalid code lengths set`, G4.mode = U3;
              break;
            }
            G4.have = 0, G4.mode = L4;
          case L4:
            for (; G4.have < G4.nlen + G4.ndist; ) {
              for (; ge3 = G4.lencode[X4 & (1 << G4.lenbits) - 1], _e4 = ge3 >>> 24, ve4 = ge3 >>> 16 & 255, ye4 = ge3 & 65535, !(_e4 <= Z4); ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              if (ye4 < 16) X4 >>>= _e4, Z4 -= _e4, G4.lens[G4.have++] = ye4;
              else {
                if (ye4 === 16) {
                  for (De3 = _e4 + 2; Z4 < De3; ) {
                    if (J4 === 0) break inf_leave;
                    J4--, X4 += K4[q4++] << Z4, Z4 += 8;
                  }
                  if (X4 >>>= _e4, Z4 -= _e4, G4.have === 0) {
                    e5.msg = `invalid bit length repeat`, G4.mode = U3;
                    break;
                  }
                  Ce3 = G4.lens[G4.have - 1], $3 = 3 + (X4 & 3), X4 >>>= 2, Z4 -= 2;
                } else if (ye4 === 17) {
                  for (De3 = _e4 + 3; Z4 < De3; ) {
                    if (J4 === 0) break inf_leave;
                    J4--, X4 += K4[q4++] << Z4, Z4 += 8;
                  }
                  X4 >>>= _e4, Z4 -= _e4, Ce3 = 0, $3 = 3 + (X4 & 7), X4 >>>= 3, Z4 -= 3;
                } else {
                  for (De3 = _e4 + 7; Z4 < De3; ) {
                    if (J4 === 0) break inf_leave;
                    J4--, X4 += K4[q4++] << Z4, Z4 += 8;
                  }
                  X4 >>>= _e4, Z4 -= _e4, Ce3 = 0, $3 = 11 + (X4 & 127), X4 >>>= 7, Z4 -= 7;
                }
                if (G4.have + $3 > G4.nlen + G4.ndist) {
                  e5.msg = `invalid bit length repeat`, G4.mode = U3;
                  break;
                }
                for (; $3--; ) G4.lens[G4.have++] = Ce3;
              }
            }
            if (G4.mode === U3) break;
            if (G4.lens[256] === 0) {
              e5.msg = `invalid code -- missing end-of-block`, G4.mode = U3;
              break;
            }
            if (G4.lenbits = 9, Ee3 = { bits: G4.lenbits }, we3 = a3(s3, G4.lens, 0, G4.nlen, G4.lencode, 0, G4.work, Ee3), G4.lenbits = Ee3.bits, we3) {
              e5.msg = `invalid literal/lengths set`, G4.mode = U3;
              break;
            }
            if (G4.distbits = 6, G4.distcode = G4.distdyn, Ee3 = { bits: G4.distbits }, we3 = a3(c3, G4.lens, G4.nlen, G4.ndist, G4.distcode, 0, G4.work, Ee3), G4.distbits = Ee3.bits, we3) {
              e5.msg = `invalid distances set`, G4.mode = U3;
              break;
            }
            if (G4.mode = R4, se4 === d3) break inf_leave;
          case R4:
            G4.mode = te3;
          case te3:
            if (J4 >= 6 && Y4 >= 258) {
              e5.next_out = ue4, e5.avail_out = Y4, e5.next_in = q4, e5.avail_in = J4, G4.hold = X4, G4.bits = Z4, i3(e5, Q4), ue4 = e5.next_out, le4 = e5.output, Y4 = e5.avail_out, q4 = e5.next_in, K4 = e5.input, J4 = e5.avail_in, X4 = G4.hold, Z4 = G4.bits, G4.mode === j4 && (G4.back = -1);
              break;
            }
            for (G4.back = 0; ge3 = G4.lencode[X4 & (1 << G4.lenbits) - 1], _e4 = ge3 >>> 24, ve4 = ge3 >>> 16 & 255, ye4 = ge3 & 65535, !(_e4 <= Z4); ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            if (ve4 && !(ve4 & 240)) {
              for (be3 = _e4, xe3 = ve4, Se3 = ye4; ge3 = G4.lencode[Se3 + ((X4 & (1 << be3 + xe3) - 1) >> be3)], _e4 = ge3 >>> 24, ve4 = ge3 >>> 16 & 255, ye4 = ge3 & 65535, !(be3 + _e4 <= Z4); ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              X4 >>>= be3, Z4 -= be3, G4.back += be3;
            }
            if (X4 >>>= _e4, Z4 -= _e4, G4.back += _e4, G4.length = ye4, ve4 === 0) {
              G4.mode = H3;
              break;
            }
            if (ve4 & 32) {
              G4.back = -1, G4.mode = j4;
              break;
            }
            if (ve4 & 64) {
              e5.msg = `invalid literal/length code`, G4.mode = U3;
              break;
            }
            G4.extra = ve4 & 15, G4.mode = ne3;
          case ne3:
            if (G4.extra) {
              for (De3 = G4.extra; Z4 < De3; ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              G4.length += X4 & (1 << G4.extra) - 1, X4 >>>= G4.extra, Z4 -= G4.extra, G4.back += G4.extra;
            }
            G4.was = G4.length, G4.mode = z4;
          case z4:
            for (; ge3 = G4.distcode[X4 & (1 << G4.distbits) - 1], _e4 = ge3 >>> 24, ve4 = ge3 >>> 16 & 255, ye4 = ge3 & 65535, !(_e4 <= Z4); ) {
              if (J4 === 0) break inf_leave;
              J4--, X4 += K4[q4++] << Z4, Z4 += 8;
            }
            if (!(ve4 & 240)) {
              for (be3 = _e4, xe3 = ve4, Se3 = ye4; ge3 = G4.distcode[Se3 + ((X4 & (1 << be3 + xe3) - 1) >> be3)], _e4 = ge3 >>> 24, ve4 = ge3 >>> 16 & 255, ye4 = ge3 & 65535, !(be3 + _e4 <= Z4); ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              X4 >>>= be3, Z4 -= be3, G4.back += be3;
            }
            if (X4 >>>= _e4, Z4 -= _e4, G4.back += _e4, ve4 & 64) {
              e5.msg = `invalid distance code`, G4.mode = U3;
              break;
            }
            G4.offset = ye4, G4.extra = ve4 & 15, G4.mode = B4;
          case B4:
            if (G4.extra) {
              for (De3 = G4.extra; Z4 < De3; ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              G4.offset += X4 & (1 << G4.extra) - 1, X4 >>>= G4.extra, Z4 -= G4.extra, G4.back += G4.extra;
            }
            if (G4.offset > G4.dmax) {
              e5.msg = `invalid distance too far back`, G4.mode = U3;
              break;
            }
            G4.mode = V4;
          case V4:
            if (Y4 === 0) break inf_leave;
            if ($3 = Q4 - Y4, G4.offset > $3) {
              if ($3 = G4.offset - $3, $3 > G4.whave && G4.sane) {
                e5.msg = `invalid distance too far back`, G4.mode = U3;
                break;
              }
              $3 > G4.wnext ? ($3 -= G4.wnext, me4 = G4.wsize - $3) : me4 = G4.wnext - $3, $3 > G4.length && ($3 = G4.length), he3 = G4.window;
            } else he3 = le4, me4 = ue4 - G4.offset, $3 = G4.length;
            $3 > Y4 && ($3 = Y4), Y4 -= $3, G4.length -= $3;
            do
              le4[ue4++] = he3[me4++];
            while (--$3);
            G4.length === 0 && (G4.mode = te3);
            break;
          case H3:
            if (Y4 === 0) break inf_leave;
            le4[ue4++] = G4.length, Y4--, G4.mode = te3;
            break;
          case re3:
            if (G4.wrap) {
              for (; Z4 < 32; ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 |= K4[q4++] << Z4, Z4 += 8;
              }
              if (Q4 -= Y4, e5.total_out += Q4, G4.total += Q4, Q4 && (e5.adler = G4.check = G4.flags ? r2(G4.check, le4, Q4, ue4 - Q4) : n2(G4.check, le4, Q4, ue4 - Q4)), Q4 = Y4, (G4.flags ? X4 : ce3(X4)) !== G4.check) {
                e5.msg = `incorrect data check`, G4.mode = U3;
                break;
              }
              X4 = 0, Z4 = 0;
            }
            G4.mode = ie3;
          case ie3:
            if (G4.wrap && G4.flags) {
              for (; Z4 < 32; ) {
                if (J4 === 0) break inf_leave;
                J4--, X4 += K4[q4++] << Z4, Z4 += 8;
              }
              if (X4 !== (G4.total & 4294967295)) {
                e5.msg = `incorrect length check`, G4.mode = U3;
                break;
              }
              X4 = 0, Z4 = 0;
            }
            G4.mode = ae3;
          case ae3:
            we3 = p3;
            break inf_leave;
          case U3:
            we3 = g4;
            break inf_leave;
          case W3:
            return _4;
          case oe3:
          default:
            return h4;
        }
        return e5.next_out = ue4, e5.avail_out = Y4, e5.next_in = q4, e5.avail_in = J4, G4.hold = X4, G4.bits = Z4, (G4.wsize || Q4 !== e5.avail_out && G4.mode < U3 && (G4.mode < re3 || se4 !== l3)) && pe3(e5, e5.output, e5.next_out, Q4 - e5.avail_out) ? (G4.mode = W3, _4) : (de4 -= e5.avail_in, Q4 -= e5.avail_out, e5.total_in += de4, e5.total_out += Q4, G4.total += Q4, G4.wrap && Q4 && (e5.adler = G4.check = G4.flags ? r2(G4.check, le4, Q4, e5.next_out - Q4) : n2(G4.check, le4, Q4, e5.next_out - Q4)), e5.data_type = G4.bits + (G4.last ? 64 : 0) + (G4.mode === j4 ? 128 : 0) + (G4.mode === R4 || G4.mode === P4 ? 256 : 0), (de4 === 0 && Q4 === 0 || se4 === l3) && we3 === f3 && (we3 = v4), we3);
      }
      function _e3(e5) {
        if (!e5 || !e5.state) return h4;
        var t4 = e5.state;
        return t4.window &&= null, e5.state = null, f3;
      }
      function ve3(e5, t4) {
        var n3;
        return !e5 || !e5.state || (n3 = e5.state, !(n3.wrap & 2)) ? h4 : (n3.head = t4, t4.done = false, f3);
      }
      function ye3(e5, t4) {
        var r3 = t4.length, i4, a4, o4;
        return !e5 || !e5.state || (i4 = e5.state, i4.wrap !== 0 && i4.mode !== A4) ? h4 : i4.mode === A4 && (a4 = 1, a4 = n2(a4, t4, r3, 0), a4 !== i4.check) ? g4 : (o4 = pe3(e5, t4, r3, r3), o4 ? (i4.mode = W3, _4) : (i4.havedict = 1, f3));
      }
      e4.inflateReset = ue3, e4.inflateReset2 = J3, e4.inflateResetKeep = q3, e4.inflateInit = X3, e4.inflateInit2 = Y3, e4.inflate = me3, e4.inflateEnd = _e3, e4.inflateGetHeader = ve3, e4.inflateSetDictionary = ye3, e4.inflateInfo = `pako inflate (from Nodeca project)`;
    }));
    Te = f(((e4, t3) => {
      t3.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
    }));
    Ee = f(((e4, t3) => {
      function n2() {
        this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = ``, this.comment = ``, this.hcrc = 0, this.done = false;
      }
      t3.exports = n2;
    }));
    De = f(((e4) => {
      var t3 = we(), n2 = $(), r2 = ye(), i3 = Te(), a3 = _e(), o3 = be(), s3 = Ee(), c3 = Object.prototype.toString;
      function l3(e5) {
        if (!(this instanceof l3)) return new l3(e5);
        this.options = n2.assign({ chunkSize: 16384, windowBits: 0, to: `` }, e5 || {});
        var u4 = this.options;
        u4.raw && u4.windowBits >= 0 && u4.windowBits < 16 && (u4.windowBits = -u4.windowBits, u4.windowBits === 0 && (u4.windowBits = -15)), u4.windowBits >= 0 && u4.windowBits < 16 && !(e5 && e5.windowBits) && (u4.windowBits += 32), u4.windowBits > 15 && u4.windowBits < 48 && (u4.windowBits & 15 || (u4.windowBits |= 15)), this.err = 0, this.msg = ``, this.ended = false, this.chunks = [], this.strm = new o3(), this.strm.avail_out = 0;
        var d4 = t3.inflateInit2(this.strm, u4.windowBits);
        if (d4 !== i3.Z_OK || (this.header = new s3(), t3.inflateGetHeader(this.strm, this.header), u4.dictionary && (typeof u4.dictionary == `string` ? u4.dictionary = r2.string2buf(u4.dictionary) : c3.call(u4.dictionary) === `[object ArrayBuffer]` && (u4.dictionary = new Uint8Array(u4.dictionary)), u4.raw && (d4 = t3.inflateSetDictionary(this.strm, u4.dictionary), d4 !== i3.Z_OK)))) throw Error(a3[d4]);
      }
      l3.prototype.push = function(e5, a4) {
        var o4 = this.strm, s4 = this.options.chunkSize, l4 = this.options.dictionary, u4, d4, f3, p3, m4, h4 = false;
        if (this.ended) return false;
        d4 = a4 === ~~a4 ? a4 : a4 === true ? i3.Z_FINISH : i3.Z_NO_FLUSH, typeof e5 == `string` ? o4.input = r2.binstring2buf(e5) : c3.call(e5) === `[object ArrayBuffer]` ? o4.input = new Uint8Array(e5) : o4.input = e5, o4.next_in = 0, o4.avail_in = o4.input.length;
        do {
          if (o4.avail_out === 0 && (o4.output = new n2.Buf8(s4), o4.next_out = 0, o4.avail_out = s4), u4 = t3.inflate(o4, i3.Z_NO_FLUSH), u4 === i3.Z_NEED_DICT && l4 && (u4 = t3.inflateSetDictionary(this.strm, l4)), u4 === i3.Z_BUF_ERROR && h4 === true && (u4 = i3.Z_OK, h4 = false), u4 !== i3.Z_STREAM_END && u4 !== i3.Z_OK) return this.onEnd(u4), this.ended = true, false;
          o4.next_out && (o4.avail_out === 0 || u4 === i3.Z_STREAM_END || o4.avail_in === 0 && (d4 === i3.Z_FINISH || d4 === i3.Z_SYNC_FLUSH)) && (this.options.to === `string` ? (f3 = r2.utf8border(o4.output, o4.next_out), p3 = o4.next_out - f3, m4 = r2.buf2string(o4.output, f3), o4.next_out = p3, o4.avail_out = s4 - p3, p3 && n2.arraySet(o4.output, o4.output, f3, p3, 0), this.onData(m4)) : this.onData(n2.shrinkBuf(o4.output, o4.next_out))), o4.avail_in === 0 && o4.avail_out === 0 && (h4 = true);
        } while ((o4.avail_in > 0 || o4.avail_out === 0) && u4 !== i3.Z_STREAM_END);
        return u4 === i3.Z_STREAM_END && (d4 = i3.Z_FINISH), d4 === i3.Z_FINISH ? (u4 = t3.inflateEnd(this.strm), this.onEnd(u4), this.ended = true, u4 === i3.Z_OK) : d4 === i3.Z_SYNC_FLUSH ? (this.onEnd(i3.Z_OK), o4.avail_out = 0, true) : true;
      }, l3.prototype.onData = function(e5) {
        this.chunks.push(e5);
      }, l3.prototype.onEnd = function(e5) {
        e5 === i3.Z_OK && (this.options.to === `string` ? this.result = this.chunks.join(``) : this.result = n2.flattenChunks(this.chunks)), this.chunks = [], this.err = e5, this.msg = this.strm.msg;
      };
      function u3(e5, t4) {
        var n3 = new l3(t4);
        if (n3.push(e5, true), n3.err) throw n3.msg || a3[n3.err];
        return n3.result;
      }
      function d3(e5, t4) {
        return t4 ||= {}, t4.raw = true, u3(e5, t4);
      }
      e4.Inflate = l3, e4.inflate = u3, e4.inflateRaw = d3, e4.ungzip = u3;
    }));
    Oe = f(((e4, t3) => {
      var n2 = $().assign, r2 = xe(), i3 = De(), a3 = Te(), o3 = {};
      n2(o3, r2, i3, a3), t3.exports = o3;
    }));
    ke = f(((e4, t3) => {
      let n2 = (e5, t4) => function(...n3) {
        let r2 = t4.promiseModule;
        return new r2((r3, i3) => {
          t4.multiArgs ? n3.push((...e6) => {
            t4.errorFirst ? e6[0] ? i3(e6) : (e6.shift(), r3(e6)) : r3(e6);
          }) : t4.errorFirst ? n3.push((e6, t5) => {
            e6 ? i3(e6) : r3(t5);
          }) : n3.push(r3), e5.apply(this, n3);
        });
      };
      t3.exports = (e5, t4) => {
        t4 = Object.assign({ exclude: [/.+(Sync|Stream)$/], errorFirst: true, promiseModule: Promise }, t4);
        let r2 = typeof e5;
        if (!(e5 !== null && (r2 === `object` || r2 === `function`))) throw TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${e5 === null ? `null` : r2}\``);
        let i3 = (e6) => {
          let n3 = (t5) => typeof t5 == `string` ? e6 === t5 : t5.test(e6);
          return t4.include ? t4.include.some(n3) : !t4.exclude.some(n3);
        }, a3;
        a3 = r2 === `function` ? function(...r3) {
          return t4.excludeMain ? e5(...r3) : n2(e5, t4).apply(this, r3);
        } : Object.create(Object.getPrototypeOf(e5));
        for (let r3 in e5) {
          let o3 = e5[r3];
          a3[r3] = typeof o3 == `function` && i3(r3) ? n2(o3, t4) : o3;
        }
        return a3;
      };
    }));
    Ae = f(((e4, t3) => {
      function n2(e5) {
        return Array.isArray(e5) ? e5 : [e5];
      }
      let r2 = /^\s+$/, i3 = /(?:[^\\]|^)\\$/, a3 = /^\\!/, o3 = /^\\#/, s3 = /\r?\n/g, c3 = /^\.*\/|^\.+$/, l3 = `node-ignore`;
      typeof Symbol < `u` && (l3 = /* @__PURE__ */ Symbol.for(`node-ignore`));
      let u3 = l3, d3 = (e5, t4, n3) => Object.defineProperty(e5, t4, { value: n3 }), f3 = /([0-z])-([0-z])/g, p3 = () => false, m4 = (e5) => e5.replace(f3, (e6, t4, n3) => t4.charCodeAt(0) <= n3.charCodeAt(0) ? e6 : ``), h4 = (e5) => {
        let { length: t4 } = e5;
        return e5.slice(0, t4 - t4 % 2);
      }, g4 = [[/^\uFEFF/, () => ``], [/((?:\\\\)*?)(\\?\s+)$/, (e5, t4, n3) => t4 + (n3.indexOf(`\\`) === 0 ? ` ` : ``)], [/(\\+?)\s/g, (e5, t4) => {
        let { length: n3 } = t4;
        return t4.slice(0, n3 - n3 % 2) + ` `;
      }], [/[\\$.|*+(){^]/g, (e5) => `\\${e5}`], [/(?!\\)\?/g, () => `[^/]`], [/^\//, () => `^`], [/\//g, () => `\\/`], [/^\^*\\\*\\\*\\\//, () => `^(?:.*\\/)?`], [/^(?=[^^])/, function() {
        return /\/(?!$)/.test(this) ? `^` : `(?:^|\\/)`;
      }], [/\\\/\\\*\\\*(?=\\\/|$)/g, (e5, t4, n3) => t4 + 6 < n3.length ? `(?:\\/[^\\/]+)*` : `\\/.+`], [/(^|[^\\]+)(\\\*)+(?=.+)/g, (e5, t4, n3) => t4 + n3.replace(/\\\*/g, `[^\\/]*`)], [/\\\\\\(?=[$.|*+(){^])/g, () => `\\`], [/\\\\/g, () => `\\`], [/(\\)?\[([^\]/]*?)(\\*)($|\])/g, (e5, t4, n3, r3, i4) => t4 === `\\` ? `\\[${n3}${h4(r3)}${i4}` : i4 === `]` && r3.length % 2 == 0 ? `[${m4(n3)}${r3}]` : `[]`], [/(?:[^*])$/, (e5) => /\/$/.test(e5) ? `${e5}$` : `${e5}(?=$|\\/$)`], [/(\^|\\\/)?\\\*$/, (e5, t4) => `${t4 ? `${t4}[^/]+` : `[^/]*`}(?=$|\\/$)`]], _4 = /* @__PURE__ */ Object.create(null), v4 = (e5, t4) => {
        let n3 = _4[e5];
        return n3 || (n3 = g4.reduce((t5, [n4, r3]) => t5.replace(n4, r3.bind(e5)), e5), _4[e5] = n3), t4 ? new RegExp(n3, `i`) : new RegExp(n3);
      }, y4 = (e5) => typeof e5 == `string`, b4 = (e5) => e5 && y4(e5) && !r2.test(e5) && !i3.test(e5) && e5.indexOf(`#`) !== 0, x4 = (e5) => e5.split(s3);
      var S4 = class {
        constructor(e5, t4, n3, r3) {
          this.origin = e5, this.pattern = t4, this.negative = n3, this.regex = r3;
        }
      };
      let C4 = (e5, t4) => {
        let n3 = e5, r3 = false;
        e5.indexOf(`!`) === 0 && (r3 = true, e5 = e5.substr(1)), e5 = e5.replace(a3, `!`).replace(o3, `#`);
        let i4 = v4(e5, t4);
        return new S4(n3, e5, r3, i4);
      }, w4 = (e5, t4) => {
        throw new t4(e5);
      }, T4 = (e5, t4, n3) => y4(e5) ? e5 ? T4.isNotRelative(e5) ? n3(`path should be a \`path.relative()\`d string, but got "${t4}"`, RangeError) : true : n3(`path must not be empty`, TypeError) : n3(`path must be a string, but got \`${t4}\``, TypeError), E4 = (e5) => c3.test(e5);
      T4.isNotRelative = E4, T4.convert = (e5) => e5;
      var D4 = class {
        constructor({ ignorecase: e5 = true, ignoreCase: t4 = e5, allowRelativePaths: n3 = false } = {}) {
          d3(this, u3, true), this._rules = [], this._ignoreCase = t4, this._allowRelativePaths = n3, this._initCache();
        }
        _initCache() {
          this._ignoreCache = /* @__PURE__ */ Object.create(null), this._testCache = /* @__PURE__ */ Object.create(null);
        }
        _addPattern(e5) {
          if (e5 && e5[u3]) {
            this._rules = this._rules.concat(e5._rules), this._added = true;
            return;
          }
          if (b4(e5)) {
            let t4 = C4(e5, this._ignoreCase);
            this._added = true, this._rules.push(t4);
          }
        }
        add(e5) {
          return this._added = false, n2(y4(e5) ? x4(e5) : e5).forEach(this._addPattern, this), this._added && this._initCache(), this;
        }
        addPattern(e5) {
          return this.add(e5);
        }
        _testOne(e5, t4) {
          let n3 = false, r3 = false;
          return this._rules.forEach((i4) => {
            let { negative: a4 } = i4;
            r3 === a4 && n3 !== r3 || a4 && !n3 && !r3 && !t4 || i4.regex.test(e5) && (n3 = !a4, r3 = a4);
          }), { ignored: n3, unignored: r3 };
        }
        _test(e5, t4, n3, r3) {
          let i4 = e5 && T4.convert(e5);
          return T4(i4, e5, this._allowRelativePaths ? p3 : w4), this._t(i4, t4, n3, r3);
        }
        _t(e5, t4, n3, r3) {
          if (e5 in t4) return t4[e5];
          if (r3 ||= e5.split(`/`), r3.pop(), !r3.length) return t4[e5] = this._testOne(e5, n3);
          let i4 = this._t(r3.join(`/`) + `/`, t4, n3, r3);
          return t4[e5] = i4.ignored ? i4 : this._testOne(e5, n3);
        }
        ignores(e5) {
          return this._test(e5, this._ignoreCache, false).ignored;
        }
        createFilter() {
          return (e5) => !this.ignores(e5);
        }
        filter(e5) {
          return n2(e5).filter(this.createFilter());
        }
        test(e5) {
          return this._test(e5, this._testCache, true);
        }
      };
      let O4 = (e5) => new D4(e5);
      if (O4.isPathValid = (e5) => T4(e5 && T4.convert(e5), e5, p3), O4.default = O4, t3.exports = O4, typeof process < `u` && (process.env && process.env.IGNORE_TEST_WIN32 || process.platform === `win32`)) {
        T4.convert = (e6) => /^\\\\\?\\/.test(e6) || /["<>|\u0000-\u001F]+/u.test(e6) ? e6 : e6.replace(/\\/g, `/`);
        let e5 = /^[a-z]:\//i;
        T4.isNotRelative = (t4) => e5.test(t4) || E4(t4);
      }
    }));
    je = f(((e4, t3) => {
      function n2(e5) {
        return e5.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
      }
      function r2(e5, t4, r3) {
        return t4 = t4 instanceof RegExp ? t4 : new RegExp(n2(t4), `g`), e5.replace(t4, r3);
      }
      t3.exports = { clean: function(e5) {
        if (typeof e5 != `string`) throw Error(`Expected a string, received: ` + e5);
        return e5 = r2(e5, `./`, `/`), e5 = r2(e5, `..`, `.`), e5 = r2(e5, ` `, `-`), e5 = r2(e5, /^[~^:?*\\\-]/g, ``), e5 = r2(e5, /[~^:?*\\]/g, `-`), e5 = r2(e5, /[~^:?*\\\-]$/g, ``), e5 = r2(e5, `@{`, `-`), e5 = r2(e5, /\.$/g, ``), e5 = r2(e5, /\/$/g, ``), e5 = r2(e5, /\.lock$/g, ``), e5;
      } };
    }));
    Me = f(((e4, t3) => {
      t3.exports = function(e5, t4) {
        var n2 = e5, r2 = t4, i3 = n2.length, a3 = r2.length, o3 = false, s3 = null, c3 = i3 + 1, l3 = [], u3 = [], d3 = [], f3 = ``, p3 = -1, m4 = 0, h4 = 1, g4, _4, v4 = function() {
          i3 >= a3 && (g4 = n2, _4 = i3, n2 = r2, r2 = g4, i3 = a3, a3 = _4, o3 = true, c3 = i3 + 1);
        }, y4 = function(e6, t5, n3) {
          return { x: e6, y: t5, k: n3 };
        }, b4 = function(e6, t5) {
          return { elem: e6, t: t5 };
        }, x4 = function(e6, t5, o4) {
          var s4 = t5 > o4 ? l3[e6 - 1 + c3] : l3[e6 + 1 + c3], d4, f4 = Math.max(t5, o4);
          for (d4 = f4 - e6; d4 < i3 && f4 < a3 && n2[d4] === r2[f4]; ) ++d4, ++f4;
          return l3[e6 + c3] = u3.length, u3[u3.length] = new y4(d4, f4, s4), f4;
        }, S4 = function(e6) {
          var t5 = i4 = 1, i4, a4 = s4 = 0, s4, c4;
          for (c4 = e6.length - 1; c4 >= 0; --c4) for (; a4 < e6[c4].x || s4 < e6[c4].y; ) e6[c4].y - e6[c4].x > s4 - a4 ? (o3 ? d3[d3.length] = new b4(r2[s4], p3) : d3[d3.length] = new b4(r2[s4], h4), ++i4, ++s4) : e6[c4].y - e6[c4].x < s4 - a4 ? (o3 ? d3[d3.length] = new b4(n2[a4], h4) : d3[d3.length] = new b4(n2[a4], p3), ++t5, ++a4) : (d3[d3.length] = new b4(n2[a4], m4), f3 += n2[a4], ++t5, ++i4, ++a4, ++s4);
        };
        return v4(), { SES_DELETE: -1, SES_COMMON: 0, SES_ADD: 1, editdistance: function() {
          return s3;
        }, getlcs: function() {
          return f3;
        }, getses: function() {
          return d3;
        }, compose: function() {
          var e6 = a3 - i3, t5 = i3 + a3 + 3, n3 = {}, r3, o4, d4, f4, p4;
          for (f4 = 0; f4 < t5; ++f4) n3[f4] = -1, l3[f4] = -1;
          r3 = -1;
          do {
            for (++r3, p4 = -r3; p4 <= e6 - 1; ++p4) n3[p4 + c3] = x4(p4, n3[p4 - 1 + c3] + 1, n3[p4 + 1 + c3]);
            for (p4 = e6 + r3; p4 >= e6 + 1; --p4) n3[p4 + c3] = x4(p4, n3[p4 - 1 + c3] + 1, n3[p4 + 1 + c3]);
            n3[e6 + c3] = x4(e6, n3[e6 - 1 + c3] + 1, n3[e6 + 1 + c3]);
          } while (n3[e6 + c3] !== a3);
          for (s3 = e6 + 2 * r3, o4 = l3[e6 + c3], d4 = []; o4 !== -1; ) d4[d4.length] = new y4(u3[o4].x, u3[o4].y, null), o4 = u3[o4].k;
          S4(d4);
        } };
      };
    }));
    Ne = f(((e4, t3) => {
      var n2 = Me();
      function r2(e5, t4) {
        var r3 = new n2(e5, t4);
        r3.compose();
        for (var i4 = r3.getses(), a4, o4, s3 = e5.length - 1, c3 = t4.length - 1, l3 = i4.length - 1; l3 >= 0; --l3) i4[l3].t === r3.SES_COMMON ? (o4 ? (o4.chain = { file1index: s3, file2index: c3, chain: null }, o4 = o4.chain) : (a4 = { file1index: s3, file2index: c3, chain: null }, o4 = a4), s3--, c3--) : i4[l3].t === r3.SES_DELETE ? s3-- : i4[l3].t === r3.SES_ADD && c3--;
        var u3 = { file1index: -1, file2index: -1, chain: null };
        return o4 ? (o4.chain = u3, a4) : u3;
      }
      function i3(e5, t4) {
        for (var n3 = [], i4 = e5.length, a4 = t4.length, o4 = r2(e5, t4); o4 !== null; o4 = o4.chain) {
          var s3 = i4 - o4.file1index - 1, c3 = a4 - o4.file2index - 1;
          i4 = o4.file1index, a4 = o4.file2index, (s3 || c3) && n3.push({ file1: [i4 + 1, s3], file2: [a4 + 1, c3] });
        }
        return n3.reverse(), n3;
      }
      function a3(e5, t4, n3) {
        var r3, a4 = i3(t4, e5), o4 = i3(t4, n3), s3 = [];
        function c3(e6, t5) {
          s3.push([e6.file1[0], t5, e6.file1[1], e6.file2[0], e6.file2[1]]);
        }
        for (r3 = 0; r3 < a4.length; r3++) c3(a4[r3], 0);
        for (r3 = 0; r3 < o4.length; r3++) c3(o4[r3], 2);
        s3.sort(function(e6, t5) {
          return e6[0] - t5[0];
        });
        var l3 = [], u3 = 0;
        function d3(e6) {
          e6 > u3 && (l3.push([1, u3, e6 - u3]), u3 = e6);
        }
        for (var f3 = 0; f3 < s3.length; f3++) {
          for (var p3 = f3, m4 = s3[f3], h4 = m4[0], g4 = h4 + m4[2]; f3 < s3.length - 1; ) {
            var _4 = s3[f3 + 1], v4 = _4[0];
            if (v4 > g4) break;
            g4 = Math.max(g4, v4 + _4[2]), f3++;
          }
          if (d3(h4), p3 == f3) m4[4] > 0 && l3.push([m4[1], m4[3], m4[4]]);
          else {
            var y4 = { 0: [e5.length, -1, t4.length, -1], 2: [n3.length, -1, t4.length, -1] };
            for (r3 = p3; r3 <= f3; r3++) {
              m4 = s3[r3];
              var b4 = y4[m4[1]], x4 = m4[0], S4 = x4 + m4[2], C4 = m4[3], w4 = C4 + m4[4];
              b4[0] = Math.min(C4, b4[0]), b4[1] = Math.max(w4, b4[1]), b4[2] = Math.min(x4, b4[2]), b4[3] = Math.max(S4, b4[3]);
            }
            var T4 = y4[0][0] + (h4 - y4[0][2]), E4 = y4[0][1] + (g4 - y4[0][3]), D4 = y4[2][0] + (h4 - y4[2][2]), O4 = y4[2][1] + (g4 - y4[2][3]);
            l3.push([-1, T4, E4 - T4, h4, g4 - h4, D4, O4 - D4]);
          }
          u3 = g4;
        }
        return d3(t4.length), l3;
      }
      function o3(e5, t4, n3) {
        var r3 = [], i4 = [e5, t4, n3], o4 = a3(e5, t4, n3), s3 = [];
        function c3() {
          s3.length && r3.push({ ok: s3 }), s3 = [];
        }
        function l3(e6) {
          for (var t5 = 0; t5 < e6.length; t5++) s3.push(e6[t5]);
        }
        function u3(t5) {
          if (t5[2] != t5[6]) return true;
          for (var r4 = t5[1], i5 = t5[5], a4 = 0; a4 < t5[2]; a4++) if (e5[a4 + r4] != n3[a4 + i5]) return true;
          return false;
        }
        for (var d3 = 0; d3 < o4.length; d3++) {
          var f3 = o4[d3], p3 = f3[0];
          p3 == -1 ? u3(f3) ? (c3(), r3.push({ conflict: { a: e5.slice(f3[1], f3[1] + f3[2]), aIndex: f3[1], o: t4.slice(f3[3], f3[3] + f3[4]), oIndex: f3[3], b: n3.slice(f3[5], f3[5] + f3[6]), bIndex: f3[5] } })) : l3(i4[0].slice(f3[1], f3[1] + f3[2])) : l3(i4[p3].slice(f3[1], f3[1] + f3[2]));
        }
        return c3(), r3;
      }
      t3.exports = o3;
    }));
    Pe = f(((e4) => {
      Object.defineProperty(e4, `__esModule`, { value: true });
      function t3(e5) {
        return e5 && typeof e5 == `object` && `default` in e5 ? e5.default : e5;
      }
      var r2 = t3(u2()), i3 = t3(fe()), a3 = t3(pe()), o3 = t3(Oe()), s3 = h(`crypto`), c3 = t3(ke());
      t3(Ae());
      var l3 = t3(je());
      t3(Ne());
      var d3 = class e5 extends Error {
        constructor(e6) {
          super(e6), this.caller = ``;
        }
        toJSON() {
          return { code: this.code, data: this.data, caller: this.caller, message: this.message, stack: this.stack };
        }
        fromJSON(t4) {
          let n2 = new e5(t4.message);
          return n2.code = t4.code, n2.data = t4.data, n2.caller = t4.caller, n2.stack = t4.stack, n2;
        }
        get isIsomorphicGitError() {
          return true;
        }
      }, f3 = class e5 extends d3 {
        constructor(t4) {
          super(`Modifying the index is not possible because you have unmerged files: ${t4.toString}. Fix them up in the work tree, and then use 'git add/rm as appropriate to mark resolution and make a commit.`), this.code = this.name = e5.code, this.data = { filepaths: t4 };
        }
      };
      f3.code = `UnmergedPathsError`;
      var p3 = class e5 extends d3 {
        constructor(t4) {
          super(`An internal error caused this command to fail.

If you're not a developer, report the bug to the developers of the application you're using. If this is a bug in isomorphic-git then you should create a proper bug yourselves. The bug should include a minimal reproduction and details about the version and environment.

Please file a bug report at https://github.com/isomorphic-git/isomorphic-git/issues with this error message: ${t4}`), this.code = this.name = e5.code, this.data = { message: t4 };
        }
      };
      p3.code = `InternalError`;
      var m4 = class e5 extends d3 {
        constructor(t4) {
          super(`The filepath "${t4}" contains unsafe character sequences`), this.code = this.name = e5.code, this.data = { filepath: t4 };
        }
      };
      m4.code = `UnsafeFilepathError`;
      var h4 = class {
        constructor(e5) {
          this.buffer = e5, this._start = 0;
        }
        eof() {
          return this._start >= this.buffer.length;
        }
        tell() {
          return this._start;
        }
        seek(e5) {
          this._start = e5;
        }
        slice(e5) {
          let t4 = this.buffer.slice(this._start, this._start + e5);
          return this._start += e5, t4;
        }
        toString(e5, t4) {
          let n2 = this.buffer.toString(e5, this._start, this._start + t4);
          return this._start += t4, n2;
        }
        write(e5, t4, n2) {
          let r3 = this.buffer.write(e5, this._start, t4, n2);
          return this._start += t4, r3;
        }
        copy(e5, t4, n2) {
          let r3 = e5.copy(this.buffer, this._start, t4, n2);
          return this._start += r3, r3;
        }
        readUInt8() {
          let e5 = this.buffer.readUInt8(this._start);
          return this._start += 1, e5;
        }
        writeUInt8(e5) {
          let t4 = this.buffer.writeUInt8(e5, this._start);
          return this._start += 1, t4;
        }
        readUInt16BE() {
          let e5 = this.buffer.readUInt16BE(this._start);
          return this._start += 2, e5;
        }
        writeUInt16BE(e5) {
          let t4 = this.buffer.writeUInt16BE(e5, this._start);
          return this._start += 2, t4;
        }
        readUInt32BE() {
          let e5 = this.buffer.readUInt32BE(this._start);
          return this._start += 4, e5;
        }
        writeUInt32BE(e5) {
          let t4 = this.buffer.writeUInt32BE(e5, this._start);
          return this._start += 4, t4;
        }
      };
      function g4(e5, t4) {
        return -(e5 < t4) || +(e5 > t4);
      }
      function _4(e5, t4) {
        return g4(e5.path, t4.path);
      }
      function v4(e5) {
        let t4 = e5 > 0 ? e5 >> 12 : 0;
        t4 !== 4 && t4 !== 8 && t4 !== 10 && t4 !== 14 && (t4 = 8);
        let n2 = e5 & 511;
        return n2 = n2 & 73 ? 493 : 420, t4 !== 8 && (n2 = 0), (t4 << 12) + n2;
      }
      let y4 = 2 ** 32;
      function b4(e5, t4, n2, r3) {
        if (e5 !== void 0 && t4 !== void 0) return [e5, t4];
        n2 === void 0 && (n2 = r3.valueOf());
        let i4 = Math.floor(n2 / 1e3);
        return [i4, (n2 - i4 * 1e3) * 1e6];
      }
      function x4(e5) {
        let [t4, n2] = b4(e5.ctimeSeconds, e5.ctimeNanoseconds, e5.ctimeMs, e5.ctime), [r3, i4] = b4(e5.mtimeSeconds, e5.mtimeNanoseconds, e5.mtimeMs, e5.mtime);
        return { ctimeSeconds: t4 % y4, ctimeNanoseconds: n2 % y4, mtimeSeconds: r3 % y4, mtimeNanoseconds: i4 % y4, dev: e5.dev % y4, ino: e5.ino % y4, mode: v4(e5.mode % y4), uid: e5.uid % y4, gid: e5.gid % y4, size: e5.size > -1 ? e5.size % y4 : 0 };
      }
      function S4(e5) {
        let t4 = ``;
        for (let n2 of new Uint8Array(e5)) n2 < 16 && (t4 += `0`), t4 += n2.toString(16);
        return t4;
      }
      let C4 = null;
      async function w4(e5) {
        return C4 === null && (C4 = await D4()), C4 ? E4(e5) : T4(e5);
      }
      function T4(e5) {
        return new i3().update(e5).digest(`hex`);
      }
      async function E4(e5) {
        return S4(await crypto.subtle.digest(`SHA-1`, e5));
      }
      async function D4() {
        try {
          return await E4(new Uint8Array([])) === `da39a3ee5e6b4b0d3255bfef95601890afd80709`;
        } catch {
        }
        return false;
      }
      function O4(e5) {
        return { assumeValid: !!(e5 & 32768), extended: !!(e5 & 16384), stage: (e5 & 12288) >> 12, nameLength: e5 & 4095 };
      }
      function k4(e5) {
        let t4 = e5.flags;
        return t4.extended = false, t4.nameLength = Math.min(Buffer.from(e5.path).length, 4095), (t4.assumeValid ? 32768 : 0) + (t4.extended ? 16384 : 0) + ((t4.stage & 3) << 12) + (t4.nameLength & 4095);
      }
      var A4 = class e5 {
        constructor(e6, t4) {
          this._dirty = false, this._unmergedPaths = t4 || /* @__PURE__ */ new Set(), this._entries = e6 || /* @__PURE__ */ new Map();
        }
        _addEntry(e6) {
          if (e6.flags.stage === 0) e6.stages = [e6], this._entries.set(e6.path, e6), this._unmergedPaths.delete(e6.path);
          else {
            let t4 = this._entries.get(e6.path);
            t4 ||= (this._entries.set(e6.path, e6), e6), t4.stages[e6.flags.stage] = e6, this._unmergedPaths.add(e6.path);
          }
        }
        static async from(t4) {
          if (Buffer.isBuffer(t4)) return e5.fromBuffer(t4);
          if (t4 === null) return new e5(null);
          throw new p3(`invalid type passed to GitIndex.from`);
        }
        static async fromBuffer(t4) {
          if (t4.length === 0) throw new p3(`Index file is empty (.git/index)`);
          let n2 = new e5(), r3 = new h4(t4), i4 = r3.toString(`utf8`, 4);
          if (i4 !== `DIRC`) throw new p3(`Invalid dircache magic file number: ${i4}`);
          let a4 = await w4(t4.slice(0, -20)), o4 = t4.slice(-20).toString(`hex`);
          if (o4 !== a4) throw new p3(`Invalid checksum in GitIndex buffer: expected ${o4} but saw ${a4}`);
          let s4 = r3.readUInt32BE();
          if (s4 !== 2) throw new p3(`Unsupported dircache version: ${s4}`);
          let c4 = r3.readUInt32BE(), l4 = 0;
          for (; !r3.eof() && l4 < c4; ) {
            let e6 = {};
            e6.ctimeSeconds = r3.readUInt32BE(), e6.ctimeNanoseconds = r3.readUInt32BE(), e6.mtimeSeconds = r3.readUInt32BE(), e6.mtimeNanoseconds = r3.readUInt32BE(), e6.dev = r3.readUInt32BE(), e6.ino = r3.readUInt32BE(), e6.mode = r3.readUInt32BE(), e6.uid = r3.readUInt32BE(), e6.gid = r3.readUInt32BE(), e6.size = r3.readUInt32BE(), e6.oid = r3.slice(20).toString(`hex`), e6.flags = O4(r3.readUInt16BE());
            let i5 = t4.indexOf(0, r3.tell() + 1) - r3.tell();
            if (i5 < 1) throw new p3(`Got a path length of: ${i5}`);
            if (e6.path = r3.toString(`utf8`, i5), e6.path.includes(`..\\`) || e6.path.includes(`../`)) throw new m4(e6.path);
            let a5 = 8 - (r3.tell() - 12) % 8;
            for (a5 === 0 && (a5 = 8); a5--; ) {
              let t5 = r3.readUInt8();
              if (t5 !== 0) throw new p3(`Expected 1-8 null characters but got '${t5}' after ${e6.path}`);
              if (r3.eof()) throw new p3(`Unexpected end of file`);
            }
            e6.stages = [], n2._addEntry(e6), l4++;
          }
          return n2;
        }
        get unmergedPaths() {
          return [...this._unmergedPaths];
        }
        get entries() {
          return [...this._entries.values()].sort(_4);
        }
        get entriesMap() {
          return this._entries;
        }
        get entriesFlat() {
          return [...this.entries].flatMap((e6) => e6.stages.length > 1 ? e6.stages.filter((e7) => e7) : e6);
        }
        *[Symbol.iterator]() {
          for (let e6 of this.entries) yield e6;
        }
        insert({ filepath: e6, stats: t4, oid: n2, stage: r3 = 0 }) {
          t4 ||= { ctimeSeconds: 0, ctimeNanoseconds: 0, mtimeSeconds: 0, mtimeNanoseconds: 0, dev: 0, ino: 0, mode: 0, uid: 0, gid: 0, size: 0 }, t4 = x4(t4);
          let i4 = Buffer.from(e6), a4 = { ctimeSeconds: t4.ctimeSeconds, ctimeNanoseconds: t4.ctimeNanoseconds, mtimeSeconds: t4.mtimeSeconds, mtimeNanoseconds: t4.mtimeNanoseconds, dev: t4.dev, ino: t4.ino, mode: t4.mode || 33188, uid: t4.uid, gid: t4.gid, size: t4.size, path: e6, oid: n2, flags: { assumeValid: false, extended: false, stage: r3, nameLength: i4.length < 4095 ? i4.length : 4095 }, stages: [] };
          this._addEntry(a4), this._dirty = true;
        }
        delete({ filepath: e6 }) {
          if (this._entries.has(e6)) this._entries.delete(e6);
          else for (let t4 of this._entries.keys()) t4.startsWith(e6 + `/`) && this._entries.delete(t4);
          this._unmergedPaths.has(e6) && this._unmergedPaths.delete(e6), this._dirty = true;
        }
        clear() {
          this._entries.clear(), this._dirty = true;
        }
        has({ filepath: e6 }) {
          return this._entries.has(e6);
        }
        render() {
          return this.entries.map((e6) => `${e6.mode.toString(8)} ${e6.oid}    ${e6.path}`).join(`
`);
        }
        static async _entryToBuffer(e6) {
          let t4 = Buffer.from(e6.path), n2 = Math.ceil((62 + t4.length + 1) / 8) * 8, r3 = Buffer.alloc(n2), i4 = new h4(r3), a4 = x4(e6);
          return i4.writeUInt32BE(a4.ctimeSeconds), i4.writeUInt32BE(a4.ctimeNanoseconds), i4.writeUInt32BE(a4.mtimeSeconds), i4.writeUInt32BE(a4.mtimeNanoseconds), i4.writeUInt32BE(a4.dev), i4.writeUInt32BE(a4.ino), i4.writeUInt32BE(a4.mode), i4.writeUInt32BE(a4.uid), i4.writeUInt32BE(a4.gid), i4.writeUInt32BE(a4.size), i4.write(e6.oid, 20, `hex`), i4.writeUInt16BE(k4(e6)), i4.write(e6.path, t4.length, `utf8`), r3;
        }
        async toObject() {
          let t4 = Buffer.alloc(12), n2 = new h4(t4);
          n2.write(`DIRC`, 4, `utf8`), n2.writeUInt32BE(2), n2.writeUInt32BE(this.entriesFlat.length);
          let r3 = [];
          for (let t5 of this.entries) if (r3.push(e5._entryToBuffer(t5)), t5.stages.length > 1) for (let n3 of t5.stages) n3 && n3 !== t5 && r3.push(e5._entryToBuffer(n3));
          r3 = await Promise.all(r3);
          let i4 = Buffer.concat(r3), a4 = Buffer.concat([t4, i4]), o4 = await w4(a4);
          return Buffer.concat([a4, Buffer.from(o4, `hex`)]);
        }
      };
      function j4(e5, t4, n2 = true, r3 = true) {
        let i4 = x4(e5), a4 = x4(t4);
        return n2 && i4.mode !== a4.mode || i4.mtimeSeconds !== a4.mtimeSeconds || i4.ctimeSeconds !== a4.ctimeSeconds || i4.uid !== a4.uid || i4.gid !== a4.gid || r3 && i4.ino !== a4.ino || i4.size !== a4.size;
      }
      let M4 = null, N4 = /* @__PURE__ */ Symbol(`IndexCache`);
      function P4() {
        return { map: /* @__PURE__ */ new Map(), stats: /* @__PURE__ */ new Map() };
      }
      async function F4(e5, t4, n2) {
        let [r3, i4] = await Promise.all([e5.lstat(t4), e5.read(t4)]), a4 = await A4.from(i4);
        n2.map.set(t4, a4), n2.stats.set(t4, r3);
      }
      async function ee3(e5, t4, n2) {
        let r3 = n2.stats.get(t4);
        if (r3 === void 0) return true;
        if (r3 === null) return false;
        let i4 = await e5.lstat(t4);
        return i4 === null ? false : j4(r3, i4);
      }
      var I4 = class {
        static async acquire({ fs: e5, gitdir: t4, cache: n2, allowUnmerged: i4 = true }, a4) {
          n2[N4] || (n2[N4] = P4());
          let o4 = `${t4}/index`;
          M4 === null && (M4 = new r2({ maxPending: 1 / 0 }));
          let s4, c4 = [];
          return await M4.acquire(o4, async () => {
            let t5 = n2[N4];
            await ee3(e5, o4, t5) && await F4(e5, o4, t5);
            let r3 = t5.map.get(o4);
            if (c4 = r3.unmergedPaths, c4.length && !i4) throw new f3(c4);
            if (s4 = await a4(r3), r3._dirty) {
              let n3 = await r3.toObject();
              await e5.write(o4, n3), t5.stats.set(o4, await e5.lstat(o4)), r3._dirty = false;
            }
          }), s4;
        }
      };
      function L4(e5) {
        let t4 = Math.max(e5.lastIndexOf(`/`), e5.lastIndexOf(`\\`));
        return t4 > -1 && (e5 = e5.slice(t4 + 1)), e5;
      }
      function R4(e5) {
        let t4 = Math.max(e5.lastIndexOf(`/`), e5.lastIndexOf(`\\`));
        return t4 === -1 ? `.` : t4 === 0 ? `/` : e5.slice(0, t4);
      }
      function te3(e5) {
        let t4 = /* @__PURE__ */ new Map(), n2 = function(e6) {
          if (!t4.has(e6)) {
            let r4 = { type: `tree`, fullpath: e6, basename: L4(e6), metadata: {}, children: [] };
            t4.set(e6, r4), r4.parent = n2(R4(e6)), r4.parent && r4.parent !== r4 && r4.parent.children.push(r4);
          }
          return t4.get(e6);
        }, r3 = function(e6, r4) {
          if (!t4.has(e6)) {
            let i4 = { type: `blob`, fullpath: e6, basename: L4(e6), metadata: r4, parent: n2(R4(e6)), children: [] };
            i4.parent && i4.parent.children.push(i4), t4.set(e6, i4);
          }
          return t4.get(e6);
        };
        n2(`.`);
        for (let t5 of e5) r3(t5.path, t5);
        return t4;
      }
      function ne3(e5) {
        switch (e5) {
          case 16384:
            return `tree`;
          case 33188:
            return `blob`;
          case 33261:
            return `blob`;
          case 40960:
            return `blob`;
          case 57344:
            return `commit`;
        }
        throw new p3(`Unexpected GitTree entry mode: ${e5.toString(8)}`);
      }
      var z4 = class {
        constructor({ fs: e5, gitdir: t4, cache: n2 }) {
          this.treePromise = I4.acquire({ fs: e5, gitdir: t4, cache: n2 }, async function(e6) {
            return te3(e6.entries);
          });
          let r3 = this;
          this.ConstructEntry = class {
            constructor(e6) {
              this._fullpath = e6, this._type = false, this._mode = false, this._stat = false, this._oid = false;
            }
            async type() {
              return r3.type(this);
            }
            async mode() {
              return r3.mode(this);
            }
            async stat() {
              return r3.stat(this);
            }
            async content() {
              return r3.content(this);
            }
            async oid() {
              return r3.oid(this);
            }
          };
        }
        async readdir(e5) {
          let t4 = e5._fullpath, n2 = (await this.treePromise).get(t4);
          if (!n2 || n2.type === `blob`) return null;
          if (n2.type !== `tree`) throw Error(`ENOTDIR: not a directory, scandir '${t4}'`);
          let r3 = n2.children.map((e6) => e6.fullpath);
          return r3.sort(g4), r3;
        }
        async type(e5) {
          return e5._type === false && await e5.stat(), e5._type;
        }
        async mode(e5) {
          return e5._mode === false && await e5.stat(), e5._mode;
        }
        async stat(e5) {
          if (e5._stat === false) {
            let t4 = (await this.treePromise).get(e5._fullpath);
            if (!t4) throw Error(`ENOENT: no such file or directory, lstat '${e5._fullpath}'`);
            let n2 = t4.type === `tree` ? {} : x4(t4.metadata);
            e5._type = t4.type === `tree` ? `tree` : ne3(n2.mode), e5._mode = n2.mode, t4.type === `tree` ? e5._stat = void 0 : e5._stat = n2;
          }
          return e5._stat;
        }
        async content(e5) {
        }
        async oid(e5) {
          return e5._oid === false && (e5._oid = (await this.treePromise).get(e5._fullpath).metadata.oid), e5._oid;
        }
      };
      let B4 = /* @__PURE__ */ Symbol(`GitWalkSymbol`);
      function V4() {
        let e5 = /* @__PURE__ */ Object.create(null);
        return Object.defineProperty(e5, B4, { value: function({ fs: e6, gitdir: t4, cache: n2 }) {
          return new z4({ fs: e6, gitdir: t4, cache: n2 });
        } }), Object.freeze(e5), e5;
      }
      var H3 = class e5 extends d3 {
        constructor(t4) {
          super(`Could not find ${t4}.`), this.code = this.name = e5.code, this.data = { what: t4 };
        }
      };
      H3.code = `NotFoundError`;
      var re3 = class e5 extends d3 {
        constructor(t4, n2, r3, i4) {
          super(`Object ${t4} ${i4 ? `at ${i4}` : ``}was anticipated to be a ${r3} but it is a ${n2}.`), this.code = this.name = e5.code, this.data = { oid: t4, actual: n2, expected: r3, filepath: i4 };
        }
      };
      re3.code = `ObjectTypeError`;
      var ie3 = class e5 extends d3 {
        constructor(t4) {
          super(`Expected a 40-char hex object id but saw "${t4}".`), this.code = this.name = e5.code, this.data = { value: t4 };
        }
      };
      ie3.code = `InvalidOidError`;
      var ae3 = class e5 extends d3 {
        constructor(t4) {
          super(`Could not find a fetch refspec for remote "${t4}". Make sure the config file has an entry like the following:
[remote "${t4}"]
	fetch = +refs/heads/*:refs/remotes/origin/*
`), this.code = this.name = e5.code, this.data = { remote: t4 };
        }
      };
      ae3.code = `NoRefspecError`;
      var U3 = class e5 {
        constructor(e6) {
          if (this.refs = /* @__PURE__ */ new Map(), this.parsedConfig = [], e6) {
            let t4 = null;
            this.parsedConfig = e6.trim().split(`
`).map((e7) => {
              if (/^\s*#/.test(e7)) return { line: e7, comment: true };
              let n2 = e7.indexOf(` `);
              if (e7.startsWith(`^`)) {
                let n3 = e7.slice(1);
                return this.refs.set(t4 + `^{}`, n3), { line: e7, ref: t4, peeled: n3 };
              } else {
                let r3 = e7.slice(0, n2);
                return t4 = e7.slice(n2 + 1), this.refs.set(t4, r3), { line: e7, ref: t4, oid: r3 };
              }
            });
          }
          return this;
        }
        static from(t4) {
          return new e5(t4);
        }
        delete(e6) {
          this.parsedConfig = this.parsedConfig.filter((t4) => t4.ref !== e6), this.refs.delete(e6);
        }
        toString() {
          return this.parsedConfig.map(({ line: e6 }) => e6).join(`
`) + `
`;
        }
      }, W3 = class e5 {
        constructor({ remotePath: e6, localPath: t4, force: n2, matchPrefix: r3 }) {
          Object.assign(this, { remotePath: e6, localPath: t4, force: n2, matchPrefix: r3 });
        }
        static from(t4) {
          let [n2, r3, i4, a4, o4] = t4.match(/^(\+?)(.*?)(\*?):(.*?)(\*?)$/).slice(1), s4 = n2 === `+`, c4 = i4 === `*`;
          if (c4 !== (o4 === `*`)) throw new p3(`Invalid refspec`);
          return new e5({ remotePath: r3, localPath: a4, force: s4, matchPrefix: c4 });
        }
        translate(e6) {
          if (this.matchPrefix) {
            if (e6.startsWith(this.remotePath)) return this.localPath + e6.replace(this.remotePath, ``);
          } else if (e6 === this.remotePath) return this.localPath;
          return null;
        }
        reverseTranslate(e6) {
          if (this.matchPrefix) {
            if (e6.startsWith(this.localPath)) return this.remotePath + e6.replace(this.localPath, ``);
          } else if (e6 === this.localPath) return this.remotePath;
          return null;
        }
      }, oe3 = class e5 {
        constructor(e6 = []) {
          this.rules = e6;
        }
        static from(t4) {
          let n2 = [];
          for (let e6 of t4) n2.push(W3.from(e6));
          return new e5(n2);
        }
        add(e6) {
          let t4 = W3.from(e6);
          this.rules.push(t4);
        }
        translate(e6) {
          let t4 = [];
          for (let n2 of this.rules) for (let r3 of e6) {
            let e7 = n2.translate(r3);
            e7 && t4.push([r3, e7]);
          }
          return t4;
        }
        translateOne(e6) {
          let t4 = null;
          for (let n2 of this.rules) {
            let r3 = n2.translate(e6);
            r3 && (t4 = r3);
          }
          return t4;
        }
        localNamespaces() {
          return this.rules.filter((e6) => e6.matchPrefix).map((e6) => e6.localPath.replace(/\/$/, ``));
        }
      };
      function se3(e5, t4) {
        let n2 = e5.replace(/\^\{\}$/, ``), r3 = t4.replace(/\^\{\}$/, ``), i4 = -(n2 < r3) || +(n2 > r3);
        return i4 === 0 ? e5.endsWith(`^{}`) ? 1 : -1 : i4;
      }
      function G3(e5, t4) {
        let n2 = ``, r3 = 0, i4 = -1, a4 = 0, o4 = `\0`;
        for (let s4 = 0; s4 <= e5.length; ++s4) {
          if (s4 < e5.length) o4 = e5[s4];
          else if (o4 === `/`) break;
          else o4 = `/`;
          if (o4 === `/`) {
            if (!(i4 === s4 - 1 || a4 === 1)) if (a4 === 2) {
              if (n2.length < 2 || r3 !== 2 || n2.at(-1) !== `.` || n2.at(-2) !== `.`) {
                if (n2.length > 2) {
                  let e6 = n2.lastIndexOf(`/`);
                  e6 === -1 ? (n2 = ``, r3 = 0) : (n2 = n2.slice(0, e6), r3 = n2.length - 1 - n2.lastIndexOf(`/`)), i4 = s4, a4 = 0;
                  continue;
                } else if (n2.length !== 0) {
                  n2 = ``, r3 = 0, i4 = s4, a4 = 0;
                  continue;
                }
              }
              t4 && (n2 += n2.length > 0 ? `/..` : `..`, r3 = 2);
            } else n2.length > 0 ? n2 += `/` + e5.slice(i4 + 1, s4) : n2 = e5.slice(i4 + 1, s4), r3 = s4 - i4 - 1;
            i4 = s4, a4 = 0;
          } else o4 === `.` && a4 !== -1 ? ++a4 : a4 = -1;
        }
        return n2;
      }
      function K3(e5) {
        if (!e5.length) return `.`;
        let t4 = e5[0] === `/`, n2 = e5.at(-1) === `/`;
        return e5 = G3(e5, !t4), e5.length ? (n2 && (e5 += `/`), t4 ? `/${e5}` : e5) : t4 ? `/` : n2 ? `./` : `.`;
      }
      function ce3(...e5) {
        if (e5.length === 0) return `.`;
        let t4;
        for (let n2 = 0; n2 < e5.length; ++n2) {
          let r3 = e5[n2];
          r3.length > 0 && (t4 === void 0 ? t4 = r3 : t4 += `/` + r3);
        }
        return t4 === void 0 ? `.` : K3(t4);
      }
      let le3 = (e5) => {
        if (typeof e5 == `number`) return e5;
        e5 = e5.toLowerCase();
        let t4 = parseInt(e5);
        return e5.endsWith(`k`) && (t4 *= 1024), e5.endsWith(`m`) && (t4 *= 1024 * 1024), e5.endsWith(`g`) && (t4 *= 1024 * 1024 * 1024), t4;
      }, q3 = (e5) => {
        if (typeof e5 == `boolean`) return e5;
        if (e5 = e5.trim().toLowerCase(), e5 === `true` || e5 === `yes` || e5 === `on`) return true;
        if (e5 === `false` || e5 === `no` || e5 === `off`) return false;
        throw Error(`Expected 'true', 'false', 'yes', 'no', 'on', or 'off', but got ${e5}`);
      }, ue3 = { core: { filemode: q3, bare: q3, logallrefupdates: q3, symlinks: q3, ignorecase: q3, bigFileThreshold: le3 } }, J3 = /^\[([A-Za-z0-9-.]+)(?: "(.*)")?\]$/, Y3 = /^[A-Za-z0-9-.]+$/, X3 = /^([A-Za-z][A-Za-z-]*)(?: *= *(.*))?$/, Z3 = /^[A-Za-z][A-Za-z-]*$/, de3 = /^(.*?)( *[#;].*)$/, Q3 = (e5) => {
        let t4 = J3.exec(e5);
        if (t4 != null) {
          let [e6, n2] = t4.slice(1);
          return [e6, n2];
        }
        return null;
      }, $3 = (e5) => {
        let t4 = X3.exec(e5);
        if (t4 != null) {
          let [e6, n2 = `true`] = t4.slice(1);
          return [e6, ge3(me3(n2))];
        }
        return null;
      }, me3 = (e5) => {
        let t4 = de3.exec(e5);
        if (t4 == null) return e5;
        let [n2, r3] = t4.slice(1);
        return he3(n2) && he3(r3) ? `${n2}${r3}` : n2;
      }, he3 = (e5) => (e5.match(/(?:^|[^\\])"/g) || []).length % 2 != 0, ge3 = (e5) => e5.split(``).reduce((e6, t4, n2, r3) => {
        let i4 = t4 === `"` && r3[n2 - 1] !== `\\`, a4 = t4 === `\\` && r3[n2 + 1] === `"`;
        return i4 || a4 ? e6 : e6 + t4;
      }, ``), _e3 = (e5) => e5 == null ? null : e5.toLowerCase(), ve3 = (e5, t4, n2) => [_e3(e5), t4, _e3(n2)].filter((e6) => e6 != null).join(`.`), ye3 = (e5) => {
        let t4 = e5.split(`.`), n2 = t4.shift(), r3 = t4.pop(), i4 = t4.length ? t4.join(`.`) : void 0;
        return { section: n2, subsection: i4, name: r3, path: ve3(n2, i4, r3), sectionPath: ve3(n2, i4, null), isSection: !!n2 };
      }, be3 = (e5, t4) => e5.reduce((e6, n2, r3) => t4(n2) ? r3 : e6, -1);
      var xe3 = class e5 {
        constructor(e6) {
          let t4 = null, n2 = null;
          this.parsedConfig = e6 ? e6.split(`
`).map((e7) => {
            let r3 = null, i4 = null, a4 = e7.trim(), o4 = Q3(a4), s4 = o4 != null;
            if (s4) [t4, n2] = o4;
            else {
              let e8 = $3(a4);
              e8 != null && ([r3, i4] = e8);
            }
            let c4 = ve3(t4, n2, r3);
            return { line: e7, isSection: s4, section: t4, subsection: n2, name: r3, value: i4, path: c4 };
          }) : [];
        }
        static from(t4) {
          return new e5(t4);
        }
        async get(e6, t4 = false) {
          let n2 = ye3(e6).path, r3 = this.parsedConfig.filter((e7) => e7.path === n2).map(({ section: e7, name: t5, value: n3 }) => {
            let r4 = ue3[e7] && ue3[e7][t5];
            return r4 ? r4(n3) : n3;
          });
          return t4 ? r3 : r3.pop();
        }
        async getall(e6) {
          return this.get(e6, true);
        }
        async getSubsections(e6) {
          return this.parsedConfig.filter((t4) => t4.isSection && t4.section === e6).map((e7) => e7.subsection);
        }
        async deleteSection(e6, t4) {
          this.parsedConfig = this.parsedConfig.filter((n2) => !(n2.section === e6 && n2.subsection === t4));
        }
        async append(e6, t4) {
          return this.set(e6, t4, true);
        }
        async set(e6, t4, n2 = false) {
          let { section: r3, subsection: i4, name: a4, path: o4, sectionPath: s4, isSection: c4 } = ye3(e6), l4 = be3(this.parsedConfig, (e7) => e7.path === o4);
          if (t4 == null) l4 !== -1 && this.parsedConfig.splice(l4, 1);
          else if (l4 !== -1) {
            let e7 = this.parsedConfig[l4], r4 = Object.assign({}, e7, { name: a4, value: t4, modified: true });
            n2 ? this.parsedConfig.splice(l4 + 1, 0, r4) : this.parsedConfig[l4] = r4;
          } else {
            let e7 = this.parsedConfig.findIndex((e8) => e8.path === s4), n3 = { section: r3, subsection: i4, name: a4, value: t4, modified: true, path: o4 };
            if (Y3.test(r3) && Z3.test(a4)) if (e7 >= 0) this.parsedConfig.splice(e7 + 1, 0, n3);
            else {
              let e8 = { isSection: c4, section: r3, subsection: i4, modified: true, path: s4 };
              this.parsedConfig.push(e8, n3);
            }
          }
        }
        toString() {
          return this.parsedConfig.map(({ line: e6, section: t4, subsection: n2, name: r3, value: i4, modified: a4 = false }) => a4 ? r3 != null && i4 != null ? typeof i4 == `string` && /[#;]/.test(i4) ? `	${r3} = "${i4}"` : `	${r3} = ${i4}` : n2 == null ? `[${t4}]` : `[${t4} "${n2}"]` : e6).join(`
`);
        }
      }, Se3 = class {
        static async get({ fs: e5, gitdir: t4 }) {
          let n2 = await e5.read(`${t4}/config`, { encoding: `utf8` });
          return xe3.from(n2);
        }
        static async save({ fs: e5, gitdir: t4, config: n2 }) {
          await e5.write(`${t4}/config`, n2.toString(), { encoding: `utf8` });
        }
      };
      let Ce3 = (e5) => [`${e5}`, `refs/${e5}`, `refs/tags/${e5}`, `refs/heads/${e5}`, `refs/remotes/${e5}`, `refs/remotes/${e5}/HEAD`], we3 = [`config`, `description`, `index`, `shallow`, `commondir`], Te3;
      async function Ee3(e5, t4) {
        return Te3 === void 0 && (Te3 = new r2()), Te3.acquire(e5, t4);
      }
      var De3 = class e5 {
        static async updateRemoteRefs({ fs: t4, gitdir: n2, remote: r3, refs: i4, symrefs: a4, tags: o4, refspecs: s4 = void 0, prune: c4 = false, pruneTags: l4 = false }) {
          for (let e6 of i4.values()) if (!e6.match(/[0-9a-f]{40}/)) throw new ie3(e6);
          let u3 = await Se3.get({ fs: t4, gitdir: n2 });
          if (!s4) {
            if (s4 = await u3.getall(`remote.${r3}.fetch`), s4.length === 0) throw new ae3(r3);
            s4.unshift(`+HEAD:refs/remotes/${r3}/HEAD`);
          }
          let d4 = oe3.from(s4), f4 = /* @__PURE__ */ new Map();
          if (l4) {
            let r4 = await e5.listRefs({ fs: t4, gitdir: n2, filepath: `refs/tags` });
            await e5.deleteRefs({ fs: t4, gitdir: n2, refs: r4.map((e6) => `refs/tags/${e6}`) });
          }
          if (o4) {
            for (let r4 of i4.keys()) if (r4.startsWith(`refs/tags`) && !r4.endsWith(`^{}`) && !await e5.exists({ fs: t4, gitdir: n2, ref: r4 })) {
              let e6 = i4.get(r4);
              f4.set(r4, e6);
            }
          }
          let p4 = d4.translate([...i4.keys()]);
          for (let [e6, t5] of p4) {
            let n3 = i4.get(e6);
            f4.set(t5, n3);
          }
          let m5 = d4.translate([...a4.keys()]);
          for (let [e6, t5] of m5) {
            let n3 = a4.get(e6), r4 = d4.translateOne(n3);
            r4 && f4.set(t5, `ref: ${r4}`);
          }
          let h5 = [];
          if (c4) {
            for (let r4 of d4.localNamespaces()) {
              let i5 = (await e5.listRefs({ fs: t4, gitdir: n2, filepath: r4 })).map((e6) => `${r4}/${e6}`);
              for (let e6 of i5) f4.has(e6) || h5.push(e6);
            }
            h5.length > 0 && await e5.deleteRefs({ fs: t4, gitdir: n2, refs: h5 });
          }
          for (let [e6, r4] of f4) await Ee3(e6, async () => t4.write(ce3(n2, e6), `${r4.trim()}
`, `utf8`));
          return { pruned: h5 };
        }
        static async writeRef({ fs: e6, gitdir: t4, ref: n2, value: r3 }) {
          if (!r3.match(/[0-9a-f]{40}/)) throw new ie3(r3);
          await Ee3(n2, async () => e6.write(ce3(t4, n2), `${r3.trim()}
`, `utf8`));
        }
        static async writeSymbolicRef({ fs: e6, gitdir: t4, ref: n2, value: r3 }) {
          await Ee3(n2, async () => e6.write(ce3(t4, n2), `ref: ${r3.trim()}
`, `utf8`));
        }
        static async deleteRef({ fs: t4, gitdir: n2, ref: r3 }) {
          return e5.deleteRefs({ fs: t4, gitdir: n2, refs: [r3] });
        }
        static async deleteRefs({ fs: e6, gitdir: t4, refs: n2 }) {
          await Promise.all(n2.map((n3) => e6.rm(ce3(t4, n3))));
          let r3 = await Ee3(`packed-refs`, async () => e6.read(`${t4}/packed-refs`, { encoding: `utf8` })), i4 = U3.from(r3), a4 = i4.refs.size;
          for (let e7 of n2) i4.refs.has(e7) && i4.delete(e7);
          i4.refs.size < a4 && (r3 = i4.toString(), await Ee3(`packed-refs`, async () => e6.write(`${t4}/packed-refs`, r3, { encoding: `utf8` })));
        }
        static async resolve({ fs: t4, gitdir: n2, ref: r3, depth: i4 = void 0 }) {
          if (i4 !== void 0 && (i4--, i4 === -1)) return r3;
          if (r3.startsWith(`ref: `)) return r3 = r3.slice(5), e5.resolve({ fs: t4, gitdir: n2, ref: r3, depth: i4 });
          if (r3.length === 40 && /[0-9a-f]{40}/.test(r3)) return r3;
          let a4 = await e5.packedRefs({ fs: t4, gitdir: n2 }), o4 = Ce3(r3).filter((e6) => !we3.includes(e6));
          for (let r4 of o4) {
            let o5 = await Ee3(r4, async () => await t4.read(`${n2}/${r4}`, { encoding: `utf8` }) || a4.get(r4));
            if (o5) return e5.resolve({ fs: t4, gitdir: n2, ref: o5.trim(), depth: i4 });
          }
          throw new H3(r3);
        }
        static async exists({ fs: t4, gitdir: n2, ref: r3 }) {
          try {
            return await e5.expand({ fs: t4, gitdir: n2, ref: r3 }), true;
          } catch {
            return false;
          }
        }
        static async expand({ fs: t4, gitdir: n2, ref: r3 }) {
          if (r3.length === 40 && /[0-9a-f]{40}/.test(r3)) return r3;
          let i4 = await e5.packedRefs({ fs: t4, gitdir: n2 }), a4 = Ce3(r3);
          for (let e6 of a4) if (await Ee3(e6, async () => t4.exists(`${n2}/${e6}`)) || i4.has(e6)) return e6;
          throw new H3(r3);
        }
        static async expandAgainstMap({ ref: e6, map: t4 }) {
          let n2 = Ce3(e6);
          for (let e7 of n2) if (await t4.has(e7)) return e7;
          throw new H3(e6);
        }
        static resolveAgainstMap({ ref: t4, fullref: n2 = t4, depth: r3 = void 0, map: i4 }) {
          if (r3 !== void 0 && (r3--, r3 === -1)) return { fullref: n2, oid: t4 };
          if (t4.startsWith(`ref: `)) return t4 = t4.slice(5), e5.resolveAgainstMap({ ref: t4, fullref: n2, depth: r3, map: i4 });
          if (t4.length === 40 && /[0-9a-f]{40}/.test(t4)) return { fullref: n2, oid: t4 };
          let a4 = Ce3(t4);
          for (let t5 of a4) {
            let n3 = i4.get(t5);
            if (n3) return e5.resolveAgainstMap({ ref: n3.trim(), fullref: t5, depth: r3, map: i4 });
          }
          throw new H3(t4);
        }
        static async packedRefs({ fs: e6, gitdir: t4 }) {
          let n2 = await Ee3(`packed-refs`, async () => e6.read(`${t4}/packed-refs`, { encoding: `utf8` }));
          return U3.from(n2).refs;
        }
        static async listRefs({ fs: t4, gitdir: n2, filepath: r3 }) {
          let i4 = e5.packedRefs({ fs: t4, gitdir: n2 }), a4 = null;
          try {
            a4 = await t4.readdirDeep(`${n2}/${r3}`), a4 = a4.map((e6) => e6.replace(`${n2}/${r3}/`, ``));
          } catch {
            a4 = [];
          }
          for (let e6 of (await i4).keys()) e6.startsWith(r3) && (e6 = e6.replace(r3 + `/`, ``), a4.includes(e6) || a4.push(e6));
          return a4.sort(se3), a4;
        }
        static async listBranches({ fs: t4, gitdir: n2, remote: r3 }) {
          return r3 ? e5.listRefs({ fs: t4, gitdir: n2, filepath: `refs/remotes/${r3}` }) : e5.listRefs({ fs: t4, gitdir: n2, filepath: `refs/heads` });
        }
        static async listTags({ fs: t4, gitdir: n2 }) {
          return (await e5.listRefs({ fs: t4, gitdir: n2, filepath: `refs/tags` })).filter((e6) => !e6.endsWith(`^{}`));
        }
      };
      function Me3(e5, t4) {
        return g4(Pe3(e5), Pe3(t4));
      }
      function Pe3(e5) {
        return e5.mode === `040000` ? e5.path + `/` : e5.path;
      }
      function Fe3(e5) {
        switch (e5) {
          case `040000`:
            return `tree`;
          case `100644`:
            return `blob`;
          case `100755`:
            return `blob`;
          case `120000`:
            return `blob`;
          case `160000`:
            return `commit`;
        }
        throw new p3(`Unexpected GitTree entry mode: ${e5}`);
      }
      function Ie3(e5) {
        let t4 = [], n2 = 0;
        for (; n2 < e5.length; ) {
          let r3 = e5.indexOf(32, n2);
          if (r3 === -1) throw new p3(`GitTree: Error parsing buffer at byte location ${n2}: Could not find the next space character.`);
          let i4 = e5.indexOf(0, n2);
          if (i4 === -1) throw new p3(`GitTree: Error parsing buffer at byte location ${n2}: Could not find the next null character.`);
          let a4 = e5.slice(n2, r3).toString(`utf8`);
          a4 === `40000` && (a4 = `040000`);
          let o4 = Fe3(a4), s4 = e5.slice(r3 + 1, i4).toString(`utf8`);
          if (s4.includes(`\\`) || s4.includes(`/`)) throw new m4(s4);
          let c4 = e5.slice(i4 + 1, i4 + 21).toString(`hex`);
          n2 = i4 + 21, t4.push({ mode: a4, path: s4, oid: c4, type: o4 });
        }
        return t4;
      }
      function Le3(e5) {
        if (typeof e5 == `number` && (e5 = e5.toString(8)), e5.match(/^0?4.*/)) return `040000`;
        if (e5.match(/^1006.*/)) return `100644`;
        if (e5.match(/^1007.*/)) return `100755`;
        if (e5.match(/^120.*/)) return `120000`;
        if (e5.match(/^160.*/)) return `160000`;
        throw new p3(`Could not understand file mode: ${e5}`);
      }
      function Re3(e5) {
        return !e5.oid && e5.sha && (e5.oid = e5.sha), e5.mode = Le3(e5.mode), e5.type ||= Fe3(e5.mode), e5;
      }
      var ze3 = class e5 {
        constructor(e6) {
          if (Buffer.isBuffer(e6)) this._entries = Ie3(e6);
          else if (Array.isArray(e6)) this._entries = e6.map(Re3);
          else throw new p3(`invalid type passed to GitTree constructor`);
          this._entries.sort(_4);
        }
        static from(t4) {
          return new e5(t4);
        }
        render() {
          return this._entries.map((e6) => `${e6.mode} ${e6.type} ${e6.oid}    ${e6.path}`).join(`
`);
        }
        toObject() {
          let e6 = [...this._entries];
          return e6.sort(Me3), Buffer.concat(e6.map((e7) => {
            let t4 = Buffer.from(e7.mode.replace(/^0/, ``)), n2 = Buffer.from(` `), r3 = Buffer.from(e7.path, `utf8`), i4 = Buffer.from([0]), a4 = Buffer.from(e7.oid, `hex`);
            return Buffer.concat([t4, n2, r3, i4, a4]);
          }));
        }
        entries() {
          return this._entries;
        }
        *[Symbol.iterator]() {
          for (let e6 of this._entries) yield e6;
        }
      }, Be3 = class {
        static wrap({ type: e5, object: t4 }) {
          let n2 = `${e5} ${t4.length}\0`, r3 = n2.length, i4 = r3 + t4.length, a4 = new Uint8Array(i4);
          for (let e6 = 0; e6 < r3; e6++) a4[e6] = n2.charCodeAt(e6);
          return a4.set(t4, r3), a4;
        }
        static unwrap(e5) {
          let t4 = e5.indexOf(32), n2 = e5.indexOf(0), r3 = e5.slice(0, t4).toString(`utf8`), i4 = e5.slice(t4 + 1, n2).toString(`utf8`), a4 = e5.length - (n2 + 1);
          if (parseInt(i4) !== a4) throw new p3(`Length mismatch: expected ${i4} bytes but got ${a4} instead.`);
          return { type: r3, object: Buffer.from(e5.slice(n2 + 1)) };
        }
      };
      async function Ve3({ fs: e5, gitdir: t4, oid: n2 }) {
        let r3 = `objects/${n2.slice(0, 2)}/${n2.slice(2)}`, i4 = await e5.read(`${t4}/${r3}`);
        return i4 ? { object: i4, format: `deflated`, source: r3 } : null;
      }
      function He3(e5, t4) {
        let n2 = new h4(e5), r3 = Ue3(n2);
        if (r3 !== t4.byteLength) throw new p3(`applyDelta expected source buffer to be ${r3} bytes but the provided buffer was ${t4.length} bytes`);
        let i4 = Ue3(n2), a4, o4 = Ge2(n2, t4);
        if (o4.byteLength === i4) a4 = o4;
        else {
          a4 = Buffer.alloc(i4);
          let e6 = new h4(a4);
          for (e6.copy(o4); !n2.eof(); ) e6.copy(Ge2(n2, t4));
          let r4 = e6.tell();
          if (i4 !== r4) throw new p3(`applyDelta expected target buffer to be ${i4} bytes but the resulting buffer was ${r4} bytes`);
        }
        return a4;
      }
      function Ue3(e5) {
        let t4 = 0, n2 = 0, r3 = null;
        do
          r3 = e5.readUInt8(), t4 |= (r3 & 127) << n2, n2 += 7;
        while (r3 & 128);
        return t4;
      }
      function We2(e5, t4, n2) {
        let r3 = 0, i4 = 0;
        for (; n2--; ) t4 & 1 && (r3 |= e5.readUInt8() << i4), t4 >>= 1, i4 += 8;
        return r3;
      }
      function Ge2(e5, t4) {
        let n2 = e5.readUInt8();
        if (n2 & 128) {
          let r3 = We2(e5, n2 & 15, 4), i4 = We2(e5, (n2 & 112) >> 4, 3);
          return i4 === 0 && (i4 = 65536), t4.slice(r3, r3 + i4);
        } else return e5.slice(n2);
      }
      function Ke3(e5) {
        let t4 = [e5];
        return { next() {
          return Promise.resolve({ done: t4.length === 0, value: t4.pop() });
        }, return() {
          return t4 = [], {};
        }, [Symbol.asyncIterator]() {
          return this;
        } };
      }
      function qe2(e5) {
        return e5[Symbol.asyncIterator] ? e5[Symbol.asyncIterator]() : e5[Symbol.iterator] ? e5[Symbol.iterator]() : e5.next ? e5 : Ke3(e5);
      }
      var Je2 = class {
        constructor(e5) {
          if (typeof Buffer > `u`) throw Error(`Missing Buffer dependency`);
          this.stream = qe2(e5), this.buffer = null, this.cursor = 0, this.undoCursor = 0, this.started = false, this._ended = false, this._discardedBytes = 0;
        }
        eof() {
          return this._ended && this.cursor === this.buffer.length;
        }
        tell() {
          return this._discardedBytes + this.cursor;
        }
        async byte() {
          if (!this.eof() && (this.started || await this._init(), !(this.cursor === this.buffer.length && (await this._loadnext(), this._ended)))) return this._moveCursor(1), this.buffer[this.undoCursor];
        }
        async chunk() {
          if (!this.eof() && (this.started || await this._init(), !(this.cursor === this.buffer.length && (await this._loadnext(), this._ended)))) return this._moveCursor(this.buffer.length), this.buffer.slice(this.undoCursor, this.cursor);
        }
        async read(e5) {
          if (!this.eof()) return this.started || await this._init(), this.cursor + e5 > this.buffer.length && (this._trim(), await this._accumulate(e5)), this._moveCursor(e5), this.buffer.slice(this.undoCursor, this.cursor);
        }
        async skip(e5) {
          this.eof() || (this.started || await this._init(), this.cursor + e5 > this.buffer.length && (this._trim(), await this._accumulate(e5)), this._moveCursor(e5));
        }
        async undo() {
          this.cursor = this.undoCursor;
        }
        async _next() {
          this.started = true;
          let { done: e5, value: t4 } = await this.stream.next();
          return e5 && (this._ended = true, !t4) ? Buffer.alloc(0) : (t4 &&= Buffer.from(t4), t4);
        }
        _trim() {
          this.buffer = this.buffer.slice(this.undoCursor), this.cursor -= this.undoCursor, this._discardedBytes += this.undoCursor, this.undoCursor = 0;
        }
        _moveCursor(e5) {
          this.undoCursor = this.cursor, this.cursor += e5, this.cursor > this.buffer.length && (this.cursor = this.buffer.length);
        }
        async _accumulate(e5) {
          if (this._ended) return;
          let t4 = [this.buffer];
          for (; this.cursor + e5 > Ye2(t4); ) {
            let e6 = await this._next();
            if (this._ended) break;
            t4.push(e6);
          }
          this.buffer = Buffer.concat(t4);
        }
        async _loadnext() {
          this._discardedBytes += this.buffer.length, this.undoCursor = 0, this.cursor = 0, this.buffer = await this._next();
        }
        async _init() {
          this.buffer = await this._next();
        }
      };
      function Ye2(e5) {
        return e5.reduce((e6, t4) => e6 + t4.length, 0);
      }
      async function Xe2(e5, t4) {
        let n2 = new Je2(e5), r3 = await n2.read(4);
        if (r3 = r3.toString(`utf8`), r3 !== `PACK`) throw new p3(`Invalid PACK header '${r3}'`);
        let i4 = await n2.read(4);
        if (i4 = i4.readUInt32BE(0), i4 !== 2) throw new p3(`Invalid packfile version: ${i4}`);
        let a4 = await n2.read(4);
        if (a4 = a4.readUInt32BE(0), !(a4 < 1)) for (; !n2.eof() && a4--; ) {
          let e6 = n2.tell(), { type: r4, length: i5, ofs: s4, reference: c4 } = await Ze2(n2), l4 = new o3.Inflate();
          for (; !l4.result; ) {
            let o4 = await n2.chunk();
            if (!o4) break;
            if (l4.push(o4, false), l4.err) throw new p3(`Pako error: ${l4.msg}`);
            if (l4.result) {
              if (l4.result.length !== i5) throw new p3(`Inflated object size is different from that stated in packfile.`);
              await n2.undo(), await n2.read(o4.length - l4.strm.avail_in);
              let u3 = n2.tell();
              await t4({ data: l4.result, type: r4, num: a4, offset: e6, end: u3, reference: c4, ofs: s4 });
            }
          }
        }
      }
      async function Ze2(e5) {
        let t4 = await e5.byte(), n2 = t4 >> 4 & 7, r3 = t4 & 15;
        if (t4 & 128) {
          let n3 = 4;
          do
            t4 = await e5.byte(), r3 |= (t4 & 127) << n3, n3 += 7;
          while (t4 & 128);
        }
        let i4, a4;
        if (n2 === 6) {
          let n3 = 0;
          i4 = 0;
          let r4 = [];
          do
            t4 = await e5.byte(), i4 |= (t4 & 127) << n3, n3 += 7, r4.push(t4);
          while (t4 & 128);
          a4 = Buffer.from(r4);
        }
        return n2 === 7 && (a4 = await e5.read(20)), { type: n2, length: r3, ofs: i4, reference: a4 };
      }
      let Qe3 = false;
      async function $e3(e5) {
        return Qe3 === null && (Qe3 = tt3()), Qe3 ? et3(e5) : o3.inflate(e5);
      }
      async function et3(e5) {
        let t4 = new DecompressionStream(`deflate`), n2 = new Blob([e5]).stream().pipeThrough(t4);
        return new Uint8Array(await new Response(n2).arrayBuffer());
      }
      function tt3() {
        try {
          if (new DecompressionStream(`deflate`)) return true;
        } catch {
        }
        return false;
      }
      function nt3(e5) {
        let t4 = [], n2 = 0, r3 = 0;
        do {
          n2 = e5.readUInt8();
          let i4 = n2 & 127;
          t4.push(i4), r3 = n2 & 128;
        } while (r3);
        return t4.reduce((e6, t5) => e6 + 1 << 7 | t5, -1);
      }
      function rt3(e5, t4) {
        let n2 = t4, r3 = 4, i4 = null;
        do
          i4 = e5.readUInt8(), n2 |= (i4 & 127) << r3, r3 += 7;
        while (i4 & 128);
        return n2;
      }
      var it3 = class e5 {
        constructor(e6) {
          Object.assign(this, e6), this.offsetCache = {};
        }
        static async fromIdx({ idx: t4, getExternalRefDelta: n2 }) {
          let r3 = new h4(t4);
          if (r3.slice(4).toString(`hex`) !== `ff744f63`) return;
          let i4 = r3.readUInt32BE();
          if (i4 !== 2) throw new p3(`Unable to read version ${i4} packfile IDX. (Only version 2 supported)`);
          if (t4.byteLength > 2048 * 1024 * 1024) throw new p3(`To keep implementation simple, I haven't implemented the layer 5 feature needed to support packfiles > 2GB in size.`);
          r3.seek(r3.tell() + 1020);
          let a4 = r3.readUInt32BE(), o4 = [];
          for (let e6 = 0; e6 < a4; e6++) o4[e6] = r3.slice(20).toString(`hex`);
          r3.seek(r3.tell() + 4 * a4);
          let s4 = /* @__PURE__ */ new Map();
          for (let e6 = 0; e6 < a4; e6++) s4.set(o4[e6], r3.readUInt32BE());
          return new e5({ hashes: o4, crcs: {}, offsets: s4, packfileSha: r3.slice(20).toString(`hex`), getExternalRefDelta: n2 });
        }
        static async fromPack({ pack: t4, getExternalRefDelta: n2, onProgress: r3 }) {
          let i4 = { 1: `commit`, 2: `tree`, 3: `blob`, 4: `tag`, 6: `ofs-delta`, 7: `ref-delta` }, o4 = {}, s4 = t4.slice(-20).toString(`hex`), c4 = [], l4 = {}, u3 = /* @__PURE__ */ new Map(), d4 = null, f4 = null;
          await Xe2([t4], async ({ data: e6, type: t5, reference: n3, offset: a4, num: s5 }) => {
            d4 === null && (d4 = s5);
            let c5 = Math.floor((d4 - s5) * 100 / d4);
            c5 !== f4 && r3 && await r3({ phase: `Receiving objects`, loaded: d4 - s5, total: d4 }), f4 = c5, t5 = i4[t5], ([`commit`, `tree`, `blob`, `tag`].includes(t5) || t5 === `ofs-delta` || t5 === `ref-delta`) && (o4[a4] = { type: t5, offset: a4 });
          });
          let p4 = Object.keys(o4).map(Number);
          for (let [e6, n3] of p4.entries()) {
            let r4 = e6 + 1 === p4.length ? t4.byteLength - 20 : p4[e6 + 1], i5 = o4[n3], s5 = a3.buf(t4.slice(n3, r4)) >>> 0;
            i5.end = r4, i5.crc = s5;
          }
          let m5 = new e5({ pack: Promise.resolve(t4), packfileSha: s4, crcs: l4, hashes: c4, offsets: u3, getExternalRefDelta: n2 });
          f4 = null;
          let h5 = 0, g5 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          for (let e6 in o4) {
            e6 = Number(e6);
            let t5 = Math.floor(h5 * 100 / d4);
            t5 !== f4 && r3 && await r3({ phase: `Resolving deltas`, loaded: h5, total: d4 }), h5++, f4 = t5;
            let n3 = o4[e6];
            if (!n3.oid) try {
              m5.readDepth = 0, m5.externalReadDepth = 0;
              let { type: t6, object: r4 } = await m5.readSlice({ start: e6 });
              g5[m5.readDepth] += 1;
              let i5 = await w4(Be3.wrap({ type: t6, object: r4 }));
              n3.oid = i5, c4.push(i5), u3.set(i5, e6), l4[i5] = n3.crc;
            } catch {
              continue;
            }
          }
          return c4.sort(), m5;
        }
        async toBuffer() {
          let e6 = [], t4 = (t5, n3) => {
            e6.push(Buffer.from(t5, n3));
          };
          t4(`ff744f63`, `hex`), t4(`00000002`, `hex`);
          let n2 = new h4(Buffer.alloc(256 * 4));
          for (let e7 = 0; e7 < 256; e7++) {
            let t5 = 0;
            for (let n3 of this.hashes) parseInt(n3.slice(0, 2), 16) <= e7 && t5++;
            n2.writeUInt32BE(t5);
          }
          e6.push(n2.buffer);
          for (let e7 of this.hashes) t4(e7, `hex`);
          let r3 = new h4(Buffer.alloc(this.hashes.length * 4));
          for (let e7 of this.hashes) r3.writeUInt32BE(this.crcs[e7]);
          e6.push(r3.buffer);
          let i4 = new h4(Buffer.alloc(this.hashes.length * 4));
          for (let e7 of this.hashes) i4.writeUInt32BE(this.offsets.get(e7));
          e6.push(i4.buffer), t4(this.packfileSha, `hex`);
          let a4 = Buffer.concat(e6), o4 = await w4(a4), s4 = Buffer.alloc(20);
          return s4.write(o4, `hex`), Buffer.concat([a4, s4]);
        }
        async load({ pack: e6 }) {
          this.pack = e6;
        }
        async unload() {
          this.pack = null;
        }
        async read({ oid: e6 }) {
          if (!this.offsets.get(e6)) {
            if (this.getExternalRefDelta) return this.externalReadDepth++, this.getExternalRefDelta(e6);
            throw new p3(`Could not read object ${e6} from packfile`);
          }
          let t4 = this.offsets.get(e6);
          return this.readSlice({ start: t4 });
        }
        async readSlice({ start: e6 }) {
          if (this.offsetCache[e6]) return Object.assign({}, this.offsetCache[e6]);
          this.readDepth++;
          let t4 = { 16: `commit`, 32: `tree`, 48: `blob`, 64: `tag`, 96: `ofs_delta`, 112: `ref_delta` }, n2 = await this.pack;
          if (!n2) throw new p3(`Could not read packfile data. The packfile may be missing, corrupted, or too large to read into memory.`);
          let r3 = n2.slice(e6), i4 = new h4(r3), a4 = i4.readUInt8(), o4 = a4 & 112, s4 = t4[o4];
          if (s4 === void 0) throw new p3(`Unrecognized type: 0b` + o4.toString(2));
          let c4 = a4 & 15, l4 = c4;
          a4 & 128 && (l4 = rt3(i4, c4));
          let u3 = null, d4 = null;
          if (s4 === `ofs_delta`) {
            let t5 = e6 - nt3(i4);
            ({ object: u3, type: s4 } = await this.readSlice({ start: t5 }));
          }
          if (s4 === `ref_delta`) {
            let e7 = i4.slice(20).toString(`hex`);
            ({ object: u3, type: s4 } = await this.read({ oid: e7 }));
          }
          let f4 = r3.slice(i4.tell());
          if (d4 = Buffer.from(await $e3(f4)), d4.byteLength !== l4) throw new p3(`Packfile told us object would have length ${l4} but it had length ${d4.byteLength}`);
          return u3 && (d4 = Buffer.from(He3(d4, u3))), this.readDepth > 3 && (this.offsetCache[e6] = { type: s4, object: d4 }), { type: s4, format: `content`, object: d4 };
        }
      };
      let at3 = /* @__PURE__ */ Symbol(`PackfileCache`);
      async function ot3({ fs: e5, filename: t4, getExternalRefDelta: n2, emitter: r3, emitterPrefix: i4 }) {
        let a4 = await e5.read(t4);
        return it3.fromIdx({ idx: a4, getExternalRefDelta: n2 });
      }
      function st3({ fs: e5, cache: t4, filename: n2, getExternalRefDelta: r3, emitter: i4, emitterPrefix: a4 }) {
        t4[at3] || (t4[at3] = /* @__PURE__ */ new Map());
        let o4 = t4[at3].get(n2);
        return o4 || (o4 = ot3({ fs: e5, filename: n2, getExternalRefDelta: r3, emitter: i4, emitterPrefix: a4 }), t4[at3].set(n2, o4)), o4;
      }
      let ct3 = 8 * 1024 * 1024;
      async function lt3(e5, { start: t4 = 0, end: n2 = e5.length } = {}) {
        let r3 = s3.createHash(`sha1`);
        for (let i4 = t4; i4 < n2; i4 += ct3) r3.update(e5.subarray(i4, Math.min(i4 + ct3, n2)));
        return r3.digest(`hex`);
      }
      async function ut3({ fs: e5, cache: t4, gitdir: n2, oid: r3, format: i4 = `content`, getExternalRefDelta: a4 }) {
        let o4 = await e5.readdir(ce3(n2, `objects/pack`));
        o4 = o4.filter((e6) => e6.endsWith(`.idx`));
        for (let i5 of o4) {
          let o5 = `${n2}/objects/pack/${i5}`, s4 = await st3({ fs: e5, cache: t4, filename: o5, getExternalRefDelta: a4 });
          if (s4.error) throw new p3(s4.error);
          if (s4.offsets.has(r3)) {
            let t5 = o5.replace(/idx$/, `pack`);
            s4.pack ||= e5.read(t5);
            let n3 = await s4.pack;
            if (!n3) throw s4.pack = null, new p3(`Could not read packfile at ${t5}. The file may be missing, corrupted, or too large to read into memory.`);
            if (!s4._checksumVerified) {
              let e6 = s4.packfileSha, t6 = n3.subarray(-20), r4 = Array.from(t6).map((e7) => e7.toString(16).padStart(2, `0`)).join(``);
              if (r4 !== e6) throw new p3(`Packfile trailer mismatch: expected ${e6}, got ${r4}. The packfile may be corrupted.`);
              let i6 = await lt3(n3, { start: 0, end: n3.length - 20 });
              if (i6 !== e6) throw new p3(`Packfile payload corrupted: calculated ${i6} but expected ${e6}. The packfile may have been tampered with.`);
              s4._checksumVerified = true;
            }
            let c4 = await s4.read({ oid: r3, getExternalRefDelta: a4 });
            return c4.format = `content`, c4.source = `objects/pack/${i5.replace(/idx$/, `pack`)}`, c4;
          }
        }
        return null;
      }
      async function dt3({ fs: e5, cache: t4, gitdir: n2, oid: r3, format: i4 = `content` }) {
        let a4 = (r4) => dt3({ fs: e5, cache: t4, gitdir: n2, oid: r4 }), o4;
        if (r3 === `4b825dc642cb6eb9a060e54bf8d69288fbee4904` && (o4 = { format: `wrapped`, object: Buffer.from(`tree 0\0`) }), o4 ||= await Ve3({ fs: e5, gitdir: n2, oid: r3 }), !o4) {
          if (o4 = await ut3({ fs: e5, cache: t4, gitdir: n2, oid: r3, getExternalRefDelta: a4 }), !o4) throw new H3(r3);
          return o4;
        }
        if (i4 === `deflated` || (o4.format === `deflated` && (o4.object = Buffer.from(await $e3(o4.object)), o4.format = `wrapped`), i4 === `wrapped`)) return o4;
        let s4 = await w4(o4.object);
        if (s4 !== r3) throw new p3(`SHA check failed! Expected ${r3}, computed ${s4}`);
        let { object: c4, type: l4 } = Be3.unwrap(o4.object);
        if (o4.type = l4, o4.object = c4, o4.format = `content`, i4 === `content`) return o4;
        throw new p3(`invalid requested format "${i4}"`);
      }
      var ft3 = class e5 extends d3 {
        constructor(t4, n2, r3 = true) {
          super(`Failed to create ${t4} at ${n2} because it already exists.${r3 ? ` (Hint: use 'force: true' parameter to overwrite existing ${t4}.)` : ``}`), this.code = this.name = e5.code, this.data = { noun: t4, where: n2, canForce: r3 };
        }
      };
      ft3.code = `AlreadyExistsError`;
      var pt3 = class e5 extends d3 {
        constructor(t4, n2, r3) {
          super(`Found multiple ${t4} matching "${n2}" (${r3.join(`, `)}). Use a longer abbreviation length to disambiguate them.`), this.code = this.name = e5.code, this.data = { nouns: t4, short: n2, matches: r3 };
        }
      };
      pt3.code = `AmbiguousError`;
      var mt3 = class e5 extends d3 {
        constructor(t4) {
          super(`Your local changes to the following files would be overwritten by checkout: ${t4.join(`, `)}`), this.code = this.name = e5.code, this.data = { filepaths: t4 };
        }
      };
      mt3.code = `CheckoutConflictError`;
      var ht3 = class e5 extends d3 {
        constructor(t4, n2) {
          super(`Cannot cherry-pick merge commit ${t4}. Merge commits have ${n2} parents and require specifying which parent to use as the base.`), this.code = this.name = e5.code, this.data = { oid: t4, parentCount: n2 };
        }
      };
      ht3.code = `CherryPickMergeCommitError`;
      var gt3 = class e5 extends d3 {
        constructor(t4) {
          super(`Cannot cherry-pick root commit ${t4}. Root commits have no parents.`), this.code = this.name = e5.code, this.data = { oid: t4 };
        }
      };
      gt3.code = `CherryPickRootCommitError`;
      var _t3 = class e5 extends d3 {
        constructor(t4, n2) {
          super(`Failed to checkout "${t4}" because commit ${n2} is not available locally. Do a git fetch to make the branch available locally.`), this.code = this.name = e5.code, this.data = { ref: t4, oid: n2 };
        }
      };
      _t3.code = `CommitNotFetchedError`;
      var vt3 = class e5 extends d3 {
        constructor() {
          super(`Empty response from git server.`), this.code = this.name = e5.code, this.data = {};
        }
      };
      vt3.code = `EmptyServerResponseError`;
      var yt3 = class e5 extends d3 {
        constructor() {
          super(`A simple fast-forward merge was not possible.`), this.code = this.name = e5.code, this.data = {};
        }
      };
      yt3.code = `FastForwardError`;
      var bt3 = class e5 extends d3 {
        constructor(t4, n2) {
          super(`One or more branches were not updated: ${t4}`), this.code = this.name = e5.code, this.data = { prettyDetails: t4, result: n2 };
        }
      };
      bt3.code = `GitPushError`;
      var xt3 = class e5 extends d3 {
        constructor(t4, n2, r3) {
          super(`HTTP Error: ${t4} ${n2}`), this.code = this.name = e5.code, this.data = { statusCode: t4, statusMessage: n2, response: r3 };
        }
      };
      xt3.code = `HttpError`;
      var St3 = class e5 extends d3 {
        constructor(t4) {
          let n2 = `invalid filepath`;
          t4 === `leading-slash` || t4 === `trailing-slash` ? n2 = `"filepath" parameter should not include leading or trailing directory separators because these can cause problems on some platforms.` : t4 === `directory` && (n2 = `"filepath" should not be a directory.`), super(n2), this.code = this.name = e5.code, this.data = { reason: t4 };
        }
      };
      St3.code = `InvalidFilepathError`;
      var Ct3 = class e5 extends d3 {
        constructor(t4, n2) {
          super(`"${t4}" would be an invalid git reference. (Hint: a valid alternative would be "${n2}".)`), this.code = this.name = e5.code, this.data = { ref: t4, suggestion: n2 };
        }
      };
      Ct3.code = `InvalidRefNameError`;
      var wt3 = class e5 extends d3 {
        constructor(t4) {
          super(`Maximum search depth of ${t4} exceeded.`), this.code = this.name = e5.code, this.data = { depth: t4 };
        }
      };
      wt3.code = `MaxDepthError`;
      var Tt3 = class e5 extends d3 {
        constructor() {
          super(`Merges with conflicts are not supported yet.`), this.code = this.name = e5.code, this.data = {};
        }
      };
      Tt3.code = `MergeNotSupportedError`;
      var Et3 = class e5 extends d3 {
        constructor(t4, n2, r3, i4) {
          super(`Automatic merge failed with one or more merge conflicts in the following files: ${t4.toString()}. Fix conflicts then commit the result.`), this.code = this.name = e5.code, this.data = { filepaths: t4, bothModified: n2, deleteByUs: r3, deleteByTheirs: i4 };
        }
      };
      Et3.code = `MergeConflictError`;
      var Dt3 = class e5 extends d3 {
        constructor(t4) {
          super(`No name was provided for ${t4} in the argument or in the .git/config file.`), this.code = this.name = e5.code, this.data = { role: t4 };
        }
      };
      Dt3.code = `MissingNameError`;
      var Ot3 = class e5 extends d3 {
        constructor(t4) {
          super(`The function requires a "${t4}" parameter but none was provided.`), this.code = this.name = e5.code, this.data = { parameter: t4 };
        }
      };
      Ot3.code = `MissingParameterError`;
      var kt3 = class e5 extends d3 {
        constructor(t4) {
          super(`There are multiple errors that were thrown by the method. Please refer to the "errors" property to see more`), this.code = this.name = e5.code, this.data = { errors: t4 }, this.errors = t4;
        }
      };
      kt3.code = `MultipleGitError`;
      var At3 = class e5 extends d3 {
        constructor(t4, n2) {
          super(`Expected "${t4}" but received "${n2}".`), this.code = this.name = e5.code, this.data = { expected: t4, actual: n2 };
        }
      };
      At3.code = `ParseError`;
      var jt3 = class e5 extends d3 {
        constructor(t4) {
          let n2 = ``;
          t4 === `not-fast-forward` ? n2 = ` because it was not a simple fast-forward` : t4 === `tag-exists` && (n2 = ` because tag already exists`), super(`Push rejected${n2}. Use "force: true" to override.`), this.code = this.name = e5.code, this.data = { reason: t4 };
        }
      };
      jt3.code = `PushRejectedError`;
      var Mt3 = class e5 extends d3 {
        constructor(t4, n2) {
          super(`Remote does not support the "${t4}" so the "${n2}" parameter cannot be used.`), this.code = this.name = e5.code, this.data = { capability: t4, parameter: n2 };
        }
      };
      Mt3.code = `RemoteCapabilityError`;
      var Nt3 = class e5 extends d3 {
        constructor(t4, n2) {
          super(`Remote did not reply using the "smart" HTTP protocol. Expected "001e# service=git-upload-pack" but received: ${t4}`), this.code = this.name = e5.code, this.data = { preview: t4, response: n2 };
        }
      };
      Nt3.code = `SmartHttpError`;
      var Pt3 = class e5 extends d3 {
        constructor(t4, n2, r3) {
          super(`Git remote "${t4}" uses an unrecognized transport protocol: "${n2}"`), this.code = this.name = e5.code, this.data = { url: t4, transport: n2, suggestion: r3 };
        }
      };
      Pt3.code = `UnknownTransportError`;
      var Ft3 = class e5 extends d3 {
        constructor(t4) {
          super(`Cannot parse remote URL: "${t4}"`), this.code = this.name = e5.code, this.data = { url: t4 };
        }
      };
      Ft3.code = `UrlParseError`;
      var It3 = class e5 extends d3 {
        constructor() {
          super(`The operation was canceled.`), this.code = this.name = e5.code, this.data = {};
        }
      };
      It3.code = `UserCanceledError`;
      var Lt3 = class e5 extends d3 {
        constructor(t4) {
          super(`Could not merge index: Entry for '${t4}' is not up to date. Either reset the index entry to HEAD, or stage your unstaged changes.`), this.code = this.name = e5.code, this.data = { filepath: t4 };
        }
      };
      Lt3.code = `IndexResetError`;
      var Rt3 = class e5 extends d3 {
        constructor(t4) {
          super(`"${t4}" does not point to any commit. You're maybe working on a repository with no commits yet. `), this.code = this.name = e5.code, this.data = { ref: t4 };
        }
      };
      Rt3.code = `NoCommitError`;
      function zt3({ name: e5, email: t4, timestamp: n2, timezoneOffset: r3 }) {
        return r3 = Bt3(r3), `${e5} <${t4}> ${n2} ${r3}`;
      }
      function Bt3(e5) {
        let t4 = Vt3(Ht3(e5));
        e5 = Math.abs(e5);
        let n2 = Math.floor(e5 / 60);
        e5 -= n2 * 60;
        let r3 = String(n2), i4 = String(e5);
        return r3.length < 2 && (r3 = `0` + r3), i4.length < 2 && (i4 = `0` + i4), (t4 === -1 ? `-` : `+`) + r3 + i4;
      }
      function Vt3(e5) {
        return Math.sign(e5) || (Object.is(e5, -0) ? -1 : 1);
      }
      function Ht3(e5) {
        return e5 === 0 ? e5 : -e5;
      }
      function Ut3(e5) {
        return e5 = e5.replace(/\r/g, ``), e5 = e5.replace(/^\n+/, ``), e5 = e5.replace(/\n+$/, ``) + `
`, e5;
      }
      function Wt3(e5) {
        let [, t4, n2, r3, i4] = e5.match(/^(.*) <(.*)> (.*) (.*)$/);
        return { name: t4, email: n2, timestamp: Number(r3), timezoneOffset: Gt3(i4) };
      }
      function Gt3(e5) {
        let [, t4, n2, r3] = e5.match(/(\+|-)(\d\d)(\d\d)/);
        return r3 = (t4 === `+` ? 1 : -1) * (Number(n2) * 60 + Number(r3)), Kt3(r3);
      }
      function Kt3(e5) {
        return e5 === 0 ? e5 : -e5;
      }
      var qt2 = class e5 {
        constructor(t4) {
          if (typeof t4 == `string`) this._tag = t4;
          else if (Buffer.isBuffer(t4)) this._tag = t4.toString(`utf8`);
          else if (typeof t4 == `object`) this._tag = e5.render(t4);
          else throw new p3(`invalid type passed to GitAnnotatedTag constructor`);
        }
        static from(t4) {
          return new e5(t4);
        }
        static render(e6) {
          return `object ${e6.object}
type ${e6.type}
tag ${e6.tag}
tagger ${zt3(e6.tagger)}

${e6.message}
${e6.gpgsig ? e6.gpgsig : ``}`;
        }
        justHeaders() {
          return this._tag.slice(0, this._tag.indexOf(`

`));
        }
        message() {
          let e6 = this.withoutSignature();
          return e6.slice(e6.indexOf(`

`) + 2);
        }
        parse() {
          return Object.assign(this.headers(), { message: this.message(), gpgsig: this.gpgsig() });
        }
        render() {
          return this._tag;
        }
        headers() {
          let e6 = this.justHeaders().split(`
`), t4 = [];
          for (let n3 of e6) n3[0] === ` ` ? t4[t4.length - 1] += `
` + n3.slice(1) : t4.push(n3);
          let n2 = {};
          for (let e7 of t4) {
            let t5 = e7.slice(0, e7.indexOf(` `)), r3 = e7.slice(e7.indexOf(` `) + 1);
            Array.isArray(n2[t5]) ? n2[t5].push(r3) : n2[t5] = r3;
          }
          return n2.tagger &&= Wt3(n2.tagger), n2.committer &&= Wt3(n2.committer), n2;
        }
        withoutSignature() {
          let e6 = Ut3(this._tag);
          return e6.indexOf(`
-----BEGIN PGP SIGNATURE-----`) === -1 ? e6 : e6.slice(0, e6.lastIndexOf(`
-----BEGIN PGP SIGNATURE-----`));
        }
        gpgsig() {
          if (this._tag.indexOf(`
-----BEGIN PGP SIGNATURE-----`) !== -1) return Ut3(this._tag.slice(this._tag.indexOf(`-----BEGIN PGP SIGNATURE-----`), this._tag.indexOf(`-----END PGP SIGNATURE-----`) + 27));
        }
        payload() {
          return this.withoutSignature() + `
`;
        }
        toObject() {
          return Buffer.from(this._tag, `utf8`);
        }
        static async sign(t4, n2, r3) {
          let i4 = t4.payload(), { signature: a4 } = await n2({ payload: i4, secretKey: r3 });
          a4 = Ut3(a4);
          let o4 = i4 + a4;
          return e5.from(o4);
        }
      };
      function Jt2(e5) {
        return e5.trim().split(`
`).map((e6) => ` ` + e6).join(`
`) + `
`;
      }
      function Yt2(e5) {
        return e5.split(`
`).map((e6) => e6.replace(/^ /, ``)).join(`
`);
      }
      var Xt2 = class e5 {
        constructor(t4) {
          if (typeof t4 == `string`) this._commit = t4;
          else if (Buffer.isBuffer(t4)) this._commit = t4.toString(`utf8`);
          else if (typeof t4 == `object`) this._commit = e5.render(t4);
          else throw new p3(`invalid type passed to GitCommit constructor`);
        }
        static fromPayloadSignature({ payload: t4, signature: n2 }) {
          let r3 = e5.justHeaders(t4), i4 = e5.justMessage(t4);
          return new e5(Ut3(r3 + `
gpgsig` + Jt2(n2) + `
` + i4));
        }
        static from(t4) {
          return new e5(t4);
        }
        toObject() {
          return Buffer.from(this._commit, `utf8`);
        }
        headers() {
          return this.parseHeaders();
        }
        message() {
          return e5.justMessage(this._commit);
        }
        parse() {
          return Object.assign({ message: this.message() }, this.headers());
        }
        static justMessage(e6) {
          return Ut3(e6.slice(e6.indexOf(`

`) + 2));
        }
        static justHeaders(e6) {
          return e6.slice(0, e6.indexOf(`

`));
        }
        parseHeaders() {
          let t4 = e5.justHeaders(this._commit).split(`
`), n2 = [];
          for (let e6 of t4) e6[0] === ` ` ? n2[n2.length - 1] += `
` + e6.slice(1) : n2.push(e6);
          let r3 = { parent: [] };
          for (let e6 of n2) {
            let t5 = e6.slice(0, e6.indexOf(` `)), n3 = e6.slice(e6.indexOf(` `) + 1);
            Array.isArray(r3[t5]) ? r3[t5].push(n3) : r3[t5] = n3;
          }
          return r3.author &&= Wt3(r3.author), r3.committer &&= Wt3(r3.committer), r3;
        }
        static renderHeaders(e6) {
          let t4 = ``;
          if (e6.tree ? t4 += `tree ${e6.tree}
` : t4 += `tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
`, e6.parent) {
            if (e6.parent.length === void 0) throw new p3(`commit 'parent' property should be an array`);
            for (let n3 of e6.parent) t4 += `parent ${n3}
`;
          }
          let n2 = e6.author;
          t4 += `author ${zt3(n2)}
`;
          let r3 = e6.committer || e6.author;
          return t4 += `committer ${zt3(r3)}
`, e6.gpgsig && (t4 += `gpgsig` + Jt2(e6.gpgsig)), t4;
        }
        static render(t4) {
          return e5.renderHeaders(t4) + `
` + Ut3(t4.message);
        }
        render() {
          return this._commit;
        }
        withoutSignature() {
          let e6 = Ut3(this._commit);
          if (e6.indexOf(`
gpgsig`) === -1) return e6;
          let t4 = e6.slice(0, e6.indexOf(`
gpgsig`)), n2 = e6.slice(e6.indexOf(`-----END PGP SIGNATURE-----
`) + 28);
          return Ut3(t4 + `
` + n2);
        }
        isolateSignature() {
          return Yt2(this._commit.slice(this._commit.indexOf(`-----BEGIN PGP SIGNATURE-----`), this._commit.indexOf(`-----END PGP SIGNATURE-----`) + 27));
        }
        static async sign(t4, n2, r3) {
          let i4 = t4.withoutSignature(), a4 = e5.justMessage(t4._commit), { signature: o4 } = await n2({ payload: i4, secretKey: r3 });
          o4 = Ut3(o4);
          let s4 = e5.justHeaders(t4._commit) + `
gpgsig` + Jt2(o4) + `
` + a4;
          return e5.from(s4);
        }
      };
      async function Zt2({ fs: e5, cache: t4, gitdir: n2, oid: r3 }) {
        if (r3 === `4b825dc642cb6eb9a060e54bf8d69288fbee4904`) return { tree: ze3.from([]), oid: r3 };
        let { type: i4, object: a4 } = await dt3({ fs: e5, cache: t4, gitdir: n2, oid: r3 });
        if (i4 === `tag`) return r3 = qt2.from(a4).parse().object, Zt2({ fs: e5, cache: t4, gitdir: n2, oid: r3 });
        if (i4 === `commit`) return r3 = Xt2.from(a4).parse().tree, Zt2({ fs: e5, cache: t4, gitdir: n2, oid: r3 });
        if (i4 !== `tree`) throw new re3(r3, i4, `tree`);
        return { tree: ze3.from(a4), oid: r3 };
      }
      var Qt2 = class {
        constructor({ fs: e5, gitdir: t4, ref: n2, cache: r3 }) {
          this.fs = e5, this.cache = r3, this.gitdir = t4, this.mapPromise = (async () => {
            let r4 = /* @__PURE__ */ new Map(), i5;
            try {
              i5 = await De3.resolve({ fs: e5, gitdir: t4, ref: n2 });
            } catch (e6) {
              e6 instanceof H3 && (i5 = `4b825dc642cb6eb9a060e54bf8d69288fbee4904`);
            }
            let a4 = await Zt2({ fs: e5, cache: this.cache, gitdir: t4, oid: i5 });
            return a4.type = `tree`, a4.mode = `40000`, r4.set(`.`, a4), r4;
          })();
          let i4 = this;
          this.ConstructEntry = class {
            constructor(e6) {
              this._fullpath = e6, this._type = false, this._mode = false, this._stat = false, this._content = false, this._oid = false;
            }
            async type() {
              return i4.type(this);
            }
            async mode() {
              return i4.mode(this);
            }
            async stat() {
              return i4.stat(this);
            }
            async content() {
              return i4.content(this);
            }
            async oid() {
              return i4.oid(this);
            }
          };
        }
        async readdir(e5) {
          let t4 = e5._fullpath, { fs: n2, cache: r3, gitdir: i4 } = this, a4 = await this.mapPromise, o4 = a4.get(t4);
          if (!o4) throw Error(`No obj for ${t4}`);
          let s4 = o4.oid;
          if (!s4) throw Error(`No oid for obj ${JSON.stringify(o4)}`);
          if (o4.type !== `tree`) return null;
          let { type: c4, object: l4 } = await dt3({ fs: n2, cache: r3, gitdir: i4, oid: s4 });
          if (c4 !== o4.type) throw new re3(s4, c4, o4.type);
          let u3 = ze3.from(l4);
          for (let e6 of u3) a4.set(ce3(t4, e6.path), e6);
          return u3.entries().map((e6) => ce3(t4, e6.path));
        }
        async type(e5) {
          if (e5._type === false) {
            let { type: t4 } = (await this.mapPromise).get(e5._fullpath);
            e5._type = t4;
          }
          return e5._type;
        }
        async mode(e5) {
          if (e5._mode === false) {
            let { mode: t4 } = (await this.mapPromise).get(e5._fullpath);
            e5._mode = v4(parseInt(t4, 8));
          }
          return e5._mode;
        }
        async stat(e5) {
        }
        async content(e5) {
          if (e5._content === false) {
            let t4 = await this.mapPromise, { fs: n2, cache: r3, gitdir: i4 } = this, a4 = t4.get(e5._fullpath).oid, { type: o4, object: s4 } = await dt3({ fs: n2, cache: r3, gitdir: i4, oid: a4 });
            o4 === `blob` ? e5._content = new Uint8Array(s4) : e5._content = void 0;
          }
          return e5._content;
        }
        async oid(e5) {
          return e5._oid === false && (e5._oid = (await this.mapPromise).get(e5._fullpath).oid), e5._oid;
        }
      };
      function $t2({ ref: e5 = `HEAD` } = {}) {
        let t4 = /* @__PURE__ */ Object.create(null);
        return Object.defineProperty(t4, B4, { value: function({ fs: t5, gitdir: n2, cache: r3 }) {
          return new Qt2({ fs: t5, gitdir: n2, ref: e5, cache: r3 });
        } }), Object.freeze(t4), t4;
      }
      var en2 = class {
        constructor({ fs: e5, dir: t4, gitdir: n2, cache: r3, refresh: i4 = true }) {
          this.fs = e5, this.cache = r3, this.dir = t4, this.gitdir = n2, this.refresh = i4, this.config = null;
          let a4 = this;
          this.ConstructEntry = class {
            constructor(e6) {
              this._fullpath = e6, this._type = false, this._mode = false, this._stat = false, this._content = false, this._oid = false;
            }
            async type() {
              return a4.type(this);
            }
            async mode() {
              return a4.mode(this);
            }
            async stat() {
              return a4.stat(this);
            }
            async content() {
              return a4.content(this);
            }
            async oid() {
              return a4.oid(this);
            }
          };
        }
        async readdir(e5) {
          let t4 = e5._fullpath, { fs: n2, dir: r3 } = this, i4 = await n2.readdir(ce3(r3, t4));
          return i4 === null ? null : i4.map((e6) => ce3(t4, e6));
        }
        async type(e5) {
          return e5._type === false && await e5.stat(), e5._type;
        }
        async mode(e5) {
          return e5._mode === false && await e5.stat(), e5._mode;
        }
        async stat(e5) {
          if (e5._stat === false) {
            let { fs: t4, dir: n2 } = this, r3 = await t4.lstat(`${n2}/${e5._fullpath}`);
            if (!r3) throw Error(`ENOENT: no such file or directory, lstat '${e5._fullpath}'`);
            let i4 = r3.isDirectory() ? `tree` : `blob`;
            i4 === `blob` && !r3.isFile() && !r3.isSymbolicLink() && (i4 = `special`), e5._type = i4, r3 = x4(r3), e5._mode = r3.mode, r3.size === -1 && e5._actualSize && (r3.size = e5._actualSize), e5._stat = r3;
          }
          return e5._stat;
        }
        async content(e5) {
          if (e5._content === false) {
            let { fs: t4, dir: n2, gitdir: r3 } = this;
            if (await e5.type() === `tree`) e5._content = void 0;
            else {
              let i4;
              if (await e5.mode() >> 12 == 10) i4 = await t4.readlink(`${n2}/${e5._fullpath}`);
              else {
                let a4 = await (await this._getGitConfig(t4, r3)).get(`core.autocrlf`);
                i4 = await t4.read(`${n2}/${e5._fullpath}`, { autocrlf: a4 });
              }
              e5._actualSize = i4.length, e5._stat && e5._stat.size === -1 && (e5._stat.size = e5._actualSize), e5._content = new Uint8Array(i4);
            }
          }
          return e5._content;
        }
        async oid(e5) {
          if (e5._oid === false) {
            let t4 = this, { fs: n2, gitdir: r3, cache: i4 } = this, a4;
            await I4.acquire({ fs: n2, gitdir: r3, cache: i4 }, async function(i5) {
              let o4 = i5.entriesMap.get(e5._fullpath), s4 = await e5.stat(), c4 = await (await t4._getGitConfig(n2, r3)).get(`core.filemode`), l4 = typeof process < `u` ? process.platform !== `win32` : true;
              if (!o4 || j4(s4, o4, c4, l4)) {
                let n3 = await e5.content();
                n3 === void 0 ? a4 = void 0 : (a4 = await w4(Be3.wrap({ type: `blob`, object: n3 })), t4.refresh && o4 && a4 === o4.oid && (!c4 || s4.mode === o4.mode) && j4(s4, o4, c4, l4) && i5.insert({ filepath: e5._fullpath, stats: s4, oid: a4 }));
              } else a4 = o4.oid;
            }), e5._oid = a4;
          }
          return e5._oid;
        }
        async _getGitConfig(e5, t4) {
          return this.config ||= await Se3.get({ fs: e5, gitdir: t4 }), this.config;
        }
      };
      function tn2({ refresh: e5 = true } = {}) {
        let t4 = /* @__PURE__ */ Object.create(null);
        return Object.defineProperty(t4, B4, { value: function({ fs: t5, dir: n2, gitdir: r3, cache: i4 }) {
          return new en2({ fs: t5, dir: n2, gitdir: r3, cache: i4, refresh: e5 });
        } }), Object.freeze(t4), t4;
      }
      function nn2(e5, t4) {
        let n2 = t4 - e5;
        return Array.from({ length: n2 }, (t5, n3) => e5 + n3);
      }
      let rn2 = Array.prototype.flat === void 0 ? (e5) => e5.reduce((e6, t4) => e6.concat(t4), []) : (e5) => e5.flat();
      var an2 = class {
        constructor() {
          this.value = null;
        }
        consider(e5) {
          e5 != null && (this.value === null || e5 < this.value) && (this.value = e5);
        }
        reset() {
          this.value = null;
        }
      };
      function* on2(e5) {
        let t4 = new an2(), n2, r3 = [], i4 = e5.length;
        for (let n3 = 0; n3 < i4; n3++) r3[n3] = e5[n3].next().value, r3[n3] !== void 0 && t4.consider(r3[n3]);
        if (t4.value !== null) for (; ; ) {
          let a4 = [];
          n2 = t4.value, t4.reset();
          for (let o4 = 0; o4 < i4; o4++) r3[o4] !== void 0 && r3[o4] === n2 ? (a4[o4] = r3[o4], r3[o4] = e5[o4].next().value) : a4[o4] = null, r3[o4] !== void 0 && t4.consider(r3[o4]);
          if (yield a4, t4.value === null) return;
        }
      }
      async function sn2({ fs: e5, cache: t4, dir: n2, gitdir: r3, trees: i4, map: a4 = async (e6, t5) => t5, reduce: o4 = async (e6, t5) => {
        let n3 = rn2(t5);
        return e6 !== void 0 && n3.unshift(e6), n3;
      }, iterate: s4 = (e6, t5) => Promise.all([...t5].map(e6)) }) {
        let c4 = i4.map((i5) => i5[B4]({ fs: e5, dir: n2, gitdir: r3, cache: t4 })), l4 = Array(c4.length).fill(`.`), u3 = nn2(0, c4.length), d4 = async (e6) => (u3.forEach((t5) => {
          let n3 = e6[t5];
          e6[t5] = n3 && new c4[t5].ConstructEntry(n3);
        }), { entries: e6, children: on2((await Promise.all(u3.map((t5) => {
          let n3 = e6[t5];
          return n3 ? c4[t5].readdir(n3) : [];
        }))).map((e7) => (e7 === null ? [] : e7)[Symbol.iterator]())) }), f4 = async (e6) => {
          let { entries: t5, children: n3 } = await d4(e6), r4 = t5.find((e7) => e7 && e7._fullpath)._fullpath, i5 = await a4(r4, t5);
          if (i5 !== null) {
            let e7 = await s4(f4, n3);
            return e7 = e7.filter((e8) => e8 !== void 0), o4(i5, e7);
          }
        };
        return f4(l4);
      }
      async function cn2(e5, t4) {
        let n2 = await e5.readdir(t4);
        n2 == null ? await e5.rm(t4) : n2.length ? await Promise.all(n2.map((n3) => {
          let r3 = ce3(t4, n3);
          return e5.lstat(r3).then((t5) => {
            if (t5) return t5.isDirectory() ? cn2(e5, r3) : e5.rm(r3);
          });
        })).then(() => e5.rmdir(t4)) : await e5.rmdir(t4);
      }
      function ln2(e5) {
        return un2(e5) && dn2(e5.then) && dn2(e5.catch);
      }
      function un2(e5) {
        return e5 && typeof e5 == `object`;
      }
      function dn2(e5) {
        return typeof e5 == `function`;
      }
      function fn2(e5) {
        return ln2(((e6) => {
          try {
            return e6.readFile().catch((e7) => e7);
          } catch (e7) {
            return e7;
          }
        })(e5));
      }
      let pn2 = [`readFile`, `writeFile`, `mkdir`, `rmdir`, `unlink`, `stat`, `lstat`, `readdir`, `readlink`, `symlink`];
      function mn2(e5, t4) {
        if (fn2(t4)) for (let n2 of pn2) e5[`_${n2}`] = t4[n2].bind(t4);
        else for (let n2 of pn2) e5[`_${n2}`] = c3(t4[n2].bind(t4));
        fn2(t4) ? (t4.cp && (e5._cp = t4.cp.bind(t4)), t4.rm ? e5._rm = t4.rm.bind(t4) : t4.rmdir.length > 1 ? e5._rm = t4.rmdir.bind(t4) : e5._rm = cn2.bind(null, e5)) : (t4.cp && (e5._cp = c3(t4.cp.bind(t4))), t4.rm ? e5._rm = c3(t4.rm.bind(t4)) : t4.rmdir.length > 2 ? e5._rm = c3(t4.rmdir.bind(t4)) : e5._rm = cn2.bind(null, e5));
      }
      var hn2 = class {
        constructor(e5) {
          if (e5._original_unwrapped_fs !== void 0) return e5;
          let t4 = Object.getOwnPropertyDescriptor(e5, `promises`);
          t4 && t4.enumerable ? mn2(this, e5.promises) : mn2(this, e5), this._original_unwrapped_fs = e5;
        }
        async exists(e5, t4 = {}) {
          try {
            return await this._stat(e5), true;
          } catch (e6) {
            if (e6.code === `ENOENT` || e6.code === `ENOTDIR` || (e6.code || ``).includes(`ENS`)) return false;
            throw console.log(`Unhandled error in "FileSystem.exists()" function`, e6), e6;
          }
        }
        async read(e5, t4 = {}) {
          try {
            let n2 = await this._readFile(e5, t4);
            if (t4.autocrlf === `true`) try {
              n2 = new TextDecoder(`utf8`, { fatal: true }).decode(n2), n2 = n2.replace(/\r\n/g, `
`), n2 = new TextEncoder().encode(n2);
            } catch {
            }
            return typeof n2 != `string` && (n2 = Buffer.from(n2)), n2;
          } catch {
            return null;
          }
        }
        async write(e5, t4, n2 = {}) {
          try {
            await this._writeFile(e5, t4, n2);
          } catch {
            await this.mkdir(R4(e5)), await this._writeFile(e5, t4, n2);
          }
        }
        async mkdir(e5, t4 = false) {
          try {
            await this._mkdir(e5);
          } catch (n2) {
            if (n2 === null || n2.code === `EEXIST`) return;
            if (t4) throw n2;
            if (n2.code === `ENOENT`) {
              let t5 = R4(e5);
              if (t5 === `.` || t5 === `/` || t5 === e5) throw n2;
              await this.mkdir(t5), await this.mkdir(e5, true);
            }
          }
        }
        async rm(e5) {
          try {
            await this._unlink(e5);
          } catch (e6) {
            if (e6.code !== `ENOENT`) throw e6;
          }
        }
        async rmdir(e5, t4) {
          try {
            t4 && t4.recursive ? await this._rm(e5, t4) : await this._rmdir(e5);
          } catch (e6) {
            if (e6.code !== `ENOENT`) throw e6;
          }
        }
        async readdir(e5) {
          try {
            let t4 = await this._readdir(e5);
            return t4.sort(g4), t4;
          } catch (e6) {
            return e6.code === `ENOTDIR` ? null : [];
          }
        }
        async readdirDeep(e5) {
          let t4 = await this._readdir(e5);
          return (await Promise.all(t4.map(async (t5) => {
            let n2 = e5 + `/` + t5;
            return (await this._stat(n2)).isDirectory() ? this.readdirDeep(n2) : n2;
          }))).reduce((e6, t5) => e6.concat(t5), []);
        }
        async lstat(e5) {
          try {
            return await this._lstat(e5);
          } catch (e6) {
            if (e6.code === `ENOENT` || (e6.code || ``).includes(`ENS`)) return null;
            throw e6;
          }
        }
        async readlink(e5, t4 = { encoding: `buffer` }) {
          try {
            let n2 = await this._readlink(e5, t4);
            return Buffer.isBuffer(n2) ? n2 : Buffer.from(n2);
          } catch (e6) {
            if (e6.code === `ENOENT` || (e6.code || ``).includes(`ENS`)) return null;
            throw e6;
          }
        }
        async writelink(e5, t4) {
          return this._symlink(t4.toString(`utf8`), e5);
        }
      };
      function gn2(e5, t4) {
        if (t4 === void 0) throw new Ot3(e5);
      }
      function _n2(e5) {
        return e5.startsWith(`/`) || /^[a-zA-Z]:[\\/]/.test(e5);
      }
      async function vn2({ fsp: e5, dotgit: t4 }) {
        gn2(`fsp`, e5), gn2(`dotgit`, t4);
        let n2 = await e5._stat(t4).catch(() => ({ isFile: () => false, isDirectory: () => false }));
        return n2.isDirectory() ? t4 : n2.isFile() ? e5._readFile(t4, `utf8`).then((e6) => e6.trimRight().substr(8)).then((e6) => _n2(e6) ? e6 : ce3(R4(t4), e6)) : t4;
      }
      let yn2 = /(^|[/.])([/.]|$)|^@$|@{|[\x00-\x20\x7f~^:?*[\\]|\.lock(\/|$)/;
      function bn2(e5, t4) {
        if (typeof e5 != `string`) throw TypeError(`Reference name must be a string`);
        return !yn2.test(e5) && (!!t4 || e5.includes(`/`));
      }
      async function xn2({ fs: e5, gitdir: t4, remote: n2, url: r3, force: i4 }) {
        if (!bn2(n2, true)) throw new Ct3(n2, l3.clean(n2));
        let a4 = await Se3.get({ fs: e5, gitdir: t4 });
        if (!i4 && (await a4.getSubsections(`remote`)).includes(n2) && r3 !== await a4.get(`remote.${n2}.url`)) throw new ft3(`remote`, n2);
        await a4.set(`remote.${n2}.url`, r3), await a4.set(`remote.${n2}.fetch`, `+refs/heads/*:refs/remotes/${n2}/*`), await Se3.save({ fs: e5, gitdir: t4, config: a4 });
      }
      let Sn2 = (e5, t4) => e5 === `.` || t4 == null || t4.length === 0 || t4 === `.` ? true : t4.length >= e5.length ? t4.startsWith(e5) : e5.startsWith(t4);
      async function Cn2({ fs: e5, cache: t4, onProgress: n2, onPostCheckout: r3, dir: i4, gitdir: a4, remote: o4, ref: s4, filepaths: c4, noCheckout: l4, noUpdateHead: u3, dryRun: d4, force: f4, track: m5 = true, nonBlocking: h5 = false, batchSize: g5 = 100 }) {
        let _5;
        if (r3) try {
          _5 = await De3.resolve({ fs: e5, gitdir: a4, ref: `HEAD` });
        } catch {
          _5 = `0000000000000000000000000000000000000000`;
        }
        let v5;
        try {
          v5 = await De3.resolve({ fs: e5, gitdir: a4, ref: s4 });
        } catch (t5) {
          if (s4 === `HEAD`) throw t5;
          let n3 = `${o4}/${s4}`;
          if (v5 = await De3.resolve({ fs: e5, gitdir: a4, ref: n3 }), m5) {
            let t6 = await Se3.get({ fs: e5, gitdir: a4 });
            await t6.set(`branch.${s4}.remote`, o4), await t6.set(`branch.${s4}.merge`, `refs/heads/${s4}`), await Se3.save({ fs: e5, gitdir: a4, config: t6 });
          }
          await De3.writeRef({ fs: e5, gitdir: a4, ref: `refs/heads/${s4}`, value: v5 });
        }
        if (!l4) {
          let o5;
          try {
            o5 = await wn2({ fs: e5, cache: t4, onProgress: n2, dir: i4, gitdir: a4, ref: s4, force: f4, filepaths: c4 });
          } catch (e6) {
            throw e6 instanceof H3 && e6.data.what === v5 ? new _t3(s4, v5) : e6;
          }
          let l5 = o5.filter(([e6]) => e6 === `conflict`).map(([e6, t5]) => t5);
          if (l5.length > 0) throw new mt3(l5);
          let u4 = o5.filter(([e6]) => e6 === `error`).map(([e6, t5]) => t5);
          if (u4.length > 0) throw new p3(u4.join(`, `));
          if (d4) {
            r3 && await r3({ previousHead: _5, newHead: v5, type: c4 != null && c4.length > 0 ? `file` : `branch` });
            return;
          }
          let m6 = 0, y5 = o5.length;
          if (await I4.acquire({ fs: e5, gitdir: a4, cache: t4 }, async function(t5) {
            await Promise.all(o5.filter(([e6]) => e6 === `delete` || e6 === `delete-index`).map(async function([r4, a5]) {
              let o6 = `${i4}/${a5}`;
              r4 === `delete` && await e5.rm(o6), t5.delete({ filepath: a5 }), n2 && await n2({ phase: `Updating workdir`, loaded: ++m6, total: y5 });
            }));
          }), await I4.acquire({ fs: e5, gitdir: a4, cache: t4 }, async function(t5) {
            for (let [r4, a5] of o5) if (r4 === `rmdir` || r4 === `rmdir-index`) {
              let o6 = `${i4}/${a5}`;
              try {
                r4 === `rmdir` && await e5.rmdir(o6), t5.delete({ filepath: a5 }), n2 && await n2({ phase: `Updating workdir`, loaded: ++m6, total: y5 });
              } catch (e6) {
                if (e6.code === `ENOTEMPTY`) console.log(`Did not delete ${a5} because directory is not empty`);
                else throw e6;
              }
            }
          }), await Promise.all(o5.filter(([e6]) => e6 === `mkdir` || e6 === `mkdir-index`).map(async function([t5, r4]) {
            let a5 = `${i4}/${r4}`;
            await e5.mkdir(a5), n2 && await n2({ phase: `Updating workdir`, loaded: ++m6, total: y5 });
          })), h5) {
            let r4 = await Dn2(`Update Working Dir`, o5.filter(([e6]) => e6 === `create` || e6 === `create-index` || e6 === `update` || e6 === `mkdir-index`).map(([n3, r5, o6, s5, c5]) => () => En2({ fs: e5, cache: t4, gitdir: a4, dir: i4 }, [n3, r5, o6, s5, c5])), n2, g5);
            await I4.acquire({ fs: e5, gitdir: a4, cache: t4, allowUnmerged: true }, async function(e6) {
              await Dn2(`Update Index`, r4.map(([t5, n3, r5]) => () => Tn2({ index: e6, fullpath: t5, oid: n3, stats: r5 })), n2, g5);
            });
          } else await I4.acquire({ fs: e5, gitdir: a4, cache: t4, allowUnmerged: true }, async function(r4) {
            let s5 = await Promise.allSettled(o5.filter(([e6]) => e6 === `create` || e6 === `create-index` || e6 === `update` || e6 === `mkdir-index`).map(async function([o6, s6, c6, l6, u5]) {
              let d5 = `${i4}/${s6}`;
              if (o6 !== `create-index` && o6 !== `mkdir-index`) {
                let { object: n3 } = await dt3({ fs: e5, cache: t4, gitdir: a4, oid: c6 });
                if (u5 && await e5.rm(d5), l6 === 33188) await e5.write(d5, n3);
                else if (l6 === 33261) await e5.write(d5, n3, { mode: 511 });
                else if (l6 === 40960) await e5.writelink(d5, n3);
                else throw new p3(`Invalid mode 0o${l6.toString(8)} detected in blob ${c6}`);
              }
              let f5 = await e5.lstat(d5);
              l6 === 33261 && (f5.mode = 493), o6 === `mkdir-index` && (f5.mode = 57344), r4.insert({ filepath: s6, stats: f5, oid: c6 }), n2 && await n2({ phase: `Updating workdir`, loaded: ++m6, total: y5 });
            })), c5 = [];
            for (let e6 of s5) e6.status === `rejected` && (c5.push(e6.reason), console.error(`[isomorphic-git checkout] task rejected:`, e6.reason?.stack ?? e6.reason));
            if (c5.length > 0) throw new kt3(c5);
          });
          r3 && await r3({ previousHead: _5, newHead: v5, type: c4 != null && c4.length > 0 ? `file` : `branch` });
        }
        if (!u3) {
          let t5 = await De3.expand({ fs: e5, gitdir: a4, ref: s4 });
          t5.startsWith(`refs/heads`) ? await De3.writeSymbolicRef({ fs: e5, gitdir: a4, ref: `HEAD`, value: t5 }) : await De3.writeRef({ fs: e5, gitdir: a4, ref: `HEAD`, value: v5 });
        }
      }
      async function wn2({ fs: e5, cache: t4, onProgress: n2, dir: r3, gitdir: i4, ref: a4, force: o4, filepaths: s4 }) {
        let c4 = 0;
        return sn2({ fs: e5, cache: t4, dir: r3, gitdir: i4, trees: [$t2({ ref: a4 }), tn2(), V4()], map: async function(e6, [t5, r4, i5]) {
          if (e6 !== `.`) {
            if (s4 && !s4.some((t6) => Sn2(e6, t6))) return null;
            switch (n2 && await n2({ phase: `Analyzing workdir`, loaded: ++c4 }), [!!i5, !!t5, !!r4].map(Number).join(``)) {
              case `000`:
                return;
              case `001`:
                return o4 && s4 && s4.includes(e6) ? [`delete`, e6] : void 0;
              case `010`:
                switch (await t5.type()) {
                  case `tree`:
                    return [`mkdir`, e6];
                  case `blob`:
                    return [`create`, e6, await t5.oid(), await t5.mode()];
                  case `commit`:
                    return [`mkdir-index`, e6, await t5.oid(), await t5.mode()];
                  default:
                    return [`error`, `new entry Unhandled type ${await t5.type()}`];
                }
              case `011`:
                switch (`${await t5.type()}-${await r4.type()}`) {
                  case `tree-tree`:
                    return;
                  case `tree-blob`:
                  case `blob-tree`:
                    return [`conflict`, e6];
                  case `blob-blob`:
                    return await t5.oid() === await r4.oid() ? await t5.mode() === await r4.mode() ? [`create-index`, e6, await t5.oid(), await t5.mode()] : o4 ? [`update`, e6, await t5.oid(), await t5.mode(), true] : [`conflict`, e6] : o4 ? [`update`, e6, await t5.oid(), await t5.mode(), await t5.mode() !== await r4.mode()] : [`conflict`, e6];
                  case `commit-tree`:
                    return;
                  case `commit-blob`:
                    return [`conflict`, e6];
                  default:
                    return [`error`, `new entry Unhandled type ${t5.type}`];
                }
              case `100`:
                return [`delete-index`, e6];
              case `101`:
                switch (await i5.type()) {
                  case `tree`:
                    return [`rmdir-index`, e6];
                  case `blob`:
                    return await i5.oid() === await r4.oid() || o4 ? [`delete`, e6] : [`conflict`, e6];
                  case `commit`:
                    return [`rmdir-index`, e6];
                  default:
                    return [`error`, `delete entry Unhandled type ${await i5.type()}`];
                }
              case `110`:
              case `111`:
                switch (`${await i5.type()}-${await t5.type()}`) {
                  case `tree-tree`:
                    return;
                  case `blob-blob`:
                    if (await i5.oid() === await t5.oid() && await i5.mode() === await t5.mode() && !o4) return;
                    if (r4) {
                      if (await r4.oid() !== await i5.oid() && await r4.oid() !== await t5.oid()) return o4 ? [`update`, e6, await t5.oid(), await t5.mode(), await t5.mode() !== await r4.mode()] : [`conflict`, e6];
                    } else if (o4) return [`update`, e6, await t5.oid(), await t5.mode(), await t5.mode() !== await i5.mode()];
                    return await t5.mode() === await i5.mode() ? await t5.oid() === await i5.oid() ? void 0 : [`update`, e6, await t5.oid(), await t5.mode(), false] : [`update`, e6, await t5.oid(), await t5.mode(), true];
                  case `tree-blob`:
                    return [`update-dir-to-blob`, e6, await t5.oid()];
                  case `blob-tree`:
                    return [`update-blob-to-tree`, e6];
                  case `commit-commit`:
                    return [`mkdir-index`, e6, await t5.oid(), await t5.mode()];
                  default:
                    return [`error`, `update entry Unhandled type ${await i5.type()}-${await t5.type()}`];
                }
            }
          }
        }, reduce: async function(e6, t5) {
          return t5 = rn2(t5), e6 ? e6 && e6[0] === `rmdir` ? (t5.push(e6), t5) : (t5.unshift(e6), t5) : t5;
        } });
      }
      async function Tn2({ index: e5, fullpath: t4, stats: n2, oid: r3 }) {
        try {
          e5.insert({ filepath: t4, stats: n2, oid: r3 });
        } catch (e6) {
          console.warn(`Error inserting ${t4} into index:`, e6);
        }
      }
      async function En2({ fs: e5, cache: t4, gitdir: n2, dir: r3 }, [i4, a4, o4, s4, c4]) {
        let l4 = `${r3}/${a4}`;
        if (i4 !== `create-index` && i4 !== `mkdir-index`) {
          let { object: r4 } = await dt3({ fs: e5, cache: t4, gitdir: n2, oid: o4 });
          if (c4 && await e5.rm(l4), s4 === 33188) await e5.write(l4, r4);
          else if (s4 === 33261) await e5.write(l4, r4, { mode: 511 });
          else if (s4 === 40960) await e5.writelink(l4, r4);
          else throw new p3(`Invalid mode 0o${s4.toString(8)} detected in blob ${o4}`);
        }
        let u3 = await e5.lstat(l4);
        return s4 === 33261 && (u3.mode = 493), i4 === `mkdir-index` && (u3.mode = 57344), [a4, o4, u3];
      }
      async function Dn2(e5, t4, n2, r3) {
        let i4 = [], a4 = [];
        for (let o4 = 0; o4 < t4.length; o4 += r3) {
          let s4 = t4.slice(o4, o4 + r3).map((e6) => e6());
          (await Promise.allSettled(s4)).forEach((t5) => {
            t5.status === `fulfilled` ? i4.push(t5.value) : (a4.push(t5.reason), console.error(`[isomorphic-git ${e5}] task rejected:`, t5.reason?.stack ?? t5.reason));
          }), n2 && await n2({ phase: `Updating workdir`, loaded: o4 + s4.length, total: t4.length });
        }
        if (a4.length > 0) throw new kt3(a4);
        return i4;
      }
      async function On2({ fs: e5, onProgress: t4, onPostCheckout: n2, dir: r3, gitdir: i4 = ce3(r3, `.git`), remote: a4 = `origin`, ref: o4, filepaths: s4, noCheckout: c4 = false, noUpdateHead: l4 = o4 === void 0, dryRun: u3 = false, force: d4 = false, track: f4 = true, cache: p4 = {}, nonBlocking: m5 = false, batchSize: h5 = 100 }) {
        try {
          gn2(`fs`, e5), gn2(`dir`, r3), gn2(`gitdir`, i4);
          let g5 = o4 || `HEAD`, _5 = new hn2(e5);
          return await Cn2({ fs: _5, cache: p4, onProgress: t4, onPostCheckout: n2, dir: r3, gitdir: await vn2({ fsp: _5, dotgit: i4 }), remote: a4, ref: g5, filepaths: s4, noCheckout: c4, noUpdateHead: l4, dryRun: u3, force: d4, track: f4, nonBlocking: m5, batchSize: h5 });
        } catch (e6) {
          throw e6.caller = `git.checkout`, e6;
        }
      }
      let kn2 = /^refs\/(heads\/|tags\/|remotes\/)?(.*)/;
      function An2(e5) {
        let t4 = kn2.exec(e5);
        return t4 ? t4[1] === `remotes/` && e5.endsWith(`/HEAD`) ? t4[2].slice(0, -5) : t4[2] : e5;
      }
      async function jn2({ fs: e5, gitdir: t4, fullname: n2 = false, test: r3 = false }) {
        let i4 = await De3.resolve({ fs: e5, gitdir: t4, ref: `HEAD`, depth: 2 });
        if (r3) try {
          await De3.resolve({ fs: e5, gitdir: t4, ref: i4 });
        } catch {
          return;
        }
        if (i4.startsWith(`refs/`)) return n2 ? i4 : An2(i4);
      }
      function Mn2(e5) {
        return e5 = e5.replace(/^git@([^:]+):/, `https://$1/`), e5 = e5.replace(/^ssh:\/\//, `https://`), e5;
      }
      function Nn2({ username: e5 = ``, password: t4 = `` }) {
        return `Basic ${Buffer.from(`${e5}:${t4}`).toString(`base64`)}`;
      }
      async function Pn2(e5, t4) {
        let n2 = qe2(e5);
        for (; ; ) {
          let { value: e6, done: r3 } = await n2.next();
          if (e6 && await t4(e6), r3) break;
        }
        n2.return && n2.return();
      }
      async function Fn2(e5) {
        let t4 = 0, n2 = [];
        await Pn2(e5, (e6) => {
          n2.push(e6), t4 += e6.byteLength;
        });
        let r3 = new Uint8Array(t4), i4 = 0;
        for (let e6 of n2) r3.set(e6, i4), i4 += e6.byteLength;
        return r3;
      }
      function In2(e5) {
        let t4 = e5.match(/^https?:\/\/([^/]+)@/);
        if (t4 == null) return { url: e5, auth: {} };
        t4 = t4[1];
        let [n2, r3] = t4.split(`:`);
        return e5 = e5.replace(`${t4}@`, ``), { url: e5, auth: { username: n2, password: r3 } };
      }
      function Ln2(e5, t4) {
        let n2 = t4.toString(16);
        return `0`.repeat(e5 - n2.length) + n2;
      }
      var Rn2 = class {
        static flush() {
          return Buffer.from(`0000`, `utf8`);
        }
        static delim() {
          return Buffer.from(`0001`, `utf8`);
        }
        static encode(e5) {
          typeof e5 == `string` && (e5 = Buffer.from(e5));
          let t4 = Ln2(4, e5.length + 4);
          return Buffer.concat([Buffer.from(t4, `utf8`), e5]);
        }
        static streamReader(e5) {
          let t4 = new Je2(e5);
          return async function() {
            try {
              let e6 = await t4.read(4);
              return e6 == null ? true : (e6 = parseInt(e6.toString(`utf8`), 16), e6 === 0 || e6 === 1 ? null : await t4.read(e6 - 4) ?? true);
            } catch (t5) {
              return e5.error = t5, true;
            }
          };
        }
      };
      async function zn2(e5) {
        let t4 = {}, n2;
        for (; n2 = await e5(), n2 !== true; ) {
          if (n2 === null) continue;
          n2 = n2.toString(`utf8`).replace(/\n$/, ``);
          let e6 = n2.indexOf(`=`);
          if (e6 > -1) {
            let r3 = n2.slice(0, e6);
            t4[r3] = n2.slice(e6 + 1);
          } else t4[n2] = true;
        }
        return { protocolVersion: 2, capabilities2: t4 };
      }
      async function Bn2(e5, { service: t4 }) {
        let n2 = /* @__PURE__ */ new Set(), r3 = /* @__PURE__ */ new Map(), i4 = /* @__PURE__ */ new Map(), a4 = Rn2.streamReader(e5), o4 = await a4();
        for (; o4 === null; ) o4 = await a4();
        if (o4 === true) throw new vt3();
        if (o4.includes(`version 2`)) return zn2(a4);
        if (o4.toString(`utf8`).replace(/\n$/, ``) !== `# service=${t4}`) throw new At3(`# service=${t4}\\n`, o4.toString(`utf8`));
        let s4 = await a4();
        for (; s4 === null; ) s4 = await a4();
        if (s4 === true) return { capabilities: n2, refs: r3, symrefs: i4 };
        if (s4 = s4.toString(`utf8`), s4.includes(`version 2`)) return zn2(a4);
        let [c4, l4] = Vn2(s4, `\0`, `\\x00`);
        if (l4.split(` `).map((e6) => n2.add(e6)), c4 !== `0000000000000000000000000000000000000000 capabilities^{}`) {
          let [e6, t5] = Vn2(c4, ` `, ` `);
          for (r3.set(t5, e6); ; ) {
            let e7 = await a4();
            if (e7 === true) break;
            if (e7 !== null) {
              let [t6, n3] = Vn2(e7.toString(`utf8`), ` `, ` `);
              r3.set(n3, t6);
            }
          }
        }
        for (let e6 of n2) if (e6.startsWith(`symref=`)) {
          let t5 = e6.match(/symref=([^:]+):(.*)/);
          t5.length === 3 && i4.set(t5[1], t5[2]);
        }
        return { protocolVersion: 1, capabilities: n2, refs: r3, symrefs: i4 };
      }
      function Vn2(e5, t4, n2) {
        let r3 = e5.trim().split(t4);
        if (r3.length !== 2) throw new At3(`Two strings separated by '${n2}'`, e5.toString(`utf8`));
        return r3;
      }
      let Hn2 = (e5, t4) => e5.endsWith(`?`) ? `${e5}${t4}` : `${e5}/${t4.replace(/^https?:\/\//, ``)}`, Un2 = (e5, t4) => {
        (t4.username || t4.password) && (e5.Authorization = Nn2(t4)), t4.headers && Object.assign(e5, t4.headers);
      }, Wn2 = async (e5) => {
        try {
          let t4 = Buffer.from(await Fn2(e5.body)), n2 = t4.toString(`utf8`);
          return { preview: n2.length < 256 ? n2 : n2.slice(0, 256) + `...`, response: n2, data: t4 };
        } catch {
          return {};
        }
      };
      var Gn2 = class {
        static async capabilities() {
          return [`discover`, `connect`];
        }
        static async discover({ http: e5, onProgress: t4, onAuth: n2, onAuthSuccess: r3, onAuthFailure: i4, corsProxy: a4, service: o4, url: s4, headers: c4, protocolVersion: l4 }) {
          let { url: u3, auth: d4 } = In2(s4), f4 = a4 ? Hn2(a4, u3) : u3;
          (d4.username || d4.password) && (c4.Authorization = Nn2(d4)), l4 === 2 && (c4[`Git-Protocol`] = `version=2`);
          let p4, m5, h5 = false;
          do
            if (p4 = await e5.request({ onProgress: t4, method: `GET`, url: `${f4}/info/refs?service=${o4}`, headers: c4 }), m5 = false, p4.statusCode === 401 || p4.statusCode === 203) {
              let e6 = h5 ? i4 : n2;
              if (e6) {
                if (d4 = await e6(u3, { ...d4, headers: { ...c4 } }), d4 && d4.cancel) throw new It3();
                d4 && (Un2(c4, d4), h5 = true, m5 = true);
              }
            } else p4.statusCode === 200 && h5 && r3 && await r3(u3, d4);
          while (m5);
          if (p4.statusCode !== 200) {
            let { response: e6 } = await Wn2(p4);
            throw new xt3(p4.statusCode, p4.statusMessage, e6);
          }
          if (p4.headers[`content-type`] === `application/x-${o4}-advertisement`) {
            let e6 = await Bn2(p4.body, { service: o4 });
            return e6.auth = d4, e6;
          } else {
            let { preview: e6, response: t5, data: n3 } = await Wn2(p4);
            try {
              let e7 = await Bn2([n3], { service: o4 });
              return e7.auth = d4, e7;
            } catch {
              throw new Nt3(e6, t5);
            }
          }
        }
        static async connect({ http: e5, onProgress: t4, corsProxy: n2, service: r3, url: i4, auth: a4, body: o4, headers: s4 }) {
          let c4 = In2(i4);
          c4 && (i4 = c4.url), n2 && (i4 = Hn2(n2, i4)), s4[`content-type`] = `application/x-${r3}-request`, s4.accept = `application/x-${r3}-result`, Un2(s4, a4);
          let l4 = await e5.request({ onProgress: t4, method: `POST`, url: `${i4}/${r3}`, body: o4, headers: s4 });
          if (l4.statusCode !== 200) {
            let { response: e6 } = Wn2(l4);
            throw new xt3(l4.statusCode, l4.statusMessage, e6);
          }
          return l4;
        }
      }, Kn2 = class {
        static getRemoteHelperFor({ url: e5 }) {
          let t4 = /* @__PURE__ */ new Map();
          t4.set(`http`, Gn2), t4.set(`https`, Gn2);
          let n2 = qn2({ url: e5 });
          if (!n2) throw new Ft3(e5);
          if (t4.has(n2.transport)) return t4.get(n2.transport);
          throw new Pt3(e5, n2.transport, n2.transport === `ssh` ? Mn2(e5) : void 0);
        }
      };
      function qn2({ url: e5 }) {
        if (e5.startsWith(`git@`)) return { transport: `ssh`, address: e5 };
        let t4 = e5.match(/(\w+)(:\/\/|::)(.*)/);
        if (t4 !== null) {
          if (t4[2] === `://`) return { transport: t4[1], address: t4[0] };
          if (t4[2] === `::`) return { transport: t4[1], address: t4[3] };
        }
      }
      let Jn2 = null;
      var Yn2 = class {
        static async read({ fs: e5, gitdir: t4 }) {
          Jn2 === null && (Jn2 = new r2());
          let n2 = ce3(t4, `shallow`), i4 = /* @__PURE__ */ new Set();
          return await Jn2.acquire(n2, async function() {
            let t5 = await e5.read(n2, { encoding: `utf8` });
            if (t5 === null || t5.trim() === ``) return i4;
            t5.trim().split(`
`).map((e6) => i4.add(e6));
          }), i4;
        }
        static async write({ fs: e5, gitdir: t4, oids: n2 }) {
          Jn2 === null && (Jn2 = new r2());
          let i4 = ce3(t4, `shallow`);
          if (n2.size > 0) {
            let t5 = [...n2].join(`
`) + `
`;
            await Jn2.acquire(i4, async function() {
              await e5.write(i4, t5, { encoding: `utf8` });
            });
          } else await Jn2.acquire(i4, async function() {
            await e5.rm(i4);
          });
        }
      };
      async function Xn2({ fs: e5, gitdir: t4, oid: n2 }) {
        let r3 = `objects/${n2.slice(0, 2)}/${n2.slice(2)}`;
        return e5.exists(`${t4}/${r3}`);
      }
      async function Zn2({ fs: e5, cache: t4, gitdir: n2, oid: r3, getExternalRefDelta: i4 }) {
        let a4 = await e5.readdir(ce3(n2, `objects/pack`));
        a4 = a4.filter((e6) => e6.endsWith(`.idx`));
        for (let o4 of a4) {
          let a5 = await st3({ fs: e5, cache: t4, filename: `${n2}/objects/pack/${o4}`, getExternalRefDelta: i4 });
          if (a5.error) throw new p3(a5.error);
          if (a5.offsets.has(r3)) return true;
        }
        return false;
      }
      async function Qn2({ fs: e5, cache: t4, gitdir: n2, oid: r3, format: i4 = `content` }) {
        let a4 = (r4) => dt3({ fs: e5, cache: t4, gitdir: n2, oid: r4 }), o4 = await Xn2({ fs: e5, gitdir: n2, oid: r3 });
        return o4 ||= await Zn2({ fs: e5, cache: t4, gitdir: n2, oid: r3, getExternalRefDelta: a4 }), o4;
      }
      function $n2(e5) {
        return e5.slice(0, 12).toString(`hex`) === `5041434b0000000200000000`;
      }
      function er2(e5, t4) {
        let n2 = e5.map((e6) => e6.split(`=`, 1)[0]);
        return t4.filter((e6) => {
          let t5 = e6.split(`=`, 1)[0];
          return n2.includes(t5);
        });
      }
      let tr2 = { name: `isomorphic-git`, version: `1.38.1`, agent: `git/isomorphic-git@1.38.1` };
      var nr2 = class {
        constructor() {
          this._queue = [];
        }
        write(e5) {
          if (this._ended) throw Error(`You cannot write to a FIFO that has already been ended!`);
          if (this._waiting) {
            let t4 = this._waiting;
            this._waiting = null, t4({ value: e5 });
          } else this._queue.push(e5);
        }
        end() {
          if (this._ended = true, this._waiting) {
            let e5 = this._waiting;
            this._waiting = null, e5({ done: true });
          }
        }
        destroy(e5) {
          this.error = e5, this.end();
        }
        async next() {
          if (this._queue.length > 0) return { value: this._queue.shift() };
          if (this._ended) return { done: true };
          if (this._waiting) throw Error(`You cannot call read until the previous call to read has returned!`);
          return new Promise((e5) => {
            this._waiting = e5;
          });
        }
      };
      function rr2(e5) {
        let t4 = e5.indexOf(`\r`), n2 = e5.indexOf(`
`);
        return t4 === -1 && n2 === -1 ? -1 : t4 === -1 ? n2 + 1 : n2 === -1 ? t4 + 1 : n2 === t4 + 1 ? n2 + 1 : Math.min(t4, n2) + 1;
      }
      function ir2(e5) {
        let t4 = new nr2(), n2 = ``;
        return (async () => {
          await Pn2(e5, (e6) => {
            for (e6 = e6.toString(`utf8`), n2 += e6; ; ) {
              let e7 = rr2(n2);
              if (e7 === -1) break;
              t4.write(n2.slice(0, e7)), n2 = n2.slice(e7);
            }
          }), n2.length > 0 && t4.write(n2), t4.end();
        })(), t4;
      }
      var ar2 = class {
        static demux(e5) {
          let t4 = Rn2.streamReader(e5), n2 = new nr2(), r3 = new nr2(), i4 = new nr2(), a4 = async function() {
            let o4 = await t4();
            if (o4 === null) return a4();
            if (o4 === true) {
              n2.end(), i4.end(), e5.error ? r3.destroy(e5.error) : r3.end();
              return;
            }
            switch (o4[0]) {
              case 1:
                r3.write(o4.slice(1));
                break;
              case 2:
                i4.write(o4.slice(1));
                break;
              case 3: {
                let e6 = o4.slice(1);
                i4.write(e6), n2.end(), i4.end(), r3.destroy(Error(e6.toString(`utf8`)));
                return;
              }
              default:
                n2.write(o4);
            }
            a4();
          };
          return a4(), { packetlines: n2, packfile: r3, progress: i4 };
        }
      };
      async function or2(e5) {
        let { packetlines: t4, packfile: n2, progress: r3 } = ar2.demux(e5), i4 = [], a4 = [], o4 = [], s4 = false, c4 = false;
        return new Promise((l4, u3) => {
          Pn2(t4, (t5) => {
            let d4 = t5.toString(`utf8`).trim();
            if (d4.startsWith(`shallow`)) {
              let e6 = d4.slice(-41).trim();
              e6.length !== 40 && u3(new ie3(e6)), i4.push(e6);
            } else if (d4.startsWith(`unshallow`)) {
              let e6 = d4.slice(-41).trim();
              e6.length !== 40 && u3(new ie3(e6)), a4.push(e6);
            } else if (d4.startsWith(`ACK`)) {
              let [, e6, t6] = d4.split(` `);
              o4.push({ oid: e6, status: t6 }), t6 || (c4 = true);
            } else d4.startsWith(`NAK`) ? (s4 = true, c4 = true) : (c4 = true, s4 = true);
            c4 && (e5.error ? u3(e5.error) : l4({ shallows: i4, unshallows: a4, acks: o4, nak: s4, packfile: n2, progress: r3 }));
          }).finally(() => {
            c4 || (e5.error ? u3(e5.error) : l4({ shallows: i4, unshallows: a4, acks: o4, nak: s4, packfile: n2, progress: r3 }));
          });
        });
      }
      function sr2({ capabilities: e5 = [], wants: t4 = [], haves: n2 = [], shallows: r3 = [], depth: i4 = null, since: a4 = null, exclude: o4 = [] }) {
        let s4 = [];
        t4 = [...new Set(t4)];
        let c4 = ` ${e5.join(` `)}`;
        for (let e6 of t4) s4.push(Rn2.encode(`want ${e6}${c4}
`)), c4 = ``;
        for (let e6 of r3) s4.push(Rn2.encode(`shallow ${e6}
`));
        i4 !== null && s4.push(Rn2.encode(`deepen ${i4}
`)), a4 !== null && s4.push(Rn2.encode(`deepen-since ${Math.floor(a4.valueOf() / 1e3)}
`));
        for (let e6 of o4) s4.push(Rn2.encode(`deepen-not ${e6}
`));
        s4.push(Rn2.flush());
        for (let e6 of n2) s4.push(Rn2.encode(`have ${e6}
`));
        return s4.push(Rn2.encode(`done
`)), s4;
      }
      async function cr2({ fs: e5, cache: t4, http: n2, onProgress: r3, onMessage: i4, onAuth: a4, onAuthSuccess: o4, onAuthFailure: s4, gitdir: c4, ref: l4, remoteRef: u3, remote: d4, url: f4, corsProxy: p4, depth: m5 = null, since: h5 = null, exclude: g5 = [], relative: _5 = false, tags: v5 = false, singleBranch: y5 = false, headers: b5 = {}, prune: x5 = false, pruneTags: S5 = false }) {
        let C5 = l4 || await jn2({ fs: e5, gitdir: c4, test: true }), w5 = await Se3.get({ fs: e5, gitdir: c4 }), T5 = d4 || C5 && await w5.get(`branch.${C5}.remote`) || `origin`, E5 = f4 || await w5.get(`remote.${T5}.url`);
        if (E5 === void 0) throw new Ot3(`remote OR url`);
        let D5 = u3 || C5 && await w5.get(`branch.${C5}.merge`) || l4 || `HEAD`;
        p4 === void 0 && (p4 = await w5.get(`http.corsProxy`));
        let O5 = Kn2.getRemoteHelperFor({ url: E5 }), k5 = await O5.discover({ http: n2, onAuth: a4, onAuthSuccess: o4, onAuthFailure: s4, corsProxy: p4, service: `git-upload-pack`, url: E5, headers: b5, protocolVersion: 1 }), A5 = k5.auth, j5 = k5.refs;
        if (j5.size === 0) return { defaultBranch: null, fetchHead: null, fetchHeadDescription: null };
        if (m5 !== null && !k5.capabilities.has(`shallow`)) throw new Mt3(`shallow`, `depth`);
        if (h5 !== null && !k5.capabilities.has(`deepen-since`)) throw new Mt3(`deepen-since`, `since`);
        if (g5.length > 0 && !k5.capabilities.has(`deepen-not`)) throw new Mt3(`deepen-not`, `exclude`);
        if (_5 === true && !k5.capabilities.has(`deepen-relative`)) throw new Mt3(`deepen-relative`, `relative`);
        let { oid: M5, fullref: N5 } = De3.resolveAgainstMap({ ref: D5, map: j5 });
        for (let e6 of j5.keys()) e6 === N5 || e6 === `HEAD` || e6.startsWith(`refs/heads/`) || v5 && e6.startsWith(`refs/tags/`) || j5.delete(e6);
        let P5 = er2([...k5.capabilities], [`multi_ack_detailed`, `no-done`, `side-band-64k`, `ofs-delta`, `agent=${tr2.agent}`]);
        _5 && P5.push(`deepen-relative`);
        let F5 = y5 ? [M5] : j5.values(), ee4 = y5 ? [C5] : await De3.listRefs({ fs: e5, gitdir: c4, filepath: `refs` }), I5 = [];
        for (let n3 of ee4) try {
          n3 = await De3.expand({ fs: e5, gitdir: c4, ref: n3 });
          let r4 = await De3.resolve({ fs: e5, gitdir: c4, ref: n3 });
          await Qn2({ fs: e5, cache: t4, gitdir: c4, oid: r4 }) && I5.push(r4);
        } catch {
        }
        I5 = [...new Set(I5)];
        let L5 = await Yn2.read({ fs: e5, gitdir: c4 }), R5 = k5.capabilities.has(`shallow`) ? [...L5] : [], te4 = sr2({ capabilities: P5, wants: F5, haves: I5, shallows: R5, depth: m5, since: h5, exclude: g5 }), ne4 = Buffer.from(await Fn2(te4)), z5 = await O5.connect({ http: n2, onProgress: r3, corsProxy: p4, service: `git-upload-pack`, url: E5, auth: A5, body: [ne4], headers: b5 }), B5 = await or2(z5.body);
        z5.headers && (B5.headers = z5.headers);
        for (let n3 of B5.shallows) if (!L5.has(n3)) try {
          let { object: r4 } = await dt3({ fs: e5, cache: t4, gitdir: c4, oid: n3 }), i5 = new Xt2(r4), a5 = await Promise.all(i5.headers().parent.map((n4) => Qn2({ fs: e5, cache: t4, gitdir: c4, oid: n4 })));
          a5.length === 0 || a5.every((e6) => e6) || L5.add(n3);
        } catch {
          L5.add(n3);
        }
        for (let e6 of B5.unshallows) L5.delete(e6);
        if (await Yn2.write({ fs: e5, gitdir: c4, oids: L5 }), y5) {
          let t5 = /* @__PURE__ */ new Map([[N5, M5]]), n3 = /* @__PURE__ */ new Map(), r4 = 10, i5 = N5;
          for (; r4--; ) {
            let e6 = k5.symrefs.get(i5);
            if (e6 === void 0) break;
            n3.set(i5, e6), i5 = e6;
          }
          let a5 = j5.get(i5);
          a5 && t5.set(i5, a5);
          let { pruned: o5 } = await De3.updateRemoteRefs({ fs: e5, gitdir: c4, remote: T5, refs: t5, symrefs: n3, tags: v5, prune: x5 });
          x5 && (B5.pruned = o5);
        } else {
          let { pruned: t5 } = await De3.updateRemoteRefs({ fs: e5, gitdir: c4, remote: T5, refs: j5, symrefs: k5.symrefs, tags: v5, prune: x5, pruneTags: S5 });
          x5 && (B5.pruned = t5);
        }
        if (B5.HEAD = k5.symrefs.get(`HEAD`), B5.HEAD === void 0) {
          let { oid: e6 } = De3.resolveAgainstMap({ ref: `HEAD`, map: j5 });
          for (let [t5, n3] of j5.entries()) if (t5 !== `HEAD` && n3 === e6) {
            B5.HEAD = t5;
            break;
          }
        }
        B5.FETCH_HEAD = { oid: M5, description: `${N5.startsWith(`refs/tags`) ? `tag` : `branch`} '${An2(N5)}' of ${E5}` }, (r3 || i4) && Pn2(ir2(B5.progress), async (e6) => {
          if (i4 && await i4(e6), r3) {
            let t5 = e6.match(/([^:]*).*\((\d+?)\/(\d+?)\)/);
            t5 && await r3({ phase: t5[1].trim(), loaded: parseInt(t5[2], 10), total: parseInt(t5[3], 10) });
          }
        });
        let V5 = Buffer.from(await Fn2(B5.packfile));
        if (z5.body.error) throw z5.body.error;
        let H4 = V5.slice(-20).toString(`hex`), re4 = { defaultBranch: B5.HEAD, fetchHead: B5.FETCH_HEAD.oid, fetchHeadDescription: B5.FETCH_HEAD.description };
        if (B5.headers && (re4.headers = B5.headers), x5 && (re4.pruned = B5.pruned), H4 !== `` && !$n2(V5)) {
          re4.packfile = `objects/pack/pack-${H4}.pack`;
          let n3 = ce3(c4, re4.packfile);
          await e5.write(n3, V5);
          let i5 = await it3.fromPack({ pack: V5, getExternalRefDelta: (n4) => dt3({ fs: e5, cache: t4, gitdir: c4, oid: n4 }), onProgress: r3 });
          await e5.write(n3.replace(/\.pack$/, `.idx`), await i5.toBuffer());
        }
        return re4;
      }
      async function lr2({ fs: e5, bare: t4 = false, dir: n2, gitdir: r3 = t4 ? n2 : ce3(n2, `.git`), defaultBranch: i4 = `master` }) {
        if (await e5.exists(r3 + `/config`)) return;
        let a4 = [`hooks`, `info`, `objects/info`, `objects/pack`, `refs/heads`, `refs/tags`];
        a4 = a4.map((e6) => r3 + `/` + e6);
        for (let t5 of a4) await e5.mkdir(t5);
        await e5.write(r3 + `/config`, `[core]
	repositoryformatversion = 0
	filemode = false
	bare = ${t4}
` + (t4 ? `` : `	logallrefupdates = true
`) + `	symlinks = false
	ignorecase = true
`), await e5.write(r3 + `/HEAD`, `ref: refs/heads/${i4}
`);
      }
      async function ur2({ fs: e5, cache: t4, http: n2, onProgress: r3, onMessage: i4, onAuth: a4, onAuthSuccess: o4, onAuthFailure: s4, onPostCheckout: c4, dir: l4, gitdir: u3, url: d4, corsProxy: f4, ref: p4, remote: m5, depth: h5, since: g5, exclude: _5, relative: v5, singleBranch: y5, noCheckout: b5, noTags: x5, headers: S5, nonBlocking: C5, batchSize: w5 = 100 }) {
        try {
          if (await lr2({ fs: e5, gitdir: u3 }), await xn2({ fs: e5, gitdir: u3, remote: m5, url: d4, force: false }), f4) {
            let t5 = await Se3.get({ fs: e5, gitdir: u3 });
            await t5.set(`http.corsProxy`, f4), await Se3.save({ fs: e5, gitdir: u3, config: t5 });
          }
          let { defaultBranch: T5, fetchHead: E5 } = await cr2({ fs: e5, cache: t4, http: n2, onProgress: r3, onMessage: i4, onAuth: a4, onAuthSuccess: o4, onAuthFailure: s4, gitdir: u3, ref: p4, remote: m5, corsProxy: f4, depth: h5, since: g5, exclude: _5, relative: v5, singleBranch: y5, headers: S5, tags: !x5 });
          if (E5 === null) return;
          p4 ||= T5, p4 = p4.replace(`refs/heads/`, ``), await Cn2({ fs: e5, cache: t4, onProgress: r3, onPostCheckout: c4, dir: l4, gitdir: u3, ref: p4, remote: m5, noCheckout: b5, nonBlocking: C5, batchSize: w5 });
        } catch (t5) {
          throw await e5.rmdir(u3, { recursive: true, maxRetries: 10 }).catch(() => void 0), t5;
        }
      }
      async function dr2({ fs: e5, http: t4, onProgress: n2, onMessage: r3, onAuth: i4, onAuthSuccess: a4, onAuthFailure: o4, onPostCheckout: s4, dir: c4, gitdir: l4 = ce3(c4, `.git`), url: u3, corsProxy: d4 = void 0, ref: f4 = void 0, remote: p4 = `origin`, depth: m5 = void 0, since: h5 = void 0, exclude: g5 = [], relative: _5 = false, singleBranch: v5 = false, noCheckout: y5 = false, noTags: b5 = false, headers: x5 = {}, cache: S5 = {}, nonBlocking: C5 = false, batchSize: w5 = 100 }) {
        try {
          gn2(`fs`, e5), gn2(`http`, t4), gn2(`gitdir`, l4), y5 || gn2(`dir`, c4), gn2(`url`, u3);
          let T5 = new hn2(e5);
          return await ur2({ fs: T5, cache: S5, http: t4, onProgress: n2, onMessage: r3, onAuth: i4, onAuthSuccess: a4, onAuthFailure: o4, onPostCheckout: s4, dir: c4, gitdir: await vn2({ fsp: T5, dotgit: l4 }), url: u3, corsProxy: d4, ref: f4, remote: p4, depth: m5, since: h5, exclude: g5, relative: _5, singleBranch: v5, noCheckout: y5, noTags: b5, headers: x5, nonBlocking: C5, batchSize: w5 });
        } catch (e6) {
          throw e6.caller = `git.clone`, e6;
        }
      }
      function fr2(e5, t4, n2, r3) {
        let i4 = [];
        for (let [a4, o4] of e5.refs) {
          if (t4 && !a4.startsWith(t4)) continue;
          if (a4.endsWith(`^{}`)) {
            if (r3) {
              let e6 = a4.replace(`^{}`, ``), t5 = i4[i4.length - 1], n3 = t5.ref === e6 ? t5 : i4.find((t6) => t6.ref === e6);
              if (n3 === void 0) throw Error(`I did not expect this to happen`);
              n3.peeled = o4;
            }
            continue;
          }
          let s4 = { ref: a4, oid: o4 };
          n2 && e5.symrefs.has(a4) && (s4.target = e5.symrefs.get(a4)), i4.push(s4);
        }
        return i4;
      }
      async function pr2({ http: e5, onAuth: t4, onAuthSuccess: n2, onAuthFailure: r3, corsProxy: i4, url: a4, headers: o4 = {}, forPush: s4 = false, protocolVersion: c4 = 2 }) {
        try {
          gn2(`http`, e5), gn2(`url`, a4);
          let l4 = await Kn2.getRemoteHelperFor({ url: a4 }).discover({ http: e5, onAuth: t4, onAuthSuccess: n2, onAuthFailure: r3, corsProxy: i4, service: s4 ? `git-receive-pack` : `git-upload-pack`, url: a4, headers: o4, protocolVersion: c4 });
          if (l4.protocolVersion === 2) return { protocolVersion: l4.protocolVersion, capabilities: l4.capabilities2 };
          let u3 = {};
          for (let e6 of l4.capabilities) {
            let [t5, n3] = e6.split(`=`);
            n3 ? u3[t5] = n3 : u3[t5] = true;
          }
          return { protocolVersion: 1, capabilities: u3, refs: fr2(l4, void 0, true, true) };
        } catch (e6) {
          throw e6.caller = `git.getRemoteInfo2`, e6;
        }
      }
      async function mr2(e5) {
        let t4 = Rn2.streamReader(e5), n2 = [], r3;
        for (; r3 = await t4(), r3 !== true; ) {
          if (r3 === null) continue;
          r3 = r3.toString(`utf8`).replace(/\n$/, ``);
          let [e6, t5, ...i4] = r3.split(` `), a4 = { ref: t5, oid: e6 };
          for (let e7 of i4) {
            let [t6, n3] = e7.split(`:`);
            t6 === `symref-target` ? a4.target = n3 : t6 === `peeled` && (a4.peeled = n3);
          }
          n2.push(a4);
        }
        return n2;
      }
      async function hr2({ prefix: e5, symrefs: t4, peelTags: n2 }) {
        let r3 = [];
        return r3.push(Rn2.encode(`command=ls-refs
`)), r3.push(Rn2.encode(`agent=${tr2.agent}
`)), (n2 || t4 || e5) && r3.push(Rn2.delim()), n2 && r3.push(Rn2.encode(`peel`)), t4 && r3.push(Rn2.encode(`symrefs`)), e5 && r3.push(Rn2.encode(`ref-prefix ${e5}`)), r3.push(Rn2.flush()), r3;
      }
      async function gr2({ http: e5, onAuth: t4, onAuthSuccess: n2, onAuthFailure: r3, corsProxy: i4, url: a4, headers: o4 = {}, forPush: s4 = false, protocolVersion: c4 = 2, prefix: l4, symrefs: u3, peelTags: d4 }) {
        try {
          gn2(`http`, e5), gn2(`url`, a4);
          let f4 = await Gn2.discover({ http: e5, onAuth: t4, onAuthSuccess: n2, onAuthFailure: r3, corsProxy: i4, service: s4 ? `git-receive-pack` : `git-upload-pack`, url: a4, headers: o4, protocolVersion: c4 });
          if (f4.protocolVersion === 1) return fr2(f4, l4, u3, d4);
          let p4 = await hr2({ prefix: l4, symrefs: u3, peelTags: d4 });
          return mr2((await Gn2.connect({ http: e5, auth: f4.auth, headers: o4, corsProxy: i4, service: s4 ? `git-receive-pack` : `git-upload-pack`, url: a4, body: p4 })).body);
        } catch (e6) {
          throw e6.caller = `git.listServerRefs`, e6;
        }
      }
      e4.checkout = On2, e4.clone = dr2, e4.getRemoteInfo2 = pr2, e4.listServerRefs = gr2;
    }));
    Fe = f(((e4, t3) => {
      t3.exports = function(e5, t4) {
        var n2 = [];
        e5.on(`data`, function(e6) {
          n2.push(e6);
        }), e5.once(`end`, function() {
          t4 && t4(null, Buffer.concat(n2)), t4 = null;
        }), e5.once(`error`, function(e6) {
          t4 && t4(e6), t4 = null;
        });
      };
    }));
    Ie = f(((e4, t3) => {
      let n2 = [`aborted`, `complete`, `headers`, `httpVersion`, `httpVersionMinor`, `httpVersionMajor`, `method`, `rawHeaders`, `rawTrailers`, `setTimeout`, `socket`, `statusCode`, `statusMessage`, `trailers`, `url`];
      t3.exports = (e5, t4) => {
        if (t4._readableState.autoDestroy) throw Error("The second stream must have the `autoDestroy` option set to `false`");
        let r2 = new Set(Object.keys(e5).concat(n2)), i3 = {};
        for (let n3 of r2) n3 in t4 || (i3[n3] = { get() {
          let t5 = e5[n3];
          return typeof t5 == `function` ? t5.bind(e5) : t5;
        }, set(t5) {
          e5[n3] = t5;
        }, enumerable: true, configurable: false });
        return Object.defineProperties(t4, i3), e5.once(`aborted`, () => {
          t4.destroy(), t4.emit(`aborted`);
        }), e5.once(`close`, () => {
          e5.complete && t4.readable ? t4.once(`end`, () => {
            t4.emit(`close`);
          }) : t4.emit(`close`);
        }), t4;
      };
    }));
    Le = f(((e4, t3) => {
      let { Transform: r2, PassThrough: i3 } = h(`stream`), a3 = h(`zlib`), o3 = Ie();
      t3.exports = (e5) => {
        let t4 = (e5.headers[`content-encoding`] || ``).toLowerCase();
        if (![`gzip`, `deflate`, `br`].includes(t4)) return e5;
        let n2 = t4 === `br`;
        if (n2 && typeof a3.createBrotliDecompress != `function`) return e5.destroy(Error(`Brotli is not supported on Node.js < 12`)), e5;
        let s3 = true, c3 = new r2({ transform(e6, t5, n3) {
          s3 = false, n3(null, e6);
        }, flush(e6) {
          e6();
        } }), l3 = new i3({ autoDestroy: false, destroy(t5, n3) {
          e5.destroy(), n3(t5);
        } }), u3 = n2 ? a3.createBrotliDecompress() : a3.createUnzip();
        return u3.once(`error`, (t5) => {
          if (s3 && !e5.readable) {
            l3.end();
            return;
          }
          l3.destroy(t5);
        }), o3(e5, l3), e5.pipe(c3).pipe(u3).pipe(l3), l3;
      };
    }));
    Re = f(((e4, t3) => {
      t3.exports = n2;
      function n2(e5, t4) {
        if (e5 && t4) return n2(e5)(t4);
        if (typeof e5 != `function`) throw TypeError(`need wrapper function`);
        return Object.keys(e5).forEach(function(t5) {
          r2[t5] = e5[t5];
        }), r2;
        function r2() {
          for (var t5 = Array(arguments.length), n3 = 0; n3 < t5.length; n3++) t5[n3] = arguments[n3];
          var r3 = e5.apply(this, t5), i3 = t5[t5.length - 1];
          return typeof r3 == `function` && r3 !== i3 && Object.keys(i3).forEach(function(e6) {
            r3[e6] = i3[e6];
          }), r3;
        }
      }
    }));
    ze = f(((e4, t3) => {
      var n2 = Re();
      t3.exports = n2(r2), t3.exports.strict = n2(i3), r2.proto = r2(function() {
        Object.defineProperty(Function.prototype, `once`, { value: function() {
          return r2(this);
        }, configurable: true }), Object.defineProperty(Function.prototype, `onceStrict`, { value: function() {
          return i3(this);
        }, configurable: true });
      });
      function r2(e5) {
        var t4 = function() {
          return t4.called ? t4.value : (t4.called = true, t4.value = e5.apply(this, arguments));
        };
        return t4.called = false, t4;
      }
      function i3(e5) {
        var t4 = function() {
          if (t4.called) throw Error(t4.onceError);
          return t4.called = true, t4.value = e5.apply(this, arguments);
        };
        return t4.onceError = (e5.name || "Function wrapped with `once`") + ` shouldn't be called more than once`, t4.called = false, t4;
      }
    }));
    Be = f(((e4, t3) => {
      t3.exports = d3;
      let r2 = Fe(), i3 = Le(), a3 = h(`http`), o3 = h(`https`), s3 = ze(), c3 = h(`querystring`), l3 = h(`url`), u3 = (e5) => typeof e5 == `object` && !!e5 && typeof e5.pipe == `function`;
      function d3(e5, t4) {
        if (e5 = Object.assign({ maxRedirects: 10 }, typeof e5 == `string` ? { url: e5 } : e5), t4 = s3(t4), e5.url) {
          let { hostname: t5, port: n3, protocol: r4, auth: i4, path: a4 } = l3.parse(e5.url);
          delete e5.url, !t5 && !n3 && !r4 && !i4 ? e5.path = a4 : Object.assign(e5, { hostname: t5, port: n3, protocol: r4, auth: i4, path: a4 });
        }
        let n2 = { "accept-encoding": `gzip, deflate` };
        e5.headers && Object.keys(e5.headers).forEach((t5) => n2[t5.toLowerCase()] = e5.headers[t5]), e5.headers = n2;
        let r3;
        e5.body ? r3 = e5.json && !u3(e5.body) ? JSON.stringify(e5.body) : e5.body : e5.form && (r3 = typeof e5.form == `string` ? e5.form : c3.stringify(e5.form), e5.headers[`content-type`] = `application/x-www-form-urlencoded`), r3 && (e5.method ||= `POST`, u3(r3) || (e5.headers[`content-length`] = Buffer.byteLength(r3)), e5.json && !e5.form && (e5.headers[`content-type`] = `application/json`)), delete e5.body, delete e5.form, e5.json && (e5.headers.accept = `application/json`), e5.method &&= e5.method.toUpperCase();
        let f3 = e5.hostname, p3 = (e5.protocol === `https:` ? o3 : a3).request(e5, (n3) => {
          if (e5.followRedirects !== false && n3.statusCode >= 300 && n3.statusCode < 400 && n3.headers.location) {
            e5.url = n3.headers.location, delete e5.headers.host, n3.resume();
            let r5 = l3.parse(e5.url).hostname;
            return r5 !== null && r5 !== f3 && (delete e5.headers.cookie, delete e5.headers.authorization), e5.method === `POST` && [301, 302].includes(n3.statusCode) && (e5.method = `GET`, delete e5.headers[`content-length`], delete e5.headers[`content-type`]), e5.maxRedirects-- === 0 ? t4(Error(`too many redirects`)) : d3(e5, t4);
          }
          let r4 = typeof i3 == `function` && e5.method !== `HEAD`;
          t4(null, r4 ? i3(n3) : n3);
        });
        return p3.on(`timeout`, () => {
          p3.abort(), t4(Error(`Request timed out`));
        }), p3.on(`error`, t4), u3(r3) ? r3.on(`error`, t4).pipe(p3) : p3.end(r3), p3;
      }
      d3.concat = (e5, t4) => d3(e5, (n2, i4) => {
        if (n2) return t4(n2);
        r2(i4, (n3, r3) => {
          if (n3) return t4(n3);
          if (e5.json) try {
            r3 = JSON.parse(r3.toString());
          } catch (e6) {
            return t4(e6, i4, r3);
          }
          t4(null, i4, r3);
        });
      }), [`get`, `post`, `put`, `patch`, `head`, `delete`].forEach((e5) => {
        d3[e5] = (t4, n2) => (typeof t4 == `string` && (t4 = { url: t4 }), d3(Object.assign({ method: e5.toUpperCase() }, t4), n2));
      });
    }));
    Ve = f(((e4, t3) => {
      t3.exports = { AggregateError: class extends Error {
        constructor(e5) {
          if (!Array.isArray(e5)) throw TypeError(`Expected input to be an Array, got ${typeof e5}`);
          let t4 = ``;
          for (let n2 = 0; n2 < e5.length; n2++) t4 += `    ${e5[n2].stack}
`;
          super(t4), this.name = `AggregateError`, this.errors = e5;
        }
      }, ArrayIsArray(e5) {
        return Array.isArray(e5);
      }, ArrayPrototypeIncludes(e5, t4) {
        return e5.includes(t4);
      }, ArrayPrototypeIndexOf(e5, t4) {
        return e5.indexOf(t4);
      }, ArrayPrototypeJoin(e5, t4) {
        return e5.join(t4);
      }, ArrayPrototypeMap(e5, t4) {
        return e5.map(t4);
      }, ArrayPrototypePop(e5, t4) {
        return e5.pop(t4);
      }, ArrayPrototypePush(e5, t4) {
        return e5.push(t4);
      }, ArrayPrototypeSlice(e5, t4, n2) {
        return e5.slice(t4, n2);
      }, Error, FunctionPrototypeCall(e5, t4, ...n2) {
        return e5.call(t4, ...n2);
      }, FunctionPrototypeSymbolHasInstance(e5, t4) {
        return Function.prototype[Symbol.hasInstance].call(e5, t4);
      }, MathFloor: Math.floor, Number, NumberIsInteger: Number.isInteger, NumberIsNaN: Number.isNaN, NumberMAX_SAFE_INTEGER: 2 ** 53 - 1, NumberMIN_SAFE_INTEGER: -(2 ** 53 - 1), NumberParseInt: Number.parseInt, ObjectDefineProperties(e5, t4) {
        return Object.defineProperties(e5, t4);
      }, ObjectDefineProperty(e5, t4, n2) {
        return Object.defineProperty(e5, t4, n2);
      }, ObjectGetOwnPropertyDescriptor(e5, t4) {
        return Object.getOwnPropertyDescriptor(e5, t4);
      }, ObjectKeys(e5) {
        return Object.keys(e5);
      }, ObjectSetPrototypeOf(e5, t4) {
        return Object.setPrototypeOf(e5, t4);
      }, Promise, PromisePrototypeCatch(e5, t4) {
        return e5.catch(t4);
      }, PromisePrototypeThen(e5, t4, n2) {
        return e5.then(t4, n2);
      }, PromiseReject(e5) {
        return Promise.reject(e5);
      }, PromiseResolve(e5) {
        return Promise.resolve(e5);
      }, ReflectApply: Reflect.apply, RegExpPrototypeTest(e5, t4) {
        return e5.test(t4);
      }, SafeSet: Set, String, StringPrototypeSlice(e5, t4, n2) {
        return e5.slice(t4, n2);
      }, StringPrototypeToLowerCase(e5) {
        return e5.toLowerCase();
      }, StringPrototypeToUpperCase(e5) {
        return e5.toUpperCase();
      }, StringPrototypeTrim(e5) {
        return e5.trim();
      }, Symbol, SymbolFor: Symbol.for, SymbolAsyncIterator: Symbol.asyncIterator, SymbolHasInstance: Symbol.hasInstance, SymbolIterator: Symbol.iterator, SymbolDispose: Symbol.dispose || /* @__PURE__ */ Symbol(`Symbol.dispose`), SymbolAsyncDispose: Symbol.asyncDispose || /* @__PURE__ */ Symbol(`Symbol.asyncDispose`), TypedArrayPrototypeSet(e5, t4, n2) {
        return e5.set(t4, n2);
      }, Boolean, Uint8Array };
    }));
    He = f(((e4, t3) => {
      t3.exports = { format(e5, ...t4) {
        return e5.replace(/%([sdifj])/g, function(...[e6, n2]) {
          let r2 = t4.shift();
          return n2 === `f` ? r2.toFixed(6) : n2 === `j` ? JSON.stringify(r2) : n2 === `s` && typeof r2 == `object` ? `${r2.constructor === Object ? `` : r2.constructor.name} {}`.trim() : r2.toString();
        });
      }, inspect(e5) {
        switch (typeof e5) {
          case `string`:
            if (e5.includes(`'`)) {
              if (!e5.includes(`"`)) return `"${e5}"`;
              if (!e5.includes("`") && !e5.includes("${")) return `\`${e5}\``;
            }
            return `'${e5}'`;
          case `number`:
            return isNaN(e5) ? `NaN` : Object.is(e5, -0) ? String(e5) : e5;
          case `bigint`:
            return `${String(e5)}n`;
          case `boolean`:
          case `undefined`:
            return String(e5);
          case `object`:
            return `{}`;
        }
      } };
    }));
    Ue = f(((e4, t3) => {
      let { format: n2, inspect: r2 } = He(), { AggregateError: i3 } = Ve(), a3 = globalThis.AggregateError || i3, o3 = /* @__PURE__ */ Symbol(`kIsNodeError`), s3 = [`string`, `function`, `number`, `object`, `Function`, `Object`, `boolean`, `bigint`, `symbol`], c3 = /^([A-Z][a-z0-9]*)+$/, l3 = {};
      function u3(e5, t4) {
        if (!e5) throw new l3.ERR_INTERNAL_ASSERTION(t4);
      }
      function d3(e5) {
        let t4 = ``, n3 = e5.length, r3 = +(e5[0] === `-`);
        for (; n3 >= r3 + 4; n3 -= 3) t4 = `_${e5.slice(n3 - 3, n3)}${t4}`;
        return `${e5.slice(0, n3)}${t4}`;
      }
      function f3(e5, t4, r3) {
        if (typeof t4 == `function`) return u3(t4.length <= r3.length, `Code: ${e5}; The provided arguments length (${r3.length}) does not match the required ones (${t4.length}).`), t4(...r3);
        let i4 = (t4.match(/%[dfijoOs]/g) || []).length;
        return u3(i4 === r3.length, `Code: ${e5}; The provided arguments length (${r3.length}) does not match the required ones (${i4}).`), r3.length === 0 ? t4 : n2(t4, ...r3);
      }
      function p3(e5, t4, n3) {
        n3 ||= Error;
        class r3 extends n3 {
          constructor(...n4) {
            super(f3(e5, t4, n4));
          }
          toString() {
            return `${this.name} [${e5}]: ${this.message}`;
          }
        }
        Object.defineProperties(r3.prototype, { name: { value: n3.name, writable: true, enumerable: false, configurable: true }, toString: { value() {
          return `${this.name} [${e5}]: ${this.message}`;
        }, writable: true, enumerable: false, configurable: true } }), r3.prototype.code = e5, r3.prototype[o3] = true, l3[e5] = r3;
      }
      function m4(e5) {
        let t4 = `__node_internal_` + e5.name;
        return Object.defineProperty(e5, `name`, { value: t4 }), e5;
      }
      function h4(e5, t4) {
        if (e5 && t4 && e5 !== t4) {
          if (Array.isArray(t4.errors)) return t4.errors.push(e5), t4;
          let n3 = new a3([t4, e5], t4.message);
          return n3.code = t4.code, n3;
        }
        return e5 || t4;
      }
      var g4 = class extends Error {
        constructor(e5 = `The operation was aborted`, t4 = void 0) {
          if (t4 !== void 0 && typeof t4 != `object`) throw new l3.ERR_INVALID_ARG_TYPE(`options`, `Object`, t4);
          super(e5, t4), this.code = `ABORT_ERR`, this.name = `AbortError`;
        }
      };
      p3(`ERR_ASSERTION`, `%s`, Error), p3(`ERR_INVALID_ARG_TYPE`, (e5, t4, n3) => {
        u3(typeof e5 == `string`, `'name' must be a string`), Array.isArray(t4) || (t4 = [t4]);
        let i4 = `The `;
        e5.endsWith(` argument`) ? i4 += `${e5} ` : i4 += `"${e5}" ${e5.includes(`.`) ? `property` : `argument`} `, i4 += `must be `;
        let a4 = [], o4 = [], l4 = [];
        for (let e6 of t4) u3(typeof e6 == `string`, `All expected entries have to be of type string`), s3.includes(e6) ? a4.push(e6.toLowerCase()) : c3.test(e6) ? o4.push(e6) : (u3(e6 !== `object`, `The value "object" should be written as "Object"`), l4.push(e6));
        if (o4.length > 0) {
          let e6 = a4.indexOf(`object`);
          e6 !== -1 && (a4.splice(a4, e6, 1), o4.push(`Object`));
        }
        if (a4.length > 0) {
          switch (a4.length) {
            case 1:
              i4 += `of type ${a4[0]}`;
              break;
            case 2:
              i4 += `one of type ${a4[0]} or ${a4[1]}`;
              break;
            default: {
              let e6 = a4.pop();
              i4 += `one of type ${a4.join(`, `)}, or ${e6}`;
            }
          }
          (o4.length > 0 || l4.length > 0) && (i4 += ` or `);
        }
        if (o4.length > 0) {
          switch (o4.length) {
            case 1:
              i4 += `an instance of ${o4[0]}`;
              break;
            case 2:
              i4 += `an instance of ${o4[0]} or ${o4[1]}`;
              break;
            default: {
              let e6 = o4.pop();
              i4 += `an instance of ${o4.join(`, `)}, or ${e6}`;
            }
          }
          l4.length > 0 && (i4 += ` or `);
        }
        switch (l4.length) {
          case 0:
            break;
          case 1:
            l4[0].toLowerCase() !== l4[0] && (i4 += `an `), i4 += `${l4[0]}`;
            break;
          case 2:
            i4 += `one of ${l4[0]} or ${l4[1]}`;
            break;
          default: {
            let e6 = l4.pop();
            i4 += `one of ${l4.join(`, `)}, or ${e6}`;
          }
        }
        if (n3 == null) i4 += `. Received ${n3}`;
        else if (typeof n3 == `function` && n3.name) i4 += `. Received function ${n3.name}`;
        else if (typeof n3 == `object`) {
          var d4;
          if ((d4 = n3.constructor) != null && d4.name) i4 += `. Received an instance of ${n3.constructor.name}`;
          else {
            let e6 = r2(n3, { depth: -1 });
            i4 += `. Received ${e6}`;
          }
        } else {
          let e6 = r2(n3, { colors: false });
          e6.length > 25 && (e6 = `${e6.slice(0, 25)}...`), i4 += `. Received type ${typeof n3} (${e6})`;
        }
        return i4;
      }, TypeError), p3(`ERR_INVALID_ARG_VALUE`, (e5, t4, n3 = `is invalid`) => {
        let i4 = r2(t4);
        return i4.length > 128 && (i4 = i4.slice(0, 128) + `...`), `The ${e5.includes(`.`) ? `property` : `argument`} '${e5}' ${n3}. Received ${i4}`;
      }, TypeError), p3(`ERR_INVALID_RETURN_VALUE`, (e5, t4, n3) => {
        var r3;
        return `Expected ${e5} to be returned from the "${t4}" function but got ${n3 != null && (r3 = n3.constructor) != null && r3.name ? `instance of ${n3.constructor.name}` : `type ${typeof n3}`}.`;
      }, TypeError), p3(`ERR_MISSING_ARGS`, (...e5) => {
        u3(e5.length > 0, `At least one arg needs to be specified`);
        let t4, n3 = e5.length;
        switch (e5 = (Array.isArray(e5) ? e5 : [e5]).map((e6) => `"${e6}"`).join(` or `), n3) {
          case 1:
            t4 += `The ${e5[0]} argument`;
            break;
          case 2:
            t4 += `The ${e5[0]} and ${e5[1]} arguments`;
            break;
          default:
            {
              let n4 = e5.pop();
              t4 += `The ${e5.join(`, `)}, and ${n4} arguments`;
            }
            break;
        }
        return `${t4} must be specified`;
      }, TypeError), p3(`ERR_OUT_OF_RANGE`, (e5, t4, n3) => {
        u3(t4, `Missing "range" argument`);
        let i4;
        if (Number.isInteger(n3) && Math.abs(n3) > 2 ** 32) i4 = d3(String(n3));
        else if (typeof n3 == `bigint`) {
          i4 = String(n3);
          let e6 = BigInt(2) ** BigInt(32);
          (n3 > e6 || n3 < -e6) && (i4 = d3(i4)), i4 += `n`;
        } else i4 = r2(n3);
        return `The value of "${e5}" is out of range. It must be ${t4}. Received ${i4}`;
      }, RangeError), p3(`ERR_MULTIPLE_CALLBACK`, `Callback called multiple times`, Error), p3(`ERR_METHOD_NOT_IMPLEMENTED`, `The %s method is not implemented`, Error), p3(`ERR_STREAM_ALREADY_FINISHED`, `Cannot call %s after a stream was finished`, Error), p3(`ERR_STREAM_CANNOT_PIPE`, `Cannot pipe, not readable`, Error), p3(`ERR_STREAM_DESTROYED`, `Cannot call %s after a stream was destroyed`, Error), p3(`ERR_STREAM_NULL_VALUES`, `May not write null values to stream`, TypeError), p3(`ERR_STREAM_PREMATURE_CLOSE`, `Premature close`, Error), p3(`ERR_STREAM_PUSH_AFTER_EOF`, `stream.push() after EOF`, Error), p3(`ERR_STREAM_UNSHIFT_AFTER_END_EVENT`, `stream.unshift() after end event`, Error), p3(`ERR_STREAM_WRITE_AFTER_END`, `write after end`, Error), p3(`ERR_UNKNOWN_ENCODING`, `Unknown encoding: %s`, TypeError), t3.exports = { AbortError: g4, aggregateTwoErrors: m4(h4), hideStackFrames: m4, codes: l3 };
    }));
    We = f(((e4, t3) => {
      Object.defineProperty(e4, `__esModule`, { value: true });
      let n2 = /* @__PURE__ */ new WeakMap(), r2 = /* @__PURE__ */ new WeakMap();
      function i3(e5) {
        let t4 = n2.get(e5);
        return console.assert(t4 != null, `'this' is expected an Event object, but got`, e5), t4;
      }
      function a3(e5) {
        if (e5.passiveListener != null) {
          typeof console < `u` && typeof console.error == `function` && console.error(`Unable to preventDefault inside passive event listener invocation.`, e5.passiveListener);
          return;
        }
        e5.event.cancelable && (e5.canceled = true, typeof e5.event.preventDefault == `function` && e5.event.preventDefault());
      }
      function o3(e5, t4) {
        n2.set(this, { eventTarget: e5, event: t4, eventPhase: 2, currentTarget: e5, canceled: false, stopped: false, immediateStopped: false, passiveListener: null, timeStamp: t4.timeStamp || Date.now() }), Object.defineProperty(this, `isTrusted`, { value: false, enumerable: true });
        let r3 = Object.keys(t4);
        for (let e6 = 0; e6 < r3.length; ++e6) {
          let t5 = r3[e6];
          t5 in this || Object.defineProperty(this, t5, s3(t5));
        }
      }
      o3.prototype = { get type() {
        return i3(this).event.type;
      }, get target() {
        return i3(this).eventTarget;
      }, get currentTarget() {
        return i3(this).currentTarget;
      }, composedPath() {
        let e5 = i3(this).currentTarget;
        return e5 == null ? [] : [e5];
      }, get NONE() {
        return 0;
      }, get CAPTURING_PHASE() {
        return 1;
      }, get AT_TARGET() {
        return 2;
      }, get BUBBLING_PHASE() {
        return 3;
      }, get eventPhase() {
        return i3(this).eventPhase;
      }, stopPropagation() {
        let e5 = i3(this);
        e5.stopped = true, typeof e5.event.stopPropagation == `function` && e5.event.stopPropagation();
      }, stopImmediatePropagation() {
        let e5 = i3(this);
        e5.stopped = true, e5.immediateStopped = true, typeof e5.event.stopImmediatePropagation == `function` && e5.event.stopImmediatePropagation();
      }, get bubbles() {
        return !!i3(this).event.bubbles;
      }, get cancelable() {
        return !!i3(this).event.cancelable;
      }, preventDefault() {
        a3(i3(this));
      }, get defaultPrevented() {
        return i3(this).canceled;
      }, get composed() {
        return !!i3(this).event.composed;
      }, get timeStamp() {
        return i3(this).timeStamp;
      }, get srcElement() {
        return i3(this).eventTarget;
      }, get cancelBubble() {
        return i3(this).stopped;
      }, set cancelBubble(e5) {
        if (!e5) return;
        let t4 = i3(this);
        t4.stopped = true, typeof t4.event.cancelBubble == `boolean` && (t4.event.cancelBubble = true);
      }, get returnValue() {
        return !i3(this).canceled;
      }, set returnValue(e5) {
        e5 || a3(i3(this));
      }, initEvent() {
      } }, Object.defineProperty(o3.prototype, `constructor`, { value: o3, configurable: true, writable: true }), typeof window < `u` && window.Event !== void 0 && (Object.setPrototypeOf(o3.prototype, window.Event.prototype), r2.set(window.Event.prototype, o3));
      function s3(e5) {
        return { get() {
          return i3(this).event[e5];
        }, set(t4) {
          i3(this).event[e5] = t4;
        }, configurable: true, enumerable: true };
      }
      function c3(e5) {
        return { value() {
          let t4 = i3(this).event;
          return t4[e5].apply(t4, arguments);
        }, configurable: true, enumerable: true };
      }
      function l3(e5, t4) {
        let n3 = Object.keys(t4);
        if (n3.length === 0) return e5;
        function r3(t5, n4) {
          e5.call(this, t5, n4);
        }
        r3.prototype = Object.create(e5.prototype, { constructor: { value: r3, configurable: true, writable: true } });
        for (let i4 = 0; i4 < n3.length; ++i4) {
          let a4 = n3[i4];
          if (!(a4 in e5.prototype)) {
            let e6 = typeof Object.getOwnPropertyDescriptor(t4, a4).value == `function`;
            Object.defineProperty(r3.prototype, a4, e6 ? c3(a4) : s3(a4));
          }
        }
        return r3;
      }
      function u3(e5) {
        if (e5 == null || e5 === Object.prototype) return o3;
        let t4 = r2.get(e5);
        return t4 ?? (t4 = l3(u3(Object.getPrototypeOf(e5)), e5), r2.set(e5, t4)), t4;
      }
      function d3(e5, t4) {
        return new (u3(Object.getPrototypeOf(t4)))(e5, t4);
      }
      function f3(e5) {
        return i3(e5).immediateStopped;
      }
      function p3(e5, t4) {
        i3(e5).eventPhase = t4;
      }
      function m4(e5, t4) {
        i3(e5).currentTarget = t4;
      }
      function h4(e5, t4) {
        i3(e5).passiveListener = t4;
      }
      let g4 = /* @__PURE__ */ new WeakMap();
      function _4(e5) {
        return typeof e5 == `object` && !!e5;
      }
      function v4(e5) {
        let t4 = g4.get(e5);
        if (t4 == null) throw TypeError(`'this' is expected an EventTarget object, but got another value.`);
        return t4;
      }
      function y4(e5) {
        return { get() {
          let t4 = v4(this).get(e5);
          for (; t4 != null; ) {
            if (t4.listenerType === 3) return t4.listener;
            t4 = t4.next;
          }
          return null;
        }, set(t4) {
          typeof t4 != `function` && !_4(t4) && (t4 = null);
          let n3 = v4(this), r3 = null, i4 = n3.get(e5);
          for (; i4 != null; ) i4.listenerType === 3 ? r3 === null ? i4.next === null ? n3.delete(e5) : n3.set(e5, i4.next) : r3.next = i4.next : r3 = i4, i4 = i4.next;
          if (t4 !== null) {
            let i5 = { listener: t4, listenerType: 3, passive: false, once: false, next: null };
            r3 === null ? n3.set(e5, i5) : r3.next = i5;
          }
        }, configurable: true, enumerable: true };
      }
      function b4(e5, t4) {
        Object.defineProperty(e5, `on${t4}`, y4(t4));
      }
      function x4(e5) {
        function t4() {
          S4.call(this);
        }
        t4.prototype = Object.create(S4.prototype, { constructor: { value: t4, configurable: true, writable: true } });
        for (let n3 = 0; n3 < e5.length; ++n3) b4(t4.prototype, e5[n3]);
        return t4;
      }
      function S4() {
        if (this instanceof S4) {
          g4.set(this, /* @__PURE__ */ new Map());
          return;
        }
        if (arguments.length === 1 && Array.isArray(arguments[0])) return x4(arguments[0]);
        if (arguments.length > 0) {
          let e5 = Array(arguments.length);
          for (let t4 = 0; t4 < arguments.length; ++t4) e5[t4] = arguments[t4];
          return x4(e5);
        }
        throw TypeError(`Cannot call a class as a function`);
      }
      S4.prototype = { addEventListener(e5, t4, n3) {
        if (t4 == null) return;
        if (typeof t4 != `function` && !_4(t4)) throw TypeError(`'listener' should be a function or an object.`);
        let r3 = v4(this), i4 = _4(n3), a4 = (i4 ? n3.capture : n3) ? 1 : 2, o4 = { listener: t4, listenerType: a4, passive: i4 && !!n3.passive, once: i4 && !!n3.once, next: null }, s4 = r3.get(e5);
        if (s4 === void 0) {
          r3.set(e5, o4);
          return;
        }
        let c4 = null;
        for (; s4 != null; ) {
          if (s4.listener === t4 && s4.listenerType === a4) return;
          c4 = s4, s4 = s4.next;
        }
        c4.next = o4;
      }, removeEventListener(e5, t4, n3) {
        if (t4 == null) return;
        let r3 = v4(this), i4 = (_4(n3) ? n3.capture : n3) ? 1 : 2, a4 = null, o4 = r3.get(e5);
        for (; o4 != null; ) {
          if (o4.listener === t4 && o4.listenerType === i4) {
            a4 === null ? o4.next === null ? r3.delete(e5) : r3.set(e5, o4.next) : a4.next = o4.next;
            return;
          }
          a4 = o4, o4 = o4.next;
        }
      }, dispatchEvent(e5) {
        if (e5 == null || typeof e5.type != `string`) throw TypeError(`"event.type" should be a string.`);
        let t4 = v4(this), n3 = e5.type, r3 = t4.get(n3);
        if (r3 == null) return true;
        let i4 = d3(this, e5), a4 = null;
        for (; r3 != null; ) {
          if (r3.once ? a4 === null ? r3.next === null ? t4.delete(n3) : t4.set(n3, r3.next) : a4.next = r3.next : a4 = r3, h4(i4, r3.passive ? r3.listener : null), typeof r3.listener == `function`) try {
            r3.listener.call(this, i4);
          } catch (e6) {
            typeof console < `u` && typeof console.error == `function` && console.error(e6);
          }
          else r3.listenerType !== 3 && typeof r3.listener.handleEvent == `function` && r3.listener.handleEvent(i4);
          if (f3(i4)) break;
          r3 = r3.next;
        }
        return h4(i4, null), p3(i4, 0), m4(i4, null), !i4.defaultPrevented;
      } }, Object.defineProperty(S4.prototype, `constructor`, { value: S4, configurable: true, writable: true }), typeof window < `u` && window.EventTarget !== void 0 && Object.setPrototypeOf(S4.prototype, window.EventTarget.prototype), e4.defineEventAttribute = b4, e4.EventTarget = S4, e4.default = S4, t3.exports = S4, t3.exports.EventTarget = t3.exports.default = S4, t3.exports.defineEventAttribute = b4;
    }));
    Ge = f(((e4, t3) => {
      Object.defineProperty(e4, `__esModule`, { value: true });
      var n2 = We(), r2 = class extends n2.EventTarget {
        constructor() {
          throw super(), TypeError(`AbortSignal cannot be constructed directly`);
        }
        get aborted() {
          let e5 = o3.get(this);
          if (typeof e5 != `boolean`) throw TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? `null` : typeof this}`);
          return e5;
        }
      };
      n2.defineEventAttribute(r2.prototype, `abort`);
      function i3() {
        let e5 = Object.create(r2.prototype);
        return n2.EventTarget.call(e5), o3.set(e5, false), e5;
      }
      function a3(e5) {
        o3.get(e5) === false && (o3.set(e5, true), e5.dispatchEvent({ type: `abort` }));
      }
      let o3 = /* @__PURE__ */ new WeakMap();
      Object.defineProperties(r2.prototype, { aborted: { enumerable: true } }), typeof Symbol == `function` && typeof Symbol.toStringTag == `symbol` && Object.defineProperty(r2.prototype, Symbol.toStringTag, { configurable: true, value: `AbortSignal` });
      var s3 = class {
        constructor() {
          c3.set(this, i3());
        }
        get signal() {
          return l3(this);
        }
        abort() {
          a3(l3(this));
        }
      };
      let c3 = /* @__PURE__ */ new WeakMap();
      function l3(e5) {
        let t4 = c3.get(e5);
        if (t4 == null) throw TypeError(`Expected 'this' to be an 'AbortController' object, but got ${e5 === null ? `null` : typeof e5}`);
        return t4;
      }
      Object.defineProperties(s3.prototype, { signal: { enumerable: true }, abort: { enumerable: true } }), typeof Symbol == `function` && typeof Symbol.toStringTag == `symbol` && Object.defineProperty(s3.prototype, Symbol.toStringTag, { configurable: true, value: `AbortController` }), e4.AbortController = s3, e4.AbortSignal = r2, e4.default = s3, t3.exports = s3, t3.exports.AbortController = t3.exports.default = s3, t3.exports.AbortSignal = r2;
    }));
    Ke = f(((e4, t3) => {
      let r2 = h(`buffer`), { format: i3, inspect: a3 } = He(), { codes: { ERR_INVALID_ARG_TYPE: o3 } } = Ue(), { kResistStopPropagation: s3, AggregateError: c3, SymbolDispose: l3 } = Ve(), u3 = globalThis.AbortSignal || Ge().AbortSignal, d3 = globalThis.AbortController || Ge().AbortController, f3 = Object.getPrototypeOf(async function() {
      }).constructor, p3 = globalThis.Blob || r2.Blob, m4 = p3 === void 0 ? function(e5) {
        return false;
      } : function(e5) {
        return e5 instanceof p3;
      }, h4 = (e5, t4) => {
        if (e5 !== void 0 && (typeof e5 != `object` || !e5 || !(`aborted` in e5))) throw new o3(t4, `AbortSignal`, e5);
      }, g4 = (e5, t4) => {
        if (typeof e5 != `function`) throw new o3(t4, `Function`, e5);
      };
      t3.exports = { AggregateError: c3, kEmptyObject: Object.freeze({}), once(e5) {
        let t4 = false;
        return function(...n2) {
          t4 || (t4 = true, e5.apply(this, n2));
        };
      }, createDeferredPromise: function() {
        let e5, t4;
        return { promise: new Promise((n2, r3) => {
          e5 = n2, t4 = r3;
        }), resolve: e5, reject: t4 };
      }, promisify(e5) {
        return new Promise((t4, n2) => {
          e5((e6, ...r3) => e6 ? n2(e6) : t4(...r3));
        });
      }, debuglog() {
        return function() {
        };
      }, format: i3, inspect: a3, types: { isAsyncFunction(e5) {
        return e5 instanceof f3;
      }, isArrayBufferView(e5) {
        return ArrayBuffer.isView(e5);
      } }, isBlob: m4, deprecate(e5, t4) {
        return e5;
      }, addAbortListener: h(`events`).addAbortListener || function(e5, t4) {
        if (e5 === void 0) throw new o3(`signal`, `AbortSignal`, e5);
        h4(e5, `signal`), g4(t4, `listener`);
        let n2;
        return e5.aborted ? queueMicrotask(() => t4()) : (e5.addEventListener(`abort`, t4, { __proto__: null, once: true, [s3]: true }), n2 = () => {
          e5.removeEventListener(`abort`, t4);
        }), { __proto__: null, [l3]() {
          var e6;
          (e6 = n2) == null || e6();
        } };
      }, AbortSignalAny: u3.any || function(e5) {
        if (e5.length === 1) return e5[0];
        let t4 = new d3(), n2 = () => t4.abort();
        return e5.forEach((e6) => {
          h4(e6, `signals`), e6.addEventListener(`abort`, n2, { once: true });
        }), t4.signal.addEventListener(`abort`, () => {
          e5.forEach((e6) => e6.removeEventListener(`abort`, n2));
        }, { once: true }), t4.signal;
      } }, t3.exports.promisify.custom = /* @__PURE__ */ Symbol.for(`nodejs.util.promisify.custom`);
    }));
    qe = f(((e4, t3) => {
      let { ArrayIsArray: n2, ArrayPrototypeIncludes: r2, ArrayPrototypeJoin: i3, ArrayPrototypeMap: a3, NumberIsInteger: o3, NumberIsNaN: s3, NumberMAX_SAFE_INTEGER: c3, NumberMIN_SAFE_INTEGER: l3, NumberParseInt: u3, ObjectPrototypeHasOwnProperty: d3, RegExpPrototypeExec: f3, String: p3, StringPrototypeToUpperCase: m4, StringPrototypeTrim: h4 } = Ve(), { hideStackFrames: g4, codes: { ERR_SOCKET_BAD_PORT: _4, ERR_INVALID_ARG_TYPE: v4, ERR_INVALID_ARG_VALUE: y4, ERR_OUT_OF_RANGE: b4, ERR_UNKNOWN_SIGNAL: x4 } } = Ue(), { normalizeEncoding: S4 } = Ke(), { isAsyncFunction: C4, isArrayBufferView: w4 } = Ke().types, T4 = {};
      function E4(e5) {
        return e5 === (e5 | 0);
      }
      function D4(e5) {
        return e5 === e5 >>> 0;
      }
      let O4 = /^[0-7]+$/;
      function k4(e5, t4, n3) {
        if (e5 === void 0 && (e5 = n3), typeof e5 == `string`) {
          if (f3(O4, e5) === null) throw new y4(t4, e5, `must be a 32-bit unsigned integer or an octal string`);
          e5 = u3(e5, 8);
        }
        return M4(e5, t4), e5;
      }
      let A4 = g4((e5, t4, n3 = l3, r3 = c3) => {
        if (typeof e5 != `number`) throw new v4(t4, `number`, e5);
        if (!o3(e5)) throw new b4(t4, `an integer`, e5);
        if (e5 < n3 || e5 > r3) throw new b4(t4, `>= ${n3} && <= ${r3}`, e5);
      }), j4 = g4((e5, t4, n3 = -2147483648, r3 = 2147483647) => {
        if (typeof e5 != `number`) throw new v4(t4, `number`, e5);
        if (!o3(e5)) throw new b4(t4, `an integer`, e5);
        if (e5 < n3 || e5 > r3) throw new b4(t4, `>= ${n3} && <= ${r3}`, e5);
      }), M4 = g4((e5, t4, n3 = false) => {
        if (typeof e5 != `number`) throw new v4(t4, `number`, e5);
        if (!o3(e5)) throw new b4(t4, `an integer`, e5);
        let r3 = +!!n3, i4 = 4294967295;
        if (e5 < r3 || e5 > i4) throw new b4(t4, `>= ${r3} && <= ${i4}`, e5);
      });
      function N4(e5, t4) {
        if (typeof e5 != `string`) throw new v4(t4, `string`, e5);
      }
      function P4(e5, t4, n3 = void 0, r3) {
        if (typeof e5 != `number`) throw new v4(t4, `number`, e5);
        if (n3 != null && e5 < n3 || r3 != null && e5 > r3 || (n3 != null || r3 != null) && s3(e5)) throw new b4(t4, `${n3 == null ? `` : `>= ${n3}`}${n3 != null && r3 != null ? ` && ` : ``}${r3 == null ? `` : `<= ${r3}`}`, e5);
      }
      let F4 = g4((e5, t4, n3) => {
        if (!r2(n3, e5)) throw new y4(t4, e5, `must be one of: ` + i3(a3(n3, (e6) => typeof e6 == `string` ? `'${e6}'` : p3(e6)), `, `));
      });
      function ee3(e5, t4) {
        if (typeof e5 != `boolean`) throw new v4(t4, `boolean`, e5);
      }
      function I4(e5, t4, n3) {
        return e5 == null || !d3(e5, t4) ? n3 : e5[t4];
      }
      let L4 = g4((e5, t4, r3 = null) => {
        let i4 = I4(r3, `allowArray`, false), a4 = I4(r3, `allowFunction`, false);
        if (!I4(r3, `nullable`, false) && e5 === null || !i4 && n2(e5) || typeof e5 != `object` && (!a4 || typeof e5 != `function`)) throw new v4(t4, `Object`, e5);
      }), R4 = g4((e5, t4) => {
        if (e5 != null && typeof e5 != `object` && typeof e5 != `function`) throw new v4(t4, `a dictionary`, e5);
      }), te3 = g4((e5, t4, r3 = 0) => {
        if (!n2(e5)) throw new v4(t4, `Array`, e5);
        if (e5.length < r3) throw new y4(t4, e5, `must be longer than ${r3}`);
      });
      function ne3(e5, t4) {
        te3(e5, t4);
        for (let n3 = 0; n3 < e5.length; n3++) N4(e5[n3], `${t4}[${n3}]`);
      }
      function z4(e5, t4) {
        te3(e5, t4);
        for (let n3 = 0; n3 < e5.length; n3++) ee3(e5[n3], `${t4}[${n3}]`);
      }
      function B4(e5, t4) {
        te3(e5, t4);
        for (let n3 = 0; n3 < e5.length; n3++) {
          let r3 = e5[n3], i4 = `${t4}[${n3}]`;
          if (r3 == null) throw new v4(i4, `AbortSignal`, r3);
          ae3(r3, i4);
        }
      }
      function V4(e5, t4 = `signal`) {
        if (N4(e5, t4), T4[e5] === void 0) throw T4[m4(e5)] === void 0 ? new x4(e5) : new x4(e5 + ` (signals must use all capital letters)`);
      }
      let H3 = g4((e5, t4 = `buffer`) => {
        if (!w4(e5)) throw new v4(t4, [`Buffer`, `TypedArray`, `DataView`], e5);
      });
      function re3(e5, t4) {
        let n3 = S4(t4), r3 = e5.length;
        if (n3 === `hex` && r3 % 2 != 0) throw new y4(`encoding`, t4, `is invalid for data of length ${r3}`);
      }
      function ie3(e5, t4 = `Port`, n3 = true) {
        if (typeof e5 != `number` && typeof e5 != `string` || typeof e5 == `string` && h4(e5).length === 0 || +e5 != e5 >>> 0 || e5 > 65535 || e5 === 0 && !n3) throw new _4(t4, e5, n3);
        return e5 | 0;
      }
      let ae3 = g4((e5, t4) => {
        if (e5 !== void 0 && (typeof e5 != `object` || !e5 || !(`aborted` in e5))) throw new v4(t4, `AbortSignal`, e5);
      }), U3 = g4((e5, t4) => {
        if (typeof e5 != `function`) throw new v4(t4, `Function`, e5);
      }), W3 = g4((e5, t4) => {
        if (typeof e5 != `function` || C4(e5)) throw new v4(t4, `Function`, e5);
      }), oe3 = g4((e5, t4) => {
        if (e5 !== void 0) throw new v4(t4, `undefined`, e5);
      });
      function se3(e5, t4, n3) {
        if (!r2(n3, e5)) throw new v4(t4, `('${i3(n3, `|`)}')`, e5);
      }
      let G3 = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
      function K3(e5, t4) {
        if (e5 === void 0 || !f3(G3, e5)) throw new y4(t4, e5, `must be an array or string of format "</styles.css>; rel=preload; as=style"`);
      }
      function ce3(e5) {
        if (typeof e5 == `string`) return K3(e5, `hints`), e5;
        if (n2(e5)) {
          let t4 = e5.length, n3 = ``;
          if (t4 === 0) return n3;
          for (let r3 = 0; r3 < t4; r3++) {
            let i4 = e5[r3];
            K3(i4, `hints`), n3 += i4, r3 !== t4 - 1 && (n3 += `, `);
          }
          return n3;
        }
        throw new y4(`hints`, e5, `must be an array or string of format "</styles.css>; rel=preload; as=style"`);
      }
      t3.exports = { isInt32: E4, isUint32: D4, parseFileMode: k4, validateArray: te3, validateStringArray: ne3, validateBooleanArray: z4, validateAbortSignalArray: B4, validateBoolean: ee3, validateBuffer: H3, validateDictionary: R4, validateEncoding: re3, validateFunction: U3, validateInt32: j4, validateInteger: A4, validateNumber: P4, validateObject: L4, validateOneOf: F4, validatePlainFunction: W3, validatePort: ie3, validateSignalName: V4, validateString: N4, validateUint32: M4, validateUndefined: oe3, validateUnion: se3, validateAbortSignal: ae3, validateLinkHeaderValue: ce3 };
    }));
    Je = f(((e4, t3) => {
      t3.exports = global.process;
    }));
    Ye = f(((e4, t3) => {
      let { SymbolAsyncIterator: n2, SymbolIterator: r2, SymbolFor: i3 } = Ve(), a3 = i3(`nodejs.stream.destroyed`), o3 = i3(`nodejs.stream.errored`), s3 = i3(`nodejs.stream.readable`), c3 = i3(`nodejs.stream.writable`), l3 = i3(`nodejs.stream.disturbed`), u3 = i3(`nodejs.webstream.isClosedPromise`), d3 = i3(`nodejs.webstream.controllerErrorFunction`);
      function f3(e5, t4 = false) {
        return !!(e5 && typeof e5.pipe == `function` && typeof e5.on == `function` && (!t4 || typeof e5.pause == `function` && typeof e5.resume == `function`) && (!e5._writableState || e5._readableState?.readable !== false) && (!e5._writableState || e5._readableState));
      }
      function p3(e5) {
        return !!(e5 && typeof e5.write == `function` && typeof e5.on == `function` && (!e5._readableState || e5._writableState?.writable !== false));
      }
      function m4(e5) {
        return !!(e5 && typeof e5.pipe == `function` && e5._readableState && typeof e5.on == `function` && typeof e5.write == `function`);
      }
      function h4(e5) {
        return e5 && (e5._readableState || e5._writableState || typeof e5.write == `function` && typeof e5.on == `function` || typeof e5.pipe == `function` && typeof e5.on == `function`);
      }
      function g4(e5) {
        return !!(e5 && !h4(e5) && typeof e5.pipeThrough == `function` && typeof e5.getReader == `function` && typeof e5.cancel == `function`);
      }
      function _4(e5) {
        return !!(e5 && !h4(e5) && typeof e5.getWriter == `function` && typeof e5.abort == `function`);
      }
      function v4(e5) {
        return !!(e5 && !h4(e5) && typeof e5.readable == `object` && typeof e5.writable == `object`);
      }
      function y4(e5) {
        return g4(e5) || _4(e5) || v4(e5);
      }
      function b4(e5, t4) {
        return e5 == null ? false : t4 === true ? typeof e5[n2] == `function` : t4 === false ? typeof e5[r2] == `function` : typeof e5[n2] == `function` || typeof e5[r2] == `function`;
      }
      function x4(e5) {
        if (!h4(e5)) return null;
        let t4 = e5._writableState, n3 = e5._readableState, r3 = t4 || n3;
        return !!(e5.destroyed || e5[a3] || r3 != null && r3.destroyed);
      }
      function S4(e5) {
        if (!p3(e5)) return null;
        if (e5.writableEnded === true) return true;
        let t4 = e5._writableState;
        return t4 != null && t4.errored ? false : typeof t4?.ended == `boolean` ? t4.ended : null;
      }
      function C4(e5, t4) {
        if (!p3(e5)) return null;
        if (e5.writableFinished === true) return true;
        let n3 = e5._writableState;
        return n3 != null && n3.errored ? false : typeof n3?.finished == `boolean` ? !!(n3.finished || t4 === false && n3.ended === true && n3.length === 0) : null;
      }
      function w4(e5) {
        if (!f3(e5)) return null;
        if (e5.readableEnded === true) return true;
        let t4 = e5._readableState;
        return !t4 || t4.errored ? false : typeof t4?.ended == `boolean` ? t4.ended : null;
      }
      function T4(e5, t4) {
        if (!f3(e5)) return null;
        let n3 = e5._readableState;
        return n3 != null && n3.errored ? false : typeof n3?.endEmitted == `boolean` ? !!(n3.endEmitted || t4 === false && n3.ended === true && n3.length === 0) : null;
      }
      function E4(e5) {
        return e5 && e5[s3] != null ? e5[s3] : typeof e5?.readable == `boolean` ? x4(e5) ? false : f3(e5) && e5.readable && !T4(e5) : null;
      }
      function D4(e5) {
        return e5 && e5[c3] != null ? e5[c3] : typeof e5?.writable == `boolean` ? x4(e5) ? false : p3(e5) && e5.writable && !S4(e5) : null;
      }
      function O4(e5, t4) {
        return h4(e5) ? x4(e5) ? true : !(t4?.readable !== false && E4(e5) || t4?.writable !== false && D4(e5)) : null;
      }
      function k4(e5) {
        return h4(e5) ? e5.writableErrored ? e5.writableErrored : e5._writableState?.errored ?? null : null;
      }
      function A4(e5) {
        return h4(e5) ? e5.readableErrored ? e5.readableErrored : e5._readableState?.errored ?? null : null;
      }
      function j4(e5) {
        if (!h4(e5)) return null;
        if (typeof e5.closed == `boolean`) return e5.closed;
        let t4 = e5._writableState, n3 = e5._readableState;
        return typeof t4?.closed == `boolean` || typeof n3?.closed == `boolean` ? t4?.closed || n3?.closed : typeof e5._closed == `boolean` && M4(e5) ? e5._closed : null;
      }
      function M4(e5) {
        return typeof e5._closed == `boolean` && typeof e5._defaultKeepAlive == `boolean` && typeof e5._removedConnection == `boolean` && typeof e5._removedContLen == `boolean`;
      }
      function N4(e5) {
        return typeof e5._sent100 == `boolean` && M4(e5);
      }
      function P4(e5) {
        return typeof e5._consuming == `boolean` && typeof e5._dumped == `boolean` && e5.req?.upgradeOrConnect === void 0;
      }
      function F4(e5) {
        if (!h4(e5)) return null;
        let t4 = e5._writableState, n3 = e5._readableState, r3 = t4 || n3;
        return !r3 && N4(e5) || !!(r3 && r3.autoDestroy && r3.emitClose && r3.closed === false);
      }
      function ee3(e5) {
        return !!(e5 && (e5[l3] ?? (e5.readableDidRead || e5.readableAborted)));
      }
      function I4(e5) {
        return !!(e5 && (e5[o3] ?? e5.readableErrored ?? e5.writableErrored ?? e5._readableState?.errorEmitted ?? e5._writableState?.errorEmitted ?? e5._readableState?.errored ?? e5._writableState?.errored));
      }
      t3.exports = { isDestroyed: x4, kIsDestroyed: a3, isDisturbed: ee3, kIsDisturbed: l3, isErrored: I4, kIsErrored: o3, isReadable: E4, kIsReadable: s3, kIsClosedPromise: u3, kControllerErrorFunction: d3, kIsWritable: c3, isClosed: j4, isDuplexNodeStream: m4, isFinished: O4, isIterable: b4, isReadableNodeStream: f3, isReadableStream: g4, isReadableEnded: w4, isReadableFinished: T4, isReadableErrored: A4, isNodeStream: h4, isWebStream: y4, isWritable: D4, isWritableNodeStream: p3, isWritableStream: _4, isWritableEnded: S4, isWritableFinished: C4, isWritableErrored: k4, isServerRequest: P4, isServerResponse: N4, willEmitClose: F4, isTransformStream: v4 };
    }));
    Xe = f(((e4, t3) => {
      let n2 = Je(), { AbortError: r2, codes: i3 } = Ue(), { ERR_INVALID_ARG_TYPE: a3, ERR_STREAM_PREMATURE_CLOSE: o3 } = i3, { kEmptyObject: s3, once: c3 } = Ke(), { validateAbortSignal: l3, validateFunction: u3, validateObject: d3, validateBoolean: f3 } = qe(), { Promise: p3, PromisePrototypeThen: m4, SymbolDispose: h4 } = Ve(), { isClosed: g4, isReadable: _4, isReadableNodeStream: v4, isReadableStream: y4, isReadableFinished: b4, isReadableErrored: x4, isWritable: S4, isWritableNodeStream: C4, isWritableStream: w4, isWritableFinished: T4, isWritableErrored: E4, isNodeStream: D4, willEmitClose: O4, kIsClosedPromise: k4 } = Ye(), A4;
      function j4(e5) {
        return e5.setHeader && typeof e5.abort == `function`;
      }
      let M4 = () => {
      };
      function N4(e5, t4, i4) {
        if (arguments.length === 2 ? (i4 = t4, t4 = s3) : t4 == null ? t4 = s3 : d3(t4, `options`), u3(i4, `callback`), l3(t4.signal, `options.signal`), i4 = c3(i4), y4(e5) || w4(e5)) return P4(e5, t4, i4);
        if (!D4(e5)) throw new a3(`stream`, [`ReadableStream`, `WritableStream`, `Stream`], e5);
        let f4 = t4.readable ?? v4(e5), p4 = t4.writable ?? C4(e5), m5 = e5._writableState, k5 = e5._readableState, N5 = () => {
          e5.writable || I4();
        }, F5 = O4(e5) && v4(e5) === f4 && C4(e5) === p4, ee3 = T4(e5, false), I4 = () => {
          ee3 = true, e5.destroyed && (F5 = false), !(F5 && (!e5.readable || f4)) && (!f4 || L4) && i4.call(e5);
        }, L4 = b4(e5, false), R4 = () => {
          L4 = true, e5.destroyed && (F5 = false), !(F5 && (!e5.writable || p4)) && (!p4 || ee3) && i4.call(e5);
        }, te3 = (t5) => {
          i4.call(e5, t5);
        }, ne3 = g4(e5), z4 = () => {
          ne3 = true;
          let t5 = E4(e5) || x4(e5);
          if (t5 && typeof t5 != `boolean`) return i4.call(e5, t5);
          if (f4 && !L4 && v4(e5, true) && !b4(e5, false) || p4 && !ee3 && !T4(e5, false)) return i4.call(e5, new o3());
          i4.call(e5);
        }, B4 = () => {
          ne3 = true;
          let t5 = E4(e5) || x4(e5);
          if (t5 && typeof t5 != `boolean`) return i4.call(e5, t5);
          i4.call(e5);
        }, V4 = () => {
          e5.req.on(`finish`, I4);
        };
        j4(e5) ? (e5.on(`complete`, I4), F5 || e5.on(`abort`, z4), e5.req ? V4() : e5.on(`request`, V4)) : p4 && !m5 && (e5.on(`end`, N5), e5.on(`close`, N5)), !F5 && typeof e5.aborted == `boolean` && e5.on(`aborted`, z4), e5.on(`end`, R4), e5.on(`finish`, I4), t4.error !== false && e5.on(`error`, te3), e5.on(`close`, z4), ne3 ? n2.nextTick(z4) : m5 != null && m5.errorEmitted || k5 != null && k5.errorEmitted ? F5 || n2.nextTick(B4) : (!f4 && (!F5 || _4(e5)) && (ee3 || S4(e5) === false) || !p4 && (!F5 || S4(e5)) && (L4 || _4(e5) === false) || k5 && e5.req && e5.aborted) && n2.nextTick(B4);
        let H3 = () => {
          i4 = M4, e5.removeListener(`aborted`, z4), e5.removeListener(`complete`, I4), e5.removeListener(`abort`, z4), e5.removeListener(`request`, V4), e5.req && e5.req.removeListener(`finish`, I4), e5.removeListener(`end`, N5), e5.removeListener(`close`, N5), e5.removeListener(`finish`, I4), e5.removeListener(`end`, R4), e5.removeListener(`error`, te3), e5.removeListener(`close`, z4);
        };
        if (t4.signal && !ne3) {
          let a4 = () => {
            let n3 = i4;
            H3(), n3.call(e5, new r2(void 0, { cause: t4.signal.reason }));
          };
          if (t4.signal.aborted) n2.nextTick(a4);
          else {
            A4 ||= Ke().addAbortListener;
            let n3 = A4(t4.signal, a4), r3 = i4;
            i4 = c3((...t5) => {
              n3[h4](), r3.apply(e5, t5);
            });
          }
        }
        return H3;
      }
      function P4(e5, t4, i4) {
        let a4 = false, o4 = M4;
        if (t4.signal) if (o4 = () => {
          a4 = true, i4.call(e5, new r2(void 0, { cause: t4.signal.reason }));
        }, t4.signal.aborted) n2.nextTick(o4);
        else {
          A4 ||= Ke().addAbortListener;
          let n3 = A4(t4.signal, o4), r3 = i4;
          i4 = c3((...t5) => {
            n3[h4](), r3.apply(e5, t5);
          });
        }
        let s4 = (...t5) => {
          a4 || n2.nextTick(() => i4.apply(e5, t5));
        };
        return m4(e5[k4].promise, s4, s4), M4;
      }
      function F4(e5, t4) {
        var n3;
        let r3 = false;
        return t4 === null && (t4 = s3), (n3 = t4) != null && n3.cleanup && (f3(t4.cleanup, `cleanup`), r3 = t4.cleanup), new p3((n4, i4) => {
          let a4 = N4(e5, t4, (e6) => {
            r3 && a4(), e6 ? i4(e6) : n4();
          });
        });
      }
      t3.exports = N4, t3.exports.finished = F4;
    }));
    Ze = f(((e4, t3) => {
      let n2 = Je(), { aggregateTwoErrors: r2, codes: { ERR_MULTIPLE_CALLBACK: i3 }, AbortError: a3 } = Ue(), { Symbol: o3 } = Ve(), { kIsDestroyed: s3, isDestroyed: c3, isFinished: l3, isServerRequest: u3 } = Ye(), d3 = o3(`kDestroy`), f3 = o3(`kConstruct`);
      function p3(e5, t4, n3) {
        e5 && (e5.stack, t4 && !t4.errored && (t4.errored = e5), n3 && !n3.errored && (n3.errored = e5));
      }
      function m4(e5, t4) {
        let n3 = this._readableState, i4 = this._writableState, a4 = i4 || n3;
        return i4 != null && i4.destroyed || n3 != null && n3.destroyed ? (typeof t4 == `function` && t4(), this) : (p3(e5, i4, n3), i4 && (i4.destroyed = true), n3 && (n3.destroyed = true), a4.constructed ? h4(this, e5, t4) : this.once(d3, function(n4) {
          h4(this, r2(n4, e5), t4);
        }), this);
      }
      function h4(e5, t4, r3) {
        let i4 = false;
        function a4(t5) {
          if (i4) return;
          i4 = true;
          let a5 = e5._readableState, o4 = e5._writableState;
          p3(t5, o4, a5), o4 && (o4.closed = true), a5 && (a5.closed = true), typeof r3 == `function` && r3(t5), t5 ? n2.nextTick(g4, e5, t5) : n2.nextTick(_4, e5);
        }
        try {
          e5._destroy(t4 || null, a4);
        } catch (e6) {
          a4(e6);
        }
      }
      function g4(e5, t4) {
        v4(e5, t4), _4(e5);
      }
      function _4(e5) {
        let t4 = e5._readableState, n3 = e5._writableState;
        n3 && (n3.closeEmitted = true), t4 && (t4.closeEmitted = true), (n3 != null && n3.emitClose || t4 != null && t4.emitClose) && e5.emit(`close`);
      }
      function v4(e5, t4) {
        let n3 = e5._readableState, r3 = e5._writableState;
        r3 != null && r3.errorEmitted || n3 != null && n3.errorEmitted || (r3 && (r3.errorEmitted = true), n3 && (n3.errorEmitted = true), e5.emit(`error`, t4));
      }
      function y4() {
        let e5 = this._readableState, t4 = this._writableState;
        e5 && (e5.constructed = true, e5.closed = false, e5.closeEmitted = false, e5.destroyed = false, e5.errored = null, e5.errorEmitted = false, e5.reading = false, e5.ended = e5.readable === false, e5.endEmitted = e5.readable === false), t4 && (t4.constructed = true, t4.destroyed = false, t4.closed = false, t4.closeEmitted = false, t4.errored = null, t4.errorEmitted = false, t4.finalCalled = false, t4.prefinished = false, t4.ended = t4.writable === false, t4.ending = t4.writable === false, t4.finished = t4.writable === false);
      }
      function b4(e5, t4, r3) {
        let i4 = e5._readableState, a4 = e5._writableState;
        if (a4 != null && a4.destroyed || i4 != null && i4.destroyed) return this;
        i4 != null && i4.autoDestroy || a4 != null && a4.autoDestroy ? e5.destroy(t4) : t4 && (t4.stack, a4 && !a4.errored && (a4.errored = t4), i4 && !i4.errored && (i4.errored = t4), r3 ? n2.nextTick(v4, e5, t4) : v4(e5, t4));
      }
      function x4(e5, t4) {
        if (typeof e5._construct != `function`) return;
        let r3 = e5._readableState, i4 = e5._writableState;
        r3 && (r3.constructed = false), i4 && (i4.constructed = false), e5.once(f3, t4), !(e5.listenerCount(f3) > 1) && n2.nextTick(S4, e5);
      }
      function S4(e5) {
        let t4 = false;
        function r3(r4) {
          if (t4) {
            b4(e5, r4 ?? new i3());
            return;
          }
          t4 = true;
          let a4 = e5._readableState, o4 = e5._writableState, s4 = o4 || a4;
          a4 && (a4.constructed = true), o4 && (o4.constructed = true), s4.destroyed ? e5.emit(d3, r4) : r4 ? b4(e5, r4, true) : n2.nextTick(C4, e5);
        }
        try {
          e5._construct((e6) => {
            n2.nextTick(r3, e6);
          });
        } catch (e6) {
          n2.nextTick(r3, e6);
        }
      }
      function C4(e5) {
        e5.emit(f3);
      }
      function w4(e5) {
        return e5?.setHeader && typeof e5.abort == `function`;
      }
      function T4(e5) {
        e5.emit(`close`);
      }
      function E4(e5, t4) {
        e5.emit(`error`, t4), n2.nextTick(T4, e5);
      }
      function D4(e5, t4) {
        !e5 || c3(e5) || (!t4 && !l3(e5) && (t4 = new a3()), u3(e5) ? (e5.socket = null, e5.destroy(t4)) : w4(e5) ? e5.abort() : w4(e5.req) ? e5.req.abort() : typeof e5.destroy == `function` ? e5.destroy(t4) : typeof e5.close == `function` ? e5.close() : t4 ? n2.nextTick(E4, e5, t4) : n2.nextTick(T4, e5), e5.destroyed || (e5[s3] = true));
      }
      t3.exports = { construct: x4, destroyer: D4, destroy: m4, undestroy: y4, errorOrDestroy: b4 };
    }));
    Qe = f(((e4, t3) => {
      let { ArrayIsArray: r2, ObjectSetPrototypeOf: i3 } = Ve(), { EventEmitter: a3 } = h(`events`);
      function o3(e5) {
        a3.call(this, e5);
      }
      i3(o3.prototype, a3.prototype), i3(o3, a3), o3.prototype.pipe = function(e5, t4) {
        let n2 = this;
        function r3(t5) {
          e5.writable && e5.write(t5) === false && n2.pause && n2.pause();
        }
        n2.on(`data`, r3);
        function i4() {
          n2.readable && n2.resume && n2.resume();
        }
        e5.on(`drain`, i4), !e5._isStdio && (!t4 || t4.end !== false) && (n2.on(`end`, c3), n2.on(`close`, l3));
        let o4 = false;
        function c3() {
          o4 || (o4 = true, e5.end());
        }
        function l3() {
          o4 || (o4 = true, typeof e5.destroy == `function` && e5.destroy());
        }
        function u3(e6) {
          d3(), a3.listenerCount(this, `error`) === 0 && this.emit(`error`, e6);
        }
        s3(n2, `error`, u3), s3(e5, `error`, u3);
        function d3() {
          n2.removeListener(`data`, r3), e5.removeListener(`drain`, i4), n2.removeListener(`end`, c3), n2.removeListener(`close`, l3), n2.removeListener(`error`, u3), e5.removeListener(`error`, u3), n2.removeListener(`end`, d3), n2.removeListener(`close`, d3), e5.removeListener(`close`, d3);
        }
        return n2.on(`end`, d3), n2.on(`close`, d3), e5.on(`close`, d3), e5.emit(`pipe`, n2), e5;
      };
      function s3(e5, t4, n2) {
        if (typeof e5.prependListener == `function`) return e5.prependListener(t4, n2);
        !e5._events || !e5._events[t4] ? e5.on(t4, n2) : r2(e5._events[t4]) ? e5._events[t4].unshift(n2) : e5._events[t4] = [n2, e5._events[t4]];
      }
      t3.exports = { Stream: o3, prependListener: s3 };
    }));
    $e = f(((e4, t3) => {
      let { SymbolDispose: n2 } = Ve(), { AbortError: r2, codes: i3 } = Ue(), { isNodeStream: a3, isWebStream: o3, kControllerErrorFunction: s3 } = Ye(), c3 = Xe(), { ERR_INVALID_ARG_TYPE: l3 } = i3, u3, d3 = (e5, t4) => {
        if (typeof e5 != `object` || !(`aborted` in e5)) throw new l3(t4, `AbortSignal`, e5);
      };
      t3.exports.addAbortSignal = function(e5, n3) {
        if (d3(e5, `signal`), !a3(n3) && !o3(n3)) throw new l3(`stream`, [`ReadableStream`, `WritableStream`, `Stream`], n3);
        return t3.exports.addAbortSignalNoValidate(e5, n3);
      }, t3.exports.addAbortSignalNoValidate = function(e5, t4) {
        if (typeof e5 != `object` || !(`aborted` in e5)) return t4;
        let i4 = a3(t4) ? () => {
          t4.destroy(new r2(void 0, { cause: e5.reason }));
        } : () => {
          t4[s3](new r2(void 0, { cause: e5.reason }));
        };
        return e5.aborted ? i4() : (u3 ||= Ke().addAbortListener, c3(t4, u3(e5, i4)[n2])), t4;
      };
    }));
    et = f(((e4, t3) => {
      let { StringPrototypeSlice: r2, SymbolIterator: i3, TypedArrayPrototypeSet: a3, Uint8Array: o3 } = Ve(), { Buffer: s3 } = h(`buffer`), { inspect: c3 } = Ke();
      t3.exports = class {
        constructor() {
          this.head = null, this.tail = null, this.length = 0;
        }
        push(e5) {
          let t4 = { data: e5, next: null };
          this.length > 0 ? this.tail.next = t4 : this.head = t4, this.tail = t4, ++this.length;
        }
        unshift(e5) {
          let t4 = { data: e5, next: this.head };
          this.length === 0 && (this.tail = t4), this.head = t4, ++this.length;
        }
        shift() {
          if (this.length === 0) return;
          let e5 = this.head.data;
          return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, e5;
        }
        clear() {
          this.head = this.tail = null, this.length = 0;
        }
        join(e5) {
          if (this.length === 0) return ``;
          let t4 = this.head, n2 = `` + t4.data;
          for (; (t4 = t4.next) !== null; ) n2 += e5 + t4.data;
          return n2;
        }
        concat(e5) {
          if (this.length === 0) return s3.alloc(0);
          let t4 = s3.allocUnsafe(e5 >>> 0), n2 = this.head, r3 = 0;
          for (; n2; ) a3(t4, n2.data, r3), r3 += n2.data.length, n2 = n2.next;
          return t4;
        }
        consume(e5, t4) {
          let n2 = this.head.data;
          if (e5 < n2.length) {
            let t5 = n2.slice(0, e5);
            return this.head.data = n2.slice(e5), t5;
          }
          return e5 === n2.length ? this.shift() : t4 ? this._getString(e5) : this._getBuffer(e5);
        }
        first() {
          return this.head.data;
        }
        *[i3]() {
          for (let e5 = this.head; e5; e5 = e5.next) yield e5.data;
        }
        _getString(e5) {
          let t4 = ``, n2 = this.head, i4 = 0;
          do {
            let a4 = n2.data;
            if (e5 > a4.length) t4 += a4, e5 -= a4.length;
            else {
              e5 === a4.length ? (t4 += a4, ++i4, n2.next ? this.head = n2.next : this.head = this.tail = null) : (t4 += r2(a4, 0, e5), this.head = n2, n2.data = r2(a4, e5));
              break;
            }
            ++i4;
          } while ((n2 = n2.next) !== null);
          return this.length -= i4, t4;
        }
        _getBuffer(e5) {
          let t4 = s3.allocUnsafe(e5), n2 = e5, r3 = this.head, i4 = 0;
          do {
            let s4 = r3.data;
            if (e5 > s4.length) a3(t4, s4, n2 - e5), e5 -= s4.length;
            else {
              e5 === s4.length ? (a3(t4, s4, n2 - e5), ++i4, r3.next ? this.head = r3.next : this.head = this.tail = null) : (a3(t4, new o3(s4.buffer, s4.byteOffset, e5), n2 - e5), this.head = r3, r3.data = s4.slice(e5));
              break;
            }
            ++i4;
          } while ((r3 = r3.next) !== null);
          return this.length -= i4, t4;
        }
        [/* @__PURE__ */ Symbol.for(`nodejs.util.inspect.custom`)](e5, t4) {
          return c3(this, { ...t4, depth: 0, customInspect: false });
        }
      };
    }));
    tt = f(((e4, t3) => {
      let { MathFloor: n2, NumberIsInteger: r2 } = Ve(), { validateInteger: i3 } = qe(), { ERR_INVALID_ARG_VALUE: a3 } = Ue().codes, o3 = 16 * 1024, s3 = 16;
      function c3(e5, t4, n3) {
        return e5.highWaterMark == null ? t4 ? e5[n3] : null : e5.highWaterMark;
      }
      function l3(e5) {
        return e5 ? s3 : o3;
      }
      function u3(e5, t4) {
        i3(t4, `value`, 0), e5 ? s3 = t4 : o3 = t4;
      }
      function d3(e5, t4, i4, o4) {
        let s4 = c3(t4, o4, i4);
        if (s4 != null) {
          if (!r2(s4) || s4 < 0) throw new a3(o4 ? `options.${i4}` : `options.highWaterMark`, s4);
          return n2(s4);
        }
        return l3(e5.objectMode);
      }
      t3.exports = { getHighWaterMark: d3, getDefaultHighWaterMark: l3, setDefaultHighWaterMark: u3 };
    }));
    nt = f(((e4) => {
      var t3 = p2().Buffer, n2 = t3.isEncoding || function(e5) {
        switch (e5 = `` + e5, e5 && e5.toLowerCase()) {
          case `hex`:
          case `utf8`:
          case `utf-8`:
          case `ascii`:
          case `binary`:
          case `base64`:
          case `ucs2`:
          case `ucs-2`:
          case `utf16le`:
          case `utf-16le`:
          case `raw`:
            return true;
          default:
            return false;
        }
      };
      function r2(e5) {
        if (!e5) return `utf8`;
        for (var t4; ; ) switch (e5) {
          case `utf8`:
          case `utf-8`:
            return `utf8`;
          case `ucs2`:
          case `ucs-2`:
          case `utf16le`:
          case `utf-16le`:
            return `utf16le`;
          case `latin1`:
          case `binary`:
            return `latin1`;
          case `base64`:
          case `ascii`:
          case `hex`:
            return e5;
          default:
            if (t4) return;
            e5 = (`` + e5).toLowerCase(), t4 = true;
        }
      }
      function i3(e5) {
        var i4 = r2(e5);
        if (typeof i4 != `string` && (t3.isEncoding === n2 || !n2(e5))) throw Error(`Unknown encoding: ` + e5);
        return i4 || e5;
      }
      e4.StringDecoder = a3;
      function a3(e5) {
        this.encoding = i3(e5);
        var n3;
        switch (this.encoding) {
          case `utf16le`:
            this.text = f3, this.end = m4, n3 = 4;
            break;
          case `utf8`:
            this.fillLast = l3, n3 = 4;
            break;
          case `base64`:
            this.text = h4, this.end = g4, n3 = 3;
            break;
          default:
            this.write = _4, this.end = v4;
            return;
        }
        this.lastNeed = 0, this.lastTotal = 0, this.lastChar = t3.allocUnsafe(n3);
      }
      a3.prototype.write = function(e5) {
        if (e5.length === 0) return ``;
        var t4, n3;
        if (this.lastNeed) {
          if (t4 = this.fillLast(e5), t4 === void 0) return ``;
          n3 = this.lastNeed, this.lastNeed = 0;
        } else n3 = 0;
        return n3 < e5.length ? t4 ? t4 + this.text(e5, n3) : this.text(e5, n3) : t4 || ``;
      }, a3.prototype.end = d3, a3.prototype.text = u3, a3.prototype.fillLast = function(e5) {
        if (this.lastNeed <= e5.length) return e5.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
        e5.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, e5.length), this.lastNeed -= e5.length;
      };
      function o3(e5) {
        return e5 <= 127 ? 0 : e5 >> 5 == 6 ? 2 : e5 >> 4 == 14 ? 3 : e5 >> 3 == 30 ? 4 : e5 >> 6 == 2 ? -1 : -2;
      }
      function s3(e5, t4, n3) {
        var r3 = t4.length - 1;
        if (r3 < n3) return 0;
        var i4 = o3(t4[r3]);
        return i4 >= 0 ? (i4 > 0 && (e5.lastNeed = i4 - 1), i4) : --r3 < n3 || i4 === -2 ? 0 : (i4 = o3(t4[r3]), i4 >= 0 ? (i4 > 0 && (e5.lastNeed = i4 - 2), i4) : --r3 < n3 || i4 === -2 ? 0 : (i4 = o3(t4[r3]), i4 >= 0 ? (i4 > 0 && (i4 === 2 ? i4 = 0 : e5.lastNeed = i4 - 3), i4) : 0));
      }
      function c3(e5, t4, n3) {
        if ((t4[0] & 192) != 128) return e5.lastNeed = 0, `\uFFFD`;
        if (e5.lastNeed > 1 && t4.length > 1) {
          if ((t4[1] & 192) != 128) return e5.lastNeed = 1, `\uFFFD`;
          if (e5.lastNeed > 2 && t4.length > 2 && (t4[2] & 192) != 128) return e5.lastNeed = 2, `\uFFFD`;
        }
      }
      function l3(e5) {
        var t4 = this.lastTotal - this.lastNeed, n3 = c3(this, e5, t4);
        if (n3 !== void 0) return n3;
        if (this.lastNeed <= e5.length) return e5.copy(this.lastChar, t4, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
        e5.copy(this.lastChar, t4, 0, e5.length), this.lastNeed -= e5.length;
      }
      function u3(e5, t4) {
        var n3 = s3(this, e5, t4);
        if (!this.lastNeed) return e5.toString(`utf8`, t4);
        this.lastTotal = n3;
        var r3 = e5.length - (n3 - this.lastNeed);
        return e5.copy(this.lastChar, 0, r3), e5.toString(`utf8`, t4, r3);
      }
      function d3(e5) {
        var t4 = e5 && e5.length ? this.write(e5) : ``;
        return this.lastNeed ? t4 + `\uFFFD` : t4;
      }
      function f3(e5, t4) {
        if ((e5.length - t4) % 2 == 0) {
          var n3 = e5.toString(`utf16le`, t4);
          if (n3) {
            var r3 = n3.charCodeAt(n3.length - 1);
            if (r3 >= 55296 && r3 <= 56319) return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = e5[e5.length - 2], this.lastChar[1] = e5[e5.length - 1], n3.slice(0, -1);
          }
          return n3;
        }
        return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = e5[e5.length - 1], e5.toString(`utf16le`, t4, e5.length - 1);
      }
      function m4(e5) {
        var t4 = e5 && e5.length ? this.write(e5) : ``;
        if (this.lastNeed) {
          var n3 = this.lastTotal - this.lastNeed;
          return t4 + this.lastChar.toString(`utf16le`, 0, n3);
        }
        return t4;
      }
      function h4(e5, t4) {
        var n3 = (e5.length - t4) % 3;
        return n3 === 0 ? e5.toString(`base64`, t4) : (this.lastNeed = 3 - n3, this.lastTotal = 3, n3 === 1 ? this.lastChar[0] = e5[e5.length - 1] : (this.lastChar[0] = e5[e5.length - 2], this.lastChar[1] = e5[e5.length - 1]), e5.toString(`base64`, t4, e5.length - n3));
      }
      function g4(e5) {
        var t4 = e5 && e5.length ? this.write(e5) : ``;
        return this.lastNeed ? t4 + this.lastChar.toString(`base64`, 0, 3 - this.lastNeed) : t4;
      }
      function _4(e5) {
        return e5.toString(this.encoding);
      }
      function v4(e5) {
        return e5 && e5.length ? this.write(e5) : ``;
      }
    }));
    rt = f(((e4, t3) => {
      let r2 = Je(), { PromisePrototypeThen: i3, SymbolAsyncIterator: a3, SymbolIterator: o3 } = Ve(), { Buffer: s3 } = h(`buffer`), { ERR_INVALID_ARG_TYPE: c3, ERR_STREAM_NULL_VALUES: l3 } = Ue().codes;
      function u3(e5, t4, n2) {
        let u4;
        if (typeof t4 == `string` || t4 instanceof s3) return new e5({ objectMode: true, ...n2, read() {
          this.push(t4), this.push(null);
        } });
        let d3;
        if (t4 && t4[a3]) d3 = true, u4 = t4[a3]();
        else if (t4 && t4[o3]) d3 = false, u4 = t4[o3]();
        else throw new c3(`iterable`, [`Iterable`], t4);
        let f3 = new e5({ objectMode: true, highWaterMark: 1, ...n2 }), p3 = false;
        f3._read = function() {
          p3 || (p3 = true, h4());
        }, f3._destroy = function(e6, t5) {
          i3(m4(e6), () => r2.nextTick(t5, e6), (n3) => r2.nextTick(t5, n3 || e6));
        };
        async function m4(e6) {
          let t5 = e6 != null, n3 = typeof u4.throw == `function`;
          if (t5 && n3) {
            let { value: t6, done: n4 } = await u4.throw(e6);
            if (await t6, n4) return;
          }
          if (typeof u4.return == `function`) {
            let { value: e7 } = await u4.return();
            await e7;
          }
        }
        async function h4() {
          for (; ; ) {
            try {
              let { value: e6, done: t5 } = d3 ? await u4.next() : u4.next();
              if (t5) f3.push(null);
              else {
                let t6 = e6 && typeof e6.then == `function` ? await e6 : e6;
                if (t6 === null) throw p3 = false, new l3();
                if (f3.push(t6)) continue;
                p3 = false;
              }
            } catch (e6) {
              f3.destroy(e6);
            }
            break;
          }
        }
        return f3;
      }
      t3.exports = u3;
    }));
    it = f(((e4, t3) => {
      let r2 = Je(), { ArrayPrototypeIndexOf: i3, NumberIsInteger: a3, NumberIsNaN: o3, NumberParseInt: s3, ObjectDefineProperties: c3, ObjectKeys: l3, ObjectSetPrototypeOf: u3, Promise: d3, SafeSet: f3, SymbolAsyncDispose: p3, SymbolAsyncIterator: m4, Symbol: h4 } = Ve();
      t3.exports = H3, H3.ReadableState = V4;
      let { EventEmitter: g4 } = h(`events`), { Stream: _4, prependListener: v4 } = Qe(), { Buffer: y4 } = h(`buffer`), { addAbortSignal: b4 } = $e(), x4 = Xe(), S4 = Ke().debuglog(`stream`, (e5) => {
        S4 = e5;
      }), C4 = et(), w4 = Ze(), { getHighWaterMark: T4, getDefaultHighWaterMark: E4 } = tt(), { aggregateTwoErrors: D4, codes: { ERR_INVALID_ARG_TYPE: O4, ERR_METHOD_NOT_IMPLEMENTED: k4, ERR_OUT_OF_RANGE: A4, ERR_STREAM_PUSH_AFTER_EOF: j4, ERR_STREAM_UNSHIFT_AFTER_END_EVENT: M4 }, AbortError: N4 } = Ue(), { validateObject: P4 } = qe(), F4 = h4(`kPaused`), { StringDecoder: ee3 } = nt(), I4 = rt();
      u3(H3.prototype, _4.prototype), u3(H3, _4);
      let L4 = () => {
      }, { errorOrDestroy: R4 } = w4, te3 = 2048, ne3 = 4096, z4 = 65536;
      function B4(e5) {
        return { enumerable: false, get() {
          return (this.state & e5) !== 0;
        }, set(t4) {
          t4 ? this.state |= e5 : this.state &= ~e5;
        } };
      }
      c3(V4.prototype, { objectMode: B4(1), ended: B4(2), endEmitted: B4(4), reading: B4(8), constructed: B4(16), sync: B4(32), needReadable: B4(64), emittedReadable: B4(128), readableListening: B4(256), resumeScheduled: B4(512), errorEmitted: B4(1024), emitClose: B4(te3), autoDestroy: B4(ne3), destroyed: B4(8192), closed: B4(16384), closeEmitted: B4(32768), multiAwaitDrain: B4(z4), readingMore: B4(131072), dataEmitted: B4(262144) });
      function V4(e5, t4, n2) {
        typeof n2 != `boolean` && (n2 = t4 instanceof st()), this.state = 6192, e5 && e5.objectMode && (this.state |= 1), n2 && e5 && e5.readableObjectMode && (this.state |= 1), this.highWaterMark = e5 ? T4(this, e5, `readableHighWaterMark`, n2) : E4(false), this.buffer = new C4(), this.length = 0, this.pipes = [], this.flowing = null, this[F4] = null, e5 && e5.emitClose === false && (this.state &= ~te3), e5 && e5.autoDestroy === false && (this.state &= ~ne3), this.errored = null, this.defaultEncoding = e5 && e5.defaultEncoding || `utf8`, this.awaitDrainWriters = null, this.decoder = null, this.encoding = null, e5 && e5.encoding && (this.decoder = new ee3(e5.encoding), this.encoding = e5.encoding);
      }
      function H3(e5) {
        if (!(this instanceof H3)) return new H3(e5);
        let t4 = this instanceof st();
        this._readableState = new V4(e5, this, t4), e5 && (typeof e5.read == `function` && (this._read = e5.read), typeof e5.destroy == `function` && (this._destroy = e5.destroy), typeof e5.construct == `function` && (this._construct = e5.construct), e5.signal && !t4 && b4(e5.signal, this)), _4.call(this, e5), w4.construct(this, () => {
          this._readableState.needReadable && G3(this, this._readableState);
        });
      }
      H3.prototype.destroy = w4.destroy, H3.prototype._undestroy = w4.undestroy, H3.prototype._destroy = function(e5, t4) {
        t4(e5);
      }, H3.prototype[g4.captureRejectionSymbol] = function(e5) {
        this.destroy(e5);
      }, H3.prototype[p3] = function() {
        let e5;
        return this.destroyed || (e5 = this.readableEnded ? null : new N4(), this.destroy(e5)), new d3((t4, n2) => x4(this, (r3) => r3 && r3 !== e5 ? n2(r3) : t4(null)));
      }, H3.prototype.push = function(e5, t4) {
        return re3(this, e5, t4, false);
      }, H3.prototype.unshift = function(e5, t4) {
        return re3(this, e5, t4, true);
      };
      function re3(e5, t4, n2, r3) {
        S4(`readableAddChunk`, t4);
        let i4 = e5._readableState, a4;
        if (i4.state & 1 || (typeof t4 == `string` ? (n2 ||= i4.defaultEncoding, i4.encoding !== n2 && (r3 && i4.encoding ? t4 = y4.from(t4, n2).toString(i4.encoding) : (t4 = y4.from(t4, n2), n2 = ``))) : t4 instanceof y4 ? n2 = `` : _4._isUint8Array(t4) ? (t4 = _4._uint8ArrayToBuffer(t4), n2 = ``) : t4 != null && (a4 = new O4(`chunk`, [`string`, `Buffer`, `Uint8Array`], t4))), a4) R4(e5, a4);
        else if (t4 === null) i4.state &= -9, W3(e5, i4);
        else if (i4.state & 1 || t4 && t4.length > 0) if (r3) if (i4.state & 4) R4(e5, new M4());
        else if (i4.destroyed || i4.errored) return false;
        else ie3(e5, i4, t4, true);
        else if (i4.ended) R4(e5, new j4());
        else if (i4.destroyed || i4.errored) return false;
        else i4.state &= -9, i4.decoder && !n2 ? (t4 = i4.decoder.write(t4), i4.objectMode || t4.length !== 0 ? ie3(e5, i4, t4, false) : G3(e5, i4)) : ie3(e5, i4, t4, false);
        else r3 || (i4.state &= -9, G3(e5, i4));
        return !i4.ended && (i4.length < i4.highWaterMark || i4.length === 0);
      }
      function ie3(e5, t4, n2, r3) {
        t4.flowing && t4.length === 0 && !t4.sync && e5.listenerCount(`data`) > 0 ? ((t4.state & z4) === 0 ? t4.awaitDrainWriters = null : t4.awaitDrainWriters.clear(), t4.dataEmitted = true, e5.emit(`data`, n2)) : (t4.length += t4.objectMode ? 1 : n2.length, r3 ? t4.buffer.unshift(n2) : t4.buffer.push(n2), t4.state & 64 && oe3(e5)), G3(e5, t4);
      }
      H3.prototype.isPaused = function() {
        let e5 = this._readableState;
        return e5[F4] === true || e5.flowing === false;
      }, H3.prototype.setEncoding = function(e5) {
        let t4 = new ee3(e5);
        this._readableState.decoder = t4, this._readableState.encoding = this._readableState.decoder.encoding;
        let n2 = this._readableState.buffer, r3 = ``;
        for (let e6 of n2) r3 += t4.write(e6);
        return n2.clear(), r3 !== `` && n2.push(r3), this._readableState.length = r3.length, this;
      };
      function ae3(e5) {
        if (e5 > 1073741824) throw new A4(`size`, `<= 1GiB`, e5);
        return e5--, e5 |= e5 >>> 1, e5 |= e5 >>> 2, e5 |= e5 >>> 4, e5 |= e5 >>> 8, e5 |= e5 >>> 16, e5++, e5;
      }
      function U3(e5, t4) {
        return e5 <= 0 || t4.length === 0 && t4.ended ? 0 : t4.state & 1 ? 1 : o3(e5) ? t4.flowing && t4.length ? t4.buffer.first().length : t4.length : e5 <= t4.length ? e5 : t4.ended ? t4.length : 0;
      }
      H3.prototype.read = function(e5) {
        S4(`read`, e5), e5 === void 0 ? e5 = NaN : a3(e5) || (e5 = s3(e5, 10));
        let t4 = this._readableState, n2 = e5;
        if (e5 > t4.highWaterMark && (t4.highWaterMark = ae3(e5)), e5 !== 0 && (t4.state &= -129), e5 === 0 && t4.needReadable && ((t4.highWaterMark === 0 ? t4.length > 0 : t4.length >= t4.highWaterMark) || t4.ended)) return S4(`read: emitReadable`, t4.length, t4.ended), t4.length === 0 && t4.ended ? Q3(this) : oe3(this), null;
        if (e5 = U3(e5, t4), e5 === 0 && t4.ended) return t4.length === 0 && Q3(this), null;
        let r3 = (t4.state & 64) != 0;
        if (S4(`need readable`, r3), (t4.length === 0 || t4.length - e5 < t4.highWaterMark) && (r3 = true, S4(`length less than watermark`, r3)), t4.ended || t4.reading || t4.destroyed || t4.errored || !t4.constructed) r3 = false, S4(`reading, ended or constructing`, r3);
        else if (r3) {
          S4(`do read`), t4.state |= 40, t4.length === 0 && (t4.state |= 64);
          try {
            this._read(t4.highWaterMark);
          } catch (e6) {
            R4(this, e6);
          }
          t4.state &= -33, t4.reading || (e5 = U3(n2, t4));
        }
        let i4;
        return i4 = e5 > 0 ? de3(e5, t4) : null, i4 === null ? (t4.needReadable = t4.length <= t4.highWaterMark, e5 = 0) : (t4.length -= e5, t4.multiAwaitDrain ? t4.awaitDrainWriters.clear() : t4.awaitDrainWriters = null), t4.length === 0 && (t4.ended || (t4.needReadable = true), n2 !== e5 && t4.ended && Q3(this)), i4 !== null && !t4.errorEmitted && !t4.closeEmitted && (t4.dataEmitted = true, this.emit(`data`, i4)), i4;
      };
      function W3(e5, t4) {
        if (S4(`onEofChunk`), !t4.ended) {
          if (t4.decoder) {
            let e6 = t4.decoder.end();
            e6 && e6.length && (t4.buffer.push(e6), t4.length += t4.objectMode ? 1 : e6.length);
          }
          t4.ended = true, t4.sync ? oe3(e5) : (t4.needReadable = false, t4.emittedReadable = true, se3(e5));
        }
      }
      function oe3(e5) {
        let t4 = e5._readableState;
        S4(`emitReadable`, t4.needReadable, t4.emittedReadable), t4.needReadable = false, t4.emittedReadable || (S4(`emitReadable`, t4.flowing), t4.emittedReadable = true, r2.nextTick(se3, e5));
      }
      function se3(e5) {
        let t4 = e5._readableState;
        S4(`emitReadable_`, t4.destroyed, t4.length, t4.ended), !t4.destroyed && !t4.errored && (t4.length || t4.ended) && (e5.emit(`readable`), t4.emittedReadable = false), t4.needReadable = !t4.flowing && !t4.ended && t4.length <= t4.highWaterMark, Y3(e5);
      }
      function G3(e5, t4) {
        !t4.readingMore && t4.constructed && (t4.readingMore = true, r2.nextTick(K3, e5, t4));
      }
      function K3(e5, t4) {
        for (; !t4.reading && !t4.ended && (t4.length < t4.highWaterMark || t4.flowing && t4.length === 0); ) {
          let n2 = t4.length;
          if (S4(`maybeReadMore read 0`), e5.read(0), n2 === t4.length) break;
        }
        t4.readingMore = false;
      }
      H3.prototype._read = function(e5) {
        throw new k4(`_read()`);
      }, H3.prototype.pipe = function(e5, t4) {
        let n2 = this, i4 = this._readableState;
        i4.pipes.length === 1 && (i4.multiAwaitDrain || (i4.multiAwaitDrain = true, i4.awaitDrainWriters = new f3(i4.awaitDrainWriters ? [i4.awaitDrainWriters] : []))), i4.pipes.push(e5), S4(`pipe count=%d opts=%j`, i4.pipes.length, t4);
        let a4 = (!t4 || t4.end !== false) && e5 !== r2.stdout && e5 !== r2.stderr ? s4 : _5;
        i4.endEmitted ? r2.nextTick(a4) : n2.once(`end`, a4), e5.on(`unpipe`, o4);
        function o4(e6, t5) {
          S4(`onunpipe`), e6 === n2 && t5 && t5.hasUnpiped === false && (t5.hasUnpiped = true, u4());
        }
        function s4() {
          S4(`onend`), e5.end();
        }
        let c4, l4 = false;
        function u4() {
          S4(`cleanup`), e5.removeListener(`close`, h5), e5.removeListener(`finish`, g5), c4 && e5.removeListener(`drain`, c4), e5.removeListener(`error`, m5), e5.removeListener(`unpipe`, o4), n2.removeListener(`end`, s4), n2.removeListener(`end`, _5), n2.removeListener(`data`, p4), l4 = true, c4 && i4.awaitDrainWriters && (!e5._writableState || e5._writableState.needDrain) && c4();
        }
        function d4() {
          l4 || (i4.pipes.length === 1 && i4.pipes[0] === e5 ? (S4(`false write response, pause`, 0), i4.awaitDrainWriters = e5, i4.multiAwaitDrain = false) : i4.pipes.length > 1 && i4.pipes.includes(e5) && (S4(`false write response, pause`, i4.awaitDrainWriters.size), i4.awaitDrainWriters.add(e5)), n2.pause()), c4 || (c4 = ce3(n2, e5), e5.on(`drain`, c4));
        }
        n2.on(`data`, p4);
        function p4(t5) {
          S4(`ondata`);
          let n3 = e5.write(t5);
          S4(`dest.write`, n3), n3 === false && d4();
        }
        function m5(t5) {
          if (S4(`onerror`, t5), _5(), e5.removeListener(`error`, m5), e5.listenerCount(`error`) === 0) {
            let n3 = e5._writableState || e5._readableState;
            n3 && !n3.errorEmitted ? R4(e5, t5) : e5.emit(`error`, t5);
          }
        }
        v4(e5, `error`, m5);
        function h5() {
          e5.removeListener(`finish`, g5), _5();
        }
        e5.once(`close`, h5);
        function g5() {
          S4(`onfinish`), e5.removeListener(`close`, h5), _5();
        }
        e5.once(`finish`, g5);
        function _5() {
          S4(`unpipe`), n2.unpipe(e5);
        }
        return e5.emit(`pipe`, n2), e5.writableNeedDrain === true ? d4() : i4.flowing || (S4(`pipe resume`), n2.resume()), e5;
      };
      function ce3(e5, t4) {
        return function() {
          let n2 = e5._readableState;
          n2.awaitDrainWriters === t4 ? (S4(`pipeOnDrain`, 1), n2.awaitDrainWriters = null) : n2.multiAwaitDrain && (S4(`pipeOnDrain`, n2.awaitDrainWriters.size), n2.awaitDrainWriters.delete(t4)), (!n2.awaitDrainWriters || n2.awaitDrainWriters.size === 0) && e5.listenerCount(`data`) && e5.resume();
        };
      }
      H3.prototype.unpipe = function(e5) {
        let t4 = this._readableState, n2 = { hasUnpiped: false };
        if (t4.pipes.length === 0) return this;
        if (!e5) {
          let e6 = t4.pipes;
          t4.pipes = [], this.pause();
          for (let t5 = 0; t5 < e6.length; t5++) e6[t5].emit(`unpipe`, this, { hasUnpiped: false });
          return this;
        }
        let r3 = i3(t4.pipes, e5);
        return r3 === -1 ? this : (t4.pipes.splice(r3, 1), t4.pipes.length === 0 && this.pause(), e5.emit(`unpipe`, this, n2), this);
      }, H3.prototype.on = function(e5, t4) {
        let n2 = _4.prototype.on.call(this, e5, t4), i4 = this._readableState;
        return e5 === `data` ? (i4.readableListening = this.listenerCount(`readable`) > 0, i4.flowing !== false && this.resume()) : e5 === `readable` && !i4.endEmitted && !i4.readableListening && (i4.readableListening = i4.needReadable = true, i4.flowing = false, i4.emittedReadable = false, S4(`on readable`, i4.length, i4.reading), i4.length ? oe3(this) : i4.reading || r2.nextTick(q3, this)), n2;
      }, H3.prototype.addListener = H3.prototype.on, H3.prototype.removeListener = function(e5, t4) {
        let n2 = _4.prototype.removeListener.call(this, e5, t4);
        return e5 === `readable` && r2.nextTick(le3, this), n2;
      }, H3.prototype.off = H3.prototype.removeListener, H3.prototype.removeAllListeners = function(e5) {
        let t4 = _4.prototype.removeAllListeners.apply(this, arguments);
        return (e5 === `readable` || e5 === void 0) && r2.nextTick(le3, this), t4;
      };
      function le3(e5) {
        let t4 = e5._readableState;
        t4.readableListening = e5.listenerCount(`readable`) > 0, t4.resumeScheduled && t4[F4] === false ? t4.flowing = true : e5.listenerCount(`data`) > 0 ? e5.resume() : t4.readableListening || (t4.flowing = null);
      }
      function q3(e5) {
        S4(`readable nexttick read 0`), e5.read(0);
      }
      H3.prototype.resume = function() {
        let e5 = this._readableState;
        return e5.flowing || (S4(`resume`), e5.flowing = !e5.readableListening, ue3(this, e5)), e5[F4] = false, this;
      };
      function ue3(e5, t4) {
        t4.resumeScheduled || (t4.resumeScheduled = true, r2.nextTick(J3, e5, t4));
      }
      function J3(e5, t4) {
        S4(`resume`, t4.reading), t4.reading || e5.read(0), t4.resumeScheduled = false, e5.emit(`resume`), Y3(e5), t4.flowing && !t4.reading && e5.read(0);
      }
      H3.prototype.pause = function() {
        return S4(`call pause flowing=%j`, this._readableState.flowing), this._readableState.flowing !== false && (S4(`pause`), this._readableState.flowing = false, this.emit(`pause`)), this._readableState[F4] = true, this;
      };
      function Y3(e5) {
        let t4 = e5._readableState;
        for (S4(`flow`, t4.flowing); t4.flowing && e5.read() !== null; ) ;
      }
      H3.prototype.wrap = function(e5) {
        let t4 = false;
        e5.on(`data`, (n3) => {
          !this.push(n3) && e5.pause && (t4 = true, e5.pause());
        }), e5.on(`end`, () => {
          this.push(null);
        }), e5.on(`error`, (e6) => {
          R4(this, e6);
        }), e5.on(`close`, () => {
          this.destroy();
        }), e5.on(`destroy`, () => {
          this.destroy();
        }), this._read = () => {
          t4 && e5.resume && (t4 = false, e5.resume());
        };
        let n2 = l3(e5);
        for (let t5 = 1; t5 < n2.length; t5++) {
          let r3 = n2[t5];
          this[r3] === void 0 && typeof e5[r3] == `function` && (this[r3] = e5[r3].bind(e5));
        }
        return this;
      }, H3.prototype[m4] = function() {
        return X3(this);
      }, H3.prototype.iterator = function(e5) {
        return e5 !== void 0 && P4(e5, `options`), X3(this, e5);
      };
      function X3(e5, t4) {
        typeof e5.read != `function` && (e5 = H3.wrap(e5, { objectMode: true }));
        let n2 = Z3(e5, t4);
        return n2.stream = e5, n2;
      }
      async function* Z3(e5, t4) {
        let n2 = L4;
        function r3(t5) {
          this === e5 ? (n2(), n2 = L4) : n2 = t5;
        }
        e5.on(`readable`, r3);
        let i4, a4 = x4(e5, { writable: false }, (e6) => {
          i4 = e6 ? D4(i4, e6) : null, n2(), n2 = L4;
        });
        try {
          for (; ; ) {
            let t5 = e5.destroyed ? null : e5.read();
            if (t5 !== null) yield t5;
            else if (i4) throw i4;
            else if (i4 === null) return;
            else await new d3(r3);
          }
        } catch (e6) {
          throw i4 = D4(i4, e6), i4;
        } finally {
          (i4 || t4?.destroyOnReturn !== false) && (i4 === void 0 || e5._readableState.autoDestroy) ? w4.destroyer(e5, null) : (e5.off(`readable`, r3), a4());
        }
      }
      c3(H3.prototype, { readable: { __proto__: null, get() {
        let e5 = this._readableState;
        return !!e5 && e5.readable !== false && !e5.destroyed && !e5.errorEmitted && !e5.endEmitted;
      }, set(e5) {
        this._readableState && (this._readableState.readable = !!e5);
      } }, readableDidRead: { __proto__: null, enumerable: false, get: function() {
        return this._readableState.dataEmitted;
      } }, readableAborted: { __proto__: null, enumerable: false, get: function() {
        return !!(this._readableState.readable !== false && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
      } }, readableHighWaterMark: { __proto__: null, enumerable: false, get: function() {
        return this._readableState.highWaterMark;
      } }, readableBuffer: { __proto__: null, enumerable: false, get: function() {
        return this._readableState && this._readableState.buffer;
      } }, readableFlowing: { __proto__: null, enumerable: false, get: function() {
        return this._readableState.flowing;
      }, set: function(e5) {
        this._readableState && (this._readableState.flowing = e5);
      } }, readableLength: { __proto__: null, enumerable: false, get() {
        return this._readableState.length;
      } }, readableObjectMode: { __proto__: null, enumerable: false, get() {
        return this._readableState ? this._readableState.objectMode : false;
      } }, readableEncoding: { __proto__: null, enumerable: false, get() {
        return this._readableState ? this._readableState.encoding : null;
      } }, errored: { __proto__: null, enumerable: false, get() {
        return this._readableState ? this._readableState.errored : null;
      } }, closed: { __proto__: null, get() {
        return this._readableState ? this._readableState.closed : false;
      } }, destroyed: { __proto__: null, enumerable: false, get() {
        return this._readableState ? this._readableState.destroyed : false;
      }, set(e5) {
        this._readableState && (this._readableState.destroyed = e5);
      } }, readableEnded: { __proto__: null, enumerable: false, get() {
        return this._readableState ? this._readableState.endEmitted : false;
      } } }), c3(V4.prototype, { pipesCount: { __proto__: null, get() {
        return this.pipes.length;
      } }, paused: { __proto__: null, get() {
        return this[F4] !== false;
      }, set(e5) {
        this[F4] = !!e5;
      } } }), H3._fromList = de3;
      function de3(e5, t4) {
        if (t4.length === 0) return null;
        let n2;
        return t4.objectMode ? n2 = t4.buffer.shift() : !e5 || e5 >= t4.length ? (n2 = t4.decoder ? t4.buffer.join(``) : t4.buffer.length === 1 ? t4.buffer.first() : t4.buffer.concat(t4.length), t4.buffer.clear()) : n2 = t4.buffer.consume(e5, t4.decoder), n2;
      }
      function Q3(e5) {
        let t4 = e5._readableState;
        S4(`endReadable`, t4.endEmitted), t4.endEmitted || (t4.ended = true, r2.nextTick(fe3, t4, e5));
      }
      function fe3(e5, t4) {
        if (S4(`endReadableNT`, e5.endEmitted, e5.length), !e5.errored && !e5.closeEmitted && !e5.endEmitted && e5.length === 0) {
          if (e5.endEmitted = true, t4.emit(`end`), t4.writable && t4.allowHalfOpen === false) r2.nextTick(pe3, t4);
          else if (e5.autoDestroy) {
            let e6 = t4._writableState;
            (!e6 || e6.autoDestroy && (e6.finished || e6.writable === false)) && t4.destroy();
          }
        }
      }
      function pe3(e5) {
        e5.writable && !e5.writableEnded && !e5.destroyed && e5.end();
      }
      H3.from = function(e5, t4) {
        return I4(H3, e5, t4);
      };
      let $3;
      function me3() {
        return $3 === void 0 && ($3 = {}), $3;
      }
      H3.fromWeb = function(e5, t4) {
        return me3().newStreamReadableFromReadableStream(e5, t4);
      }, H3.toWeb = function(e5, t4) {
        return me3().newReadableStreamFromStreamReadable(e5, t4);
      }, H3.wrap = function(e5, t4) {
        return new H3({ objectMode: e5.readableObjectMode ?? e5.objectMode ?? true, ...t4, destroy(t5, n2) {
          w4.destroyer(e5, t5), n2(t5);
        } }).wrap(e5);
      };
    }));
    at = f(((e4, t3) => {
      let r2 = Je(), { ArrayPrototypeSlice: i3, Error: a3, FunctionPrototypeSymbolHasInstance: o3, ObjectDefineProperty: s3, ObjectDefineProperties: c3, ObjectSetPrototypeOf: l3, StringPrototypeToLowerCase: u3, Symbol: d3, SymbolHasInstance: f3 } = Ve();
      t3.exports = P4, P4.WritableState = M4;
      let { EventEmitter: p3 } = h(`events`), m4 = Qe().Stream, { Buffer: h4 } = h(`buffer`), g4 = Ze(), { addAbortSignal: _4 } = $e(), { getHighWaterMark: v4, getDefaultHighWaterMark: y4 } = tt(), { ERR_INVALID_ARG_TYPE: b4, ERR_METHOD_NOT_IMPLEMENTED: x4, ERR_MULTIPLE_CALLBACK: S4, ERR_STREAM_CANNOT_PIPE: C4, ERR_STREAM_DESTROYED: w4, ERR_STREAM_ALREADY_FINISHED: T4, ERR_STREAM_NULL_VALUES: E4, ERR_STREAM_WRITE_AFTER_END: D4, ERR_UNKNOWN_ENCODING: O4 } = Ue().codes, { errorOrDestroy: k4 } = g4;
      l3(P4.prototype, m4.prototype), l3(P4, m4);
      function A4() {
      }
      let j4 = d3(`kOnFinished`);
      function M4(e5, t4, n2) {
        typeof n2 != `boolean` && (n2 = t4 instanceof st()), this.objectMode = !!(e5 && e5.objectMode), n2 && (this.objectMode = this.objectMode || !!(e5 && e5.writableObjectMode)), this.highWaterMark = e5 ? v4(this, e5, `writableHighWaterMark`, n2) : y4(false), this.finalCalled = false, this.needDrain = false, this.ending = false, this.ended = false, this.finished = false, this.destroyed = false;
        let r3 = !!(e5 && e5.decodeStrings === false);
        this.decodeStrings = !r3, this.defaultEncoding = e5 && e5.defaultEncoding || `utf8`, this.length = 0, this.writing = false, this.corked = 0, this.sync = true, this.bufferProcessing = false, this.onwrite = R4.bind(void 0, t4), this.writecb = null, this.writelen = 0, this.afterWriteTickInfo = null, N4(this), this.pendingcb = 0, this.constructed = true, this.prefinished = false, this.errorEmitted = false, this.emitClose = !e5 || e5.emitClose !== false, this.autoDestroy = !e5 || e5.autoDestroy !== false, this.errored = null, this.closed = false, this.closeEmitted = false, this[j4] = [];
      }
      function N4(e5) {
        e5.buffered = [], e5.bufferedIndex = 0, e5.allBuffers = true, e5.allNoop = true;
      }
      M4.prototype.getBuffer = function() {
        return i3(this.buffered, this.bufferedIndex);
      }, s3(M4.prototype, `bufferedRequestCount`, { __proto__: null, get() {
        return this.buffered.length - this.bufferedIndex;
      } });
      function P4(e5) {
        let t4 = this instanceof st();
        if (!t4 && !o3(P4, this)) return new P4(e5);
        this._writableState = new M4(e5, this, t4), e5 && (typeof e5.write == `function` && (this._write = e5.write), typeof e5.writev == `function` && (this._writev = e5.writev), typeof e5.destroy == `function` && (this._destroy = e5.destroy), typeof e5.final == `function` && (this._final = e5.final), typeof e5.construct == `function` && (this._construct = e5.construct), e5.signal && _4(e5.signal, this)), m4.call(this, e5), g4.construct(this, () => {
          let e6 = this._writableState;
          e6.writing || B4(this, e6), ie3(this, e6);
        });
      }
      s3(P4, f3, { __proto__: null, value: function(e5) {
        return o3(this, e5) ? true : this === P4 ? e5 && e5._writableState instanceof M4 : false;
      } }), P4.prototype.pipe = function() {
        k4(this, new C4());
      };
      function F4(e5, t4, n2, i4) {
        let a4 = e5._writableState;
        if (typeof n2 == `function`) i4 = n2, n2 = a4.defaultEncoding;
        else {
          if (!n2) n2 = a4.defaultEncoding;
          else if (n2 !== `buffer` && !h4.isEncoding(n2)) throw new O4(n2);
          typeof i4 != `function` && (i4 = A4);
        }
        if (t4 === null) throw new E4();
        if (!a4.objectMode) if (typeof t4 == `string`) a4.decodeStrings !== false && (t4 = h4.from(t4, n2), n2 = `buffer`);
        else if (t4 instanceof h4) n2 = `buffer`;
        else if (m4._isUint8Array(t4)) t4 = m4._uint8ArrayToBuffer(t4), n2 = `buffer`;
        else throw new b4(`chunk`, [`string`, `Buffer`, `Uint8Array`], t4);
        let o4;
        return a4.ending ? o4 = new D4() : a4.destroyed && (o4 = new w4(`write`)), o4 ? (r2.nextTick(i4, o4), k4(e5, o4, true), o4) : (a4.pendingcb++, ee3(e5, a4, t4, n2, i4));
      }
      P4.prototype.write = function(e5, t4, n2) {
        return F4(this, e5, t4, n2) === true;
      }, P4.prototype.cork = function() {
        this._writableState.corked++;
      }, P4.prototype.uncork = function() {
        let e5 = this._writableState;
        e5.corked && (e5.corked--, e5.writing || B4(this, e5));
      }, P4.prototype.setDefaultEncoding = function(e5) {
        if (typeof e5 == `string` && (e5 = u3(e5)), !h4.isEncoding(e5)) throw new O4(e5);
        return this._writableState.defaultEncoding = e5, this;
      };
      function ee3(e5, t4, n2, r3, i4) {
        let a4 = t4.objectMode ? 1 : n2.length;
        t4.length += a4;
        let o4 = t4.length < t4.highWaterMark;
        return o4 || (t4.needDrain = true), t4.writing || t4.corked || t4.errored || !t4.constructed ? (t4.buffered.push({ chunk: n2, encoding: r3, callback: i4 }), t4.allBuffers && r3 !== `buffer` && (t4.allBuffers = false), t4.allNoop && i4 !== A4 && (t4.allNoop = false)) : (t4.writelen = a4, t4.writecb = i4, t4.writing = true, t4.sync = true, e5._write(n2, r3, t4.onwrite), t4.sync = false), o4 && !t4.errored && !t4.destroyed;
      }
      function I4(e5, t4, n2, r3, i4, a4, o4) {
        t4.writelen = r3, t4.writecb = o4, t4.writing = true, t4.sync = true, t4.destroyed ? t4.onwrite(new w4(`write`)) : n2 ? e5._writev(i4, t4.onwrite) : e5._write(i4, a4, t4.onwrite), t4.sync = false;
      }
      function L4(e5, t4, n2, r3) {
        --t4.pendingcb, r3(n2), z4(t4), k4(e5, n2);
      }
      function R4(e5, t4) {
        let n2 = e5._writableState, i4 = n2.sync, a4 = n2.writecb;
        if (typeof a4 != `function`) {
          k4(e5, new S4());
          return;
        }
        n2.writing = false, n2.writecb = null, n2.length -= n2.writelen, n2.writelen = 0, t4 ? (t4.stack, n2.errored ||= t4, e5._readableState && !e5._readableState.errored && (e5._readableState.errored = t4), i4 ? r2.nextTick(L4, e5, n2, t4, a4) : L4(e5, n2, t4, a4)) : (n2.buffered.length > n2.bufferedIndex && B4(e5, n2), i4 ? n2.afterWriteTickInfo !== null && n2.afterWriteTickInfo.cb === a4 ? n2.afterWriteTickInfo.count++ : (n2.afterWriteTickInfo = { count: 1, cb: a4, stream: e5, state: n2 }, r2.nextTick(te3, n2.afterWriteTickInfo)) : ne3(e5, n2, 1, a4));
      }
      function te3({ stream: e5, state: t4, count: n2, cb: r3 }) {
        return t4.afterWriteTickInfo = null, ne3(e5, t4, n2, r3);
      }
      function ne3(e5, t4, n2, r3) {
        for (!t4.ending && !e5.destroyed && t4.length === 0 && t4.needDrain && (t4.needDrain = false, e5.emit(`drain`)); n2-- > 0; ) t4.pendingcb--, r3();
        t4.destroyed && z4(t4), ie3(e5, t4);
      }
      function z4(e5) {
        if (e5.writing) return;
        for (let t5 = e5.bufferedIndex; t5 < e5.buffered.length; ++t5) {
          let { chunk: n2, callback: r3 } = e5.buffered[t5], i4 = e5.objectMode ? 1 : n2.length;
          e5.length -= i4, r3(e5.errored ?? new w4(`write`));
        }
        let t4 = e5[j4].splice(0);
        for (let n2 = 0; n2 < t4.length; n2++) t4[n2](e5.errored ?? new w4(`end`));
        N4(e5);
      }
      function B4(e5, t4) {
        if (t4.corked || t4.bufferProcessing || t4.destroyed || !t4.constructed) return;
        let { buffered: n2, bufferedIndex: r3, objectMode: a4 } = t4, o4 = n2.length - r3;
        if (!o4) return;
        let s4 = r3;
        if (t4.bufferProcessing = true, o4 > 1 && e5._writev) {
          t4.pendingcb -= o4 - 1;
          let r4 = t4.allNoop ? A4 : (e6) => {
            for (let t5 = s4; t5 < n2.length; ++t5) n2[t5].callback(e6);
          }, a5 = t4.allNoop && s4 === 0 ? n2 : i3(n2, s4);
          a5.allBuffers = t4.allBuffers, I4(e5, t4, true, t4.length, a5, ``, r4), N4(t4);
        } else {
          do {
            let { chunk: r4, encoding: i4, callback: o5 } = n2[s4];
            n2[s4++] = null, I4(e5, t4, false, a4 ? 1 : r4.length, r4, i4, o5);
          } while (s4 < n2.length && !t4.writing);
          s4 === n2.length ? N4(t4) : s4 > 256 ? (n2.splice(0, s4), t4.bufferedIndex = 0) : t4.bufferedIndex = s4;
        }
        t4.bufferProcessing = false;
      }
      P4.prototype._write = function(e5, t4, n2) {
        if (this._writev) this._writev([{ chunk: e5, encoding: t4 }], n2);
        else throw new x4(`_write()`);
      }, P4.prototype._writev = null, P4.prototype.end = function(e5, t4, n2) {
        let i4 = this._writableState;
        typeof e5 == `function` ? (n2 = e5, e5 = null, t4 = null) : typeof t4 == `function` && (n2 = t4, t4 = null);
        let o4;
        if (e5 != null) {
          let n3 = F4(this, e5, t4);
          n3 instanceof a3 && (o4 = n3);
        }
        return i4.corked && (i4.corked = 1, this.uncork()), o4 || (!i4.errored && !i4.ending ? (i4.ending = true, ie3(this, i4, true), i4.ended = true) : i4.finished ? o4 = new T4(`end`) : i4.destroyed && (o4 = new w4(`end`))), typeof n2 == `function` && (o4 || i4.finished ? r2.nextTick(n2, o4) : i4[j4].push(n2)), this;
      };
      function V4(e5) {
        return e5.ending && !e5.destroyed && e5.constructed && e5.length === 0 && !e5.errored && e5.buffered.length === 0 && !e5.finished && !e5.writing && !e5.errorEmitted && !e5.closeEmitted;
      }
      function H3(e5, t4) {
        let n2 = false;
        function i4(i5) {
          if (n2) {
            k4(e5, i5 ?? S4());
            return;
          }
          if (n2 = true, t4.pendingcb--, i5) {
            let n3 = t4[j4].splice(0);
            for (let e6 = 0; e6 < n3.length; e6++) n3[e6](i5);
            k4(e5, i5, t4.sync);
          } else V4(t4) && (t4.prefinished = true, e5.emit(`prefinish`), t4.pendingcb++, r2.nextTick(ae3, e5, t4));
        }
        t4.sync = true, t4.pendingcb++;
        try {
          e5._final(i4);
        } catch (e6) {
          i4(e6);
        }
        t4.sync = false;
      }
      function re3(e5, t4) {
        !t4.prefinished && !t4.finalCalled && (typeof e5._final == `function` && !t4.destroyed ? (t4.finalCalled = true, H3(e5, t4)) : (t4.prefinished = true, e5.emit(`prefinish`)));
      }
      function ie3(e5, t4, n2) {
        V4(t4) && (re3(e5, t4), t4.pendingcb === 0 && (n2 ? (t4.pendingcb++, r2.nextTick((e6, t5) => {
          V4(t5) ? ae3(e6, t5) : t5.pendingcb--;
        }, e5, t4)) : V4(t4) && (t4.pendingcb++, ae3(e5, t4))));
      }
      function ae3(e5, t4) {
        t4.pendingcb--, t4.finished = true;
        let n2 = t4[j4].splice(0);
        for (let e6 = 0; e6 < n2.length; e6++) n2[e6]();
        if (e5.emit(`finish`), t4.autoDestroy) {
          let t5 = e5._readableState;
          (!t5 || t5.autoDestroy && (t5.endEmitted || t5.readable === false)) && e5.destroy();
        }
      }
      c3(P4.prototype, { closed: { __proto__: null, get() {
        return this._writableState ? this._writableState.closed : false;
      } }, destroyed: { __proto__: null, get() {
        return this._writableState ? this._writableState.destroyed : false;
      }, set(e5) {
        this._writableState && (this._writableState.destroyed = e5);
      } }, writable: { __proto__: null, get() {
        let e5 = this._writableState;
        return !!e5 && e5.writable !== false && !e5.destroyed && !e5.errored && !e5.ending && !e5.ended;
      }, set(e5) {
        this._writableState && (this._writableState.writable = !!e5);
      } }, writableFinished: { __proto__: null, get() {
        return this._writableState ? this._writableState.finished : false;
      } }, writableObjectMode: { __proto__: null, get() {
        return this._writableState ? this._writableState.objectMode : false;
      } }, writableBuffer: { __proto__: null, get() {
        return this._writableState && this._writableState.getBuffer();
      } }, writableEnded: { __proto__: null, get() {
        return this._writableState ? this._writableState.ending : false;
      } }, writableNeedDrain: { __proto__: null, get() {
        let e5 = this._writableState;
        return e5 ? !e5.destroyed && !e5.ending && e5.needDrain : false;
      } }, writableHighWaterMark: { __proto__: null, get() {
        return this._writableState && this._writableState.highWaterMark;
      } }, writableCorked: { __proto__: null, get() {
        return this._writableState ? this._writableState.corked : 0;
      } }, writableLength: { __proto__: null, get() {
        return this._writableState && this._writableState.length;
      } }, errored: { __proto__: null, enumerable: false, get() {
        return this._writableState ? this._writableState.errored : null;
      } }, writableAborted: { __proto__: null, enumerable: false, get: function() {
        return !!(this._writableState.writable !== false && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
      } } });
      let U3 = g4.destroy;
      P4.prototype.destroy = function(e5, t4) {
        let n2 = this._writableState;
        return !n2.destroyed && (n2.bufferedIndex < n2.buffered.length || n2[j4].length) && r2.nextTick(z4, n2), U3.call(this, e5, t4), this;
      }, P4.prototype._undestroy = g4.undestroy, P4.prototype._destroy = function(e5, t4) {
        t4(e5);
      }, P4.prototype[p3.captureRejectionSymbol] = function(e5) {
        this.destroy(e5);
      };
      let W3;
      function oe3() {
        return W3 === void 0 && (W3 = {}), W3;
      }
      P4.fromWeb = function(e5, t4) {
        return oe3().newStreamWritableFromWritableStream(e5, t4);
      }, P4.toWeb = function(e5) {
        return oe3().newWritableStreamFromStreamWritable(e5);
      };
    }));
    ot = f(((e4, t3) => {
      let r2 = Je(), i3 = h(`buffer`), { isReadable: a3, isWritable: o3, isIterable: s3, isNodeStream: c3, isReadableNodeStream: l3, isWritableNodeStream: u3, isDuplexNodeStream: d3, isReadableStream: f3, isWritableStream: p3 } = Ye(), m4 = Xe(), { AbortError: h4, codes: { ERR_INVALID_ARG_TYPE: g4, ERR_INVALID_RETURN_VALUE: _4 } } = Ue(), { destroyer: v4 } = Ze(), y4 = st(), b4 = it(), x4 = at(), { createDeferredPromise: S4 } = Ke(), C4 = rt(), w4 = globalThis.Blob || i3.Blob, T4 = w4 === void 0 ? function(e5) {
        return false;
      } : function(e5) {
        return e5 instanceof w4;
      }, E4 = globalThis.AbortController || Ge().AbortController, { FunctionPrototypeCall: D4 } = Ve();
      var O4 = class extends y4 {
        constructor(e5) {
          super(e5), e5?.readable === false && (this._readableState.readable = false, this._readableState.ended = true, this._readableState.endEmitted = true), e5?.writable === false && (this._writableState.writable = false, this._writableState.ending = true, this._writableState.ended = true, this._writableState.finished = true);
        }
      };
      t3.exports = function e5(t4, n2) {
        if (d3(t4)) return t4;
        if (l3(t4)) return A4({ readable: t4 });
        if (u3(t4)) return A4({ writable: t4 });
        if (c3(t4)) return A4({ writable: false, readable: false });
        if (f3(t4)) return A4({ readable: b4.fromWeb(t4) });
        if (p3(t4)) return A4({ writable: x4.fromWeb(t4) });
        if (typeof t4 == `function`) {
          let { value: e6, write: i5, final: a4, destroy: o4 } = k4(t4);
          if (s3(e6)) return C4(O4, e6, { objectMode: true, write: i5, final: a4, destroy: o4 });
          let c4 = e6?.then;
          if (typeof c4 == `function`) {
            let t5, n3 = D4(c4, e6, (e7) => {
              if (e7 != null) throw new _4(`nully`, `body`, e7);
            }, (e7) => {
              v4(t5, e7);
            });
            return t5 = new O4({ objectMode: true, readable: false, write: i5, final(e7) {
              a4(async () => {
                try {
                  await n3, r2.nextTick(e7, null);
                } catch (t6) {
                  r2.nextTick(e7, t6);
                }
              });
            }, destroy: o4 });
          }
          throw new _4(`Iterable, AsyncIterable or AsyncFunction`, n2, e6);
        }
        if (T4(t4)) return e5(t4.arrayBuffer());
        if (s3(t4)) return C4(O4, t4, { objectMode: true, writable: false });
        if (f3(t4?.readable) && p3(t4?.writable)) return O4.fromWeb(t4);
        if (typeof t4?.writable == `object` || typeof t4?.readable == `object`) return A4({ readable: t4 != null && t4.readable ? l3(t4?.readable) ? t4?.readable : e5(t4.readable) : void 0, writable: t4 != null && t4.writable ? u3(t4?.writable) ? t4?.writable : e5(t4.writable) : void 0 });
        let i4 = t4?.then;
        if (typeof i4 == `function`) {
          let e6;
          return D4(i4, t4, (t5) => {
            t5 != null && e6.push(t5), e6.push(null);
          }, (t5) => {
            v4(e6, t5);
          }), e6 = new O4({ objectMode: true, writable: false, read() {
          } });
        }
        throw new g4(n2, [`Blob`, `ReadableStream`, `WritableStream`, `Stream`, `Iterable`, `AsyncIterable`, `Function`, `{ readable, writable } pair`, `Promise`], t4);
      };
      function k4(e5) {
        let { promise: t4, resolve: n2 } = S4(), i4 = new E4(), a4 = i4.signal;
        return { value: e5((async function* () {
          for (; ; ) {
            let e6 = t4;
            t4 = null;
            let { chunk: i5, done: o4, cb: s4 } = await e6;
            if (r2.nextTick(s4), o4) return;
            if (a4.aborted) throw new h4(void 0, { cause: a4.reason });
            ({ promise: t4, resolve: n2 } = S4()), yield i5;
          }
        })(), { signal: a4 }), write(e6, t5, r3) {
          let i5 = n2;
          n2 = null, i5({ chunk: e6, done: false, cb: r3 });
        }, final(e6) {
          let t5 = n2;
          n2 = null, t5({ done: true, cb: e6 });
        }, destroy(e6, t5) {
          i4.abort(), t5(e6);
        } };
      }
      function A4(e5) {
        let t4 = e5.readable && typeof e5.readable.read != `function` ? b4.wrap(e5.readable) : e5.readable, n2 = e5.writable, r3 = !!a3(t4), i4 = !!o3(n2), s4, c4, l4, u4, d4;
        function f4(e6) {
          let t5 = u4;
          u4 = null, t5 ? t5(e6) : e6 && d4.destroy(e6);
        }
        return d4 = new O4({ readableObjectMode: !!(t4 != null && t4.readableObjectMode), writableObjectMode: !!(n2 != null && n2.writableObjectMode), readable: r3, writable: i4 }), i4 && (m4(n2, (e6) => {
          i4 = false, e6 && v4(t4, e6), f4(e6);
        }), d4._write = function(e6, t5, r4) {
          n2.write(e6, t5) ? r4() : s4 = r4;
        }, d4._final = function(e6) {
          n2.end(), c4 = e6;
        }, n2.on(`drain`, function() {
          if (s4) {
            let e6 = s4;
            s4 = null, e6();
          }
        }), n2.on(`finish`, function() {
          if (c4) {
            let e6 = c4;
            c4 = null, e6();
          }
        })), r3 && (m4(t4, (e6) => {
          r3 = false, e6 && v4(t4, e6), f4(e6);
        }), t4.on(`readable`, function() {
          if (l4) {
            let e6 = l4;
            l4 = null, e6();
          }
        }), t4.on(`end`, function() {
          d4.push(null);
        }), d4._read = function() {
          for (; ; ) {
            let e6 = t4.read();
            if (e6 === null) {
              l4 = d4._read;
              return;
            }
            if (!d4.push(e6)) return;
          }
        }), d4._destroy = function(e6, r4) {
          !e6 && u4 !== null && (e6 = new h4()), l4 = null, s4 = null, c4 = null, u4 === null ? r4(e6) : (u4 = r4, v4(n2, e6), v4(t4, e6));
        }, d4;
      }
    }));
    st = f(((e4, t3) => {
      let { ObjectDefineProperties: n2, ObjectGetOwnPropertyDescriptor: r2, ObjectKeys: i3, ObjectSetPrototypeOf: a3 } = Ve();
      t3.exports = c3;
      let o3 = it(), s3 = at();
      a3(c3.prototype, o3.prototype), a3(c3, o3);
      {
        let e5 = i3(s3.prototype);
        for (let t4 = 0; t4 < e5.length; t4++) {
          let n3 = e5[t4];
          c3.prototype[n3] || (c3.prototype[n3] = s3.prototype[n3]);
        }
      }
      function c3(e5) {
        if (!(this instanceof c3)) return new c3(e5);
        o3.call(this, e5), s3.call(this, e5), e5 ? (this.allowHalfOpen = e5.allowHalfOpen !== false, e5.readable === false && (this._readableState.readable = false, this._readableState.ended = true, this._readableState.endEmitted = true), e5.writable === false && (this._writableState.writable = false, this._writableState.ending = true, this._writableState.ended = true, this._writableState.finished = true)) : this.allowHalfOpen = true;
      }
      n2(c3.prototype, { writable: { __proto__: null, ...r2(s3.prototype, `writable`) }, writableHighWaterMark: { __proto__: null, ...r2(s3.prototype, `writableHighWaterMark`) }, writableObjectMode: { __proto__: null, ...r2(s3.prototype, `writableObjectMode`) }, writableBuffer: { __proto__: null, ...r2(s3.prototype, `writableBuffer`) }, writableLength: { __proto__: null, ...r2(s3.prototype, `writableLength`) }, writableFinished: { __proto__: null, ...r2(s3.prototype, `writableFinished`) }, writableCorked: { __proto__: null, ...r2(s3.prototype, `writableCorked`) }, writableEnded: { __proto__: null, ...r2(s3.prototype, `writableEnded`) }, writableNeedDrain: { __proto__: null, ...r2(s3.prototype, `writableNeedDrain`) }, destroyed: { __proto__: null, get() {
        return this._readableState === void 0 || this._writableState === void 0 ? false : this._readableState.destroyed && this._writableState.destroyed;
      }, set(e5) {
        this._readableState && this._writableState && (this._readableState.destroyed = e5, this._writableState.destroyed = e5);
      } } });
      let l3;
      function u3() {
        return l3 === void 0 && (l3 = {}), l3;
      }
      c3.fromWeb = function(e5, t4) {
        return u3().newStreamDuplexFromReadableWritablePair(e5, t4);
      }, c3.toWeb = function(e5) {
        return u3().newReadableWritablePairFromDuplex(e5);
      };
      let d3;
      c3.from = function(e5) {
        return d3 ||= ot(), d3(e5, `body`);
      };
    }));
    ct = f(((e4, t3) => {
      let { ObjectSetPrototypeOf: n2, Symbol: r2 } = Ve();
      t3.exports = c3;
      let { ERR_METHOD_NOT_IMPLEMENTED: i3 } = Ue().codes, a3 = st(), { getHighWaterMark: o3 } = tt();
      n2(c3.prototype, a3.prototype), n2(c3, a3);
      let s3 = r2(`kCallback`);
      function c3(e5) {
        if (!(this instanceof c3)) return new c3(e5);
        let t4 = e5 ? o3(this, e5, `readableHighWaterMark`, true) : null;
        t4 === 0 && (e5 = { ...e5, highWaterMark: null, readableHighWaterMark: t4, writableHighWaterMark: e5.writableHighWaterMark || 0 }), a3.call(this, e5), this._readableState.sync = false, this[s3] = null, e5 && (typeof e5.transform == `function` && (this._transform = e5.transform), typeof e5.flush == `function` && (this._flush = e5.flush)), this.on(`prefinish`, u3);
      }
      function l3(e5) {
        typeof this._flush == `function` && !this.destroyed ? this._flush((t4, n3) => {
          if (t4) {
            e5 ? e5(t4) : this.destroy(t4);
            return;
          }
          n3 != null && this.push(n3), this.push(null), e5 && e5();
        }) : (this.push(null), e5 && e5());
      }
      function u3() {
        this._final !== l3 && l3.call(this);
      }
      c3.prototype._final = l3, c3.prototype._transform = function(e5, t4, n3) {
        throw new i3(`_transform()`);
      }, c3.prototype._write = function(e5, t4, n3) {
        let r3 = this._readableState, i4 = this._writableState, a4 = r3.length;
        this._transform(e5, t4, (e6, t5) => {
          if (e6) {
            n3(e6);
            return;
          }
          t5 != null && this.push(t5), i4.ended || a4 === r3.length || r3.length < r3.highWaterMark ? n3() : this[s3] = n3;
        });
      }, c3.prototype._read = function() {
        if (this[s3]) {
          let e5 = this[s3];
          this[s3] = null, e5();
        }
      };
    }));
    lt = f(((e4, t3) => {
      let { ObjectSetPrototypeOf: n2 } = Ve();
      t3.exports = i3;
      let r2 = ct();
      n2(i3.prototype, r2.prototype), n2(i3, r2);
      function i3(e5) {
        if (!(this instanceof i3)) return new i3(e5);
        r2.call(this, e5);
      }
      i3.prototype._transform = function(e5, t4, n3) {
        n3(null, e5);
      };
    }));
    ut = f(((e4, t3) => {
      let n2 = Je(), { ArrayIsArray: r2, Promise: i3, SymbolAsyncIterator: a3, SymbolDispose: o3 } = Ve(), s3 = Xe(), { once: c3 } = Ke(), l3 = Ze(), u3 = st(), { aggregateTwoErrors: d3, codes: { ERR_INVALID_ARG_TYPE: f3, ERR_INVALID_RETURN_VALUE: p3, ERR_MISSING_ARGS: m4, ERR_STREAM_DESTROYED: h4, ERR_STREAM_PREMATURE_CLOSE: g4 }, AbortError: _4 } = Ue(), { validateFunction: v4, validateAbortSignal: y4 } = qe(), { isIterable: b4, isReadable: x4, isReadableNodeStream: S4, isNodeStream: C4, isTransformStream: w4, isWebStream: T4, isReadableStream: E4, isReadableFinished: D4 } = Ye(), O4 = globalThis.AbortController || Ge().AbortController, k4, A4, j4;
      function M4(e5, t4, n3) {
        let r3 = false;
        return e5.on(`close`, () => {
          r3 = true;
        }), { destroy: (t5) => {
          r3 || (r3 = true, l3.destroyer(e5, t5 || new h4(`pipe`)));
        }, cleanup: s3(e5, { readable: t4, writable: n3 }, (e6) => {
          r3 = !e6;
        }) };
      }
      function N4(e5) {
        return v4(e5[e5.length - 1], `streams[stream.length - 1]`), e5.pop();
      }
      function P4(e5) {
        if (b4(e5)) return e5;
        if (S4(e5)) return F4(e5);
        throw new f3(`val`, [`Readable`, `Iterable`, `AsyncIterable`], e5);
      }
      async function* F4(e5) {
        A4 ||= it(), yield* A4.prototype[a3].call(e5);
      }
      async function ee3(e5, t4, n3, { end: r3 }) {
        let a4, o4 = null, c4 = (e6) => {
          if (e6 && (a4 = e6), o4) {
            let e7 = o4;
            o4 = null, e7();
          }
        }, l4 = () => new i3((e6, t5) => {
          a4 ? t5(a4) : o4 = () => {
            a4 ? t5(a4) : e6();
          };
        });
        t4.on(`drain`, c4);
        let u4 = s3(t4, { readable: false }, c4);
        try {
          t4.writableNeedDrain && await l4();
          for await (let n4 of e5) t4.write(n4) || await l4();
          r3 && (t4.end(), await l4()), n3();
        } catch (e6) {
          n3(a4 === e6 ? e6 : d3(a4, e6));
        } finally {
          u4(), t4.off(`drain`, c4);
        }
      }
      async function I4(e5, t4, n3, { end: r3 }) {
        w4(t4) && (t4 = t4.writable);
        let i4 = t4.getWriter();
        try {
          for await (let t5 of e5) await i4.ready, i4.write(t5).catch(() => {
          });
          await i4.ready, r3 && await i4.close(), n3();
        } catch (e6) {
          try {
            await i4.abort(e6), n3(e6);
          } catch (e7) {
            n3(e7);
          }
        }
      }
      function L4(...e5) {
        return R4(e5, c3(N4(e5)));
      }
      function R4(e5, t4, i4) {
        if (e5.length === 1 && r2(e5[0]) && (e5 = e5[0]), e5.length < 2) throw new m4(`streams`);
        let a4 = new O4(), s4 = a4.signal, c4 = i4?.signal, l4 = [];
        y4(c4, `options.signal`);
        function d4() {
          F5(new _4());
        }
        j4 ||= Ke().addAbortListener;
        let h5;
        c4 && (h5 = j4(c4, d4));
        let g5, v5, D5 = [], A5 = 0;
        function N5(e6) {
          F5(e6, --A5 === 0);
        }
        function F5(e6, r3) {
          var i5;
          if (e6 && (!g5 || g5.code === `ERR_STREAM_PREMATURE_CLOSE`) && (g5 = e6), !(!g5 && !r3)) {
            for (; D5.length; ) D5.shift()(g5);
            (i5 = h5) == null || i5[o3](), a4.abort(), r3 && (g5 || l4.forEach((e7) => e7()), n2.nextTick(t4, g5, v5));
          }
        }
        let L5;
        for (let t5 = 0; t5 < e5.length; t5++) {
          let r3 = e5[t5], a5 = t5 < e5.length - 1, o4 = t5 > 0, c5 = a5 || i4?.end !== false, d5 = t5 === e5.length - 1;
          if (C4(r3)) {
            let e6 = function(e7) {
              e7 && e7.name !== `AbortError` && e7.code !== `ERR_STREAM_PREMATURE_CLOSE` && N5(e7);
            };
            if (c5) {
              let { destroy: e7, cleanup: t6 } = M4(r3, a5, o4);
              D5.push(e7), x4(r3) && d5 && l4.push(t6);
            }
            r3.on(`error`, e6), x4(r3) && d5 && l4.push(() => {
              r3.removeListener(`error`, e6);
            });
          }
          if (t5 === 0) if (typeof r3 == `function`) {
            if (L5 = r3({ signal: s4 }), !b4(L5)) throw new p3(`Iterable, AsyncIterable or Stream`, `source`, L5);
          } else L5 = b4(r3) || S4(r3) || w4(r3) ? r3 : u3.from(r3);
          else if (typeof r3 == `function`) if (L5 = w4(L5) ? P4(L5?.readable) : P4(L5), L5 = r3(L5, { signal: s4 }), a5) {
            if (!b4(L5, true)) throw new p3(`AsyncIterable`, `transform[${t5 - 1}]`, L5);
          } else {
            k4 ||= lt();
            let e6 = new k4({ objectMode: true }), t6 = L5?.then;
            if (typeof t6 == `function`) A5++, t6.call(L5, (t7) => {
              v5 = t7, t7 != null && e6.write(t7), c5 && e6.end(), n2.nextTick(N5);
            }, (t7) => {
              e6.destroy(t7), n2.nextTick(N5, t7);
            });
            else if (b4(L5, true)) A5++, ee3(L5, e6, N5, { end: c5 });
            else if (E4(L5) || w4(L5)) {
              let t7 = L5.readable || L5;
              A5++, ee3(t7, e6, N5, { end: c5 });
            } else throw new p3(`AsyncIterable or Promise`, `destination`, L5);
            L5 = e6;
            let { destroy: r4, cleanup: i5 } = M4(L5, false, true);
            D5.push(r4), d5 && l4.push(i5);
          }
          else if (C4(r3)) {
            if (S4(L5)) {
              A5 += 2;
              let e6 = te3(L5, r3, N5, { end: c5 });
              x4(r3) && d5 && l4.push(e6);
            } else if (w4(L5) || E4(L5)) {
              let e6 = L5.readable || L5;
              A5++, ee3(e6, r3, N5, { end: c5 });
            } else if (b4(L5)) A5++, ee3(L5, r3, N5, { end: c5 });
            else throw new f3(`val`, [`Readable`, `Iterable`, `AsyncIterable`, `ReadableStream`, `TransformStream`], L5);
            L5 = r3;
          } else if (T4(r3)) {
            if (S4(L5)) A5++, I4(P4(L5), r3, N5, { end: c5 });
            else if (E4(L5) || b4(L5)) A5++, I4(L5, r3, N5, { end: c5 });
            else if (w4(L5)) A5++, I4(L5.readable, r3, N5, { end: c5 });
            else throw new f3(`val`, [`Readable`, `Iterable`, `AsyncIterable`, `ReadableStream`, `TransformStream`], L5);
            L5 = r3;
          } else L5 = u3.from(r3);
        }
        return (s4 != null && s4.aborted || c4 != null && c4.aborted) && n2.nextTick(d4), L5;
      }
      function te3(e5, t4, r3, { end: i4 }) {
        let a4 = false;
        if (t4.on(`close`, () => {
          a4 || r3(new g4());
        }), e5.pipe(t4, { end: false }), i4) {
          let r4 = function() {
            a4 = true, t4.end();
          };
          D4(e5) ? n2.nextTick(r4) : e5.once(`end`, r4);
        } else r3();
        return s3(e5, { readable: true, writable: false }, (t5) => {
          let n3 = e5._readableState;
          t5 && t5.code === `ERR_STREAM_PREMATURE_CLOSE` && n3 && n3.ended && !n3.errored && !n3.errorEmitted ? e5.once(`end`, r3).once(`error`, r3) : r3(t5);
        }), s3(t4, { readable: false, writable: true }, r3);
      }
      t3.exports = { pipelineImpl: R4, pipeline: L4 };
    }));
    dt = f(((e4, t3) => {
      let { pipeline: n2 } = ut(), r2 = st(), { destroyer: i3 } = Ze(), { isNodeStream: a3, isReadable: o3, isWritable: s3, isWebStream: c3, isTransformStream: l3, isWritableStream: u3, isReadableStream: d3 } = Ye(), { AbortError: f3, codes: { ERR_INVALID_ARG_VALUE: p3, ERR_MISSING_ARGS: m4 } } = Ue(), h4 = Xe();
      t3.exports = function(...e5) {
        if (e5.length === 0) throw new m4(`streams`);
        if (e5.length === 1) return r2.from(e5[0]);
        let t4 = [...e5];
        if (typeof e5[0] == `function` && (e5[0] = r2.from(e5[0])), typeof e5[e5.length - 1] == `function`) {
          let t5 = e5.length - 1;
          e5[t5] = r2.from(e5[t5]);
        }
        for (let n3 = 0; n3 < e5.length; ++n3) if (!(!a3(e5[n3]) && !c3(e5[n3]))) {
          if (n3 < e5.length - 1 && !(o3(e5[n3]) || d3(e5[n3]) || l3(e5[n3]))) throw new p3(`streams[${n3}]`, t4[n3], `must be readable`);
          if (n3 > 0 && !(s3(e5[n3]) || u3(e5[n3]) || l3(e5[n3]))) throw new p3(`streams[${n3}]`, t4[n3], `must be writable`);
        }
        let g4, _4, v4, y4, b4;
        function x4(e6) {
          let t5 = y4;
          y4 = null, t5 ? t5(e6) : e6 ? b4.destroy(e6) : !T4 && !w4 && b4.destroy();
        }
        let S4 = e5[0], C4 = n2(e5, x4), w4 = !!(s3(S4) || u3(S4) || l3(S4)), T4 = !!(o3(C4) || d3(C4) || l3(C4));
        if (b4 = new r2({ writableObjectMode: !!(S4 != null && S4.writableObjectMode), readableObjectMode: !!(C4 != null && C4.readableObjectMode), writable: w4, readable: T4 }), w4) {
          if (a3(S4)) b4._write = function(e6, t5, n3) {
            S4.write(e6, t5) ? n3() : g4 = n3;
          }, b4._final = function(e6) {
            S4.end(), _4 = e6;
          }, S4.on(`drain`, function() {
            if (g4) {
              let e6 = g4;
              g4 = null, e6();
            }
          });
          else if (c3(S4)) {
            let e6 = (l3(S4) ? S4.writable : S4).getWriter();
            b4._write = async function(t5, n3, r3) {
              try {
                await e6.ready, e6.write(t5).catch(() => {
                }), r3();
              } catch (e7) {
                r3(e7);
              }
            }, b4._final = async function(t5) {
              try {
                await e6.ready, e6.close().catch(() => {
                }), _4 = t5;
              } catch (e7) {
                t5(e7);
              }
            };
          }
          h4(l3(C4) ? C4.readable : C4, () => {
            if (_4) {
              let e6 = _4;
              _4 = null, e6();
            }
          });
        }
        if (T4) {
          if (a3(C4)) C4.on(`readable`, function() {
            if (v4) {
              let e6 = v4;
              v4 = null, e6();
            }
          }), C4.on(`end`, function() {
            b4.push(null);
          }), b4._read = function() {
            for (; ; ) {
              let e6 = C4.read();
              if (e6 === null) {
                v4 = b4._read;
                return;
              }
              if (!b4.push(e6)) return;
            }
          };
          else if (c3(C4)) {
            let e6 = (l3(C4) ? C4.readable : C4).getReader();
            b4._read = async function() {
              for (; ; ) try {
                let { value: t5, done: n3 } = await e6.read();
                if (!b4.push(t5)) return;
                if (n3) {
                  b4.push(null);
                  return;
                }
              } catch {
                return;
              }
            };
          }
        }
        return b4._destroy = function(e6, t5) {
          !e6 && y4 !== null && (e6 = new f3()), v4 = null, g4 = null, _4 = null, y4 === null ? t5(e6) : (y4 = t5, a3(C4) && i3(C4, e6));
        }, b4;
      };
    }));
    ft = f(((e4, t3) => {
      let n2 = globalThis.AbortController || Ge().AbortController, { codes: { ERR_INVALID_ARG_VALUE: r2, ERR_INVALID_ARG_TYPE: i3, ERR_MISSING_ARGS: a3, ERR_OUT_OF_RANGE: o3 }, AbortError: s3 } = Ue(), { validateAbortSignal: c3, validateInteger: l3, validateObject: u3 } = qe(), d3 = Ve().Symbol(`kWeak`), f3 = Ve().Symbol(`kResistStopPropagation`), { finished: p3 } = Xe(), m4 = dt(), { addAbortSignalNoValidate: h4 } = $e(), { isWritable: g4, isNodeStream: _4 } = Ye(), { deprecate: v4 } = Ke(), { ArrayPrototypePush: y4, Boolean: b4, MathFloor: x4, Number: S4, NumberIsNaN: C4, Promise: w4, PromiseReject: T4, PromiseResolve: E4, PromisePrototypeThen: D4, Symbol: O4 } = Ve(), k4 = O4(`kEmpty`), A4 = O4(`kEof`);
      function j4(e5, t4) {
        if (t4 != null && u3(t4, `options`), t4?.signal != null && c3(t4.signal, `options.signal`), _4(e5) && !g4(e5)) throw new r2(`stream`, e5, `must be writable`);
        let n3 = m4(this, e5);
        return t4 != null && t4.signal && h4(t4.signal, n3), n3;
      }
      function M4(e5, t4) {
        if (typeof e5 != `function`) throw new i3(`fn`, [`Function`, `AsyncFunction`], e5);
        t4 != null && u3(t4, `options`), t4?.signal != null && c3(t4.signal, `options.signal`);
        let n3 = 1;
        t4?.concurrency != null && (n3 = x4(t4.concurrency));
        let r3 = n3 - 1;
        return t4?.highWaterMark != null && (r3 = x4(t4.highWaterMark)), l3(n3, `options.concurrency`, 1), l3(r3, `options.highWaterMark`, 0), r3 += n3, async function* () {
          let i4 = Ke().AbortSignalAny([t4?.signal].filter(b4)), a4 = this, o4 = [], c4 = { signal: i4 }, l4, u4, d4 = false, f4 = 0;
          function p4() {
            d4 = true, m5();
          }
          function m5() {
            --f4, h5();
          }
          function h5() {
            u4 && !d4 && f4 < n3 && o4.length < r3 && (u4(), u4 = null);
          }
          async function g5() {
            try {
              for await (let t5 of a4) {
                if (d4) return;
                if (i4.aborted) throw new s3();
                try {
                  if (t5 = e5(t5, c4), t5 === k4) continue;
                  t5 = E4(t5);
                } catch (e6) {
                  t5 = T4(e6);
                }
                f4 += 1, D4(t5, m5, p4), o4.push(t5), l4 &&= (l4(), null), !d4 && (o4.length >= r3 || f4 >= n3) && await new w4((e6) => {
                  u4 = e6;
                });
              }
              o4.push(A4);
            } catch (e6) {
              let t5 = T4(e6);
              D4(t5, m5, p4), o4.push(t5);
            } finally {
              d4 = true, l4 &&= (l4(), null);
            }
          }
          g5();
          try {
            for (; ; ) {
              for (; o4.length > 0; ) {
                let e6 = await o4[0];
                if (e6 === A4) return;
                if (i4.aborted) throw new s3();
                e6 !== k4 && (yield e6), o4.shift(), h5();
              }
              await new w4((e6) => {
                l4 = e6;
              });
            }
          } finally {
            d4 = true, u4 &&= (u4(), null);
          }
        }.call(this);
      }
      function N4(e5 = void 0) {
        return e5 != null && u3(e5, `options`), e5?.signal != null && c3(e5.signal, `options.signal`), async function* () {
          let t4 = 0;
          for await (let r3 of this) {
            var n3;
            if (e5 != null && (n3 = e5.signal) != null && n3.aborted) throw new s3({ cause: e5.signal.reason });
            yield [t4++, r3];
          }
        }.call(this);
      }
      async function P4(e5, t4 = void 0) {
        for await (let n3 of L4.call(this, e5, t4)) return true;
        return false;
      }
      async function F4(e5, t4 = void 0) {
        if (typeof e5 != `function`) throw new i3(`fn`, [`Function`, `AsyncFunction`], e5);
        return !await P4.call(this, async (...t5) => !await e5(...t5), t4);
      }
      async function ee3(e5, t4) {
        for await (let n3 of L4.call(this, e5, t4)) return n3;
      }
      async function I4(e5, t4) {
        if (typeof e5 != `function`) throw new i3(`fn`, [`Function`, `AsyncFunction`], e5);
        async function n3(t5, n4) {
          return await e5(t5, n4), k4;
        }
        for await (let e6 of M4.call(this, n3, t4)) ;
      }
      function L4(e5, t4) {
        if (typeof e5 != `function`) throw new i3(`fn`, [`Function`, `AsyncFunction`], e5);
        async function n3(t5, n4) {
          return await e5(t5, n4) ? t5 : k4;
        }
        return M4.call(this, n3, t4);
      }
      var R4 = class extends a3 {
        constructor() {
          super(`reduce`), this.message = `Reduce of an empty stream requires an initial value`;
        }
      };
      async function te3(e5, t4, r3) {
        var a4;
        if (typeof e5 != `function`) throw new i3(`reducer`, [`Function`, `AsyncFunction`], e5);
        r3 != null && u3(r3, `options`), r3?.signal != null && c3(r3.signal, `options.signal`);
        let o4 = arguments.length > 1;
        if (r3 != null && (a4 = r3.signal) != null && a4.aborted) {
          let e6 = new s3(void 0, { cause: r3.signal.reason });
          throw this.once(`error`, () => {
          }), await p3(this.destroy(e6)), e6;
        }
        let l4 = new n2(), m5 = l4.signal;
        if (r3 != null && r3.signal) {
          let e6 = { once: true, [d3]: this, [f3]: true };
          r3.signal.addEventListener(`abort`, () => l4.abort(), e6);
        }
        let h5 = false;
        try {
          for await (let n3 of this) {
            var g5;
            if (h5 = true, r3 != null && (g5 = r3.signal) != null && g5.aborted) throw new s3();
            o4 ? t4 = await e5(t4, n3, { signal: m5 }) : (t4 = n3, o4 = true);
          }
          if (!h5 && !o4) throw new R4();
        } finally {
          l4.abort();
        }
        return t4;
      }
      async function ne3(e5) {
        e5 != null && u3(e5, `options`), e5?.signal != null && c3(e5.signal, `options.signal`);
        let t4 = [];
        for await (let r3 of this) {
          var n3;
          if (e5 != null && (n3 = e5.signal) != null && n3.aborted) throw new s3(void 0, { cause: e5.signal.reason });
          y4(t4, r3);
        }
        return t4;
      }
      function z4(e5, t4) {
        let n3 = M4.call(this, e5, t4);
        return async function* () {
          for await (let e6 of n3) yield* e6;
        }.call(this);
      }
      function B4(e5) {
        if (e5 = S4(e5), C4(e5)) return 0;
        if (e5 < 0) throw new o3(`number`, `>= 0`, e5);
        return e5;
      }
      function V4(e5, t4 = void 0) {
        return t4 != null && u3(t4, `options`), t4?.signal != null && c3(t4.signal, `options.signal`), e5 = B4(e5), async function* () {
          var n3;
          if (t4 != null && (n3 = t4.signal) != null && n3.aborted) throw new s3();
          for await (let n4 of this) {
            var r3;
            if (t4 != null && (r3 = t4.signal) != null && r3.aborted) throw new s3();
            e5-- <= 0 && (yield n4);
          }
        }.call(this);
      }
      function H3(e5, t4 = void 0) {
        return t4 != null && u3(t4, `options`), t4?.signal != null && c3(t4.signal, `options.signal`), e5 = B4(e5), async function* () {
          var n3;
          if (t4 != null && (n3 = t4.signal) != null && n3.aborted) throw new s3();
          for await (let n4 of this) {
            var r3;
            if (t4 != null && (r3 = t4.signal) != null && r3.aborted) throw new s3();
            if (e5-- > 0 && (yield n4), e5 <= 0) return;
          }
        }.call(this);
      }
      t3.exports.streamReturningOperators = { asIndexedPairs: v4(N4, `readable.asIndexedPairs will be removed in a future version.`), drop: V4, filter: L4, flatMap: z4, map: M4, take: H3, compose: j4 }, t3.exports.promiseReturningOperators = { every: F4, forEach: I4, reduce: te3, toArray: ne3, some: P4, find: ee3 };
    }));
    pt = f(((e4, t3) => {
      let { ArrayPrototypePop: n2, Promise: r2 } = Ve(), { isIterable: i3, isNodeStream: a3, isWebStream: o3 } = Ye(), { pipelineImpl: s3 } = ut(), { finished: c3 } = Xe();
      mt();
      function l3(...e5) {
        return new r2((t4, r3) => {
          let c4, l4, u3 = e5[e5.length - 1];
          if (u3 && typeof u3 == `object` && !a3(u3) && !i3(u3) && !o3(u3)) {
            let t5 = n2(e5);
            c4 = t5.signal, l4 = t5.end;
          }
          s3(e5, (e6, n3) => {
            e6 ? r3(e6) : t4(n3);
          }, { signal: c4, end: l4 });
        });
      }
      t3.exports = { finished: c3, pipeline: l3 };
    }));
    mt = f(((e4, t3) => {
      let { Buffer: r2 } = h(`buffer`), { ObjectDefineProperty: i3, ObjectKeys: a3, ReflectApply: o3 } = Ve(), { promisify: { custom: s3 } } = Ke(), { streamReturningOperators: c3, promiseReturningOperators: l3 } = ft(), { codes: { ERR_ILLEGAL_CONSTRUCTOR: u3 } } = Ue(), d3 = dt(), { setDefaultHighWaterMark: f3, getDefaultHighWaterMark: p3 } = tt(), { pipeline: m4 } = ut(), { destroyer: h4 } = Ze(), g4 = Xe(), _4 = pt(), v4 = Ye(), y4 = t3.exports = Qe().Stream;
      y4.isDestroyed = v4.isDestroyed, y4.isDisturbed = v4.isDisturbed, y4.isErrored = v4.isErrored, y4.isReadable = v4.isReadable, y4.isWritable = v4.isWritable, y4.Readable = it();
      for (let e5 of a3(c3)) {
        let n2 = function(...e6) {
          if (new.target) throw u3();
          return y4.Readable.from(o3(t4, this, e6));
        };
        let t4 = c3[e5];
        i3(n2, `name`, { __proto__: null, value: t4.name }), i3(n2, `length`, { __proto__: null, value: t4.length }), i3(y4.Readable.prototype, e5, { __proto__: null, value: n2, enumerable: false, configurable: true, writable: true });
      }
      for (let e5 of a3(l3)) {
        let n2 = function(...e6) {
          if (new.target) throw u3();
          return o3(t4, this, e6);
        };
        let t4 = l3[e5];
        i3(n2, `name`, { __proto__: null, value: t4.name }), i3(n2, `length`, { __proto__: null, value: t4.length }), i3(y4.Readable.prototype, e5, { __proto__: null, value: n2, enumerable: false, configurable: true, writable: true });
      }
      y4.Writable = at(), y4.Duplex = st(), y4.Transform = ct(), y4.PassThrough = lt(), y4.pipeline = m4;
      let { addAbortSignal: b4 } = $e();
      y4.addAbortSignal = b4, y4.finished = g4, y4.destroy = h4, y4.compose = d3, y4.setDefaultHighWaterMark = f3, y4.getDefaultHighWaterMark = p3, i3(y4, `promises`, { __proto__: null, configurable: true, enumerable: true, get() {
        return _4;
      } }), i3(m4, s3, { __proto__: null, enumerable: true, get() {
        return _4.pipeline;
      } }), i3(g4, s3, { __proto__: null, enumerable: true, get() {
        return _4.finished;
      } }), y4.Stream = y4, y4._isUint8Array = function(e5) {
        return e5 instanceof Uint8Array;
      }, y4._uint8ArrayToBuffer = function(e5) {
        return r2.from(e5.buffer, e5.byteOffset, e5.byteLength);
      };
    }));
    ht = f(((e4, t3) => {
      let r2 = h(`stream`);
      if (r2 && process.env.READABLE_STREAM === `disable`) {
        let e5 = r2.promises;
        t3.exports._uint8ArrayToBuffer = r2._uint8ArrayToBuffer, t3.exports._isUint8Array = r2._isUint8Array, t3.exports.isDisturbed = r2.isDisturbed, t3.exports.isErrored = r2.isErrored, t3.exports.isReadable = r2.isReadable, t3.exports.Readable = r2.Readable, t3.exports.Writable = r2.Writable, t3.exports.Duplex = r2.Duplex, t3.exports.Transform = r2.Transform, t3.exports.PassThrough = r2.PassThrough, t3.exports.addAbortSignal = r2.addAbortSignal, t3.exports.finished = r2.finished, t3.exports.destroy = r2.destroy, t3.exports.pipeline = r2.pipeline, t3.exports.compose = r2.compose, Object.defineProperty(r2, `promises`, { configurable: true, enumerable: true, get() {
          return e5;
        } }), t3.exports.Stream = r2.Stream;
      } else {
        let e5 = mt(), n2 = pt(), r3 = e5.Readable.destroy;
        t3.exports = e5.Readable, t3.exports._uint8ArrayToBuffer = e5._uint8ArrayToBuffer, t3.exports._isUint8Array = e5._isUint8Array, t3.exports.isDisturbed = e5.isDisturbed, t3.exports.isErrored = e5.isErrored, t3.exports.isReadable = e5.isReadable, t3.exports.Readable = e5.Readable, t3.exports.Writable = e5.Writable, t3.exports.Duplex = e5.Duplex, t3.exports.Transform = e5.Transform, t3.exports.PassThrough = e5.PassThrough, t3.exports.addAbortSignal = e5.addAbortSignal, t3.exports.finished = e5.finished, t3.exports.destroy = e5.destroy, t3.exports.destroy = r3, t3.exports.pipeline = e5.pipeline, t3.exports.compose = e5.compose, Object.defineProperty(e5, `promises`, { configurable: true, enumerable: true, get() {
          return n2;
        } }), t3.exports.Stream = e5.Stream;
      }
      t3.exports.default = t3.exports;
    }));
    gt = m(Pe(), 1);
    _t = m(Be(), 1);
    Tt = { request: wt };
    zt = c2(o2);
    Bt = Tt;
    Kt = { async fetchRefs(e4) {
      try {
        return e4.transport === `ssh` ? await Vt(e4) : await Ht(e4);
      } catch (t3) {
        Gt(e4, t3, e4.transport, `fetch`);
      }
    }, async clone(e4, t3, n2, r2 = e4.transport) {
      try {
        r2 === `ssh` ? await Ut(e4, t3, n2, r2) : await Wt(e4, t3, n2, r2);
      } catch (t4) {
        Gt(e4, t4, r2, `clone`);
      }
    } };
  }
});

// ../../node_modules/degit/dist/src-6fVYqAkF.js
init_utils_DTdqQ6KU();
import m3 from "node:fs";
import h3 from "node:tty";
import g3 from "assert";
import _3, { EventEmitter as ee2 } from "events";
import v3 from "fs";
import y3, { dirname as te2, parse as ne2 } from "path";
import b3, { basename as re2, join as ie2, posix as ae2, win32 as oe2 } from "node:path";
import { EventEmitter as se2 } from "node:events";
import ce2, { access as le2, constants as ue2, cp as de2, mkdir as fe2, mkdtemp as pe2, readFile as me2, readdir as he2, rm as ge2, writeFile as _e2 } from "node:fs/promises";
import ve2 from "node:stream";
import { StringDecoder as ye2 } from "node:string_decoder";
import { Buffer as be2 } from "buffer";
import * as xe2 from "zlib";
import Se2 from "zlib";
import Ce2 from "node:assert";
import { randomBytes as we2 } from "node:crypto";
var Te2 = h3?.WriteStream?.prototype?.hasColors?.() ?? false;
var x3 = (e4, t3) => {
  if (!Te2) return (e5) => e5;
  let n2 = `\x1B[${e4}m`, r2 = `\x1B[${t3}m`;
  return (e5) => {
    let i3 = e5 + ``, a3 = i3.indexOf(r2);
    if (a3 === -1) return n2 + i3 + r2;
    let o3 = n2, s3 = 0, c3 = (t3 === 22 ? r2 : ``) + n2;
    for (; a3 !== -1; ) o3 += i3.slice(s3, a3) + c3, s3 = a3 + r2.length, a3 = i3.indexOf(r2, s3);
    return o3 += i3.slice(s3) + r2, o3;
  };
};
x3(0, 0);
var S3 = x3(1, 22);
x3(2, 22), x3(3, 23);
var Ee2 = x3(4, 24);
x3(53, 55), x3(7, 27), x3(8, 28), x3(9, 29), x3(30, 39);
var De2 = x3(31, 39);
var Oe2 = x3(32, 39);
x3(33, 39), x3(34, 39);
var ke2 = x3(35, 39);
var Ae2 = x3(36, 39);
x3(37, 39), x3(90, 39), x3(40, 49), x3(41, 49), x3(42, 49), x3(43, 49), x3(44, 49), x3(45, 49), x3(46, 49), x3(47, 49), x3(100, 49), x3(91, 39), x3(92, 39), x3(93, 39), x3(94, 39), x3(95, 39), x3(96, 39), x3(97, 39), x3(101, 49), x3(102, 49), x3(103, 49), x3(104, 49), x3(105, 49), x3(106, 49), x3(107, 49);
var je2 = f(((e4, t3) => {
  let n2 = process.platform === `win32`, r2 = n2 ? `\\\\+` : `\\/`, i3 = n2 ? `\\\\` : `/`, a3 = `((?:[^${i3}]*(?:${i3}|$))*)`, o3 = `([^${i3}]*)`;
  function s3(e5, { extended: t4 = false, globstar: n3 = false, strict: i4 = false, filepath: s4 = false, flags: c3 = `` } = {}) {
    let l3 = ``, u3 = ``, d3 = { regex: ``, segments: [] }, f3 = false, p3 = false, m4 = [];
    function h4(e6, { split: t5, last: n4, only: i5 } = {}) {
      i5 !== `path` && (l3 += e6), s4 && i5 !== `regex` && (d3.regex += e6 === `\\/` ? r2 : e6, t5 ? (n4 && (u3 += e6), u3 !== `` && (c3.includes(`g`) || (u3 = `^${u3}$`), d3.segments.push(new RegExp(u3, c3))), u3 = ``) : u3 += e6);
    }
    let g4, _4;
    for (let r3 = 0; r3 < e5.length; r3++) {
      if (g4 = e5[r3], _4 = e5[r3 + 1], [`\\`, `$`, `^`, `.`, `=`].includes(g4)) {
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `/`) {
        h4(`\\${g4}`, { split: true }), _4 === `/` && !i4 && (l3 += `?`);
        continue;
      }
      if (g4 === `(`) {
        if (m4.length) {
          h4(g4);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `)`) {
        if (m4.length) {
          h4(g4);
          let e6 = m4.pop();
          h4(e6 === `@` ? `{1}` : e6 === `!` ? `([^/]*)` : e6);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `|`) {
        if (m4.length) {
          h4(g4);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `+`) {
        if (_4 === `(` && t4) {
          m4.push(g4);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `@` && t4 && _4 === `(`) {
        m4.push(g4);
        continue;
      }
      if (g4 === `!`) {
        if (t4) {
          if (p3) {
            h4(`^`);
            continue;
          }
          if (_4 === `(`) {
            m4.push(g4), h4(`(?!`), r3++;
            continue;
          }
          h4(`\\${g4}`);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `?`) {
        if (t4) {
          _4 === `(` ? m4.push(g4) : h4(`.`);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `[`) {
        if (p3 && _4 === `:`) {
          r3++;
          let t5 = ``;
          for (; e5[++r3] !== `:`; ) t5 += e5[r3];
          t5 === `alnum` ? h4(`(\\w|\\d)`) : t5 === `space` ? h4(`\\s`) : t5 === `digit` && h4(`\\d`), r3++;
          continue;
        }
        if (t4) {
          p3 = true, h4(g4);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `]`) {
        if (t4) {
          p3 = false, h4(g4);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `{`) {
        if (t4) {
          f3 = true, h4(`(`);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `}`) {
        if (t4) {
          f3 = false, h4(`)`);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `,`) {
        if (f3) {
          h4(`|`);
          continue;
        }
        h4(`\\${g4}`);
        continue;
      }
      if (g4 === `*`) {
        if (_4 === `(` && t4) {
          m4.push(g4);
          continue;
        }
        let i5 = e5[r3 - 1], s5 = 1;
        for (; e5[r3 + 1] === `*`; ) s5++, r3++;
        let c4 = e5[r3 + 1];
        n3 ? s5 > 1 && (i5 === `/` || i5 === void 0) && (c4 === `/` || c4 === void 0) ? (h4(`((?:[^/]*(?:/|$))*)`, { only: `regex` }), h4(a3, { only: `path`, last: true, split: true }), r3++) : (h4(`([^/]*)`, { only: `regex` }), h4(o3, { only: `path` })) : h4(`.*`);
        continue;
      }
      h4(g4);
    }
    c3.includes(`g`) || (l3 = `^${l3}$`, u3 = `^${u3}$`, s4 && (d3.regex = `^${d3.regex}$`));
    let ee3 = { regex: new RegExp(l3, c3) };
    return s4 && (d3.segments.push(new RegExp(u3, c3)), d3.regex = new RegExp(d3.regex, c3), d3.globstar = new RegExp(c3.includes(`g`) ? a3 : `^${a3}$`, c3), ee3.path = d3), ee3;
  }
  t3.exports = s3;
}));
var Me2 = f(((e4, t3) => {
  let n2 = h(`os`), r2 = h(`path`), i3 = n2.platform() === `win32`, a3 = { "{": `}`, "(": `)`, "[": `]` }, o3 = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\)|(\\).|([@?!+*]\(.*\)))/, s3 = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;
  function c3(e5, { strict: t4 = true } = {}) {
    if (e5 === ``) return false;
    let n3, r3 = t4 ? o3 : s3;
    for (; n3 = r3.exec(e5); ) {
      if (n3[2]) return true;
      let t5 = n3.index + n3[0].length, r4 = n3[1], i4 = r4 ? a3[r4] : null;
      if (r4 && i4) {
        let n4 = e5.indexOf(i4, t5);
        n4 !== -1 && (t5 = n4 + 1);
      }
      e5 = e5.slice(t5);
    }
    return false;
  }
  function u3(e5, { strict: t4 = false } = {}) {
    i3 && e5.includes(`/`) && (e5 = e5.split(`\\`).join(`/`)), /[\{\[].*[\/]*.*[\}\]]$/.test(e5) && (e5 += `/`), e5 += `a`;
    do
      e5 = r2.dirname(e5);
    while (c3(e5, { strict: t4 }) || /(^|[^\\])([\{\[]|\([^\)]+$)/.test(e5));
    return e5.replace(/\\([\*\?\|\[\]\(\)\{\}])/g, `$1`);
  }
  function d3(e5, t4 = {}) {
    let n3 = u3(e5, t4), i4 = c3(e5, t4), a4;
    return n3 == `.` ? a4 = e5 : (a4 = e5.substr(n3.length), a4.startsWith(`/`) && (a4 = a4.substr(1))), i4 || (n3 = r2.dirname(e5), a4 = n3 === `.` ? e5 : e5.substr(n3.length)), a4.startsWith(`./`) && (a4 = a4.substr(2)), a4.startsWith(`/`) && (a4 = a4.substr(1)), { base: n3, glob: a4, isGlob: i4 };
  }
  t3.exports = d3;
}));
var Ne2 = f(((e4, t3) => {
  let n2 = h(`fs`), r2 = je2(), i3 = Me2(), { join: a3, resolve: o3, relative: s3 } = h(`path`), c3 = /(^|[\\\/])\.[^\\\/\.]/g, u3 = {};
  function d3(e5, t4, r3, i4, l3 = ``, f3 = 0) {
    let p3 = r3.segments[f3], m4 = o3(i4.cwd, t4, l3), h4 = n2.readdirSync(m4), { dot: g4, filesOnly: _4 } = i4, ee3 = 0, v4 = h4.length, y4, te3, ne3, b4, re3;
    for (; ee3 < v4; ee3++) if (te3 = a3(m4, y4 = h4[ee3]), ne3 = l3 ? a3(l3, y4) : y4, !(!g4 && c3.test(ne3))) {
      if (re3 = r3.regex.test(ne3), (b4 = u3[ne3]) === void 0 && (u3[ne3] = b4 = n2.lstatSync(te3)), !b4.isDirectory()) {
        re3 && e5.push(s3(i4.cwd, te3));
        continue;
      }
      p3 && !p3.test(y4) || (!_4 && re3 && e5.push(a3(t4, ne3)), d3(e5, t4, r3, i4, ne3, p3 && p3.toString() !== r3.globstar && f3 + 1));
    }
  }
  t3.exports = function(e5, t4 = {}) {
    if (!e5) return [];
    let a4 = i3(e5);
    if (t4.cwd = t4.cwd || `.`, !a4.isGlob) try {
      let r3 = o3(t4.cwd, e5), i4 = n2.statSync(r3);
      return t4.filesOnly && !i4.isFile() ? [] : t4.absolute ? [r3] : [e5];
    } catch (e6) {
      if (e6.code != `ENOENT`) throw e6;
      return [];
    }
    t4.flush && (u3 = {});
    let s4 = [], { path: c4 } = r2(a4.glob, { filepath: true, globstar: true, extended: true });
    return c4.globstar = c4.globstar.toString(), d3(s4, a4.base, c4, t4, `.`, 0), t4.absolute ? s4.map((e6) => o3(t4.cwd, e6)) : s4;
  };
}));
var Pe2 = /* @__PURE__ */ new Map([[`github`, `github.com`], [`gitlab`, `gitlab.com`], [`bitbucket`, `bitbucket.org`], [`git.sr.ht`, `git.sr.ht`], [`gist`, `gist.github.com`]]);
var Fe2 = { github: (e4, t3) => `${e4.url}/archive/${t3}.tar.gz`, gitlab: (e4, t3) => `${e4.url}/-/archive/${t3}/${e4.name}-${t3}.tar.gz`, bitbucket: (e4, t3) => `${e4.url}/get/${t3}.tar.gz`, "git.sr.ht": (e4, t3) => `${e4.url}/archive/${t3}.tar.gz`, gist: (e4, t3) => `https://codeload.github.com/gist/${e4.name}/tar.gz/${t3}` };
function Ie2(e4) {
  return Object.hasOwn(Fe2, e4);
}
function Le2(e4, t3) {
  let n2 = e4.slice(9), r2 = n2.indexOf(`/`);
  if (r2 === -1) throw new k(`could not parse ${t3}`, { code: `BAD_SRC` });
  return { customDomain: n2.slice(0, r2), remainder: n2.slice(r2 + 1), site: `gitlab`, transport: `https`, isWebUrl: true };
}
function Re2(e4, t3) {
  let n2 = `github`, r2 = `https`, i3 = false, a3 = e4;
  if (e4.startsWith(`https://`) || e4.startsWith(`http://`)) {
    let t4 = new URL(e4);
    n2 = t4.hostname.replace(/\.(com|org)$/u, ``), a3 = t4.pathname.replace(/^\//u, ``), i3 = true;
  } else if (e4.startsWith(`ssh://`)) {
    let t4 = new URL(e4);
    n2 = t4.hostname.replace(/\.(com|org)$/u, ``), a3 = t4.pathname.replace(/^\//u, ``), r2 = `ssh`, i3 = true;
  } else if (e4.startsWith(`git@`)) {
    let i4 = /^git@([^:/]+)[:/](.+)$/u.exec(e4);
    if (!i4) throw new k(`could not parse ${t3}`, { code: `BAD_SRC` });
    n2 = i4[1].replace(/\.(com|org)$/u, ``), a3 = i4[2], r2 = `ssh`;
  } else if (e4.startsWith(`git.sr.ht/`)) n2 = `git.sr.ht`, a3 = e4.slice(10);
  else if (e4.startsWith(`gitlab://`)) return Le2(e4, t3);
  else {
    let t4 = e4.indexOf(`:`), r3 = e4.indexOf(`/`);
    t4 !== -1 && (r3 === -1 || t4 < r3) && (n2 = e4.slice(0, t4), a3 = e4.slice(t4 + 1));
  }
  return n2 === `gist.github` && (n2 = `gist`), { remainder: a3, site: n2, transport: r2, isWebUrl: i3 };
}
function ze2(e4, t3) {
  switch (e4) {
    case `github`: {
      let e5 = t3.findIndex((e6, n2) => (e6 === `tree` || e6 === `blob`) && n2 + 1 < t3.length);
      return e5 === -1 ? void 0 : { ref: t3[e5 + 1], subdir: t3.slice(e5 + 2) };
    }
    case `gitlab`: {
      let e5 = t3.findIndex((e6, n2) => e6 === `-` && (t3[n2 + 1] === `tree` || t3[n2 + 1] === `blob`) && n2 + 2 < t3.length);
      return e5 === -1 ? void 0 : { ref: t3[e5 + 2], subdir: t3.slice(e5 + 3) };
    }
    case `bitbucket`: {
      let e5 = t3.findIndex((e6, n2) => e6 === `src` && n2 + 1 < t3.length);
      return e5 === -1 ? void 0 : { ref: t3[e5 + 1], subdir: t3.slice(e5 + 2) };
    }
    case `git.sr.ht`: {
      let e5 = t3.findIndex((e6, n2) => e6 === `tree` && n2 + 1 < t3.length);
      return e5 === -1 ? void 0 : { ref: t3[e5 + 1], subdir: t3.slice(e5 + 2) };
    }
    case `gist`:
      return;
  }
}
function Be2(e4, t3, n2, r2) {
  if (t3.length > 2) throw new k(`could not parse ${e4}`, { code: `BAD_SRC` });
  let i3 = t3.length === 1 ? t3[0] : t3[1];
  if (!i3) throw new k(`could not parse ${e4}`, { code: `BAD_SRC` });
  let a3 = i3.replace(/\.git$/u, ``), o3 = t3.length === 1 ? `gist` : t3[0], s3 = `https://gist.github.com/${a3}.git`;
  return { mode: `tar`, name: a3, ref: n2, site: `gist`, ssh: `ssh://git@gist.github.com/${a3}.git`, transport: r2, url: s3, user: o3 };
}
function Ve2(e4) {
  let t3 = decodeURIComponent(e4), [n2, r2 = `HEAD`] = t3.split(`#`, 2), { remainder: i3, site: a3, transport: o3, customDomain: s3, isWebUrl: c3 } = Re2(n2, t3);
  if (!Ie2(a3)) throw new k(`degit supports GitHub, GitLab, Sourcehut, BitBucket and Gist`, { code: `UNSUPPORTED_HOST` });
  let l3 = i3.split(`/`).filter(Boolean);
  if (a3 === `gist`) return Be2(e4, l3, r2, o3);
  let [u3, d3, ...p3] = l3;
  if (!u3 || !d3) throw new k(`could not parse ${e4}`, { code: `BAD_SRC` });
  let m4 = d3.replace(/\.git$/u, ``), h4 = r2, g4 = p3;
  if (c3) {
    let e5 = ze2(a3, p3);
    e5 && (r2 === `HEAD` && (h4 = e5.ref), g4 = e5.subdir);
  }
  let _4 = g4.length > 0 ? `/${g4.join(`/`)}` : void 0, ee3 = s3 ?? Pe2.get(a3), v4 = `https://${ee3}/${u3}/${m4}`, y4 = `ssh://git@${ee3}/${u3}/${m4}`;
  return { mode: `tar`, name: m4, ref: h4, site: a3, ssh: y4, subdir: _4, transport: o3, url: v4, user: u3 };
}
function He2(e4, t3) {
  if (t3.site !== `gitlab`) return [t3];
  let [n2] = e4.split(`#`, 2), { remainder: r2, isWebUrl: i3 } = Re2(n2.replace(/\.git$/u, ``), e4), a3 = new URL(t3.url).hostname, o3 = r2, s3 = false;
  if (i3) {
    let e5 = r2.split(`/`).filter(Boolean), t4 = e5.findIndex((t5, n3) => t5 === `-` && (e5[n3 + 1] === `tree` || e5[n3 + 1] === `blob`));
    t4 === -1 ? o3 = r2 : (o3 = e5.slice(0, t4).join(`/`), s3 = true);
  }
  let c3 = o3.split(`/`).filter(Boolean), l3 = [];
  for (let e5 = 2; e5 <= c3.length; e5 += 1) {
    let n3 = c3.slice(0, e5 - 1).join(`/`), r3 = c3[e5 - 1], i4 = c3.slice(e5).join(`/`), o4 = s3 ? t3.subdir : i4 ? `/${i4}` : void 0;
    l3.push({ ...t3, user: n3, name: r3, subdir: o4, url: `https://${a3}/${n3}/${r3}`, ssh: `ssh://git@${a3}/${n3}/${r3}` });
  }
  return l3;
}
var Ue2 = b3.join(V, `aliases.json`);
function Ke2(e4, t3) {
  return Object.hasOwn(e4, t3) ? e4[t3] : void 0;
}
var Qe2 = m(Ne2(), 1);
function $e2(e4) {
  let t3 = b3.resolve(e4, O);
  try {
    if (!m3.lstatSync(t3).isFile()) return false;
    let e5 = M(t3);
    return Array.isArray(e5) ? (m3.unlinkSync(t3), e5) : false;
  } catch {
    return false;
  }
}
function et2(e4, t3, n2, r2) {
  try {
    if (m3.readdirSync(e4).length > 0) {
      if (t3) {
        n2({ code: `DEST_NOT_EMPTY`, message: `destination directory is not empty. Using options.force, continuing` });
        return;
      }
      throw new k(`destination directory is not empty, aborting. Use options.force to override`, { code: `DEST_NOT_EMPTY` });
    }
    r2({ code: `DEST_IS_EMPTY`, message: `destination directory is empty` });
  } catch (e5) {
    if (e5.code !== `ENOENT`) throw e5;
  }
}
function tt2(e4) {
  return /[*?{}[\]]/u.test(e4);
}
function nt2(e4, n2, r2, i3) {
  let a3 = Array.isArray(n2.files) ? n2.files : [n2.files], o3 = b3.resolve(e4), s3 = a3.flatMap((e5) => {
    if (tt2(e5) && !n2.allowGlobs) return i3({ code: `GLOB_NOT_ALLOWED`, message: `remove action uses glob pattern ${S3(e5)} but ${S3(`allowGlobs`)} is not set, skipping` }), [];
    if (!A(o3, e5)) return it2(o3, e5, i3);
    let r3 = (0, Qe2.default)(e5, { cwd: o3, dot: true, flush: true }), a4 = r3.length > 0 ? r3 : [e5];
    return a4.sort((e6, t3) => b3.normalize(t3).split(b3.sep).length - b3.normalize(e6).split(b3.sep).length), a4.flatMap((e6) => it2(o3, e6, i3));
  });
  s3.length > 0 && r2({ code: `REMOVED`, message: `removed: ${S3(s3.map((e5) => S3(e5)).join(`, `))}` });
}
function rt2(e4, n2, r2) {
  if (r2) try {
    let t3 = m3.realpathSync(b3.dirname(n2)), r3 = b3.relative(e4, t3);
    return r3.startsWith(`..`) || b3.isAbsolute(r3) ? { ok: false, missing: false } : { ok: true };
  } catch {
    return { ok: false, missing: true };
  }
  try {
    return A(e4, m3.realpathSync(n2)) ? { ok: true } : { ok: false, missing: false };
  } catch {
    return { ok: false, missing: true };
  }
}
function it2(e4, n2, r2) {
  let i3 = A(e4, n2);
  if (!i3) return r2({ code: `FILE_OUTSIDE_DEST`, message: `action wants to remove ${S3(n2)} but it is outside the destination, skipping` }), [];
  let a3;
  try {
    a3 = m3.lstatSync(i3);
  } catch {
    return r2({ code: `FILE_DOES_NOT_EXIST`, message: `action wants to remove ${S3(n2)} but it does not exist` }), [];
  }
  let o3 = rt2(e4, i3, a3.isSymbolicLink());
  if (o3.ok === false) return r2({ code: o3.missing ? `FILE_DOES_NOT_EXIST` : `FILE_OUTSIDE_DEST`, message: `action wants to remove ${S3(n2)} but ${o3.missing ? `it does not exist` : `it resolves outside the destination, skipping`}` }), [];
  let s3 = a3.isDirectory();
  return m3.rmSync(i3, { force: true, recursive: true }), s3 ? [`${n2}/`] : [n2];
}
function at2(e4, n2, r2) {
  if (!n2 || n2.length === 0) return;
  let a3 = b3.resolve(e4), o3 = /* @__PURE__ */ new Set(), s3 = /* @__PURE__ */ new Set();
  for (let e5 of n2) {
    let n3 = A(a3, e5);
    if (!n3) {
      r2({ code: `FILE_OUTSIDE_DEST`, message: `action wants to keep ${S3(e5)} but it is outside the destination, skipping` });
      continue;
    }
    if (!m3.existsSync(n3)) {
      r2({ code: `FILE_DOES_NOT_EXIST`, message: `action wants to keep ${S3(e5)} but it does not exist` });
      continue;
    }
    let i3 = m3.lstatSync(n3);
    !i3.isSymbolicLink() && i3.isDirectory() ? s3.add(n3) : o3.add(n3);
  }
  if (o3.size === 0 && s3.size === 0) {
    r2({ code: `NO_FILES_MATCHED`, message: `no requested files were found, keeping the entire destination` });
    return;
  }
  let c3 = b3.resolve(a3, O);
  try {
    m3.lstatSync(c3).isFile() && o3.add(c3);
  } catch {
  }
  let l3 = [...s3].map((e5) => ({ dir: e5, prefix: b3.join(e5, b3.sep) }));
  function u3(e5) {
    if (o3.has(e5)) return true;
    for (let { dir: t3, prefix: n3 } of l3) if (e5 === t3 || e5.startsWith(n3)) return true;
    return false;
  }
  d3(a3);
  function d3(e5) {
    for (let t3 of m3.readdirSync(e5, { withFileTypes: true })) {
      let n3 = b3.join(e5, t3.name);
      t3.isDirectory() && !t3.isSymbolicLink() ? (d3(n3), m3.readdirSync(n3).length === 0 && !u3(n3) && m3.rmdirSync(n3)) : u3(n3) || m3.unlinkSync(n3);
    }
  }
}
function ot2(e4, t3, n2) {
  let r2 = n2.split(`/`).filter(Boolean).join(`/`), i3 = b3.join(e4, r2);
  if (!m3.existsSync(i3)) throw new k(`could not find subdirectory ${n2} in cloned repository`, { code: `MISSING_SUBDIR`, subdir: n2 });
  m3.mkdirSync(t3, { recursive: true });
  for (let e5 of m3.readdirSync(i3, { withFileTypes: true })) {
    let n3 = b3.join(i3, e5.name), r3 = b3.join(t3, e5.name);
    m3.cpSync(n3, r3, { recursive: true });
  }
}
function st2(e4, t3, n2, r2) {
  let i3 = Array.isArray(t3.files) ? t3.files : [t3.files], a3 = b3.resolve(e4), o3 = process.env[t3.replacement];
  if (o3 === void 0) {
    r2({ message: `action wants to search_replace using env var ${S3(t3.replacement)} but it is not defined, skipping` });
    return;
  }
  let s3;
  try {
    s3 = new RegExp(t3.pattern, `gu`);
  } catch {
    r2({ message: `action wants to search_replace using an invalid pattern ${S3(t3.pattern)}, skipping` });
    return;
  }
  let c3 = i3.flatMap((e5) => ct2(a3, e5, s3, o3, r2));
  c3.length > 0 && n2({ message: `replaced content in ${S3(String(c3.length))} files: ${c3.map((e5) => S3(e5)).join(`, `)}` });
}
function ct2(e4, n2, r2, i3, a3) {
  let o3 = A(e4, n2);
  if (!o3) return a3({ message: `action wants to search_replace ${S3(n2)} but it is outside the destination, skipping` }), [];
  try {
    let s3 = m3.realpathSync(o3);
    if (!A(e4, s3)) return a3({ message: `action wants to search_replace ${S3(n2)} but it is outside the destination, skipping` }), [];
    if (m3.statSync(s3).isDirectory()) return a3({ message: `action wants to search_replace ${S3(n2)} but it is a directory, skipping` }), [];
    let c3 = m3.readFileSync(s3, `utf8`), l3 = c3.replace(r2, () => i3);
    return l3 === c3 ? [] : (m3.writeFileSync(s3, l3), [n2]);
  } catch (e5) {
    if (e5?.code === `ENOENT`) return a3({ message: `action wants to search_replace ${S3(n2)} but it does not exist` }), [];
    throw e5;
  }
}
async function lt2(e4, t3, r2, i3, a3) {
  if (typeof r2.src != `string` || r2.src === ``) throw new k(`clone directive requires a non-empty source`, { code: `BAD_SRC` });
  let o3 = j(t3, true), s3;
  if (o3 && (m3.readdirSync(t3).length > 0 || e4.hasStashed) && (s3 = await e4.getStagingDir(), e4.hasStashed === false)) {
    let n2 = F(s3, t3);
    e4.hasStashed = true, I(n2);
  }
  r2.cache !== void 0 && typeof r2.cache != `boolean` && e4.warn({ message: `clone action cache must be a boolean, ignoring` }), r2.verbose !== void 0 && typeof r2.verbose != `boolean` && e4.warn({ message: `clone action verbose must be a boolean, ignoring` });
  let c3 = a3(r2.src, { aliases: e4.aliases, cache: typeof r2.cache == `boolean` ? r2.cache : e4.cache, fetch: e4.fetch, files: i3, force: true, git: await e4.getGitClient(), verbose: typeof r2.verbose == `boolean` ? r2.verbose : e4.verbose });
  c3.on(`info`, e4.info), c3.on(`warn`, e4.warn);
  try {
    await c3.clone(t3);
  } catch (e5) {
    throw o3 || m3.rmSync(t3, { force: true, recursive: true }), e5;
  }
  if (e4.hasStashed && s3) {
    let n2 = ft2(s3, t3);
    if (n2.ok === true) e4.hasStashed = false;
    else throw new k(`could not restore stashed files: ${n2.message}`, { code: `COULD_NOT_RESTORE`, original: n2.original });
  }
}
function ut2(e4) {
  if (typeof e4 == `string` && e4 !== ``) return [e4];
  if (Array.isArray(e4) && e4.length > 0 && e4.every((e5) => typeof e5 == `string` && e5 !== ``)) return e4;
}
async function dt2(e4, t3, r2, i3) {
  let a3 = typeof t3 == `object` && t3 ? t3.action : void 0;
  if (typeof a3 != `string`) {
    e4.warn({ message: `unknown directive action ${S3(String(a3))}, skipping` });
    return;
  }
  if (t3.action === `clone`) {
    let n2 = ut2(t3.files);
    if (t3.files !== void 0 && n2 === void 0) {
      e4.warn({ message: `clone action requires a string or array of strings for files, skipping` });
      return;
    }
    await lt2(e4, r2, t3, n2, i3);
    return;
  }
  if (t3.action === `search_replace`) {
    j(r2, false);
    let i4 = ut2(t3.files);
    if (i4 === void 0) {
      e4.warn({ message: `search_replace action requires a string or array of strings for files, skipping` });
      return;
    }
    if (typeof t3.pattern != `string` || t3.pattern === ``) {
      e4.warn({ message: `search_replace action requires a non-empty pattern, skipping` });
      return;
    }
    if (typeof t3.replacement != `string` || t3.replacement === ``) {
      e4.warn({ message: `search_replace action requires a non-empty replacement environment variable name, skipping` });
      return;
    }
    st2(r2, { ...t3, files: i4 }, e4.info, e4.warn);
    return;
  }
  if (t3.action === `remove`) {
    j(r2, false);
    let i4 = ut2(t3.files);
    if (i4 === void 0) {
      e4.warn({ message: `remove action requires a string or array of strings for files, skipping` });
      return;
    }
    t3.allowGlobs !== void 0 && typeof t3.allowGlobs != `boolean` && e4.warn({ message: `remove action allowGlobs must be a boolean, ignoring` }), nt2(r2, { ...t3, files: i4, allowGlobs: typeof t3.allowGlobs == `boolean` ? t3.allowGlobs : void 0 }, e4.info, e4.warn);
    return;
  }
  e4.warn({ message: `unknown directive action ${S3(a3)}, skipping` });
}
function ft2(e4, t3, n2 = true) {
  if (!e4) return { ok: true };
  try {
    return L(e4, t3, n2), { ok: true };
  } catch (e5) {
    return { ok: false, message: e5 instanceof Error ? e5.message : String(e5), original: e5 };
  }
}
async function pt2(e4, t3, n2, r2) {
  try {
    for (let i3 of t3) await dt2(e4, i3, n2, r2);
  } catch (t4) {
    if (e4.hasStashed && !(t4 instanceof k && t4.code === `COULD_NOT_RESTORE`)) {
      let t5 = ft2(e4.stagingDir, n2, false);
      t5.ok === true ? e4.hasStashed = false : e4.warn({ message: `could not restore stashed files: ${t5.message}`, original: t5.original });
    }
    throw t4;
  }
}
var mt2 = Object.defineProperty;
var ht2 = (e4, t3) => {
  for (var n2 in t3) mt2(e4, n2, { get: t3[n2], enumerable: true });
};
var gt2 = typeof process == `object` && process ? process : { stdout: null, stderr: null };
var _t2 = (e4) => !!e4 && typeof e4 == `object` && (e4 instanceof Yt || e4 instanceof ve2 || vt2(e4) || yt2(e4));
var vt2 = (e4) => !!e4 && typeof e4 == `object` && e4 instanceof se2 && typeof e4.pipe == `function` && e4.pipe !== ve2.Writable.prototype.pipe;
var yt2 = (e4) => !!e4 && typeof e4 == `object` && e4 instanceof se2 && typeof e4.write == `function` && typeof e4.end == `function`;
var C3 = /* @__PURE__ */ Symbol(`EOF`);
var w3 = /* @__PURE__ */ Symbol(`maybeEmitEnd`);
var bt2 = /* @__PURE__ */ Symbol(`emittedEnd`);
var xt2 = /* @__PURE__ */ Symbol(`emittingEnd`);
var St2 = /* @__PURE__ */ Symbol(`emittedError`);
var Ct2 = /* @__PURE__ */ Symbol(`closed`);
var wt2 = /* @__PURE__ */ Symbol(`read`);
var Tt2 = /* @__PURE__ */ Symbol(`flush`);
var Et2 = /* @__PURE__ */ Symbol(`flushChunk`);
var T3 = /* @__PURE__ */ Symbol(`encoding`);
var Dt2 = /* @__PURE__ */ Symbol(`decoder`);
var E3 = /* @__PURE__ */ Symbol(`flowing`);
var Ot2 = /* @__PURE__ */ Symbol(`paused`);
var kt2 = /* @__PURE__ */ Symbol(`resume`);
var D3 = /* @__PURE__ */ Symbol(`buffer`);
var O3 = /* @__PURE__ */ Symbol(`pipes`);
var k3 = /* @__PURE__ */ Symbol(`bufferLength`);
var At2 = /* @__PURE__ */ Symbol(`bufferPush`);
var jt2 = /* @__PURE__ */ Symbol(`bufferShift`);
var A3 = /* @__PURE__ */ Symbol(`objectMode`);
var j3 = /* @__PURE__ */ Symbol(`destroyed`);
var Mt2 = /* @__PURE__ */ Symbol(`error`);
var Nt2 = /* @__PURE__ */ Symbol(`emitData`);
var Pt2 = /* @__PURE__ */ Symbol(`emitEnd`);
var Ft2 = /* @__PURE__ */ Symbol(`emitEnd2`);
var M3 = /* @__PURE__ */ Symbol(`async`);
var It2 = /* @__PURE__ */ Symbol(`abort`);
var Lt2 = /* @__PURE__ */ Symbol(`aborted`);
var Rt2 = /* @__PURE__ */ Symbol(`signal`);
var zt2 = /* @__PURE__ */ Symbol(`dataListeners`);
var N3 = /* @__PURE__ */ Symbol(`discarded`);
var Bt2 = (e4) => Promise.resolve().then(e4);
var Vt2 = (e4) => e4();
var Ht2 = (e4) => e4 === `end` || e4 === `finish` || e4 === `prefinish`;
var Ut2 = (e4) => e4 instanceof ArrayBuffer || !!e4 && typeof e4 == `object` && e4.constructor && e4.constructor.name === `ArrayBuffer` && e4.byteLength >= 0;
var Wt2 = (e4) => !Buffer.isBuffer(e4) && ArrayBuffer.isView(e4);
var Gt2 = class {
  src;
  dest;
  opts;
  ondrain;
  constructor(e4, t3, n2) {
    this.src = e4, this.dest = t3, this.opts = n2, this.ondrain = () => e4[kt2](), this.dest.on(`drain`, this.ondrain);
  }
  unpipe() {
    this.dest.removeListener(`drain`, this.ondrain);
  }
  proxyErrors(e4) {
  }
  end() {
    this.unpipe(), this.opts.end && this.dest.end();
  }
};
var Kt2 = class extends Gt2 {
  unpipe() {
    this.src.removeListener(`error`, this.proxyErrors), super.unpipe();
  }
  constructor(e4, t3, n2) {
    super(e4, t3, n2), this.proxyErrors = (e5) => this.dest.emit(`error`, e5), e4.on(`error`, this.proxyErrors);
  }
};
var qt = (e4) => !!e4.objectMode;
var Jt = (e4) => !e4.objectMode && !!e4.encoding && e4.encoding !== `buffer`;
var Yt = class extends se2 {
  [E3] = false;
  [Ot2] = false;
  [O3] = [];
  [D3] = [];
  [A3];
  [T3];
  [M3];
  [Dt2];
  [C3] = false;
  [bt2] = false;
  [xt2] = false;
  [Ct2] = false;
  [St2] = null;
  [k3] = 0;
  [j3] = false;
  [Rt2];
  [Lt2] = false;
  [zt2] = 0;
  [N3] = false;
  writable = true;
  readable = true;
  constructor(...e4) {
    let t3 = e4[0] || {};
    if (super(), t3.objectMode && typeof t3.encoding == `string`) throw TypeError(`Encoding and objectMode may not be used together`);
    qt(t3) ? (this[A3] = true, this[T3] = null) : Jt(t3) ? (this[T3] = t3.encoding, this[A3] = false) : (this[A3] = false, this[T3] = null), this[M3] = !!t3.async, this[Dt2] = this[T3] ? new ye2(this[T3]) : null, t3 && t3.debugExposeBuffer === true && Object.defineProperty(this, `buffer`, { get: () => this[D3] }), t3 && t3.debugExposePipes === true && Object.defineProperty(this, `pipes`, { get: () => this[O3] });
    let { signal: n2 } = t3;
    n2 && (this[Rt2] = n2, n2.aborted ? this[It2]() : n2.addEventListener(`abort`, () => this[It2]()));
  }
  get bufferLength() {
    return this[k3];
  }
  get encoding() {
    return this[T3];
  }
  set encoding(e4) {
    throw Error(`Encoding must be set at instantiation time`);
  }
  setEncoding(e4) {
    throw Error(`Encoding must be set at instantiation time`);
  }
  get objectMode() {
    return this[A3];
  }
  set objectMode(e4) {
    throw Error(`objectMode must be set at instantiation time`);
  }
  get async() {
    return this[M3];
  }
  set async(e4) {
    this[M3] = this[M3] || !!e4;
  }
  [It2]() {
    this[Lt2] = true, this.emit(`abort`, this[Rt2]?.reason), this.destroy(this[Rt2]?.reason);
  }
  get aborted() {
    return this[Lt2];
  }
  set aborted(e4) {
  }
  write(e4, t3, n2) {
    if (this[Lt2]) return false;
    if (this[C3]) throw Error(`write after end`);
    if (this[j3]) return this.emit(`error`, Object.assign(Error(`Cannot call write after a stream was destroyed`), { code: `ERR_STREAM_DESTROYED` })), true;
    typeof t3 == `function` && (n2 = t3, t3 = `utf8`), t3 ||= `utf8`;
    let r2 = this[M3] ? Bt2 : Vt2;
    if (!this[A3] && !Buffer.isBuffer(e4)) {
      if (Wt2(e4)) e4 = Buffer.from(e4.buffer, e4.byteOffset, e4.byteLength);
      else if (Ut2(e4)) e4 = Buffer.from(e4);
      else if (typeof e4 != `string`) throw Error(`Non-contiguous data written to non-objectMode stream`);
    }
    return this[A3] ? (this[E3] && this[k3] !== 0 && this[Tt2](true), this[E3] ? this.emit(`data`, e4) : this[At2](e4), this[k3] !== 0 && this.emit(`readable`), n2 && r2(n2), this[E3]) : e4.length ? (typeof e4 == `string` && !(t3 === this[T3] && !this[Dt2]?.lastNeed) && (e4 = Buffer.from(e4, t3)), Buffer.isBuffer(e4) && this[T3] && (e4 = this[Dt2].write(e4)), this[E3] && this[k3] !== 0 && this[Tt2](true), this[E3] ? this.emit(`data`, e4) : this[At2](e4), this[k3] !== 0 && this.emit(`readable`), n2 && r2(n2), this[E3]) : (this[k3] !== 0 && this.emit(`readable`), n2 && r2(n2), this[E3]);
  }
  read(e4) {
    if (this[j3]) return null;
    if (this[N3] = false, this[k3] === 0 || e4 === 0 || e4 && e4 > this[k3]) return this[w3](), null;
    this[A3] && (e4 = null), this[D3].length > 1 && !this[A3] && (this[D3] = [this[T3] ? this[D3].join(``) : Buffer.concat(this[D3], this[k3])]);
    let t3 = this[wt2](e4 || null, this[D3][0]);
    return this[w3](), t3;
  }
  [wt2](e4, t3) {
    if (this[A3]) this[jt2]();
    else {
      let n2 = t3;
      e4 === n2.length || e4 === null ? this[jt2]() : typeof n2 == `string` ? (this[D3][0] = n2.slice(e4), t3 = n2.slice(0, e4), this[k3] -= e4) : (this[D3][0] = n2.subarray(e4), t3 = n2.subarray(0, e4), this[k3] -= e4);
    }
    return this.emit(`data`, t3), !this[D3].length && !this[C3] && this.emit(`drain`), t3;
  }
  end(e4, t3, n2) {
    return typeof e4 == `function` && (n2 = e4, e4 = void 0), typeof t3 == `function` && (n2 = t3, t3 = `utf8`), e4 !== void 0 && this.write(e4, t3), n2 && this.once(`end`, n2), this[C3] = true, this.writable = false, (this[E3] || !this[Ot2]) && this[w3](), this;
  }
  [kt2]() {
    this[j3] || (!this[zt2] && !this[O3].length && (this[N3] = true), this[Ot2] = false, this[E3] = true, this.emit(`resume`), this[D3].length ? this[Tt2]() : this[C3] ? this[w3]() : this.emit(`drain`));
  }
  resume() {
    return this[kt2]();
  }
  pause() {
    this[E3] = false, this[Ot2] = true, this[N3] = false;
  }
  get destroyed() {
    return this[j3];
  }
  get flowing() {
    return this[E3];
  }
  get paused() {
    return this[Ot2];
  }
  [At2](e4) {
    this[A3] ? this[k3] += 1 : this[k3] += e4.length, this[D3].push(e4);
  }
  [jt2]() {
    return this[A3] ? --this[k3] : this[k3] -= this[D3][0].length, this[D3].shift();
  }
  [Tt2](e4 = false) {
    do
      ;
    while (this[Et2](this[jt2]()) && this[D3].length);
    !e4 && !this[D3].length && !this[C3] && this.emit(`drain`);
  }
  [Et2](e4) {
    return this.emit(`data`, e4), this[E3];
  }
  pipe(e4, t3) {
    if (this[j3]) return e4;
    this[N3] = false;
    let n2 = this[bt2];
    return t3 ||= {}, e4 === gt2.stdout || e4 === gt2.stderr ? t3.end = false : t3.end = t3.end !== false, t3.proxyErrors = !!t3.proxyErrors, n2 ? t3.end && e4.end() : (this[O3].push(t3.proxyErrors ? new Kt2(this, e4, t3) : new Gt2(this, e4, t3)), this[M3] ? Bt2(() => this[kt2]()) : this[kt2]()), e4;
  }
  unpipe(e4) {
    let t3 = this[O3].find((t4) => t4.dest === e4);
    t3 && (this[O3].length === 1 ? (this[E3] && this[zt2] === 0 && (this[E3] = false), this[O3] = []) : this[O3].splice(this[O3].indexOf(t3), 1), t3.unpipe());
  }
  addListener(e4, t3) {
    return this.on(e4, t3);
  }
  on(e4, t3) {
    let n2 = super.on(e4, t3);
    if (e4 === `data`) this[N3] = false, this[zt2]++, !this[O3].length && !this[E3] && this[kt2]();
    else if (e4 === `readable` && this[k3] !== 0) super.emit(`readable`);
    else if (Ht2(e4) && this[bt2]) super.emit(e4), this.removeAllListeners(e4);
    else if (e4 === `error` && this[St2]) {
      let e5 = t3;
      this[M3] ? Bt2(() => e5.call(this, this[St2])) : e5.call(this, this[St2]);
    }
    return n2;
  }
  removeListener(e4, t3) {
    return this.off(e4, t3);
  }
  off(e4, t3) {
    let n2 = super.off(e4, t3);
    return e4 === `data` && (this[zt2] = this.listeners(`data`).length, this[zt2] === 0 && !this[N3] && !this[O3].length && (this[E3] = false)), n2;
  }
  removeAllListeners(e4) {
    let t3 = super.removeAllListeners(e4);
    return (e4 === `data` || e4 === void 0) && (this[zt2] = 0, !this[N3] && !this[O3].length && (this[E3] = false)), t3;
  }
  get emittedEnd() {
    return this[bt2];
  }
  [w3]() {
    !this[xt2] && !this[bt2] && !this[j3] && this[D3].length === 0 && this[C3] && (this[xt2] = true, this.emit(`end`), this.emit(`prefinish`), this.emit(`finish`), this[Ct2] && this.emit(`close`), this[xt2] = false);
  }
  emit(e4, ...t3) {
    let n2 = t3[0];
    if (e4 !== `error` && e4 !== `close` && e4 !== j3 && this[j3]) return false;
    if (e4 === `data`) return !this[A3] && !n2 ? false : this[M3] ? (Bt2(() => this[Nt2](n2)), true) : this[Nt2](n2);
    if (e4 === `end`) return this[Pt2]();
    if (e4 === `close`) {
      if (this[Ct2] = true, !this[bt2] && !this[j3]) return false;
      let e5 = super.emit(`close`);
      return this.removeAllListeners(`close`), e5;
    } else if (e4 === `error`) {
      this[St2] = n2, super.emit(Mt2, n2);
      let e5 = !this[Rt2] || this.listeners(`error`).length ? super.emit(`error`, n2) : false;
      return this[w3](), e5;
    } else if (e4 === `resume`) {
      let e5 = super.emit(`resume`);
      return this[w3](), e5;
    } else if (e4 === `finish` || e4 === `prefinish`) {
      let t4 = super.emit(e4);
      return this.removeAllListeners(e4), t4;
    }
    let r2 = super.emit(e4, ...t3);
    return this[w3](), r2;
  }
  [Nt2](e4) {
    for (let t4 of this[O3]) t4.dest.write(e4) === false && this.pause();
    let t3 = this[N3] ? false : super.emit(`data`, e4);
    return this[w3](), t3;
  }
  [Pt2]() {
    return this[bt2] ? false : (this[bt2] = true, this.readable = false, this[M3] ? (Bt2(() => this[Ft2]()), true) : this[Ft2]());
  }
  [Ft2]() {
    if (this[Dt2]) {
      let e5 = this[Dt2].end();
      if (e5) {
        for (let t3 of this[O3]) t3.dest.write(e5);
        this[N3] || super.emit(`data`, e5);
      }
    }
    for (let e5 of this[O3]) e5.end();
    let e4 = super.emit(`end`);
    return this.removeAllListeners(`end`), e4;
  }
  async collect() {
    let e4 = Object.assign([], { dataLength: 0 });
    this[A3] || (e4.dataLength = 0);
    let t3 = this.promise();
    return this.on(`data`, (t4) => {
      e4.push(t4), this[A3] || (e4.dataLength += t4.length);
    }), await t3, e4;
  }
  async concat() {
    if (this[A3]) throw Error(`cannot concat in objectMode`);
    let e4 = await this.collect();
    return this[T3] ? e4.join(``) : Buffer.concat(e4, e4.dataLength);
  }
  async promise() {
    return new Promise((e4, t3) => {
      this.on(j3, () => t3(Error(`stream destroyed`))), this.on(`error`, (e5) => t3(e5)), this.on(`end`, () => e4());
    });
  }
  [Symbol.asyncIterator]() {
    this[N3] = false;
    let e4 = false, t3 = async () => (this.pause(), e4 = true, { value: void 0, done: true });
    return { next: () => {
      if (e4) return t3();
      let n2 = this.read();
      if (n2 !== null) return Promise.resolve({ done: false, value: n2 });
      if (this[C3]) return t3();
      let r2, i3, a3 = (e5) => {
        this.off(`data`, o3), this.off(`end`, s3), this.off(j3, c3), t3(), i3(e5);
      }, o3 = (e5) => {
        this.off(`error`, a3), this.off(`end`, s3), this.off(j3, c3), this.pause(), r2({ value: e5, done: !!this[C3] });
      }, s3 = () => {
        this.off(`error`, a3), this.off(`data`, o3), this.off(j3, c3), t3(), r2({ done: true, value: void 0 });
      }, c3 = () => a3(Error(`stream destroyed`));
      return new Promise((e5, t4) => {
        i3 = t4, r2 = e5, this.once(j3, c3), this.once(`error`, a3), this.once(`end`, s3), this.once(`data`, o3);
      });
    }, throw: t3, return: t3, [Symbol.asyncIterator]() {
      return this;
    }, [Symbol.asyncDispose]: async () => {
    } };
  }
  [Symbol.iterator]() {
    this[N3] = false;
    let e4 = false, t3 = () => (this.pause(), this.off(Mt2, t3), this.off(j3, t3), this.off(`end`, t3), e4 = true, { done: true, value: void 0 });
    return this.once(`end`, t3), this.once(Mt2, t3), this.once(j3, t3), { next: () => {
      if (e4) return t3();
      let n2 = this.read();
      return n2 === null ? t3() : { done: false, value: n2 };
    }, throw: t3, return: t3, [Symbol.iterator]() {
      return this;
    }, [Symbol.dispose]: () => {
    } };
  }
  destroy(e4) {
    if (this[j3]) return e4 ? this.emit(`error`, e4) : this.emit(j3), this;
    this[j3] = true, this[N3] = true, this[D3].length = 0, this[k3] = 0;
    let t3 = this;
    return typeof t3.close == `function` && !this[Ct2] && t3.close(), e4 ? this.emit(`error`, e4) : this.emit(j3), this;
  }
  static get isStream() {
    return _t2;
  }
};
var Xt = v3.writev;
var Zt = /* @__PURE__ */ Symbol(`_autoClose`);
var P3 = /* @__PURE__ */ Symbol(`_close`);
var Qt = /* @__PURE__ */ Symbol(`_ended`);
var F3 = /* @__PURE__ */ Symbol(`_fd`);
var $t = /* @__PURE__ */ Symbol(`_finished`);
var I3 = /* @__PURE__ */ Symbol(`_flags`);
var en = /* @__PURE__ */ Symbol(`_flush`);
var tn = /* @__PURE__ */ Symbol(`_handleChunk`);
var nn = /* @__PURE__ */ Symbol(`_makeBuf`);
var rn = /* @__PURE__ */ Symbol(`_mode`);
var an = /* @__PURE__ */ Symbol(`_needDrain`);
var on = /* @__PURE__ */ Symbol(`_onerror`);
var sn = /* @__PURE__ */ Symbol(`_onopen`);
var cn = /* @__PURE__ */ Symbol(`_onread`);
var ln = /* @__PURE__ */ Symbol(`_onwrite`);
var un = /* @__PURE__ */ Symbol(`_open`);
var L3 = /* @__PURE__ */ Symbol(`_path`);
var dn = /* @__PURE__ */ Symbol(`_pos`);
var R3 = /* @__PURE__ */ Symbol(`_queue`);
var fn = /* @__PURE__ */ Symbol(`_read`);
var pn = /* @__PURE__ */ Symbol(`_readSize`);
var z3 = /* @__PURE__ */ Symbol(`_reading`);
var mn = /* @__PURE__ */ Symbol(`_remain`);
var hn = /* @__PURE__ */ Symbol(`_size`);
var gn = /* @__PURE__ */ Symbol(`_write`);
var _n = /* @__PURE__ */ Symbol(`_writing`);
var vn = /* @__PURE__ */ Symbol(`_defaultFlag`);
var yn = /* @__PURE__ */ Symbol(`_errored`);
var bn = class extends Yt {
  [yn] = false;
  [F3];
  [L3];
  [pn];
  [z3] = false;
  [hn];
  [mn];
  [Zt];
  constructor(e4, t3) {
    if (t3 ||= {}, super(t3), this.readable = true, this.writable = false, typeof e4 != `string`) throw TypeError(`path must be a string`);
    this[yn] = false, this[F3] = typeof t3.fd == `number` ? t3.fd : void 0, this[L3] = e4, this[pn] = t3.readSize || 16 * 1024 * 1024, this[z3] = false, this[hn] = typeof t3.size == `number` ? t3.size : 1 / 0, this[mn] = this[hn], this[Zt] = typeof t3.autoClose == `boolean` ? t3.autoClose : true, typeof this[F3] == `number` ? this[fn]() : this[un]();
  }
  get fd() {
    return this[F3];
  }
  get path() {
    return this[L3];
  }
  write() {
    throw TypeError(`this is a readable stream`);
  }
  end() {
    throw TypeError(`this is a readable stream`);
  }
  [un]() {
    v3.open(this[L3], `r`, (e4, t3) => this[sn](e4, t3));
  }
  [sn](e4, t3) {
    e4 ? this[on](e4) : (this[F3] = t3, this.emit(`open`, t3), this[fn]());
  }
  [nn]() {
    return Buffer.allocUnsafe(Math.min(this[pn], this[mn]));
  }
  [fn]() {
    if (!this[z3]) {
      this[z3] = true;
      let e4 = this[nn]();
      if (e4.length === 0) return process.nextTick(() => this[cn](null, 0, e4));
      v3.read(this[F3], e4, 0, e4.length, null, (e5, t3, n2) => this[cn](e5, t3, n2));
    }
  }
  [cn](e4, t3, n2) {
    this[z3] = false, e4 ? this[on](e4) : this[tn](t3, n2) && this[fn]();
  }
  [P3]() {
    if (this[Zt] && typeof this[F3] == `number`) {
      let e4 = this[F3];
      this[F3] = void 0, v3.close(e4, (e5) => e5 ? this.emit(`error`, e5) : this.emit(`close`));
    }
  }
  [on](e4) {
    this[z3] = true, this[P3](), this.emit(`error`, e4);
  }
  [tn](e4, t3) {
    let n2 = false;
    return this[mn] -= e4, e4 > 0 && (n2 = super.write(e4 < t3.length ? t3.subarray(0, e4) : t3)), (e4 === 0 || this[mn] <= 0) && (n2 = false, this[P3](), super.end()), n2;
  }
  emit(e4, ...t3) {
    switch (e4) {
      case `prefinish`:
      case `finish`:
        return false;
      case `drain`:
        return typeof this[F3] == `number` && this[fn](), false;
      case `error`:
        return this[yn] ? false : (this[yn] = true, super.emit(e4, ...t3));
      default:
        return super.emit(e4, ...t3);
    }
  }
};
var xn = class extends bn {
  [un]() {
    let e4 = true;
    try {
      this[sn](null, v3.openSync(this[L3], `r`)), e4 = false;
    } finally {
      e4 && this[P3]();
    }
  }
  [fn]() {
    let e4 = true;
    try {
      if (!this[z3]) {
        this[z3] = true;
        do {
          let e5 = this[nn](), t3 = e5.length === 0 ? 0 : v3.readSync(this[F3], e5, 0, e5.length, null);
          if (!this[tn](t3, e5)) break;
        } while (true);
        this[z3] = false;
      }
      e4 = false;
    } finally {
      e4 && this[P3]();
    }
  }
  [P3]() {
    if (this[Zt] && typeof this[F3] == `number`) {
      let e4 = this[F3];
      this[F3] = void 0, v3.closeSync(e4), this.emit(`close`);
    }
  }
};
var Sn = class extends _3 {
  readable = false;
  writable = true;
  [yn] = false;
  [_n] = false;
  [Qt] = false;
  [R3] = [];
  [an] = false;
  [L3];
  [rn];
  [Zt];
  [F3];
  [vn];
  [I3];
  [$t] = false;
  [dn];
  constructor(e4, t3) {
    t3 ||= {}, super(t3), this[L3] = e4, this[F3] = typeof t3.fd == `number` ? t3.fd : void 0, this[rn] = t3.mode === void 0 ? 438 : t3.mode, this[dn] = typeof t3.start == `number` ? t3.start : void 0, this[Zt] = typeof t3.autoClose == `boolean` ? t3.autoClose : true;
    let n2 = this[dn] === void 0 ? `w` : `r+`;
    this[vn] = t3.flags === void 0, this[I3] = t3.flags === void 0 ? n2 : t3.flags, this[F3] === void 0 && this[un]();
  }
  emit(e4, ...t3) {
    if (e4 === `error`) {
      if (this[yn]) return false;
      this[yn] = true;
    }
    return super.emit(e4, ...t3);
  }
  get fd() {
    return this[F3];
  }
  get path() {
    return this[L3];
  }
  [on](e4) {
    this[P3](), this[_n] = true, this.emit(`error`, e4);
  }
  [un]() {
    v3.open(this[L3], this[I3], this[rn], (e4, t3) => this[sn](e4, t3));
  }
  [sn](e4, t3) {
    this[vn] && this[I3] === `r+` && e4 && e4.code === `ENOENT` ? (this[I3] = `w`, this[un]()) : e4 ? this[on](e4) : (this[F3] = t3, this.emit(`open`, t3), this[_n] || this[en]());
  }
  end(e4, t3) {
    return e4 && this.write(e4, t3), this[Qt] = true, !this[_n] && !this[R3].length && typeof this[F3] == `number` && this[ln](null, 0), this;
  }
  write(e4, t3) {
    return typeof e4 == `string` && (e4 = Buffer.from(e4, t3)), this[Qt] ? (this.emit(`error`, Error(`write() after end()`)), false) : this[F3] === void 0 || this[_n] || this[R3].length ? (this[R3].push(e4), this[an] = true, false) : (this[_n] = true, this[gn](e4), true);
  }
  [gn](e4) {
    v3.write(this[F3], e4, 0, e4.length, this[dn], (e5, t3) => this[ln](e5, t3));
  }
  [ln](e4, t3) {
    e4 ? this[on](e4) : (this[dn] !== void 0 && typeof t3 == `number` && (this[dn] += t3), this[R3].length ? this[en]() : (this[_n] = false, this[Qt] && !this[$t] ? (this[$t] = true, this[P3](), this.emit(`finish`)) : this[an] && (this[an] = false, this.emit(`drain`))));
  }
  [en]() {
    if (this[R3].length === 0) this[Qt] && this[ln](null, 0);
    else if (this[R3].length === 1) this[gn](this[R3].pop());
    else {
      let e4 = this[R3];
      this[R3] = [], Xt(this[F3], e4, this[dn], (e5, t3) => this[ln](e5, t3));
    }
  }
  [P3]() {
    if (this[Zt] && typeof this[F3] == `number`) {
      let e4 = this[F3];
      this[F3] = void 0, v3.close(e4, (e5) => e5 ? this.emit(`error`, e5) : this.emit(`close`));
    }
  }
};
var Cn = class extends Sn {
  [un]() {
    let e4;
    if (this[vn] && this[I3] === `r+`) try {
      e4 = v3.openSync(this[L3], this[I3], this[rn]);
    } catch (e5) {
      if (e5?.code === `ENOENT`) return this[I3] = `w`, this[un]();
      throw e5;
    }
    else e4 = v3.openSync(this[L3], this[I3], this[rn]);
    this[sn](null, e4);
  }
  [P3]() {
    if (this[Zt] && typeof this[F3] == `number`) {
      let e4 = this[F3];
      this[F3] = void 0, v3.closeSync(e4), this.emit(`close`);
    }
  }
  [gn](e4) {
    let t3 = true;
    try {
      this[ln](null, v3.writeSync(this[F3], e4, 0, e4.length, this[dn])), t3 = false;
    } finally {
      if (t3) try {
        this[P3]();
      } catch {
      }
    }
  }
};
var wn = /* @__PURE__ */ new Map([[`C`, `cwd`], [`f`, `file`], [`z`, `gzip`], [`P`, `preservePaths`], [`U`, `unlink`], [`strip-components`, `strip`], [`stripComponents`, `strip`], [`keep-newer`, `newer`], [`keepNewer`, `newer`], [`keep-newer-files`, `newer`], [`keepNewerFiles`, `newer`], [`k`, `keep`], [`keep-existing`, `keep`], [`keepExisting`, `keep`], [`m`, `noMtime`], [`no-mtime`, `noMtime`], [`p`, `preserveOwner`], [`L`, `follow`], [`h`, `follow`], [`onentry`, `onReadEntry`]]);
var Tn = (e4) => !!e4.sync && !!e4.file;
var En = (e4) => !e4.sync && !!e4.file;
var Dn = (e4) => !!e4.sync && !e4.file;
var On = (e4) => !e4.sync && !e4.file;
var kn = (e4) => !!e4.file;
var An = (e4) => wn.get(e4) || e4;
var jn = (e4 = {}) => {
  if (!e4) return {};
  let t3 = {};
  for (let [n2, r2] of Object.entries(e4)) {
    let e5 = An(n2);
    t3[e5] = r2;
  }
  return t3.chmod === void 0 && t3.noChmod === false && (t3.chmod = true), delete t3.noChmod, t3;
};
var Mn = (e4, t3, n2, r2, i3) => Object.assign((a3 = [], o3, s3) => {
  Array.isArray(a3) && (o3 = a3, a3 = {}), typeof o3 == `function` && (s3 = o3, o3 = void 0), o3 = o3 ? Array.from(o3) : [];
  let c3 = jn(a3);
  if (i3?.(c3, o3), Tn(c3)) {
    if (typeof s3 == `function`) throw TypeError(`callback not supported for sync tar functions`);
    return e4(c3, o3);
  } else if (En(c3)) {
    let e5 = t3(c3, o3);
    return s3 ? e5.then(() => s3(), s3) : e5;
  } else if (Dn(c3)) {
    if (typeof s3 == `function`) throw TypeError(`callback not supported for sync tar functions`);
    return n2(c3, o3);
  } else if (On(c3)) {
    if (typeof s3 == `function`) throw TypeError(`callback only supported with file option`);
    return r2(c3, o3);
  }
  throw Error(`impossible options??`);
}, { syncFile: e4, asyncFile: t3, syncNoFile: n2, asyncNoFile: r2, validate: i3 });
var Nn = Se2.constants || { ZLIB_VERNUM: 4736 };
var B3 = Object.freeze(Object.assign(/* @__PURE__ */ Object.create(null), { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_MEM_ERROR: -4, Z_BUF_ERROR: -5, Z_VERSION_ERROR: -6, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, DEFLATE: 1, INFLATE: 2, GZIP: 3, GUNZIP: 4, DEFLATERAW: 5, INFLATERAW: 6, UNZIP: 7, BROTLI_DECODE: 8, BROTLI_ENCODE: 9, Z_MIN_WINDOWBITS: 8, Z_MAX_WINDOWBITS: 15, Z_DEFAULT_WINDOWBITS: 15, Z_MIN_CHUNK: 64, Z_MAX_CHUNK: 1 / 0, Z_DEFAULT_CHUNK: 16384, Z_MIN_MEMLEVEL: 1, Z_MAX_MEMLEVEL: 9, Z_DEFAULT_MEMLEVEL: 8, Z_MIN_LEVEL: -1, Z_MAX_LEVEL: 9, Z_DEFAULT_LEVEL: -1, BROTLI_OPERATION_PROCESS: 0, BROTLI_OPERATION_FLUSH: 1, BROTLI_OPERATION_FINISH: 2, BROTLI_OPERATION_EMIT_METADATA: 3, BROTLI_MODE_GENERIC: 0, BROTLI_MODE_TEXT: 1, BROTLI_MODE_FONT: 2, BROTLI_DEFAULT_MODE: 0, BROTLI_MIN_QUALITY: 0, BROTLI_MAX_QUALITY: 11, BROTLI_DEFAULT_QUALITY: 11, BROTLI_MIN_WINDOW_BITS: 10, BROTLI_MAX_WINDOW_BITS: 24, BROTLI_LARGE_MAX_WINDOW_BITS: 30, BROTLI_DEFAULT_WINDOW: 22, BROTLI_MIN_INPUT_BLOCK_BITS: 16, BROTLI_MAX_INPUT_BLOCK_BITS: 24, BROTLI_PARAM_MODE: 0, BROTLI_PARAM_QUALITY: 1, BROTLI_PARAM_LGWIN: 2, BROTLI_PARAM_LGBLOCK: 3, BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING: 4, BROTLI_PARAM_SIZE_HINT: 5, BROTLI_PARAM_LARGE_WINDOW: 6, BROTLI_PARAM_NPOSTFIX: 7, BROTLI_PARAM_NDIRECT: 8, BROTLI_DECODER_RESULT_ERROR: 0, BROTLI_DECODER_RESULT_SUCCESS: 1, BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT: 2, BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT: 3, BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION: 0, BROTLI_DECODER_PARAM_LARGE_WINDOW: 1, BROTLI_DECODER_NO_ERROR: 0, BROTLI_DECODER_SUCCESS: 1, BROTLI_DECODER_NEEDS_MORE_INPUT: 2, BROTLI_DECODER_NEEDS_MORE_OUTPUT: 3, BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE: -1, BROTLI_DECODER_ERROR_FORMAT_RESERVED: -2, BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE: -3, BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET: -4, BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME: -5, BROTLI_DECODER_ERROR_FORMAT_CL_SPACE: -6, BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE: -7, BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT: -8, BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1: -9, BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2: -10, BROTLI_DECODER_ERROR_FORMAT_TRANSFORM: -11, BROTLI_DECODER_ERROR_FORMAT_DICTIONARY: -12, BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS: -13, BROTLI_DECODER_ERROR_FORMAT_PADDING_1: -14, BROTLI_DECODER_ERROR_FORMAT_PADDING_2: -15, BROTLI_DECODER_ERROR_FORMAT_DISTANCE: -16, BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET: -19, BROTLI_DECODER_ERROR_INVALID_ARGUMENTS: -20, BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES: -21, BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS: -22, BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP: -25, BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1: -26, BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2: -27, BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES: -30, BROTLI_DECODER_ERROR_UNREACHABLE: -31 }, Nn));
var Pn = be2.concat;
var Fn = Object.getOwnPropertyDescriptor(be2, `concat`);
var In = (e4) => e4;
var Ln = Fn?.writable === true || Fn?.set !== void 0 ? (e4) => {
  be2.concat = e4 ? In : Pn;
} : (e4) => {
};
var Rn = /* @__PURE__ */ Symbol(`_superWrite`);
var zn = class extends Error {
  code;
  errno;
  constructor(e4, t3) {
    super(`zlib: ` + e4.message, { cause: e4 }), this.code = e4.code, this.errno = e4.errno, this.code ||= `ZLIB_ERROR`, this.message = `zlib: ` + e4.message, Error.captureStackTrace(this, t3 ?? this.constructor);
  }
  get name() {
    return `ZlibError`;
  }
};
var Bn = /* @__PURE__ */ Symbol(`flushFlag`);
var Vn = class extends Yt {
  #e = false;
  #t = false;
  #n;
  #r;
  #i;
  #a;
  #o;
  get sawError() {
    return this.#e;
  }
  get handle() {
    return this.#a;
  }
  get flushFlag() {
    return this.#n;
  }
  constructor(e4, t3) {
    if (!e4 || typeof e4 != `object`) throw TypeError(`invalid options for ZlibBase constructor`);
    if (super(e4), this.#n = e4.flush ?? 0, this.#r = e4.finishFlush ?? 0, this.#i = e4.fullFlushFlag ?? 0, typeof xe2[t3] != `function`) throw TypeError(`Compression method not supported: ` + t3);
    try {
      this.#a = new xe2[t3](e4);
    } catch (e5) {
      throw new zn(e5, this.constructor);
    }
    this.#o = (e5) => {
      this.#e || (this.#e = true, this.close(), this.emit(`error`, e5));
    }, this.#a?.on(`error`, (e5) => this.#o(new zn(e5))), this.once(`end`, () => this.close);
  }
  close() {
    this.#a && (this.#a.close(), this.#a = void 0, this.emit(`close`));
  }
  reset() {
    if (!this.#e) return g3(this.#a, `zlib binding closed`), this.#a.reset?.();
  }
  flush(e4) {
    this.ended || (typeof e4 != `number` && (e4 = this.#i), this.write(Object.assign(be2.alloc(0), { [Bn]: e4 })));
  }
  end(e4, t3, n2) {
    return typeof e4 == `function` && (n2 = e4, t3 = void 0, e4 = void 0), typeof t3 == `function` && (n2 = t3, t3 = void 0), e4 && (t3 ? this.write(e4, t3) : this.write(e4)), this.flush(this.#r), this.#t = true, super.end(n2);
  }
  get ended() {
    return this.#t;
  }
  [Rn](e4) {
    return super.write(e4);
  }
  write(e4, t3, n2) {
    if (typeof t3 == `function` && (n2 = t3, t3 = `utf8`), typeof e4 == `string` && (e4 = be2.from(e4, t3)), this.#e) return;
    g3(this.#a, `zlib binding closed`);
    let r2 = this.#a._handle, i3 = r2.close;
    r2.close = () => {
    };
    let a3 = this.#a.close;
    this.#a.close = () => {
    }, Ln(true);
    let o3;
    try {
      let t4 = typeof e4[Bn] == `number` ? e4[Bn] : this.#n;
      o3 = this.#a._processChunk(e4, t4), Ln(false);
    } catch (e5) {
      Ln(false), this.#o(new zn(e5, this.write));
    } finally {
      this.#a && (this.#a._handle = r2, r2.close = i3, this.#a.close = a3, this.#a.removeAllListeners(`error`));
    }
    this.#a && this.#a.on(`error`, (e5) => this.#o(new zn(e5, this.write)));
    let s3;
    if (o3) if (Array.isArray(o3) && o3.length > 0) {
      let e5 = o3[0];
      s3 = this[Rn](be2.from(e5));
      for (let e6 = 1; e6 < o3.length; e6++) s3 = this[Rn](o3[e6]);
    } else s3 = this[Rn](be2.from(o3));
    return n2 && n2(), s3;
  }
};
var Hn = class extends Vn {
  #e;
  #t;
  constructor(e4, t3) {
    e4 ||= {}, e4.flush = e4.flush || B3.Z_NO_FLUSH, e4.finishFlush = e4.finishFlush || B3.Z_FINISH, e4.fullFlushFlag = B3.Z_FULL_FLUSH, super(e4, t3), this.#e = e4.level, this.#t = e4.strategy;
  }
  params(e4, t3) {
    if (!this.sawError) {
      if (!this.handle) throw Error(`cannot switch params when binding is closed`);
      if (!this.handle.params) throw Error(`not supported in this implementation`);
      if (this.#e !== e4 || this.#t !== t3) {
        this.flush(B3.Z_SYNC_FLUSH), g3(this.handle, `zlib binding closed`);
        let n2 = this.handle.flush;
        this.handle.flush = (e5, t4) => {
          typeof e5 == `function` && (t4 = e5, e5 = this.flushFlag), this.flush(e5), t4?.();
        };
        try {
          this.handle.params(e4, t3);
        } finally {
          this.handle.flush = n2;
        }
        this.handle && (this.#e = e4, this.#t = t3);
      }
    }
  }
};
var Un = class extends Hn {
  #e;
  constructor(e4) {
    super(e4, `Gzip`), this.#e = e4 && !!e4.portable;
  }
  [Rn](e4) {
    return this.#e ? (this.#e = false, e4[9] = 255, super[Rn](e4)) : super[Rn](e4);
  }
};
var Wn = class extends Hn {
  constructor(e4) {
    super(e4, `Unzip`);
  }
};
var Gn = class extends Vn {
  constructor(e4, t3) {
    e4 ||= {}, e4.flush = e4.flush || B3.BROTLI_OPERATION_PROCESS, e4.finishFlush = e4.finishFlush || B3.BROTLI_OPERATION_FINISH, e4.fullFlushFlag = B3.BROTLI_OPERATION_FLUSH, super(e4, t3);
  }
};
var Kn = class extends Gn {
  constructor(e4) {
    super(e4, `BrotliCompress`);
  }
};
var qn = class extends Gn {
  constructor(e4) {
    super(e4, `BrotliDecompress`);
  }
};
var Jn = class extends Vn {
  constructor(e4, t3) {
    e4 ||= {}, e4.flush = e4.flush || B3.ZSTD_e_continue, e4.finishFlush = e4.finishFlush || B3.ZSTD_e_end, e4.fullFlushFlag = B3.ZSTD_e_flush, super(e4, t3);
  }
};
var Yn = class extends Jn {
  constructor(e4) {
    super(e4, `ZstdCompress`);
  }
};
var Xn = class extends Jn {
  constructor(e4) {
    super(e4, `ZstdDecompress`);
  }
};
var Zn = (e4, t3) => {
  if (Number.isSafeInteger(e4)) e4 < 0 ? $n(e4, t3) : Qn(e4, t3);
  else throw Error(`cannot encode number outside of javascript safe integer range`);
  return t3;
};
var Qn = (e4, t3) => {
  t3[0] = 128;
  for (var n2 = t3.length; n2 > 1; n2--) t3[n2 - 1] = e4 & 255, e4 = Math.floor(e4 / 256);
};
var $n = (e4, t3) => {
  t3[0] = 255;
  var n2 = false;
  e4 *= -1;
  for (var r2 = t3.length; r2 > 1; r2--) {
    var i3 = e4 & 255;
    e4 = Math.floor(e4 / 256), n2 ? t3[r2 - 1] = rr(i3) : i3 === 0 ? t3[r2 - 1] = 0 : (n2 = true, t3[r2 - 1] = ir(i3));
  }
};
var er = (e4) => {
  let t3 = e4[0], n2 = t3 === 128 ? nr(e4.subarray(1, e4.length)) : t3 === 255 ? tr(e4) : null;
  if (n2 === null) throw Error(`invalid base256 encoding`);
  if (!Number.isSafeInteger(n2)) throw Error(`parsed number outside of javascript safe integer range`);
  return n2;
};
var tr = (e4) => {
  for (var t3 = e4.length, n2 = 0, r2 = false, i3 = t3 - 1; i3 > -1; i3--) {
    var a3 = Number(e4[i3]), o3;
    r2 ? o3 = rr(a3) : a3 === 0 ? o3 = a3 : (r2 = true, o3 = ir(a3)), o3 !== 0 && (n2 -= o3 * 256 ** (t3 - i3 - 1));
  }
  return n2;
};
var nr = (e4) => {
  for (var t3 = e4.length, n2 = 0, r2 = t3 - 1; r2 > -1; r2--) {
    var i3 = Number(e4[r2]);
    i3 !== 0 && (n2 += i3 * 256 ** (t3 - r2 - 1));
  }
  return n2;
};
var rr = (e4) => (255 ^ e4) & 255;
var ir = (e4) => (255 ^ e4) + 1 & 255;
ht2({}, { code: () => lr, isCode: () => ar, isName: () => or, name: () => cr, normalFsTypes: () => sr });
var ar = (e4) => cr.has(e4);
var or = (e4) => lr.has(e4);
var sr = /* @__PURE__ */ new Set([`0`, ``, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `D`]);
var cr = /* @__PURE__ */ new Map([[`0`, `File`], [``, `OldFile`], [`1`, `Link`], [`2`, `SymbolicLink`], [`3`, `CharacterDevice`], [`4`, `BlockDevice`], [`5`, `Directory`], [`6`, `FIFO`], [`7`, `ContiguousFile`], [`g`, `GlobalExtendedHeader`], [`x`, `ExtendedHeader`], [`A`, `SolarisACL`], [`D`, `GNUDumpDir`], [`I`, `Inode`], [`K`, `NextFileHasLongLinkpath`], [`L`, `NextFileHasLongPath`], [`M`, `ContinuationFile`], [`N`, `OldGnuLongPath`], [`S`, `SparseFile`], [`V`, `TapeVolumeHeader`], [`X`, `OldExtendedHeader`]]);
var lr = new Map(Array.from(cr).map((e4) => [e4[1], e4[0]]));
var ur = (e4) => e4 === void 0 || e4 < 0 ? void 0 : e4;
var dr = class {
  cksumValid = false;
  needPax = false;
  nullBlock = false;
  block;
  path;
  mode;
  uid;
  gid;
  size;
  cksum;
  #e = `Unsupported`;
  linkpath;
  uname;
  gname;
  devmaj = 0;
  devmin = 0;
  atime;
  ctime;
  mtime;
  charset;
  comment;
  constructor(e4, t3 = 0, n2, r2) {
    Buffer.isBuffer(e4) ? this.decode(e4, t3 || 0, n2, r2) : e4 && this.#t(e4);
  }
  decode(e4, t3, n2, r2) {
    if (t3 ||= 0, !e4 || !(e4.length >= t3 + 512)) throw Error(`need 512 bytes for header`);
    let i3 = pr(e4, t3 + 156, 1), a3 = sr.has(i3), o3 = a3 ? n2 : void 0, s3 = a3 ? r2 : void 0;
    if (this.path = o3?.path ?? pr(e4, t3, 100), this.mode = o3?.mode ?? s3?.mode ?? gr(e4, t3 + 100, 8), this.uid = o3?.uid ?? s3?.uid ?? gr(e4, t3 + 108, 8), this.gid = o3?.gid ?? s3?.gid ?? gr(e4, t3 + 116, 8), this.size = ur(o3?.size ?? s3?.size ?? gr(e4, t3 + 124, 12)), this.mtime = o3?.mtime ?? s3?.mtime ?? mr(e4, t3 + 136, 12), this.cksum = gr(e4, t3 + 148, 12), s3 && this.#t(s3, true), o3 && this.#t(o3), ar(i3) && (this.#e = i3 || `0`), this.#e === `0` && this.path.slice(-1) === `/` && (this.#e = `5`), this.#e === `5` && (this.size = 0), this.linkpath = pr(e4, t3 + 157, 100), e4.subarray(t3 + 257, t3 + 265).toString() === `ustar\x0000`) if (this.uname = o3?.uname ?? s3?.uname ?? pr(e4, t3 + 265, 32), this.gname = o3?.gname ?? s3?.gname ?? pr(e4, t3 + 297, 32), this.devmaj = o3?.devmaj ?? s3?.devmaj ?? gr(e4, t3 + 329, 8) ?? 0, this.devmin = o3?.devmin ?? s3?.devmin ?? gr(e4, t3 + 337, 8) ?? 0, e4[t3 + 475] !== 0) {
      let n3 = pr(e4, t3 + 345, 155);
      this.path = n3 + `/` + this.path;
    } else {
      let i4 = pr(e4, t3 + 345, 130);
      i4 && (this.path = i4 + `/` + this.path), this.atime = n2?.atime ?? r2?.atime ?? mr(e4, t3 + 476, 12), this.ctime = n2?.ctime ?? r2?.ctime ?? mr(e4, t3 + 488, 12);
    }
    let c3 = 256;
    for (let n3 = t3; n3 < t3 + 148; n3++) c3 += e4[n3];
    for (let n3 = t3 + 156; n3 < t3 + 512; n3++) c3 += e4[n3];
    this.cksumValid = c3 === this.cksum, this.cksum === void 0 && c3 === 256 && (this.nullBlock = true);
  }
  #t(e4, t3 = false) {
    Object.assign(this, Object.fromEntries(Object.entries(e4).filter(([e5, n2]) => !(n2 == null || e5 === `size` && Number(n2) < 0 || e5 === `path` && t3 || e5 === `linkpath` && t3 || e5 === `global`))));
  }
  encode(e4, t3 = 0) {
    if (e4 ||= this.block = Buffer.alloc(512), this.#e === `Unsupported` && (this.#e = `0`), !(e4.length >= t3 + 512)) throw Error(`need 512 bytes for header`);
    let n2 = this.ctime || this.atime ? 130 : 155, r2 = fr(this.path || ``, n2), i3 = r2[0], a3 = r2[1];
    this.needPax = !!r2[2], this.needPax = Er(e4, t3, 100, i3) || this.needPax, this.needPax = br(e4, t3 + 100, 8, this.mode) || this.needPax, this.needPax = br(e4, t3 + 108, 8, this.uid) || this.needPax, this.needPax = br(e4, t3 + 116, 8, this.gid) || this.needPax, this.needPax = br(e4, t3 + 124, 12, this.size) || this.needPax, this.needPax = wr(e4, t3 + 136, 12, this.mtime) || this.needPax, e4[t3 + 156] = Number(this.#e.codePointAt(0)), this.needPax = Er(e4, t3 + 157, 100, this.linkpath) || this.needPax, e4.write(`ustar\x0000`, t3 + 257, 8), this.needPax = Er(e4, t3 + 265, 32, this.uname) || this.needPax, this.needPax = Er(e4, t3 + 297, 32, this.gname) || this.needPax, this.needPax = br(e4, t3 + 329, 8, this.devmaj) || this.needPax, this.needPax = br(e4, t3 + 337, 8, this.devmin) || this.needPax, this.needPax = Er(e4, t3 + 345, n2, a3) || this.needPax, e4[t3 + 475] === 0 ? (this.needPax = Er(e4, t3 + 345, 130, a3) || this.needPax, this.needPax = wr(e4, t3 + 476, 12, this.atime) || this.needPax, this.needPax = wr(e4, t3 + 488, 12, this.ctime) || this.needPax) : this.needPax = Er(e4, t3 + 345, 155, a3) || this.needPax;
    let o3 = 256;
    for (let n3 = t3; n3 < t3 + 148; n3++) o3 += e4[n3];
    for (let n3 = t3 + 156; n3 < t3 + 512; n3++) o3 += e4[n3];
    return this.cksum = o3, br(e4, t3 + 148, 8, this.cksum), this.cksumValid = true, this.needPax;
  }
  get type() {
    return this.#e === `Unsupported` ? this.#e : cr.get(this.#e);
  }
  get typeKey() {
    return this.#e;
  }
  set type(e4) {
    let t3 = String(lr.get(e4));
    if (ar(t3) || t3 === `Unsupported`) this.#e = t3;
    else if (ar(e4)) this.#e = e4;
    else throw TypeError(`invalid entry type: ` + e4);
  }
};
var fr = (e4, t3) => {
  let n2 = e4, r2 = ``, i3, a3 = ae2.parse(e4).root || `.`;
  if (Buffer.byteLength(n2) < 100) i3 = [n2, r2, false];
  else {
    r2 = ae2.dirname(n2), n2 = ae2.basename(n2);
    do
      Buffer.byteLength(n2) <= 100 && Buffer.byteLength(r2) <= t3 ? i3 = [n2, r2, false] : Buffer.byteLength(n2) > 100 && Buffer.byteLength(r2) <= t3 ? i3 = [n2.slice(0, 99), r2, true] : (n2 = ae2.join(ae2.basename(r2), n2), r2 = ae2.dirname(r2));
    while (r2 !== a3 && i3 === void 0);
    i3 ||= [e4.slice(0, 99), ``, true];
  }
  return i3;
};
var pr = (e4, t3, n2) => e4.subarray(t3, t3 + n2).toString(`utf8`).replace(/\0.*/, ``);
var mr = (e4, t3, n2) => hr(gr(e4, t3, n2));
var hr = (e4) => e4 === void 0 ? void 0 : new Date(e4 * 1e3);
var gr = (e4, t3, n2) => Number(e4[t3]) & 128 ? er(e4.subarray(t3, t3 + n2)) : vr(e4, t3, n2);
var _r = (e4) => isNaN(e4) ? void 0 : e4;
var vr = (e4, t3, n2) => _r(parseInt(e4.subarray(t3, t3 + n2).toString(`utf8`).replace(/\0.*$/, ``).trim(), 8));
var yr = { 12: 8589934591, 8: 2097151 };
var br = (e4, t3, n2, r2) => r2 === void 0 ? false : r2 > yr[n2] || r2 < 0 ? (Zn(r2, e4.subarray(t3, t3 + n2)), true) : (xr(e4, t3, n2, r2), false);
var xr = (e4, t3, n2, r2) => e4.write(Sr(r2, n2), t3, n2, `ascii`);
var Sr = (e4, t3) => Cr(Math.floor(e4).toString(8), t3);
var Cr = (e4, t3) => (e4.length === t3 - 1 ? e4 : Array(t3 - e4.length - 1).join(`0`) + e4 + ` `) + `\0`;
var wr = (e4, t3, n2, r2) => r2 === void 0 ? false : br(e4, t3, n2, r2.getTime() / 1e3);
var Tr = Array(156).join(`\0`);
var Er = (e4, t3, n2, r2) => r2 === void 0 ? false : (e4.write(r2 + Tr, t3, n2, `utf8`), r2.length !== Buffer.byteLength(r2) || r2.length > n2);
var Dr = class e2 {
  atime;
  mtime;
  ctime;
  charset;
  comment;
  gid;
  uid;
  gname;
  uname;
  linkpath;
  dev;
  ino;
  nlink;
  path;
  size;
  mode;
  global;
  constructor(e4, t3 = false) {
    this.atime = e4.atime, this.charset = e4.charset, this.comment = e4.comment, this.ctime = e4.ctime, this.dev = e4.dev, this.gid = e4.gid, this.global = t3, this.gname = e4.gname, this.ino = e4.ino, this.linkpath = e4.linkpath, this.mtime = e4.mtime, this.nlink = e4.nlink, this.path = e4.path, this.size = e4.size, this.uid = e4.uid, this.uname = e4.uname;
  }
  encode() {
    let e4 = this.encodeBody();
    if (e4 === ``) return Buffer.allocUnsafe(0);
    let t3 = Buffer.byteLength(e4), n2 = 512 * Math.ceil(1 + t3 / 512), r2 = Buffer.allocUnsafe(n2);
    for (let e5 = 0; e5 < 512; e5++) r2[e5] = 0;
    new dr({ path: (`PaxHeader/` + re2(this.path ?? ``)).slice(0, 99), mode: this.mode || 420, uid: this.uid, gid: this.gid, size: t3, mtime: this.mtime, type: this.global ? `GlobalExtendedHeader` : `ExtendedHeader`, linkpath: ``, uname: this.uname || ``, gname: this.gname || ``, devmaj: 0, devmin: 0, atime: this.atime, ctime: this.ctime }).encode(r2), r2.write(e4, 512, t3, `utf8`);
    for (let e5 = t3 + 512; e5 < r2.length; e5++) r2[e5] = 0;
    return r2;
  }
  encodeBody() {
    return this.encodeField(`path`) + this.encodeField(`ctime`) + this.encodeField(`atime`) + this.encodeField(`dev`) + this.encodeField(`ino`) + this.encodeField(`nlink`) + this.encodeField(`charset`) + this.encodeField(`comment`) + this.encodeField(`gid`) + this.encodeField(`gname`) + this.encodeField(`linkpath`) + this.encodeField(`mtime`) + this.encodeField(`size`) + this.encodeField(`uid`) + this.encodeField(`uname`);
  }
  encodeField(e4) {
    if (this[e4] === void 0) return ``;
    let t3 = this[e4], n2 = t3 instanceof Date ? t3.getTime() / 1e3 : t3, r2 = ` ` + (e4 === `dev` || e4 === `ino` || e4 === `nlink` ? `SCHILY.` : ``) + e4 + `=` + n2 + `
`, i3 = Buffer.byteLength(r2), a3 = Math.floor(Math.log(i3) / Math.log(10)) + 1;
    return i3 + a3 >= 10 ** a3 && (a3 += 1), a3 + i3 + r2;
  }
  static parse(t3, n2, r2 = false) {
    return new e2(Or(kr(t3), n2), r2);
  }
};
var Or = (e4, t3) => t3 ? Object.assign({}, t3, e4) : e4;
var kr = (e4) => e4.replace(/\n$/, ``).split(`
`).reduce(Ar, /* @__PURE__ */ Object.create(null));
var Ar = (e4, t3) => {
  let n2 = parseInt(t3, 10);
  if (n2 !== Buffer.byteLength(t3) + 1) return e4;
  t3 = t3.slice((n2 + ` `).length);
  let r2 = t3.split(`=`), i3 = r2.shift();
  if (!i3) return e4;
  let a3 = i3.replace(/^SCHILY\.(dev|ino|nlink)/, `$1`), o3 = r2.join(`=`).replace(/\0.*/, ``);
  switch (a3) {
    case `path`:
    case `linkpath`:
    case `type`:
    case `charset`:
    case `comment`:
    case `gname`:
    case `uname`:
      e4[a3] = o3;
      break;
    case `ctime`:
    case `atime`:
    case `mtime`:
      e4[a3] = new Date(Number(o3) * 1e3);
      break;
    case `size`:
      let t4 = +o3;
      t4 >= 0 && (e4[a3] = t4);
      break;
    case `gid`:
    case `uid`:
    case `dev`:
    case `ino`:
    case `nlink`:
    case `mode`:
      e4[a3] = +o3;
      break;
  }
  return e4;
};
var V3 = (process.env.TESTING_TAR_FAKE_PLATFORM || process.platform) === `win32` ? (e4) => String(e4).replaceAll(/\\/g, `/`) : (e4) => String(e4);
var jr = class extends Yt {
  extended;
  globalExtended;
  header;
  startBlockSize;
  blockRemain;
  remain;
  type;
  meta = false;
  ignore = false;
  path;
  mode;
  uid;
  gid;
  uname;
  gname;
  size = 0;
  mtime;
  atime;
  ctime;
  linkpath;
  dev;
  ino;
  nlink;
  invalid = false;
  absolute;
  unsupported = false;
  constructor(e4, t3, n2) {
    switch (super({}), this.pause(), this.extended = t3, this.globalExtended = n2, this.header = e4, this.remain = e4.size ?? 0, this.startBlockSize = 512 * Math.ceil(this.remain / 512), this.blockRemain = this.startBlockSize, this.type = e4.type, this.type) {
      case `File`:
      case `OldFile`:
      case `Link`:
      case `SymbolicLink`:
      case `CharacterDevice`:
      case `BlockDevice`:
      case `Directory`:
      case `FIFO`:
      case `ContiguousFile`:
      case `GNUDumpDir`:
        break;
      case `NextFileHasLongLinkpath`:
      case `NextFileHasLongPath`:
      case `OldGnuLongPath`:
      case `GlobalExtendedHeader`:
      case `ExtendedHeader`:
      case `OldExtendedHeader`:
        this.meta = true;
        break;
      default:
        this.ignore = true;
    }
    if (!e4.path) throw Error(`no path provided for tar.ReadEntry`);
    this.path = V3(e4.path), this.mode = e4.mode, this.mode && (this.mode &= 4095), this.uid = e4.uid, this.gid = e4.gid, this.uname = e4.uname, this.gname = e4.gname, this.size = this.remain, this.mtime = e4.mtime, this.atime = e4.atime, this.ctime = e4.ctime, this.linkpath = e4.linkpath ? V3(e4.linkpath) : void 0, this.uname = e4.uname, this.gname = e4.gname, t3 && this.#e(t3), n2 && this.#e(n2, true);
  }
  write(e4) {
    let t3 = e4.length;
    if (t3 > this.blockRemain) throw Error(`writing more to entry than is appropriate`);
    let n2 = this.remain, r2 = this.blockRemain;
    return this.remain = Math.max(0, n2 - t3), this.blockRemain = Math.max(0, r2 - t3), this.ignore ? true : n2 >= t3 ? super.write(e4) : super.write(e4.subarray(0, n2));
  }
  #e(e4, t3 = false) {
    e4.path &&= V3(e4.path), e4.linkpath &&= V3(e4.linkpath), Object.assign(this, Object.fromEntries(Object.entries(e4).filter(([e5, n2]) => !(n2 == null || e5 === `path` && t3))));
  }
};
var Mr = (e4, t3, n2, r2 = {}) => {
  e4.file && (r2.file = e4.file), e4.cwd && (r2.cwd = e4.cwd), r2.code = n2 instanceof Error && n2.code || t3, r2.tarCode = t3, !e4.strict && r2.recoverable !== false ? (n2 instanceof Error && (r2 = Object.assign(n2, r2), n2 = n2.message), e4.emit(`warn`, t3, n2, r2)) : n2 instanceof Error ? e4.emit(`error`, Object.assign(n2, r2)) : e4.emit(`error`, Object.assign(Error(`${t3}: ${n2}`), r2));
};
var Nr = 1024 * 1024;
var Pr = Buffer.from([31, 139]);
var Fr = Buffer.from([40, 181, 47, 253]);
var Ir = Math.max(Pr.length, Fr.length);
var H2 = /* @__PURE__ */ Symbol(`state`);
var Lr = /* @__PURE__ */ Symbol(`writeEntry`);
var U2 = /* @__PURE__ */ Symbol(`readEntry`);
var Rr = /* @__PURE__ */ Symbol(`nextEntry`);
var zr = /* @__PURE__ */ Symbol(`processEntry`);
var W2 = /* @__PURE__ */ Symbol(`extendedHeader`);
var Br = /* @__PURE__ */ Symbol(`globalExtendedHeader`);
var Vr = /* @__PURE__ */ Symbol(`meta`);
var Hr = /* @__PURE__ */ Symbol(`emitMeta`);
var G2 = /* @__PURE__ */ Symbol(`buffer`);
var K2 = /* @__PURE__ */ Symbol(`queue`);
var Ur = /* @__PURE__ */ Symbol(`ended`);
var Wr = /* @__PURE__ */ Symbol(`emittedEnd`);
var Gr = /* @__PURE__ */ Symbol(`emit`);
var q2 = /* @__PURE__ */ Symbol(`unzip`);
var Kr = /* @__PURE__ */ Symbol(`consumeChunk`);
var qr = /* @__PURE__ */ Symbol(`consumeChunkSub`);
var Jr = /* @__PURE__ */ Symbol(`consumeBody`);
var Yr = /* @__PURE__ */ Symbol(`consumeMeta`);
var Xr = /* @__PURE__ */ Symbol(`consumeHeader`);
var Zr = /* @__PURE__ */ Symbol(`consuming`);
var Qr = /* @__PURE__ */ Symbol(`bufferConcat`);
var $r = /* @__PURE__ */ Symbol(`maybeEnd`);
var ei = /* @__PURE__ */ Symbol(`writing`);
var J2 = /* @__PURE__ */ Symbol(`aborted`);
var ti = /* @__PURE__ */ Symbol(`onDone`);
var ni = /* @__PURE__ */ Symbol(`sawValidEntry`);
var ri = /* @__PURE__ */ Symbol(`sawNullBlock`);
var ii = /* @__PURE__ */ Symbol(`sawEOF`);
var ai = /* @__PURE__ */ Symbol(`closeStream`);
var oi = 1e3;
var si = /* @__PURE__ */ Symbol(`compressedBytesRead`);
var ci = /* @__PURE__ */ Symbol(`decompressedBytesRead`);
var li = /* @__PURE__ */ Symbol(`checkDecompressionRatio`);
var ui = () => true;
var di = class extends ee2 {
  file;
  strict;
  maxMetaEntrySize;
  filter;
  brotli;
  zstd;
  maxDecompressionRatio;
  writable = true;
  readable = false;
  [K2] = [];
  [G2];
  [U2];
  [Lr];
  [H2] = `begin`;
  [Vr] = ``;
  [W2];
  [Br];
  [Ur] = false;
  [q2];
  [J2] = false;
  [ni];
  [ri] = false;
  [ii] = false;
  [ei] = false;
  [Zr] = false;
  [Wr] = false;
  [si] = 0;
  [ci] = 0;
  constructor(e4 = {}) {
    super(), this.file = e4.file || ``, this.on(ti, () => {
      (this[H2] === `begin` || this[ni] === false) && this.warn(`TAR_BAD_ARCHIVE`, `Unrecognized archive format`);
    }), e4.ondone ? this.on(ti, e4.ondone) : this.on(ti, () => {
      this.emit(`prefinish`), this.emit(`finish`), this.emit(`end`);
    }), this.strict = !!e4.strict, this.maxDecompressionRatio = typeof e4.maxDecompressionRatio == `number` ? e4.maxDecompressionRatio : oi, this.maxMetaEntrySize = e4.maxMetaEntrySize || Nr, this.filter = typeof e4.filter == `function` ? e4.filter : ui;
    let t3 = e4.file && (e4.file.endsWith(`.tar.br`) || e4.file.endsWith(`.tbr`));
    this.brotli = !(e4.gzip || e4.zstd) && e4.brotli !== void 0 ? e4.brotli : t3 ? void 0 : false;
    let n2 = e4.file && (e4.file.endsWith(`.tar.zst`) || e4.file.endsWith(`.tzst`));
    this.zstd = !(e4.gzip || e4.brotli) && e4.zstd !== void 0 ? e4.zstd : n2 ? true : void 0, this.on(`end`, () => this[ai]()), typeof e4.onwarn == `function` && this.on(`warn`, e4.onwarn), typeof e4.onReadEntry == `function` && this.on(`entry`, e4.onReadEntry);
  }
  warn(e4, t3, n2 = {}) {
    Mr(this, e4, t3, n2);
  }
  [Xr](e4, t3) {
    this[ni] === void 0 && (this[ni] = false);
    let n2;
    try {
      n2 = new dr(e4, t3, this[W2], this[Br]);
    } catch (e5) {
      return this.warn(`TAR_ENTRY_INVALID`, e5);
    }
    if (n2.nullBlock) this[ri] ? (this[ii] = true, this[H2] === `begin` && (this[H2] = `header`), this[Gr](`eof`)) : (this[ri] = true, this[Gr](`nullBlock`));
    else if (this[ri] = false, !n2.cksumValid) this.warn(`TAR_ENTRY_INVALID`, `checksum failure`, { header: n2 });
    else if (!n2.path) this.warn(`TAR_ENTRY_INVALID`, `path is required`, { header: n2 });
    else {
      let e5 = n2.type;
      if (/^(Symbolic)?Link$/.test(e5) && !n2.linkpath) this.warn(`TAR_ENTRY_INVALID`, `linkpath required`, { header: n2 });
      else if (!/^(Symbolic)?Link$/.test(e5) && !/^(Global)?ExtendedHeader$/.test(e5) && n2.linkpath) this.warn(`TAR_ENTRY_INVALID`, `linkpath forbidden`, { header: n2 });
      else {
        let e6 = this[Lr] = new jr(n2, this[W2], this[Br]);
        this[ni] || (e6.remain ? e6.on(`end`, () => {
          e6.invalid || (this[ni] = true);
        }) : this[ni] = true), e6.meta ? e6.size > this.maxMetaEntrySize ? (e6.ignore = true, this[Gr](`ignoredEntry`, e6), this[H2] = `ignore`, e6.resume()) : e6.size > 0 && (this[Vr] = ``, e6.on(`data`, (e7) => this[Vr] += e7), this[H2] = `meta`) : (this[W2] = void 0, e6.ignore = e6.ignore || !this.filter(e6.path, e6), e6.ignore ? (this[Gr](`ignoredEntry`, e6), this[H2] = e6.remain ? `ignore` : `header`, e6.resume()) : (e6.remain ? this[H2] = `body` : (this[H2] = `header`, e6.end()), this[U2] ? this[K2].push(e6) : (this[K2].push(e6), this[Rr]())));
      }
    }
  }
  [ai]() {
    queueMicrotask(() => this.emit(`close`));
  }
  [zr](e4) {
    let t3 = true;
    if (!e4) this[U2] = void 0, t3 = false;
    else if (Array.isArray(e4)) {
      let [t4, ...n2] = e4;
      this.emit(t4, ...n2);
    } else this[U2] = e4, this.emit(`entry`, e4), e4.emittedEnd || (e4.on(`end`, () => this[Rr]()), t3 = false);
    return t3;
  }
  [Rr]() {
    do
      ;
    while (this[zr](this[K2].shift()));
    if (this[K2].length === 0) {
      let e4 = this[U2];
      !e4 || e4.flowing || e4.size === e4.remain ? this[ei] || this.emit(`drain`) : e4.once(`drain`, () => this.emit(`drain`));
    }
  }
  [Jr](e4, t3) {
    let n2 = this[Lr];
    if (!n2) throw Error(`attempt to consume body without entry??`);
    let r2 = n2.blockRemain ?? 0, i3 = r2 >= e4.length && t3 === 0 ? e4 : e4.subarray(t3, t3 + r2);
    return n2.write(i3), n2.blockRemain || (this[H2] = `header`, this[Lr] = void 0, n2.end()), i3.length;
  }
  [Yr](e4, t3) {
    let n2 = this[Lr], r2 = this[Jr](e4, t3);
    return !this[Lr] && n2 && this[Hr](n2), r2;
  }
  [Gr](e4, t3, n2) {
    this[K2].length === 0 && !this[U2] ? this.emit(e4, t3, n2) : this[K2].push([e4, t3, n2]);
  }
  [Hr](e4) {
    switch (this[Gr](`meta`, this[Vr]), e4.type) {
      case `ExtendedHeader`:
      case `OldExtendedHeader`:
        this[W2] = Dr.parse(this[Vr], this[W2], false);
        break;
      case `GlobalExtendedHeader`:
        this[Br] = Dr.parse(this[Vr], this[Br], true);
        break;
      case `NextFileHasLongPath`:
      case `OldGnuLongPath`: {
        let e5 = this[W2] ?? /* @__PURE__ */ Object.create(null);
        this[W2] = e5, e5.path = this[Vr].replace(/\0.*/, ``);
        break;
      }
      case `NextFileHasLongLinkpath`: {
        let e5 = this[W2] || /* @__PURE__ */ Object.create(null);
        this[W2] = e5, e5.linkpath = this[Vr].replace(/\0.*/, ``);
        break;
      }
      default:
        throw Error(`unknown meta: ` + e4.type);
    }
  }
  abort(e4) {
    if (!this[J2]) {
      if (this[q2]) {
        let e5 = this[q2];
        e5.write = () => true, e5.end = () => e5, e5.emit = () => false, e5.destroy?.();
      }
      this[J2] = true, this.emit(`abort`, e4), this.warn(`TAR_ABORT`, e4, { recoverable: false });
    }
  }
  [li](e4) {
    this[ci] += e4.length;
    let t3 = this[ci] / this[si];
    return t3 > this.maxDecompressionRatio ? (this.abort(Error(`max decompression ratio exceeded: ${t3.toFixed(2)} > ${this.maxDecompressionRatio}`)), false) : true;
  }
  write(e4, t3, n2) {
    if (typeof t3 == `function` && (n2 = t3, t3 = void 0), typeof e4 == `string` && (e4 = Buffer.from(e4, typeof t3 == `string` ? t3 : `utf8`)), this[J2]) return n2?.(), false;
    if ((this[q2] === void 0 || this.brotli === void 0 && this[q2] === false) && e4) {
      if (this[G2] && (e4 = Buffer.concat([this[G2], e4]), this[G2] = void 0), e4.length < Ir) return this[G2] = e4, n2?.(), true;
      for (let t5 = 0; this[q2] === void 0 && t5 < Pr.length; t5++) e4[t5] !== Pr[t5] && (this[q2] = false);
      let t4 = false;
      if (this[q2] === false && this.zstd !== false) {
        t4 = true;
        for (let n3 = 0; n3 < Fr.length; n3++) if (e4[n3] !== Fr[n3]) {
          t4 = false;
          break;
        }
      }
      let r3 = this.brotli === void 0 && !t4;
      if (this[q2] === false && r3) if (e4.length < 512) if (this[Ur]) this.brotli = true;
      else return this[G2] = e4, n2?.(), true;
      else try {
        new dr(e4.subarray(0, 512)), this.brotli = false;
      } catch {
        this.brotli = true;
      }
      if (this[q2] === void 0 || this[q2] === false && (this.brotli || t4)) {
        let r4 = this[Ur];
        this[Ur] = false, this[q2] = this[q2] === void 0 ? new Wn({}) : t4 ? new Xn({}) : new qn({}), this[q2].on(`data`, (e5) => {
          this[li](e5) && this[Kr](e5);
        }), this[q2].on(`error`, (e5) => {
          this[J2] || this.abort(e5);
        }), this[q2].on(`end`, () => {
          this[Ur] = true, this[Kr]();
        }), this[ei] = true, this[si] += e4.length;
        let i3 = !!this[q2][r4 ? `end` : `write`](e4);
        return this[ei] = false, n2?.(), i3;
      }
    }
    this[ei] = true, this[q2] ? (this[si] += e4.length, this[q2].write(e4)) : this[Kr](e4), this[ei] = false;
    let r2 = this[K2].length > 0 ? false : this[U2] ? this[U2].flowing : true;
    return !r2 && this[K2].length === 0 && this[U2]?.once(`drain`, () => this.emit(`drain`)), n2?.(), r2;
  }
  [Qr](e4) {
    e4 && !this[J2] && (this[G2] = this[G2] ? Buffer.concat([this[G2], e4]) : e4);
  }
  [$r]() {
    if (this[Ur] && !this[Wr] && !this[J2] && !this[Zr]) {
      this[Wr] = true;
      let e4 = this[Lr];
      if (e4?.blockRemain) {
        let t3 = this[G2] ? this[G2].length : 0;
        this.warn(`TAR_BAD_ARCHIVE`, `Truncated input (needed ${e4.blockRemain} more bytes, only ${t3} available)`, { entry: e4 }), this[G2] && e4.write(this[G2]), e4.end();
      }
      this[Gr](ti);
    }
  }
  [Kr](e4) {
    if (this[Zr] && e4) this[Qr](e4);
    else if (!e4 && !this[G2]) this[$r]();
    else if (e4) {
      if (this[Zr] = true, this[G2]) {
        this[Qr](e4);
        let t3 = this[G2];
        this[G2] = void 0, this[qr](t3);
      } else this[qr](e4);
      for (; this[G2] && this[G2]?.length >= 512 && !this[J2] && !this[ii]; ) {
        let e5 = this[G2];
        this[G2] = void 0, this[qr](e5);
      }
      this[Zr] = false;
    }
    (!this[G2] || this[Ur]) && this[$r]();
  }
  [qr](e4) {
    let t3 = 0, n2 = e4.length;
    for (; t3 + 512 <= n2 && !this[J2] && !this[ii]; ) switch (this[H2]) {
      case `begin`:
      case `header`:
        this[Xr](e4, t3), t3 += 512;
        break;
      case `ignore`:
      case `body`:
        t3 += this[Jr](e4, t3);
        break;
      case `meta`:
        t3 += this[Yr](e4, t3);
        break;
      default:
        throw Error(`invalid state: ` + this[H2]);
    }
    t3 < n2 && (this[G2] = this[G2] ? Buffer.concat([e4.subarray(t3), this[G2]]) : e4.subarray(t3));
  }
  end(e4, t3, n2) {
    return typeof e4 == `function` && (n2 = e4, t3 = void 0, e4 = void 0), typeof t3 == `function` && (n2 = t3, t3 = void 0), typeof e4 == `string` && (e4 = Buffer.from(e4, t3)), n2 && this.once(`finish`, n2), this[J2] || (this[q2] ? (e4 && (this[si] += e4.length, this[q2].write(e4)), this[q2].end()) : (this[Ur] = true, (this.brotli === void 0 || this.zstd === void 0) && (e4 ||= Buffer.alloc(0)), e4 && this.write(e4), this[$r]())), this;
  }
};
var fi = (e4) => {
  let t3 = e4.length - 1, n2 = -1;
  for (; t3 > -1 && e4.charAt(t3) === `/`; ) n2 = t3, t3--;
  return n2 === -1 ? e4 : e4.slice(0, n2);
};
var pi = (e4) => {
  let t3 = e4.onReadEntry;
  e4.onReadEntry = t3 ? (e5) => {
    t3(e5), e5.resume();
  } : (e5) => e5.resume();
};
var mi = (e4, t3) => {
  let n2 = new Map(t3.map((e5) => [fi(e5), true])), r2 = e4.filter, i3 = (e5, t4 = ``, r3 = 0) => {
    if (r3 >= 100) return n2.set(e5, false), false;
    let a3 = t4 || ne2(e5).root || `.`, o3;
    if (e5 === a3) o3 = false;
    else {
      let t5 = n2.get(e5);
      o3 = t5 === void 0 ? i3(te2(e5), a3, r3 + 1) : t5;
    }
    return n2.set(e5, o3), o3;
  };
  e4.filter = r2 ? (e5, t4) => r2(e5, t4) && i3(fi(e5)) : (e5) => i3(fi(e5));
};
var hi = Mn((e4) => {
  let t3 = new di(e4), n2 = e4.file, r2;
  try {
    r2 = m3.openSync(n2, `r`);
    let i3 = m3.fstatSync(r2), a3 = e4.maxReadSize || 16 * 1024 * 1024;
    if (i3.size < a3) {
      let e5 = Buffer.allocUnsafe(i3.size), n3 = m3.readSync(r2, e5, 0, i3.size, 0);
      t3.end(n3 === e5.byteLength ? e5 : e5.subarray(0, n3));
    } else {
      let e5 = 0, n3 = Buffer.allocUnsafe(a3);
      for (; e5 < i3.size; ) {
        let i4 = m3.readSync(r2, n3, 0, a3, e5);
        if (i4 === 0) break;
        e5 += i4, t3.write(n3.subarray(0, i4));
      }
      t3.end();
    }
  } finally {
    if (typeof r2 == `number`) try {
      m3.closeSync(r2);
    } catch {
    }
  }
}, (e4, t3) => {
  let n2 = new di(e4), r2 = e4.maxReadSize || 16 * 1024 * 1024, i3 = e4.file;
  return new Promise((e5, t4) => {
    n2.on(`error`, t4), n2.on(`end`, e5), m3.stat(i3, (e6, a3) => {
      if (e6) t4(e6);
      else {
        let e7 = new bn(i3, { readSize: r2, size: a3.size });
        e7.on(`error`, t4), e7.pipe(n2);
      }
    });
  });
}, (e4) => new di(e4), (e4) => new di(e4), (e4, t3) => {
  t3?.length && mi(e4, t3), e4.noResume || pi(e4);
});
var gi = (e4, t3, n2) => (e4 &= 4095, n2 && (e4 = (e4 | 384) & -19), t3 && (e4 & 256 && (e4 |= 64), e4 & 32 && (e4 |= 8), e4 & 4 && (e4 |= 1)), e4);
var { isAbsolute: _i, parse: vi } = oe2;
var yi = (e4) => {
  let t3 = ``, n2 = vi(e4);
  for (; _i(e4) || n2.root; ) {
    let r2 = e4.charAt(0) === `/` && e4.slice(0, 4) !== `//?/` ? `/` : n2.root;
    e4 = e4.slice(r2.length), t3 += r2, n2 = vi(e4);
  }
  return [t3, e4];
};
var bi = [`|`, `<`, `>`, `?`, `:`];
var xi = bi.map((e4) => String.fromCodePoint(61440 + Number(e4.codePointAt(0))));
var Si = new Map(bi.map((e4, t3) => [e4, xi[t3]]));
var Ci = new Map(xi.map((e4, t3) => [e4, bi[t3]]));
var wi = (e4) => bi.reduce((e5, t3) => e5.split(t3).join(Si.get(t3)), e4);
var Ti = (e4) => xi.reduce((e5, t3) => e5.split(t3).join(Ci.get(t3)), e4);
var Ei = (e4, t3) => t3 ? (e4 = V3(e4).replace(/^\.(\/|$)/, ``), fi(t3) + `/` + e4) : V3(e4);
var Di = 16 * 1024 * 1024;
var Oi = /* @__PURE__ */ Symbol(`process`);
var ki = /* @__PURE__ */ Symbol(`file`);
var Ai = /* @__PURE__ */ Symbol(`directory`);
var ji = /* @__PURE__ */ Symbol(`symlink`);
var Mi = /* @__PURE__ */ Symbol(`hardlink`);
var Ni = /* @__PURE__ */ Symbol(`header`);
var Pi = /* @__PURE__ */ Symbol(`read`);
var Fi = /* @__PURE__ */ Symbol(`lstat`);
var Ii = /* @__PURE__ */ Symbol(`onlstat`);
var Li = /* @__PURE__ */ Symbol(`onread`);
var Ri = /* @__PURE__ */ Symbol(`onreadlink`);
var zi = /* @__PURE__ */ Symbol(`openfile`);
var Bi = /* @__PURE__ */ Symbol(`onopenfile`);
var Vi = /* @__PURE__ */ Symbol(`close`);
var Hi = /* @__PURE__ */ Symbol(`mode`);
var Ui = /* @__PURE__ */ Symbol(`awaitDrain`);
var Wi = /* @__PURE__ */ Symbol(`ondrain`);
var Y2 = /* @__PURE__ */ Symbol(`prefix`);
var Gi = class extends Yt {
  path;
  portable;
  myuid = process.getuid && process.getuid() || 0;
  myuser = process.env.USER || ``;
  maxReadSize;
  linkCache;
  statCache;
  preservePaths;
  cwd;
  strict;
  mtime;
  noPax;
  noMtime;
  prefix;
  fd;
  blockLen = 0;
  blockRemain = 0;
  buf;
  pos = 0;
  remain = 0;
  length = 0;
  offset = 0;
  win32;
  absolute;
  header;
  type;
  linkpath;
  stat;
  onWriteEntry;
  #e = false;
  constructor(e4, t3 = {}) {
    let n2 = jn(t3);
    super(), this.path = V3(e4), this.portable = !!n2.portable, this.maxReadSize = n2.maxReadSize || Di, this.linkCache = n2.linkCache || /* @__PURE__ */ new Map(), this.statCache = n2.statCache || /* @__PURE__ */ new Map(), this.preservePaths = !!n2.preservePaths, this.cwd = V3(n2.cwd || process.cwd()), this.strict = !!n2.strict, this.noPax = !!n2.noPax, this.noMtime = !!n2.noMtime, this.mtime = n2.mtime, this.prefix = n2.prefix ? V3(n2.prefix) : void 0, this.onWriteEntry = n2.onWriteEntry, typeof n2.onwarn == `function` && this.on(`warn`, n2.onwarn);
    let r2 = false;
    if (!this.preservePaths) {
      let [e5, t4] = yi(this.path);
      e5 && typeof t4 == `string` && (this.path = t4, r2 = e5);
    }
    this.win32 = !!n2.win32 || process.platform === `win32`, this.win32 && (this.path = Ti(this.path.replaceAll(/\\/g, `/`)), e4 = e4.replaceAll(/\\/g, `/`)), this.absolute = V3(n2.absolute || y3.resolve(this.cwd, e4)), this.path === `` && (this.path = `./`), r2 && this.warn(`TAR_ENTRY_INFO`, `stripping ${r2} from absolute path`, { entry: this, path: r2 + this.path });
    let i3 = this.statCache.get(this.absolute);
    i3 ? this[Ii](i3) : this[Fi]();
  }
  warn(e4, t3, n2 = {}) {
    return Mr(this, e4, t3, n2);
  }
  emit(e4, ...t3) {
    return e4 === `error` && (this.#e = true), super.emit(e4, ...t3);
  }
  [Fi]() {
    v3.lstat(this.absolute, (e4, t3) => {
      if (e4) return this.emit(`error`, e4);
      this[Ii](t3);
    });
  }
  [Ii](e4) {
    this.statCache.set(this.absolute, e4), this.stat = e4, e4.isFile() || (e4.size = 0), this.type = Ji(e4), this.emit(`stat`, e4), this[Oi]();
  }
  [Oi]() {
    switch (this.type) {
      case `File`:
        return this[ki]();
      case `Directory`:
        return this[Ai]();
      case `SymbolicLink`:
        return this[ji]();
      default:
        return this.end();
    }
  }
  [Hi](e4) {
    return gi(e4, this.type === `Directory`, this.portable);
  }
  [Y2](e4) {
    return Ei(e4, this.prefix);
  }
  [Ni]() {
    if (!this.stat) throw Error(`cannot write header before stat`);
    this.type === `Directory` && this.portable && (this.noMtime = true), this.onWriteEntry?.(this), this.header = new dr({ path: this[Y2](this.path), linkpath: this.type === `Link` && this.linkpath !== void 0 ? this[Y2](this.linkpath) : this.linkpath, mode: this[Hi](this.stat.mode), uid: this.portable ? void 0 : this.stat.uid, gid: this.portable ? void 0 : this.stat.gid, size: this.stat.size, mtime: this.noMtime ? void 0 : this.mtime || this.stat.mtime, type: this.type === `Unsupported` ? void 0 : this.type, uname: this.portable ? void 0 : this.stat.uid === this.myuid ? this.myuser : ``, atime: this.portable ? void 0 : this.stat.atime, ctime: this.portable ? void 0 : this.stat.ctime }), this.header.encode() && !this.noPax && super.write(new Dr({ atime: this.portable ? void 0 : this.header.atime, ctime: this.portable ? void 0 : this.header.ctime, gid: this.portable ? void 0 : this.header.gid, mtime: this.noMtime ? void 0 : this.mtime || this.header.mtime, path: this[Y2](this.path), linkpath: this.type === `Link` && this.linkpath !== void 0 ? this[Y2](this.linkpath) : this.linkpath, size: this.header.size, uid: this.portable ? void 0 : this.header.uid, uname: this.portable ? void 0 : this.header.uname, dev: this.portable ? void 0 : this.stat.dev, ino: this.portable ? void 0 : this.stat.ino, nlink: this.portable ? void 0 : this.stat.nlink }).encode());
    let e4 = this.header?.block;
    if (!e4) throw Error(`failed to encode header`);
    super.write(e4);
  }
  [Ai]() {
    if (!this.stat) throw Error(`cannot create directory entry without stat`);
    this.path.slice(-1) !== `/` && (this.path += `/`), this.stat.size = 0, this[Ni](), this.end();
  }
  [ji]() {
    v3.readlink(this.absolute, (e4, t3) => {
      if (e4) return this.emit(`error`, e4);
      this[Ri](t3);
    });
  }
  [Ri](e4) {
    this.linkpath = V3(e4), this[Ni](), this.end();
  }
  [Mi](e4) {
    if (!this.stat) throw Error(`cannot create link entry without stat`);
    this.type = `Link`, this.linkpath = V3(y3.relative(this.cwd, e4)), this.stat.size = 0, this[Ni](), this.end();
  }
  [ki]() {
    if (!this.stat) throw Error(`cannot create file entry without stat`);
    if (this.stat.nlink > 1) {
      let e4 = `${this.stat.dev}:${this.stat.ino}`, t3 = this.linkCache.get(e4);
      if (t3?.indexOf(this.cwd) === 0) return this[Mi](t3);
      this.linkCache.set(e4, this.absolute);
    }
    if (this[Ni](), this.stat.size === 0) return this.end();
    this[zi]();
  }
  [zi]() {
    v3.open(this.absolute, `r`, (e4, t3) => {
      if (e4) return this.emit(`error`, e4);
      this[Bi](t3);
    });
  }
  [Bi](e4) {
    if (this.fd = e4, this.#e) return this[Vi]();
    if (!this.stat) throw Error(`should stat before calling onopenfile`);
    this.blockLen = 512 * Math.ceil(this.stat.size / 512), this.blockRemain = this.blockLen;
    let t3 = Math.min(this.blockLen, this.maxReadSize);
    this.buf = Buffer.allocUnsafe(t3), this.offset = 0, this.pos = 0, this.remain = this.stat.size, this.length = this.buf.length, this[Pi]();
  }
  [Pi]() {
    let { fd: e4, buf: t3, offset: n2, length: r2, pos: i3 } = this;
    if (e4 === void 0 || t3 === void 0) throw Error(`cannot read file without first opening`);
    v3.read(e4, t3, n2, r2, i3, (e5, t4) => {
      if (e5) return this[Vi](() => this.emit(`error`, e5));
      this[Li](t4);
    });
  }
  [Vi](e4 = () => {
  }) {
    this.fd !== void 0 && v3.close(this.fd, e4);
  }
  [Li](e4) {
    if (e4 <= 0 && this.remain > 0) {
      let e5 = Object.assign(Error(`encountered unexpected EOF`), { path: this.absolute, syscall: `read`, code: `EOF` });
      return this[Vi](() => this.emit(`error`, e5));
    }
    if (e4 > this.remain) {
      let e5 = Object.assign(Error(`did not encounter expected EOF`), { path: this.absolute, syscall: `read`, code: `EOF` });
      return this[Vi](() => this.emit(`error`, e5));
    }
    if (!this.buf) throw Error(`should have created buffer prior to reading`);
    if (e4 === this.remain) for (let t4 = e4; t4 < this.length && e4 < this.blockRemain; t4++) this.buf[t4 + this.offset] = 0, e4++, this.remain++;
    let t3 = this.offset === 0 && e4 === this.buf.length ? this.buf : this.buf.subarray(this.offset, this.offset + e4);
    this.write(t3) ? this[Wi]() : this[Ui](() => this[Wi]());
  }
  [Ui](e4) {
    this.once(`drain`, e4);
  }
  write(e4, t3, n2) {
    if (typeof t3 == `function` && (n2 = t3, t3 = void 0), typeof e4 == `string` && (e4 = Buffer.from(e4, typeof t3 == `string` ? t3 : `utf8`)), this.blockRemain < e4.length) {
      let e5 = Object.assign(Error(`writing more data than expected`), { path: this.absolute });
      return this.emit(`error`, e5);
    }
    return this.remain -= e4.length, this.blockRemain -= e4.length, this.pos += e4.length, this.offset += e4.length, super.write(e4, null, n2);
  }
  [Wi]() {
    if (!this.remain) return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), this[Vi]((e4) => e4 ? this.emit(`error`, e4) : this.end());
    if (!this.buf) throw Error(`buffer lost somehow in ONDRAIN`);
    this.offset >= this.length && (this.buf = Buffer.allocUnsafe(Math.min(this.blockRemain, this.buf.length)), this.offset = 0), this.length = this.buf.length - this.offset, this[Pi]();
  }
};
var Ki = class extends Gi {
  sync = true;
  [Fi]() {
    this[Ii](v3.lstatSync(this.absolute));
  }
  [ji]() {
    this[Ri](v3.readlinkSync(this.absolute));
  }
  [zi]() {
    this[Bi](v3.openSync(this.absolute, `r`));
  }
  [Pi]() {
    let e4 = true;
    try {
      let { fd: t3, buf: n2, offset: r2, length: i3, pos: a3 } = this;
      if (t3 === void 0 || n2 === void 0) throw Error(`fd and buf must be set in READ method`);
      let o3 = v3.readSync(t3, n2, r2, i3, a3);
      this[Li](o3), e4 = false;
    } finally {
      if (e4) try {
        this[Vi](() => {
        });
      } catch {
      }
    }
  }
  [Ui](e4) {
    e4();
  }
  [Vi](e4 = () => {
  }) {
    this.fd !== void 0 && v3.closeSync(this.fd), e4();
  }
};
var qi = class extends Yt {
  blockLen = 0;
  blockRemain = 0;
  buf = 0;
  pos = 0;
  remain = 0;
  length = 0;
  preservePaths;
  portable;
  strict;
  noPax;
  noMtime;
  readEntry;
  type;
  prefix;
  path;
  mode;
  uid;
  gid;
  uname;
  gname;
  header;
  mtime;
  atime;
  ctime;
  linkpath;
  size;
  onWriteEntry;
  warn(e4, t3, n2 = {}) {
    return Mr(this, e4, t3, n2);
  }
  constructor(e4, t3 = {}) {
    let n2 = jn(t3);
    super(), this.preservePaths = !!n2.preservePaths, this.portable = !!n2.portable, this.strict = !!n2.strict, this.noPax = !!n2.noPax, this.noMtime = !!n2.noMtime, this.onWriteEntry = n2.onWriteEntry, this.readEntry = e4;
    let { type: r2 } = e4;
    if (r2 === `Unsupported`) throw Error(`writing entry that should be ignored`);
    this.type = r2, this.type === `Directory` && this.portable && (this.noMtime = true), this.prefix = n2.prefix, this.path = V3(e4.path), this.mode = e4.mode === void 0 ? void 0 : this[Hi](e4.mode), this.uid = this.portable ? void 0 : e4.uid, this.gid = this.portable ? void 0 : e4.gid, this.uname = this.portable ? void 0 : e4.uname, this.gname = this.portable ? void 0 : e4.gname, this.size = e4.size, this.mtime = this.noMtime ? void 0 : n2.mtime || e4.mtime, this.atime = this.portable ? void 0 : e4.atime, this.ctime = this.portable ? void 0 : e4.ctime, this.linkpath = e4.linkpath === void 0 ? void 0 : V3(e4.linkpath), typeof n2.onwarn == `function` && this.on(`warn`, n2.onwarn);
    let i3 = false;
    if (!this.preservePaths) {
      let [e5, t4] = yi(this.path);
      e5 && typeof t4 == `string` && (this.path = t4, i3 = e5);
    }
    this.remain = e4.size, this.blockRemain = e4.startBlockSize, this.onWriteEntry?.(this), this.header = new dr({ path: this[Y2](this.path), linkpath: this.type === `Link` && this.linkpath !== void 0 ? this[Y2](this.linkpath) : this.linkpath, mode: this.mode, uid: this.portable ? void 0 : this.uid, gid: this.portable ? void 0 : this.gid, size: this.size, mtime: this.noMtime ? void 0 : this.mtime, type: this.type, uname: this.portable ? void 0 : this.uname, atime: this.portable ? void 0 : this.atime, ctime: this.portable ? void 0 : this.ctime }), i3 && this.warn(`TAR_ENTRY_INFO`, `stripping ${i3} from absolute path`, { entry: this, path: i3 + this.path }), this.header.encode() && !this.noPax && super.write(new Dr({ atime: this.portable ? void 0 : this.atime, ctime: this.portable ? void 0 : this.ctime, gid: this.portable ? void 0 : this.gid, mtime: this.noMtime ? void 0 : this.mtime, path: this[Y2](this.path), linkpath: this.type === `Link` && this.linkpath !== void 0 ? this[Y2](this.linkpath) : this.linkpath, size: this.size, uid: this.portable ? void 0 : this.uid, uname: this.portable ? void 0 : this.uname, dev: this.portable ? void 0 : this.readEntry.dev, ino: this.portable ? void 0 : this.readEntry.ino, nlink: this.portable ? void 0 : this.readEntry.nlink }).encode());
    let a3 = this.header?.block;
    if (!a3) throw Error(`failed to encode header`);
    super.write(a3), e4.pipe(this);
  }
  [Y2](e4) {
    return Ei(e4, this.prefix);
  }
  [Hi](e4) {
    return gi(e4, this.type === `Directory`, this.portable);
  }
  write(e4, t3, n2) {
    typeof t3 == `function` && (n2 = t3, t3 = void 0), typeof e4 == `string` && (e4 = Buffer.from(e4, typeof t3 == `string` ? t3 : `utf8`));
    let r2 = e4.length;
    if (r2 > this.blockRemain) throw Error(`writing more to entry than is appropriate`);
    return this.blockRemain -= r2, super.write(e4, n2);
  }
  end(e4, t3, n2) {
    return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), typeof e4 == `function` && (n2 = e4, t3 = void 0, e4 = void 0), typeof t3 == `function` && (n2 = t3, t3 = void 0), typeof e4 == `string` && (e4 = Buffer.from(e4, t3 ?? `utf8`)), n2 && this.once(`finish`, n2), e4 ? super.end(e4, n2) : super.end(n2), this;
  }
};
var Ji = (e4) => e4.isFile() ? `File` : e4.isDirectory() ? `Directory` : e4.isSymbolicLink() ? `SymbolicLink` : `Unsupported`;
var Yi = class e3 {
  tail;
  head;
  length = 0;
  static create(t3 = []) {
    return new e3(t3);
  }
  constructor(e4 = []) {
    for (let t3 of e4) this.push(t3);
  }
  *[Symbol.iterator]() {
    for (let e4 = this.head; e4; e4 = e4.next) yield e4.value;
  }
  removeNode(e4) {
    if (e4.list !== this) throw Error(`removing node which does not belong to this list`);
    let t3 = e4.next, n2 = e4.prev;
    return t3 && (t3.prev = n2), n2 && (n2.next = t3), e4 === this.head && (this.head = t3), e4 === this.tail && (this.tail = n2), this.length--, e4.next = void 0, e4.prev = void 0, e4.list = void 0, t3;
  }
  unshiftNode(e4) {
    if (e4 === this.head) return;
    e4.list && e4.list.removeNode(e4);
    let t3 = this.head;
    e4.list = this, e4.next = t3, t3 && (t3.prev = e4), this.head = e4, this.tail ||= e4, this.length++;
  }
  pushNode(e4) {
    if (e4 === this.tail) return;
    e4.list && e4.list.removeNode(e4);
    let t3 = this.tail;
    e4.list = this, e4.prev = t3, t3 && (t3.next = e4), this.tail = e4, this.head ||= e4, this.length++;
  }
  push(...e4) {
    for (let t3 = 0, n2 = e4.length; t3 < n2; t3++) Zi(this, e4[t3]);
    return this.length;
  }
  unshift(...e4) {
    for (var t3 = 0, n2 = e4.length; t3 < n2; t3++) Qi(this, e4[t3]);
    return this.length;
  }
  pop() {
    if (!this.tail) return;
    let e4 = this.tail.value, t3 = this.tail;
    return this.tail = this.tail.prev, this.tail ? this.tail.next = void 0 : this.head = void 0, t3.list = void 0, this.length--, e4;
  }
  shift() {
    if (!this.head) return;
    let e4 = this.head.value, t3 = this.head;
    return this.head = this.head.next, this.head ? this.head.prev = void 0 : this.tail = void 0, t3.list = void 0, this.length--, e4;
  }
  forEach(e4, t3) {
    t3 ||= this;
    for (let n2 = this.head, r2 = 0; n2; r2++) e4.call(t3, n2.value, r2, this), n2 = n2.next;
  }
  forEachReverse(e4, t3) {
    t3 ||= this;
    for (let n2 = this.tail, r2 = this.length - 1; n2; r2--) e4.call(t3, n2.value, r2, this), n2 = n2.prev;
  }
  get(e4) {
    let t3 = 0, n2 = this.head;
    for (; n2 && t3 < e4; t3++) n2 = n2.next;
    if (t3 === e4 && n2) return n2.value;
  }
  getReverse(e4) {
    let t3 = 0, n2 = this.tail;
    for (; n2 && t3 < e4; t3++) n2 = n2.prev;
    if (t3 === e4 && n2) return n2.value;
  }
  map(t3, n2) {
    n2 ||= this;
    let r2 = new e3();
    for (let e4 = this.head; e4; ) r2.push(t3.call(n2, e4.value, this)), e4 = e4.next;
    return r2;
  }
  mapReverse(t3, n2) {
    n2 ||= this;
    var r2 = new e3();
    for (let e4 = this.tail; e4; ) r2.push(t3.call(n2, e4.value, this)), e4 = e4.prev;
    return r2;
  }
  reduce(e4, t3) {
    let n2, r2 = this.head;
    if (arguments.length > 1) n2 = t3;
    else if (this.head) r2 = this.head.next, n2 = this.head.value;
    else throw TypeError(`Reduce of empty list with no initial value`);
    for (var i3 = 0; r2; i3++) n2 = e4(n2, r2.value, i3), r2 = r2.next;
    return n2;
  }
  reduceReverse(e4, t3) {
    let n2, r2 = this.tail;
    if (arguments.length > 1) n2 = t3;
    else if (this.tail) r2 = this.tail.prev, n2 = this.tail.value;
    else throw TypeError(`Reduce of empty list with no initial value`);
    for (let t4 = this.length - 1; r2; t4--) n2 = e4(n2, r2.value, t4), r2 = r2.prev;
    return n2;
  }
  toArray() {
    let e4 = Array(this.length);
    for (let t3 = 0, n2 = this.head; n2; t3++) e4[t3] = n2.value, n2 = n2.next;
    return e4;
  }
  toArrayReverse() {
    let e4 = Array(this.length);
    for (let t3 = 0, n2 = this.tail; n2; t3++) e4[t3] = n2.value, n2 = n2.prev;
    return e4;
  }
  slice(t3 = 0, n2 = this.length) {
    n2 < 0 && (n2 += this.length), t3 < 0 && (t3 += this.length);
    let r2 = new e3();
    if (n2 < t3 || n2 < 0) return r2;
    t3 < 0 && (t3 = 0), n2 > this.length && (n2 = this.length);
    let i3 = this.head, a3 = 0;
    for (a3 = 0; i3 && a3 < t3; a3++) i3 = i3.next;
    for (; i3 && a3 < n2; a3++, i3 = i3.next) r2.push(i3.value);
    return r2;
  }
  sliceReverse(t3 = 0, n2 = this.length) {
    n2 < 0 && (n2 += this.length), t3 < 0 && (t3 += this.length);
    let r2 = new e3();
    if (n2 < t3 || n2 < 0) return r2;
    t3 < 0 && (t3 = 0), n2 > this.length && (n2 = this.length);
    let i3 = this.length, a3 = this.tail;
    for (; a3 && i3 > n2; i3--) a3 = a3.prev;
    for (; a3 && i3 > t3; i3--, a3 = a3.prev) r2.push(a3.value);
    return r2;
  }
  splice(e4, t3 = 0, ...n2) {
    e4 > this.length && (e4 = this.length - 1), e4 < 0 && (e4 = this.length + e4);
    let r2 = this.head;
    for (let t4 = 0; r2 && t4 < e4; t4++) r2 = r2.next;
    let i3 = [];
    for (let e5 = 0; r2 && e5 < t3; e5++) i3.push(r2.value), r2 = this.removeNode(r2);
    r2 ? r2 !== this.tail && (r2 = r2.prev) : r2 = this.tail;
    for (let e5 of n2) r2 = Xi(this, r2, e5);
    return i3;
  }
  reverse() {
    let e4 = this.head, t3 = this.tail;
    for (let t4 = e4; t4; t4 = t4.prev) {
      let e5 = t4.prev;
      t4.prev = t4.next, t4.next = e5;
    }
    return this.head = t3, this.tail = e4, this;
  }
};
function Xi(e4, t3, n2) {
  let r2 = new $i(n2, t3, t3 ? t3.next : e4.head, e4);
  return r2.next === void 0 && (e4.tail = r2), r2.prev === void 0 && (e4.head = r2), e4.length++, r2;
}
function Zi(e4, t3) {
  e4.tail = new $i(t3, e4.tail, void 0, e4), e4.head ||= e4.tail, e4.length++;
}
function Qi(e4, t3) {
  e4.head = new $i(t3, void 0, e4.head, e4), e4.tail ||= e4.head, e4.length++;
}
var $i = class {
  list;
  next;
  prev;
  value;
  constructor(e4, t3, n2, r2) {
    this.list = r2, this.value = e4, t3 ? (t3.next = this, this.prev = t3) : this.prev = void 0, n2 ? (n2.prev = this, this.next = n2) : this.next = void 0;
  }
};
var ea = class {
  path;
  absolute;
  entry;
  stat;
  readdir;
  pending = false;
  pendingLink = false;
  ignore = false;
  piped = false;
  constructor(e4, t3) {
    this.path = e4 || `./`, this.absolute = t3;
  }
};
var ta = Buffer.alloc(1024);
var na = /* @__PURE__ */ Symbol(`onStat`);
var ra = /* @__PURE__ */ Symbol(`ended`);
var X2 = /* @__PURE__ */ Symbol(`queue`);
var ia = /* @__PURE__ */ Symbol(`pendingLinks`);
var aa = /* @__PURE__ */ Symbol(`current`);
var oa = /* @__PURE__ */ Symbol(`process`);
var sa = /* @__PURE__ */ Symbol(`processing`);
var ca = /* @__PURE__ */ Symbol(`processJob`);
var Z2 = /* @__PURE__ */ Symbol(`jobs`);
var la = /* @__PURE__ */ Symbol(`jobDone`);
var ua = /* @__PURE__ */ Symbol(`addFSEntry`);
var da = /* @__PURE__ */ Symbol(`addTarEntry`);
var fa = /* @__PURE__ */ Symbol(`stat`);
var pa = /* @__PURE__ */ Symbol(`readdir`);
var ma = /* @__PURE__ */ Symbol(`onreaddir`);
var ha = /* @__PURE__ */ Symbol(`pipe`);
var ga = /* @__PURE__ */ Symbol(`entry`);
var _a = /* @__PURE__ */ Symbol(`entryOpt`);
var va = /* @__PURE__ */ Symbol(`writeEntryClass`);
var ya = /* @__PURE__ */ Symbol(`write`);
var ba = /* @__PURE__ */ Symbol(`ondrain`);
var xa = class extends Yt {
  sync = false;
  opt;
  cwd;
  maxReadSize;
  preservePaths;
  strict;
  noPax;
  prefix;
  linkCache;
  statCache;
  file;
  portable;
  zip;
  readdirCache;
  noDirRecurse;
  follow;
  noMtime;
  mtime;
  filter;
  jobs;
  [va];
  onWriteEntry;
  [X2];
  [ia] = /* @__PURE__ */ new Map();
  [Z2] = 0;
  [sa] = false;
  [ra] = false;
  constructor(e4 = {}) {
    if (super(), this.opt = e4, this.file = e4.file || ``, this.cwd = e4.cwd || process.cwd(), this.maxReadSize = e4.maxReadSize, this.preservePaths = !!e4.preservePaths, this.strict = !!e4.strict, this.noPax = !!e4.noPax, this.prefix = V3(e4.prefix || ``), this.linkCache = e4.linkCache || /* @__PURE__ */ new Map(), this.statCache = e4.statCache || /* @__PURE__ */ new Map(), this.readdirCache = e4.readdirCache || /* @__PURE__ */ new Map(), this.onWriteEntry = e4.onWriteEntry, this[va] = Gi, typeof e4.onwarn == `function` && this.on(`warn`, e4.onwarn), this.portable = !!e4.portable, e4.gzip || e4.brotli || e4.zstd) {
      if (+!!e4.gzip + +!!e4.brotli + +!!e4.zstd > 1) throw TypeError(`gzip, brotli, zstd are mutually exclusive`);
      if (e4.gzip && (typeof e4.gzip != `object` && (e4.gzip = {}), this.portable && (e4.gzip.portable = true), this.zip = new Un(e4.gzip)), e4.brotli && (typeof e4.brotli != `object` && (e4.brotli = {}), this.zip = new Kn(e4.brotli)), e4.zstd && (typeof e4.zstd != `object` && (e4.zstd = {}), this.zip = new Yn(e4.zstd)), !this.zip) throw Error(`impossible`);
      let t3 = this.zip;
      t3.on(`data`, (e5) => super.write(e5)), t3.on(`end`, () => super.end()), t3.on(`drain`, () => this[ba]()), this.on(`resume`, () => t3.resume());
    } else this.on(`drain`, this[ba]);
    this.noDirRecurse = !!e4.noDirRecurse, this.follow = !!e4.follow, this.noMtime = !!e4.noMtime, e4.mtime && (this.mtime = e4.mtime), this.filter = typeof e4.filter == `function` ? e4.filter : () => true, this[X2] = new Yi(), this[Z2] = 0, this.jobs = Number(e4.jobs) || 4, this[sa] = false, this[ra] = false;
  }
  [ya](e4) {
    return super.write(e4);
  }
  add(e4) {
    return this.write(e4), this;
  }
  end(e4, t3, n2) {
    return typeof e4 == `function` && (n2 = e4, e4 = void 0), typeof t3 == `function` && (n2 = t3, t3 = void 0), e4 && this.add(e4), this[ra] = true, this[oa](), n2 && n2(), this;
  }
  write(e4) {
    if (this[ra]) throw Error(`write after end`);
    return typeof e4 == `string` ? this[ua](e4) : this[da](e4), this.flowing;
  }
  [da](e4) {
    let t3 = V3(y3.resolve(this.cwd, e4.path));
    if (!this.filter(e4.path, e4)) e4.resume();
    else {
      let n2 = new ea(e4.path, t3);
      n2.entry = new qi(e4, this[_a](n2)), n2.entry.on(`end`, () => this[la](n2)), this[Z2] += 1, this[X2].push(n2);
    }
    this[oa]();
  }
  [ua](e4) {
    let t3 = V3(y3.resolve(this.cwd, e4));
    this[X2].push(new ea(e4, t3)), this[oa]();
  }
  [fa](e4) {
    e4.pending = true, this[Z2] += 1, v3[this.follow ? `stat` : `lstat`](e4.absolute, (t3, n2) => {
      e4.pending = false, --this[Z2], t3 ? this.emit(`error`, t3) : this[na](e4, n2);
    });
  }
  [na](e4, t3) {
    if (this.statCache.set(e4.absolute, t3), e4.stat = t3, !this.filter(e4.path, t3)) e4.ignore = true;
    else if (t3.isFile() && t3.nlink > 1 && !this.linkCache.get(`${t3.dev}:${t3.ino}`) && !this.sync) if (e4 === this[aa]) this[ca](e4);
    else {
      let n2 = `${t3.dev}:${t3.ino}`, r2 = this[ia].get(n2);
      r2 ? r2.push(e4) : this[ia].set(n2, [e4]), e4.pendingLink = true, e4.pending = true;
    }
    this[oa]();
  }
  [pa](e4) {
    e4.pending = true, this[Z2] += 1, v3.readdir(e4.absolute, (t3, n2) => {
      if (e4.pending = false, --this[Z2], t3) return this.emit(`error`, t3);
      this[ma](e4, n2);
    });
  }
  [ma](e4, t3) {
    this.readdirCache.set(e4.absolute, t3), e4.readdir = t3, this[oa]();
  }
  [oa]() {
    if (!this[sa]) {
      this[sa] = true;
      for (let e4 = this[X2].head; e4 && this[Z2] < this.jobs; e4 = e4.next) if (this[ca](e4.value), e4.value.ignore) {
        let t3 = e4.next;
        this[X2].removeNode(e4), e4.next = t3;
      }
      this[sa] = false, this[ra] && this[X2].length === 0 && this[Z2] === 0 && (this.zip ? this.zip.end(ta) : (super.write(ta), super.end()));
    }
  }
  get [aa]() {
    return this[X2] && this[X2].head && this[X2].head.value;
  }
  [la](e4) {
    this[X2].shift(), --this[Z2];
    let { stat: t3 } = e4;
    if (t3 && t3.isFile() && t3.nlink > 1) {
      let e5 = `${t3.dev}:${t3.ino}`, n2 = this[ia].get(e5);
      if (n2) {
        this[ia].delete(e5);
        for (let e6 of n2) e6.pending = false, this[ca](e6);
      }
    }
    this[oa]();
  }
  [ca](e4) {
    if (e4.pending && e4.pendingLink && e4 === this[aa] && (e4.pending = false, e4.pendingLink = false), !e4.pending) {
      if (e4.entry) {
        e4 === this[aa] && !e4.piped && this[ha](e4);
        return;
      }
      if (!e4.stat) {
        let t3 = this.statCache.get(e4.absolute);
        t3 ? this[na](e4, t3) : this[fa](e4);
      }
      if (e4.stat && !e4.ignore) {
        if (!this.noDirRecurse && e4.stat.isDirectory() && !e4.readdir) {
          let t3 = this.readdirCache.get(e4.absolute);
          if (t3 ? this[ma](e4, t3) : this[pa](e4), !e4.readdir) return;
        }
        if (e4.entry = this[ga](e4), !e4.entry) {
          e4.ignore = true;
          return;
        }
        e4 === this[aa] && !e4.piped && this[ha](e4);
      }
    }
  }
  [_a](e4) {
    return { onwarn: (e5, t3, n2) => this.warn(e5, t3, n2), noPax: this.noPax, cwd: this.cwd, absolute: e4.absolute, preservePaths: this.preservePaths, maxReadSize: this.maxReadSize, strict: this.strict, portable: this.portable, linkCache: this.linkCache, statCache: this.statCache, noMtime: this.noMtime, mtime: this.mtime, prefix: this.prefix, onWriteEntry: this.onWriteEntry };
  }
  [ga](e4) {
    this[Z2] += 1;
    try {
      return new this[va](e4.path, this[_a](e4)).on(`end`, () => this[la](e4)).on(`error`, (e5) => this.emit(`error`, e5));
    } catch (e5) {
      this.emit(`error`, e5);
    }
  }
  [ba]() {
    this[aa] && this[aa].entry && this[aa].entry.resume();
  }
  [ha](e4) {
    e4.piped = true, e4.readdir && e4.readdir.forEach((t4) => {
      let n3 = e4.path, r2 = n3 === `./` ? `` : n3.replace(/\/*$/, `/`);
      this[ua](r2 + t4);
    });
    let t3 = e4.entry, n2 = this.zip;
    if (!t3) throw Error(`cannot pipe without source`);
    n2 ? t3.on(`data`, (e5) => {
      n2.write(e5) || t3.pause();
    }) : t3.on(`data`, (e5) => {
      super.write(e5) || t3.pause();
    });
  }
  pause() {
    return this.zip && this.zip.pause(), super.pause();
  }
  warn(e4, t3, n2 = {}) {
    Mr(this, e4, t3, n2);
  }
};
var Sa = class extends xa {
  sync = true;
  constructor(e4) {
    super(e4), this[va] = Ki;
  }
  pause() {
  }
  resume() {
  }
  [fa](e4) {
    let t3 = this.follow ? `statSync` : `lstatSync`;
    this[na](e4, v3[t3](e4.absolute));
  }
  [pa](e4) {
    this[ma](e4, v3.readdirSync(e4.absolute));
  }
  [ha](e4) {
    let t3 = e4.entry, n2 = this.zip;
    if (e4.readdir && e4.readdir.forEach((t4) => {
      let n3 = e4.path, r2 = n3 === `./` ? `` : n3.replace(/\/*$/, `/`);
      this[ua](r2 + t4);
    }), !t3) throw Error(`Cannot pipe without source`);
    n2 ? t3.on(`data`, (e5) => {
      n2.write(e5);
    }) : t3.on(`data`, (e5) => {
      super[ya](e5);
    });
  }
};
var Ca = (e4, t3) => {
  let n2 = new Sa(e4), r2 = new Cn(e4.file, { mode: e4.mode || 438 });
  n2.pipe(r2), Ta(n2, t3);
};
var wa = (e4, t3) => {
  let n2 = new xa(e4), r2 = new Sn(e4.file, { mode: e4.mode || 438 });
  n2.pipe(r2);
  let i3 = new Promise((e5, t4) => {
    r2.on(`error`, t4), r2.on(`close`, e5), n2.on(`error`, t4);
  });
  return Ea(n2, t3).catch((e5) => n2.emit(`error`, e5)), i3;
};
var Ta = (e4, t3) => {
  t3.forEach((t4) => {
    t4.charAt(0) === `@` ? hi({ file: b3.resolve(e4.cwd, t4.slice(1)), sync: true, noResume: true, onReadEntry: (t5) => e4.add(t5) }) : e4.add(t4);
  }), e4.end();
};
var Ea = async (e4, t3) => {
  for (let n2 of t3) n2.charAt(0) === `@` ? await hi({ file: b3.resolve(String(e4.cwd), n2.slice(1)), noResume: true, onReadEntry: (t4) => {
    e4.add(t4);
  } }) : e4.add(n2);
  e4.end();
};
Mn(Ca, wa, (e4, t3) => {
  let n2 = new Sa(e4);
  return Ta(n2, t3), n2;
}, (e4, t3) => {
  let n2 = new xa(e4);
  return Ea(n2, t3).catch((e5) => n2.emit(`error`, e5)), n2;
}, (e4, t3) => {
  if (!t3?.length) throw TypeError(`no paths specified to add to archive`);
});
var Da = (process.env.__FAKE_PLATFORM__ || process.platform) === `win32`;
var { O_CREAT: Oa, O_NOFOLLOW: ka, O_TRUNC: Aa, O_WRONLY: ja } = v3.constants;
var Ma = Number(process.env.__FAKE_FS_O_FILENAME__) || v3.constants.UV_FS_O_FILEMAP || 0;
var Na = Da && !!Ma;
var Pa = 512 * 1024;
var Fa = Ma | Aa | Oa | ja;
var Ia = !Da && typeof ka == `number` ? ka | Aa | Oa | ja : null;
var La = Ia === null ? Na ? (e4) => e4 < Pa ? Fa : `w` : () => `w` : () => Ia;
var Ra = (e4, t3, n2) => {
  try {
    return m3.lchownSync(e4, t3, n2);
  } catch (e5) {
    if (e5?.code !== `ENOENT`) throw e5;
  }
};
var za = (e4, t3, n2, r2) => {
  m3.lchown(e4, t3, n2, (e5) => {
    r2(e5 && e5?.code !== `ENOENT` ? e5 : null);
  });
};
var Ba = (e4, t3, n2, r2, i3) => {
  t3.isDirectory() ? Va(b3.resolve(e4, t3.name), n2, r2, (a3) => {
    if (a3) return i3(a3);
    za(b3.resolve(e4, t3.name), n2, r2, i3);
  }) : za(b3.resolve(e4, t3.name), n2, r2, i3);
};
var Va = (e4, t3, n2, r2) => {
  m3.readdir(e4, { withFileTypes: true }, (i3, a3) => {
    if (i3) {
      if (i3.code === `ENOENT`) return r2();
      if (i3.code !== `ENOTDIR` && i3.code !== `ENOTSUP`) return r2(i3);
    }
    if (i3 || !a3.length) return za(e4, t3, n2, r2);
    let o3 = a3.length, s3 = null, c3 = (i4) => {
      if (!s3) {
        if (i4) return r2(s3 = i4);
        if (--o3 === 0) return za(e4, t3, n2, r2);
      }
    };
    for (let r3 of a3) Ba(e4, r3, t3, n2, c3);
  });
};
var Ha = (e4, t3, n2, r2) => {
  t3.isDirectory() && Ua(b3.resolve(e4, t3.name), n2, r2), Ra(b3.resolve(e4, t3.name), n2, r2);
};
var Ua = (e4, t3, n2) => {
  let r2;
  try {
    r2 = m3.readdirSync(e4, { withFileTypes: true });
  } catch (r3) {
    let i3 = r3;
    if (i3?.code === `ENOENT`) return;
    if (i3?.code === `ENOTDIR` || i3?.code === `ENOTSUP`) return Ra(e4, t3, n2);
    throw i3;
  }
  for (let i3 of r2) Ha(e4, i3, t3, n2);
  return Ra(e4, t3, n2);
};
var Wa = class extends Error {
  path;
  code;
  syscall = `chdir`;
  constructor(e4, t3) {
    super(`${t3}: Cannot cd into '${e4}'`), this.path = e4, this.code = t3;
  }
  get name() {
    return `CwdError`;
  }
};
var Ga = class extends Error {
  path;
  symlink;
  syscall = `symlink`;
  code = `TAR_SYMLINK_ERROR`;
  constructor(e4, t3) {
    super(`TAR_SYMLINK_ERROR: Cannot extract through symbolic link`), this.symlink = e4, this.path = t3;
  }
  get name() {
    return `SymlinkError`;
  }
};
var Ka = (e4, t3) => {
  m3.stat(e4, (n2, r2) => {
    (n2 || !r2.isDirectory()) && (n2 = new Wa(e4, n2?.code || `ENOTDIR`)), t3(n2);
  });
};
var qa = (e4, t3, n2) => {
  e4 = V3(e4);
  let r2 = t3.umask ?? 18, i3 = t3.mode | 448, a3 = (i3 & r2) !== 0, o3 = t3.uid, s3 = t3.gid, c3 = typeof o3 == `number` && typeof s3 == `number` && (o3 !== t3.processUid || s3 !== t3.processGid), l3 = t3.preserve, u3 = t3.unlink, d3 = V3(t3.cwd), f3 = (t4, r3) => {
    t4 ? n2(t4) : r3 && c3 ? Va(r3, o3, s3, (e5) => f3(e5)) : a3 ? m3.chmod(e4, i3, n2) : n2();
  };
  if (e4 === d3) return Ka(e4, f3);
  if (l3) return ce2.mkdir(e4, { mode: i3, recursive: true }).then((e5) => f3(null, e5 ?? void 0), f3);
  Ja(d3, V3(b3.relative(d3, e4)).split(`/`), i3, u3, d3, void 0, f3);
};
var Ja = (e4, t3, n2, r2, i3, a3, o3) => {
  if (t3.length === 0) return o3(null, a3);
  let s3 = t3.shift(), c3 = V3(b3.resolve(e4 + `/` + s3));
  m3.mkdir(c3, n2, Ya(c3, t3, n2, r2, i3, a3, o3));
};
var Ya = (e4, t3, n2, r2, i3, a3, o3) => (s3) => {
  s3 ? m3.lstat(e4, (c3, l3) => {
    if (c3) c3.path = c3.path && V3(c3.path), o3(c3);
    else if (l3.isDirectory()) Ja(e4, t3, n2, r2, i3, a3, o3);
    else if (r2) m3.unlink(e4, (s4) => {
      if (s4) return o3(s4);
      m3.mkdir(e4, n2, Ya(e4, t3, n2, r2, i3, a3, o3));
    });
    else {
      if (l3.isSymbolicLink()) return o3(new Ga(e4, e4 + `/` + t3.join(`/`)));
      o3(s3);
    }
  }) : (a3 ||= e4, Ja(e4, t3, n2, r2, i3, a3, o3));
};
var Xa = (e4) => {
  let t3 = false, n2;
  try {
    t3 = m3.statSync(e4).isDirectory();
  } catch (e5) {
    n2 = e5?.code;
  } finally {
    if (!t3) throw new Wa(e4, n2 ?? `ENOTDIR`);
  }
};
var Za = (e4, t3) => {
  e4 = V3(e4);
  let n2 = t3.umask ?? 18, r2 = t3.mode | 448, i3 = (r2 & n2) !== 0, a3 = t3.uid, o3 = t3.gid, s3 = typeof a3 == `number` && typeof o3 == `number` && (a3 !== t3.processUid || o3 !== t3.processGid), c3 = t3.preserve, l3 = t3.unlink, u3 = V3(t3.cwd), d3 = (t4) => {
    t4 && s3 && Ua(t4, a3, o3), i3 && m3.chmodSync(e4, r2);
  };
  if (e4 === u3) return Xa(u3), d3();
  if (c3) return d3(m3.mkdirSync(e4, { mode: r2, recursive: true }) ?? void 0);
  let f3 = V3(b3.relative(u3, e4)).split(`/`), p3;
  for (let e5 = f3.shift(), t4 = u3; e5 && (t4 += `/` + e5); e5 = f3.shift()) {
    t4 = V3(b3.resolve(t4));
    try {
      m3.mkdirSync(t4, r2), p3 ||= t4;
    } catch {
      let e6 = m3.lstatSync(t4);
      if (e6.isDirectory()) continue;
      if (l3) {
        m3.unlinkSync(t4), m3.mkdirSync(t4, r2), p3 ||= t4;
        continue;
      } else if (e6.isSymbolicLink()) return new Ga(t4, t4 + `/` + f3.join(`/`));
    }
  }
  return d3(p3);
};
var Qa = /* @__PURE__ */ Object.create(null);
var $a = 1e4;
var eo = /* @__PURE__ */ new Set();
var to = (e4) => {
  eo.has(e4) ? eo.delete(e4) : Qa[e4] = e4.normalize(`NFD`).toLocaleLowerCase(`en`).toLocaleUpperCase(`en`), eo.add(e4);
  let t3 = Qa[e4], n2 = eo.size - $a;
  if (n2 > $a / 10) {
    for (let e5 of eo) if (eo.delete(e5), delete Qa[e5], --n2 <= 0) break;
  }
  return t3;
};
var no = (process.env.TESTING_TAR_FAKE_PLATFORM || process.platform) === `win32`;
var ro = (e4) => e4.split(`/`).slice(0, -1).reduce((e5, t3) => {
  let n2 = e5.at(-1);
  return n2 !== void 0 && (t3 = ie2(n2, t3)), e5.push(t3 || `/`), e5;
}, []);
var io = class {
  #e = /* @__PURE__ */ new Map();
  #t = /* @__PURE__ */ new Map();
  #n = /* @__PURE__ */ new Set();
  reserve(e4, t3) {
    e4 = no ? [`win32 parallelization disabled`] : e4.map((e5) => fi(ie2(to(e5))));
    let n2 = new Set(e4.map((e5) => ro(e5)).reduce((e5, t4) => e5.concat(t4)));
    this.#t.set(t3, { dirs: n2, paths: e4 });
    for (let n3 of e4) {
      let e5 = this.#e.get(n3);
      e5 ? e5.push(t3) : this.#e.set(n3, [t3]);
    }
    for (let e5 of n2) {
      let n3 = this.#e.get(e5);
      if (!n3) this.#e.set(e5, [/* @__PURE__ */ new Set([t3])]);
      else {
        let e6 = n3.at(-1);
        e6 instanceof Set ? e6.add(t3) : n3.push(/* @__PURE__ */ new Set([t3]));
      }
    }
    return this.#i(t3);
  }
  #r(e4) {
    let t3 = this.#t.get(e4);
    if (!t3) throw Error(`function does not have any path reservations`);
    return { paths: t3.paths.map((e5) => this.#e.get(e5)), dirs: [...t3.dirs].map((e5) => this.#e.get(e5)) };
  }
  check(e4) {
    let { paths: t3, dirs: n2 } = this.#r(e4);
    return t3.every((t4) => t4 && t4[0] === e4) && n2.every((t4) => t4 && t4[0] instanceof Set && t4[0].has(e4));
  }
  #i(e4) {
    return this.#n.has(e4) || !this.check(e4) ? false : (this.#n.add(e4), e4(() => this.#a(e4)), true);
  }
  #a(e4) {
    if (!this.#n.has(e4)) return false;
    let t3 = this.#t.get(e4);
    if (!t3) throw Error(`invalid reservation`);
    let { paths: n2, dirs: r2 } = t3, i3 = /* @__PURE__ */ new Set();
    for (let t4 of n2) {
      let n3 = this.#e.get(t4);
      if (!n3 || n3?.[0] !== e4) continue;
      let r3 = n3[1];
      if (!r3) {
        this.#e.delete(t4);
        continue;
      }
      if (n3.shift(), typeof r3 == `function`) i3.add(r3);
      else for (let e5 of r3) i3.add(e5);
    }
    for (let t4 of r2) {
      let n3 = this.#e.get(t4), r3 = n3?.[0];
      if (!(!n3 || !(r3 instanceof Set))) if (r3.size === 1 && n3.length === 1) {
        this.#e.delete(t4);
        continue;
      } else if (r3.size === 1) {
        n3.shift();
        let e5 = n3[0];
        typeof e5 == `function` && i3.add(e5);
      } else r3.delete(e4);
    }
    return this.#n.delete(e4), i3.forEach((e5) => this.#i(e5)), true;
  }
};
var ao = () => process.umask();
var oo = /* @__PURE__ */ Symbol(`onEntry`);
var so = /* @__PURE__ */ Symbol(`checkFs`);
var co = /* @__PURE__ */ Symbol(`checkFs2`);
var lo = /* @__PURE__ */ Symbol(`isReusable`);
var Q2 = /* @__PURE__ */ Symbol(`makeFs`);
var uo = /* @__PURE__ */ Symbol(`file`);
var fo = /* @__PURE__ */ Symbol(`directory`);
var po = /* @__PURE__ */ Symbol(`link`);
var mo = /* @__PURE__ */ Symbol(`symlink`);
var ho = /* @__PURE__ */ Symbol(`hardlink`);
var go = /* @__PURE__ */ Symbol(`ensureNoSymlink`);
var _o = /* @__PURE__ */ Symbol(`unsupported`);
var vo = /* @__PURE__ */ Symbol(`checkPath`);
var yo = /* @__PURE__ */ Symbol(`stripAbsolutePath`);
var bo = /* @__PURE__ */ Symbol(`mkdir`);
var $2 = /* @__PURE__ */ Symbol(`onError`);
var xo = /* @__PURE__ */ Symbol(`pending`);
var So = /* @__PURE__ */ Symbol(`pend`);
var Co = /* @__PURE__ */ Symbol(`unpend`);
var wo = /* @__PURE__ */ Symbol(`ended`);
var To = /* @__PURE__ */ Symbol(`maybeClose`);
var Eo = /* @__PURE__ */ Symbol(`skip`);
var Do = /* @__PURE__ */ Symbol(`doChown`);
var Oo = /* @__PURE__ */ Symbol(`uid`);
var ko = /* @__PURE__ */ Symbol(`gid`);
var Ao = /* @__PURE__ */ Symbol(`checkedCwd`);
var jo = (process.env.TESTING_TAR_FAKE_PLATFORM || process.platform) === `win32`;
var Mo = 1024;
var No = (e4, t3) => {
  if (!jo) return m3.unlink(e4, t3);
  let n2 = e4 + `.DELETE.` + we2(16).toString(`hex`);
  m3.rename(e4, n2, (e5) => {
    if (e5) return t3(e5);
    m3.unlink(n2, t3);
  });
};
var Po = (e4) => {
  if (!jo) return m3.unlinkSync(e4);
  let t3 = e4 + `.DELETE.` + we2(16).toString(`hex`);
  m3.renameSync(e4, t3), m3.unlinkSync(t3);
};
var Fo = (e4, t3, n2) => e4 !== void 0 && e4 === e4 >>> 0 ? e4 : t3 !== void 0 && t3 === t3 >>> 0 ? t3 : n2;
var Io = class extends di {
  [wo] = false;
  [Ao] = false;
  [xo] = 0;
  reservations = new io();
  transform;
  writable = true;
  readable = false;
  uid;
  gid;
  setOwner;
  preserveOwner;
  processGid;
  processUid;
  maxDepth;
  forceChown;
  win32;
  newer;
  keep;
  noMtime;
  preservePaths;
  unlink;
  cwd;
  strip;
  processUmask;
  umask;
  dmode;
  fmode;
  chmod;
  constructor(e4 = {}) {
    if (e4.ondone = () => {
      this[wo] = true, this[To]();
    }, super(e4), this.transform = e4.transform, this.chmod = !!e4.chmod, typeof e4.uid == `number` || typeof e4.gid == `number`) {
      if (typeof e4.uid != `number` || typeof e4.gid != `number`) throw TypeError(`cannot set owner without number uid and gid`);
      if (e4.preserveOwner) throw TypeError(`cannot preserve owner in archive and also set owner explicitly`);
      this.uid = e4.uid, this.gid = e4.gid, this.setOwner = true;
    } else this.uid = void 0, this.gid = void 0, this.setOwner = false;
    this.preserveOwner = e4.preserveOwner === void 0 && typeof e4.uid != `number` ? process.getuid?.() === 0 : !!e4.preserveOwner, this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ? process.getuid() : void 0, this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ? process.getgid() : void 0, this.maxDepth = typeof e4.maxDepth == `number` ? e4.maxDepth : Mo, this.forceChown = e4.forceChown === true, this.win32 = !!e4.win32 || jo, this.newer = !!e4.newer, this.keep = !!e4.keep, this.noMtime = !!e4.noMtime, this.preservePaths = !!e4.preservePaths, this.unlink = !!e4.unlink, this.cwd = V3(b3.resolve(e4.cwd || process.cwd())), this.strip = Number(e4.strip) || 0, this.processUmask = this.chmod ? typeof e4.processUmask == `number` ? e4.processUmask : ao() : 0, this.umask = typeof e4.umask == `number` ? e4.umask : this.processUmask, this.dmode = e4.dmode || 511 & ~this.umask, this.fmode = e4.fmode || 438 & ~this.umask, this.on(`entry`, (e5) => this[oo](e5));
  }
  warn(e4, t3, n2 = {}) {
    return (e4 === `TAR_BAD_ARCHIVE` || e4 === `TAR_ABORT`) && (n2.recoverable = false), super.warn(e4, t3, n2);
  }
  [To]() {
    this[wo] && this[xo] === 0 && (this.emit(`prefinish`), this.emit(`finish`), this.emit(`end`));
  }
  [yo](e4, t3) {
    let n2 = e4[t3], { type: r2 } = e4;
    if (!n2 || this.preservePaths) return true;
    let [i3, a3] = yi(n2), o3 = a3.replaceAll(/\\/g, `/`).split(`/`);
    if (o3.includes(`..`) || jo && /^[a-z]:\.\.$/i.test(o3[0] ?? ``)) {
      if (t3 === `path` || r2 === `Link`) return this.warn(`TAR_ENTRY_ERROR`, `${t3} contains '..'`, { entry: e4, [t3]: n2 }), false;
      let i4 = b3.posix.dirname(e4.path), a4 = b3.posix.normalize(b3.posix.join(i4, o3.join(`/`)));
      if (a4.startsWith(`../`) || a4 === `..`) return this.warn(`TAR_ENTRY_ERROR`, `${t3} escapes extraction directory`, { entry: e4, [t3]: n2 }), false;
    }
    return i3 && (e4[t3] = String(a3), this.warn(`TAR_ENTRY_INFO`, `stripping ${i3} from absolute ${t3}`, { entry: e4, [t3]: n2 })), true;
  }
  [vo](e4) {
    let t3 = V3(e4.path), n2 = t3.split(`/`);
    if (this.strip) {
      if (n2.length < this.strip) return false;
      if (e4.type === `Link`) {
        let t4 = V3(String(e4.linkpath)).split(`/`);
        if (t4.length >= this.strip) e4.linkpath = t4.slice(this.strip).join(`/`);
        else return false;
      }
      n2.splice(0, this.strip), e4.path = n2.join(`/`);
    }
    if (isFinite(this.maxDepth) && n2.length > this.maxDepth) return this.warn(`TAR_ENTRY_ERROR`, `path excessively deep`, { entry: e4, path: t3, depth: n2.length, maxDepth: this.maxDepth }), false;
    if (!this[yo](e4, `path`) || !this[yo](e4, `linkpath`)) return false;
    if (e4.absolute = b3.isAbsolute(e4.path) ? V3(b3.resolve(e4.path)) : V3(b3.resolve(this.cwd, e4.path)), !this.preservePaths && typeof e4.absolute == `string` && e4.absolute.indexOf(this.cwd + `/`) !== 0 && e4.absolute !== this.cwd) return this.warn(`TAR_ENTRY_ERROR`, `path escaped extraction target`, { entry: e4, path: V3(e4.path), resolvedPath: e4.absolute, cwd: this.cwd }), false;
    if (e4.absolute === this.cwd && e4.type !== `Directory` && e4.type !== `GNUDumpDir`) return false;
    if (this.win32) {
      let { root: t4 } = b3.win32.parse(String(e4.absolute));
      e4.absolute = t4 + wi(String(e4.absolute).slice(t4.length));
      let { root: n3 } = b3.win32.parse(e4.path);
      e4.path = n3 + wi(e4.path.slice(n3.length));
    }
    return true;
  }
  [oo](e4) {
    if (!this[vo](e4)) return e4.resume();
    switch (Ce2.equal(typeof e4.absolute, `string`), e4.type) {
      case `Directory`:
      case `GNUDumpDir`:
        e4.mode && (e4.mode |= 448);
      case `File`:
      case `OldFile`:
      case `ContiguousFile`:
      case `Link`:
      case `SymbolicLink`:
        return this[so](e4);
      default:
        return this[_o](e4);
    }
  }
  [$2](e4, t3) {
    e4.name === `CwdError` ? this.emit(`error`, e4) : (this.warn(`TAR_ENTRY_ERROR`, e4, { entry: t3 }), this[Co](), t3.resume());
  }
  [bo](e4, t3, n2) {
    qa(V3(e4), { uid: this.uid, gid: this.gid, processUid: this.processUid, processGid: this.processGid, umask: this.processUmask, preserve: this.preservePaths, unlink: this.unlink, cwd: this.cwd, mode: t3 }, n2);
  }
  [Do](e4) {
    return this.forceChown || this.preserveOwner && (typeof e4.uid == `number` && e4.uid !== this.processUid || typeof e4.gid == `number` && e4.gid !== this.processGid) || typeof this.uid == `number` && this.uid !== this.processUid || typeof this.gid == `number` && this.gid !== this.processGid;
  }
  [Oo](e4) {
    return Fo(this.uid, e4.uid, this.processUid);
  }
  [ko](e4) {
    return Fo(this.gid, e4.gid, this.processGid);
  }
  [uo](e4, t3) {
    let n2 = typeof e4.mode == `number` ? e4.mode & 4095 : this.fmode, r2 = new Sn(String(e4.absolute), { flags: La(e4.size), mode: n2, autoClose: false });
    r2.on(`error`, (n3) => {
      r2.fd && m3.close(r2.fd, () => {
      }), r2.write = () => true, this[$2](n3, e4), t3();
    });
    let i3 = 1, a3 = (n3) => {
      if (n3) {
        r2.fd && m3.close(r2.fd, () => {
        }), this[$2](n3, e4), t3();
        return;
      }
      --i3 === 0 && r2.fd !== void 0 && m3.close(r2.fd, (n4) => {
        n4 ? this[$2](n4, e4) : this[Co](), t3();
      });
    };
    r2.on(`finish`, () => {
      let t4 = String(e4.absolute), n3 = r2.fd;
      if (typeof n3 == `number` && e4.mtime && !this.noMtime) {
        i3++;
        let r3 = e4.atime || /* @__PURE__ */ new Date(), o4 = e4.mtime;
        m3.futimes(n3, r3, o4, (e5) => e5 ? m3.utimes(t4, r3, o4, (t5) => a3(t5 && e5)) : a3());
      }
      if (typeof n3 == `number` && this[Do](e4)) {
        i3++;
        let r3 = this[Oo](e4), o4 = this[ko](e4);
        typeof r3 == `number` && typeof o4 == `number` && m3.fchown(n3, r3, o4, (e5) => e5 ? m3.chown(t4, r3, o4, (t5) => a3(t5 && e5)) : a3());
      }
      a3();
    });
    let o3 = this.transform && this.transform(e4) || e4;
    o3 !== e4 && (o3.on(`error`, (n3) => {
      this[$2](n3, e4), t3();
    }), e4.pipe(o3)), o3.pipe(r2);
  }
  [fo](e4, t3) {
    let n2 = typeof e4.mode == `number` ? e4.mode & 4095 : this.dmode;
    this[bo](String(e4.absolute), n2, (n3) => {
      if (n3) {
        this[$2](n3, e4), t3();
        return;
      }
      let r2 = 1, i3 = () => {
        --r2 === 0 && (t3(), this[Co](), e4.resume());
      };
      e4.mtime && !this.noMtime && (r2++, m3.utimes(String(e4.absolute), e4.atime || /* @__PURE__ */ new Date(), e4.mtime, i3)), this[Do](e4) && (r2++, m3.chown(String(e4.absolute), Number(this[Oo](e4)), Number(this[ko](e4)), i3)), i3();
    });
  }
  [_o](e4) {
    e4.unsupported = true, this.warn(`TAR_ENTRY_UNSUPPORTED`, `unsupported entry type: ${e4.type}`, { entry: e4 }), e4.resume();
  }
  [mo](e4, t3) {
    let n2 = V3(b3.relative(this.cwd, b3.resolve(b3.dirname(String(e4.absolute)), String(e4.linkpath)))).split(`/`);
    this[go](e4, this.cwd, n2, () => this[po](e4, String(e4.linkpath), `symlink`, t3), (n3) => {
      this[$2](n3, e4), t3();
    });
  }
  [ho](e4, t3) {
    let n2 = V3(b3.resolve(this.cwd, String(e4.linkpath))), r2 = V3(String(e4.linkpath)).split(`/`);
    this[go](e4, this.cwd, r2, () => this[po](e4, n2, `link`, t3), (n3) => {
      this[$2](n3, e4), t3();
    });
  }
  [go](e4, t3, n2, r2, i3) {
    let a3 = n2.shift();
    if (this.preservePaths || a3 === void 0) return r2();
    let o3 = b3.resolve(t3, a3);
    m3.lstat(o3, (t4, a4) => {
      if (t4) return r2();
      if (a4?.isSymbolicLink()) return i3(new Ga(o3, b3.resolve(o3, n2.join(`/`))));
      this[go](e4, o3, n2, r2, i3);
    });
  }
  [So]() {
    this[xo]++;
  }
  [Co]() {
    this[xo]--, this[To]();
  }
  [Eo](e4) {
    this[Co](), e4.resume();
  }
  [lo](e4, t3) {
    return e4.type === `File` && !this.unlink && t3.isFile() && t3.nlink <= 1 && !jo;
  }
  [so](e4) {
    this[So]();
    let t3 = [e4.path];
    e4.linkpath && t3.push(e4.linkpath), this.reservations.reserve(t3, (t4) => this[co](e4, t4));
  }
  [co](e4, t3) {
    let n2 = (e5) => {
      t3(e5);
    }, r2 = () => {
      this[bo](this.cwd, this.dmode, (t4) => {
        if (t4) {
          this[$2](t4, e4), n2();
          return;
        }
        this[Ao] = true, i3();
      });
    }, i3 = () => {
      if (e4.absolute !== this.cwd) {
        let t4 = V3(b3.dirname(String(e4.absolute)));
        if (t4 !== this.cwd) return this[bo](t4, this.dmode, (t5) => {
          if (t5) {
            this[$2](t5, e4), n2();
            return;
          }
          a3();
        });
      }
      a3();
    }, a3 = () => {
      m3.lstat(String(e4.absolute), (t4, r3) => {
        if (r3 && (this.keep || this.newer && r3.mtime > (e4.mtime ?? r3.mtime))) {
          this[Eo](e4), n2();
          return;
        }
        if (t4 || this[lo](e4, r3)) return this[Q2](null, e4, n2);
        if (r3.isDirectory()) {
          if (e4.type === `Directory`) {
            let t5 = this.chmod && e4.mode && (r3.mode & 4095) !== e4.mode, i4 = (t6) => this[Q2](t6 ?? null, e4, n2);
            return t5 ? m3.chmod(String(e4.absolute), Number(e4.mode), i4) : i4();
          }
          if (e4.absolute !== this.cwd) return m3.rmdir(String(e4.absolute), (t5) => this[Q2](t5 ?? null, e4, n2));
        }
        if (e4.absolute === this.cwd) return this[Q2](null, e4, n2);
        No(String(e4.absolute), (t5) => this[Q2](t5 ?? null, e4, n2));
      });
    };
    this[Ao] ? i3() : r2();
  }
  [Q2](e4, t3, n2) {
    if (e4) {
      this[$2](e4, t3), n2();
      return;
    }
    switch (t3.type) {
      case `File`:
      case `OldFile`:
      case `ContiguousFile`:
        return this[uo](t3, n2);
      case `Link`:
        return this[ho](t3, n2);
      case `SymbolicLink`:
        return this[mo](t3, n2);
      case `Directory`:
      case `GNUDumpDir`:
        return this[fo](t3, n2);
    }
  }
  [po](e4, t3, n2, r2) {
    m3[n2](t3, String(e4.absolute), (t4) => {
      t4 ? this[$2](t4, e4) : (this[Co](), e4.resume()), r2();
    });
  }
};
var Lo = (e4) => {
  try {
    return [null, e4()];
  } catch (e5) {
    return [e5, null];
  }
};
var Ro = class extends Io {
  sync = true;
  [Q2](e4, t3) {
    return super[Q2](e4, t3, () => {
    });
  }
  [so](e4) {
    if (!this[Ao]) {
      let t4 = this[bo](this.cwd, this.dmode);
      if (t4) return this[$2](t4, e4);
      this[Ao] = true;
    }
    if (e4.absolute !== this.cwd) {
      let t4 = V3(b3.dirname(String(e4.absolute)));
      if (t4 !== this.cwd) {
        let n3 = this[bo](t4, this.dmode);
        if (n3) return this[$2](n3, e4);
      }
    }
    let [t3, n2] = Lo(() => m3.lstatSync(String(e4.absolute)));
    if (n2 && (this.keep || this.newer && n2.mtime > (e4.mtime ?? n2.mtime))) return this[Eo](e4);
    if (t3 || this[lo](e4, n2)) return this[Q2](null, e4);
    if (n2.isDirectory()) {
      if (e4.type === `Directory`) {
        let [t5] = this.chmod && e4.mode && (n2.mode & 4095) !== e4.mode ? Lo(() => {
          m3.chmodSync(String(e4.absolute), Number(e4.mode));
        }) : [];
        return this[Q2](t5, e4);
      }
      let [t4] = Lo(() => m3.rmdirSync(String(e4.absolute)));
      this[Q2](t4, e4);
    }
    let [r2] = e4.absolute === this.cwd ? [] : Lo(() => Po(String(e4.absolute)));
    this[Q2](r2, e4);
  }
  [uo](e4, t3) {
    let n2 = typeof e4.mode == `number` ? e4.mode & 4095 : this.fmode, r2 = (n3) => {
      let r3;
      try {
        m3.closeSync(i3);
      } catch (e5) {
        r3 = e5;
      }
      (n3 || r3) && this[$2](n3 || r3, e4), t3();
    }, i3;
    try {
      i3 = m3.openSync(String(e4.absolute), La(e4.size), n2);
    } catch (e5) {
      return r2(e5);
    }
    let a3 = this.transform && this.transform(e4) || e4;
    a3 !== e4 && (a3.on(`error`, (t4) => this[$2](t4, e4)), e4.pipe(a3)), a3.on(`data`, (e5) => {
      try {
        m3.writeSync(i3, e5, 0, e5.length);
      } catch (e6) {
        r2(e6);
      }
    }), a3.on(`end`, () => {
      let t4 = null;
      if (e4.mtime && !this.noMtime) {
        let n3 = e4.atime || /* @__PURE__ */ new Date(), r3 = e4.mtime;
        try {
          m3.futimesSync(i3, n3, r3);
        } catch (i4) {
          try {
            m3.utimesSync(String(e4.absolute), n3, r3);
          } catch {
            t4 = i4;
          }
        }
      }
      if (this[Do](e4)) {
        let n3 = this[Oo](e4), r3 = this[ko](e4);
        try {
          m3.fchownSync(i3, Number(n3), Number(r3));
        } catch (i4) {
          try {
            m3.chownSync(String(e4.absolute), Number(n3), Number(r3));
          } catch {
            t4 ||= i4;
          }
        }
      }
      r2(t4);
    });
  }
  [fo](e4, t3) {
    let n2 = typeof e4.mode == `number` ? e4.mode & 4095 : this.dmode, r2 = this[bo](String(e4.absolute), n2);
    if (r2) {
      this[$2](r2, e4), t3();
      return;
    }
    if (e4.mtime && !this.noMtime) try {
      m3.utimesSync(String(e4.absolute), e4.atime || /* @__PURE__ */ new Date(), e4.mtime);
    } catch {
    }
    if (this[Do](e4)) try {
      m3.chownSync(String(e4.absolute), Number(this[Oo](e4)), Number(this[ko](e4)));
    } catch {
    }
    t3(), e4.resume();
  }
  [bo](e4, t3) {
    try {
      return Za(V3(e4), { uid: this.uid, gid: this.gid, processUid: this.processUid, processGid: this.processGid, umask: this.processUmask, preserve: this.preservePaths, unlink: this.unlink, cwd: this.cwd, mode: t3 });
    } catch (e5) {
      return e5;
    }
  }
  [go](e4, t3, n2, r2, i3) {
    if (this.preservePaths || n2.length === 0) return r2();
    let a3 = t3;
    for (let e5 of n2) {
      a3 = b3.resolve(a3, e5);
      let [o3, s3] = Lo(() => m3.lstatSync(a3));
      if (o3) return r2();
      if (s3.isSymbolicLink()) return i3(new Ga(a3, b3.resolve(t3, n2.join(`/`))));
    }
    r2();
  }
  [po](e4, t3, n2, r2) {
    let i3 = `${n2}Sync`;
    try {
      m3[i3](t3, String(e4.absolute)), r2(), e4.resume();
    } catch (t4) {
      return this[$2](t4, e4);
    }
  }
};
var zo = Mn((e4) => {
  let t3 = new Ro(e4), n2 = e4.file, r2 = m3.statSync(n2);
  new xn(n2, { readSize: e4.maxReadSize || 16 * 1024 * 1024, size: r2.size }).pipe(t3);
}, (e4, t3) => {
  let n2 = new Io(e4), r2 = e4.maxReadSize || 16 * 1024 * 1024, i3 = e4.file;
  return new Promise((e5, t4) => {
    n2.on(`error`, t4), n2.on(`close`, e5), m3.stat(i3, (e6, a3) => {
      if (e6) t4(e6);
      else {
        let e7 = new bn(i3, { readSize: r2, size: a3.size });
        e7.on(`error`, t4), e7.pipe(n2);
      }
    });
  });
}, (e4) => new Ro(e4), (e4) => new Io(e4), (e4, t3) => {
  t3?.length && mi(e4, t3);
});
var Bo = (e4, t3) => {
  let n2 = new Sa(e4), r2 = true, i3, a3;
  try {
    try {
      i3 = m3.openSync(e4.file, `r+`);
    } catch (t4) {
      if (t4?.code === `ENOENT`) i3 = m3.openSync(e4.file, `w+`);
      else throw t4;
    }
    let o3 = m3.fstatSync(i3), s3 = Buffer.alloc(512);
    t: for (a3 = 0; a3 < o3.size; a3 += 512) {
      for (let e5 = 0, t5 = 0; e5 < 512; e5 += t5) {
        if (t5 = m3.readSync(i3, s3, e5, s3.length - e5, a3 + e5), a3 === 0 && s3[0] === 31 && s3[1] === 139) throw Error(`cannot append to compressed archives`);
        if (!t5) break t;
      }
      let t4 = new dr(s3);
      if (!t4.cksumValid) break;
      let n3 = 512 * Math.ceil((t4.size || 0) / 512);
      if (a3 + n3 + 512 > o3.size) break;
      a3 += n3, e4.mtimeCache && t4.mtime && e4.mtimeCache.set(String(t4.path), t4.mtime);
    }
    r2 = false, Vo(e4, n2, a3, i3, t3);
  } finally {
    if (r2) try {
      m3.closeSync(i3);
    } catch {
    }
  }
};
var Vo = (e4, t3, n2, r2, i3) => {
  let a3 = new Cn(e4.file, { fd: r2, start: n2 });
  t3.pipe(a3), Uo(t3, i3);
};
var Ho = (e4, t3) => {
  t3 = Array.from(t3);
  let n2 = new xa(e4), r2 = (t4, n3, r3) => {
    let i3 = (e5, n4) => {
      e5 ? m3.close(t4, (t5) => r3(e5)) : r3(null, n4);
    }, a3 = 0;
    if (n3 === 0) return i3(null, 0);
    let o3 = 0, s3 = Buffer.alloc(512), c3 = (r4, l3) => {
      if (r4 || l3 === void 0) return i3(r4);
      if (o3 += l3, o3 < 512 && l3) return m3.read(t4, s3, o3, s3.length - o3, a3 + o3, c3);
      if (a3 === 0 && s3[0] === 31 && s3[1] === 139) return i3(Error(`cannot append to compressed archives`));
      if (o3 < 512) return i3(null, a3);
      let u3 = new dr(s3);
      if (!u3.cksumValid) return i3(null, a3);
      let d3 = 512 * Math.ceil((u3.size ?? 0) / 512);
      if (a3 + d3 + 512 > n3 || (a3 += d3 + 512, a3 >= n3)) return i3(null, a3);
      e4.mtimeCache && u3.mtime && e4.mtimeCache.set(String(u3.path), u3.mtime), o3 = 0, m3.read(t4, s3, 0, 512, a3, c3);
    };
    m3.read(t4, s3, 0, 512, a3, c3);
  };
  return new Promise((i3, a3) => {
    n2.on(`error`, a3);
    let o3 = `r+`, s3 = (c3, l3) => {
      if (c3 && c3.code === `ENOENT` && o3 === `r+`) return o3 = `w+`, m3.open(e4.file, o3, s3);
      if (c3 || !l3) return a3(c3);
      m3.fstat(l3, (o4, s4) => {
        if (o4) return m3.close(l3, () => a3(o4));
        r2(l3, s4.size, (r3, o5) => {
          if (r3) return a3(r3);
          let s5 = new Sn(e4.file, { fd: l3, start: o5 });
          n2.pipe(s5), s5.on(`error`, a3), s5.on(`close`, i3), Wo(n2, t3);
        });
      });
    };
    m3.open(e4.file, o3, s3);
  });
};
var Uo = (e4, t3) => {
  t3.forEach((t4) => {
    t4.charAt(0) === `@` ? hi({ file: b3.resolve(e4.cwd, t4.slice(1)), sync: true, noResume: true, onReadEntry: (t5) => e4.add(t5) }) : e4.add(t4);
  }), e4.end();
};
var Wo = async (e4, t3) => {
  for (let n2 of t3) n2.charAt(0) === `@` ? await hi({ file: b3.resolve(String(e4.cwd), n2.slice(1)), noResume: true, onReadEntry: (t4) => e4.add(t4) }) : e4.add(n2);
  e4.end();
};
var Go = Mn(Bo, Ho, () => {
  throw TypeError(`file is required`);
}, () => {
  throw TypeError(`file is required`);
}, (e4, t3) => {
  if (!kn(e4)) throw TypeError(`file is required`);
  if (e4.gzip || e4.brotli || e4.zstd || e4.file.endsWith(`.br`) || e4.file.endsWith(`.tbr`)) throw TypeError(`cannot append to compressed archives`);
  if (!t3?.length) throw TypeError(`no paths specified to add/replace`);
});
Mn(Go.syncFile, Go.asyncFile, Go.syncNoFile, Go.asyncNoFile, (e4, t3 = []) => {
  Go.validate?.(e4, t3), Ko(e4);
});
var Ko = (e4) => {
  let t3 = e4.filter;
  e4.mtimeCache ||= /* @__PURE__ */ new Map(), e4.filter = t3 ? (n2, r2) => t3(n2, r2) && !((e4.mtimeCache?.get(n2) ?? r2.mtime ?? 0) > (r2.mtime ?? 0)) : (t4, n2) => !((e4.mtimeCache?.get(t4) ?? n2.mtime ?? 0) > (n2.mtime ?? 0));
};
function qo(e4) {
  return M(b3.join(e4, `map.json`)) || {};
}
async function Jo(e4, t3, n2, r2) {
  let i3 = new Map(Object.entries(r2)), o3 = M(b3.join(e4, `access.json`)) || {};
  o3[t3.ref] = (/* @__PURE__ */ new Date()).toISOString(), await _e2(b3.join(e4, `access.json`), JSON.stringify(o3, null, `  `));
  let s3 = i3.get(t3.ref);
  if (s3 !== n2) {
    if (i3.set(t3.ref, n2), s3 && ![...i3.values()].includes(s3)) try {
      await ge2(b3.join(e4, `${s3}.tar.gz`), { force: true, recursive: true });
    } catch {
    }
    await _e2(b3.join(e4, `map.json`), JSON.stringify(Object.fromEntries(i3), null, `  `));
  }
}
async function Yo(e4, t3, n2) {
  let r2 = e4.cache ? e4.getHashFromCache(e4.repo, t3) : await e4.getHash(e4.repo, t3);
  if (r2) return r2;
  if (e4.repo.transport === `ssh`) {
    e4.warn({ message: `tar lookup failed; falling back to git clone` }), await e4.cloneWithGit(n2);
    return;
  }
  throw new k(`could not find commit hash for ${e4.repo.ref}`, { code: `MISSING_REF`, ref: e4.repo.ref });
}
async function Xo(e4, t3, n2) {
  return { file: b3.join(e4, `${n2}.tar.gz`), subdir: null, url: Fe2[t3.site](t3, n2), workDir: await pe2(b3.join(e4, `extract-`)) };
}
async function Zo(e4, t3) {
  let n2 = e4.repo.subdir?.split(`/`).filter(Boolean).join(`/`);
  if (!n2) return;
  let r2 = [];
  try {
    await es(e4, t3, async () => {
      r2.length = 0;
      let e5;
      if (await hi({ file: t3.file, onReadEntry: (e6) => {
        r2.push(e6.path);
      }, onwarn: (t4, n3) => {
        t4 === `TAR_BAD_ARCHIVE` && (e5 = Error(n3), e5.code = t4);
      } }), e5) throw e5;
    });
  } catch (e5) {
    throw new k(`could not inspect ${t3.url}`, { code: `COULD_NOT_DOWNLOAD`, url: t3.url, original: e5 });
  }
  let i3 = [...new Set(r2.map((e5) => e5.split(`/`)[0]))];
  for (let e5 of i3) {
    let i4 = `${e5}/${n2}`, a3 = `${i4}/`;
    if (r2.some((e6) => {
      let t4 = e6.replace(/\/$/u, ``);
      return t4 === i4 || t4.startsWith(a3);
    })) {
      t3.subdir = i4;
      return;
    }
  }
  throw new k(`could not find subdirectory /${n2} in archive`, { code: `MISSING_SUBDIR`, subdir: `/${n2}` });
}
async function Qo(e4, t3) {
  if (!e4.cache) {
    try {
      await le2(t3.file, ue2.F_OK), e4.verboseInfo({ code: `FILE_EXISTS`, message: `${t3.file} already exists locally` });
      return;
    } catch {
    }
    N(b3.dirname(t3.file)), e4.proxy && e4.verboseInfo({ code: `PROXY`, message: `using proxy ${e4.proxy}` }), e4.verboseInfo({ code: `DOWNLOADING`, message: `downloading ${t3.url} to ${t3.file}` });
    try {
      await e4.fetch(t3.url, t3.file, e4.proxy);
    } catch (e5) {
      throw new k(`could not download ${t3.url}`, { code: `COULD_NOT_DOWNLOAD`, url: t3.url, original: e5 });
    }
  }
}
async function $o(e4, t3, n2) {
  try {
    e4.verboseInfo({ code: `EXTRACTING`, message: `extracting ${t3.subdir ? `${e4.repo.subdir} from ` : ``}${t3.file} to ${t3.workDir}` });
    let [r2, i3] = t3.subdir ? [t3.subdir.split(`/`).length, [t3.subdir]] : [1, []];
    await es(e4, t3, () => zo({ C: t3.workDir, file: t3.file, strip: r2 }, i3));
    let a3 = await ns(t3.workDir);
    return a3 || (N(n2), await rs(t3.workDir, n2)), a3;
  } catch (e5) {
    throw new k(`could not download ${t3.url}`, { code: `COULD_NOT_DOWNLOAD`, url: t3.url, original: e5 });
  } finally {
    await ge2(t3.workDir, { force: true, recursive: true });
  }
}
async function es(e4, t3, n2) {
  try {
    await n2();
  } catch (r2) {
    let i3 = r2.code;
    if (!(typeof i3 == `string` && /^(TAR_BAD_ARCHIVE|TAR_ABORT|ZLIB_ERROR|Z_(BUF|DATA|STREAM|MEM|VERSION)_ERROR)$/u.test(i3)) || e4.cache) throw r2;
    try {
      await ge2(t3.file, { force: true, recursive: true });
    } catch {
    }
    await e4.fetch(t3.url, t3.file, e4.proxy), await n2();
  }
}
async function ts(e4, t3, n2) {
  let r2 = qo(t3), i3 = await Yo(e4, r2, n2);
  if (!i3) return;
  N(t3);
  let a3 = await Xo(t3, e4.repo, i3);
  await Qo(e4, a3), e4.repo.subdir && await Zo(e4, a3), await $o(e4, a3, n2) && (e4.warn({ message: `git lfs pointer detected in tar snapshot; falling back to git clone` }), await e4.cloneWithGit(n2)), await Jo(t3, e4.repo, i3, r2);
}
async function ns(e4) {
  let t3 = (await he2(e4, { withFileTypes: true })).map(async (t4) => {
    let n2 = b3.join(e4, t4.name);
    if (t4.isDirectory()) return ns(n2);
    if (!t4.isFile()) return false;
    let r2 = await me2(n2, `utf8`);
    return /^version https:\/\/git-lfs\.github\.com\/spec\/v1$/mu.test(r2) && /^oid sha256:[0-9a-f]{64}$/mu.test(r2) && /^size \d+$/mu.test(r2);
  });
  return (await Promise.all(t3)).some(Boolean);
}
async function rs(e4, t3) {
  let n2 = await he2(e4, { withFileTypes: true });
  await Promise.all(n2.map(async (n3) => {
    await de2(b3.join(e4, n3.name), b3.join(t3, n3.name), { recursive: true });
  }));
}
var is = /* @__PURE__ */ new Set([`tar`, `git`]);
function as(e4, t3, n2, r2) {
  let i3 = r2 === `.` ? `` : ` to ${r2}`;
  return `cloned ${S3(`${e4}/${t3}`)}#${S3(n2)}${i3}`;
}
var os = class t2 extends se2 {
  aliases;
  cache;
  files;
  force;
  mode;
  verbose;
  proxy;
  repo;
  fetch;
  git;
  gitClientPromise;
  src;
  constructor(t3, n2 = {}) {
    if (super(), n2.mode && !is.has(n2.mode)) throw Error(`Valid modes are ${[...is].join(`, `)}`);
    if (this.aliases = n2.aliases ?? {}, this.cache = n2.cache, this.files = n2.files, this.force = n2.force, this.verbose = n2.verbose, this.proxy = process.env.https_proxy, t3 === void 0) this.mode = n2.mode ?? `tar`;
    else {
      let e4 = Ke2(this.aliases, t3) ?? t3;
      if (typeof e4 != `string` || e4 === ``) throw new k(`source must not be empty`, { code: `BAD_SRC` });
      this.src = e4, this.repo = Ve2(e4), this.mode = n2.mode ?? this.repo.mode, this.repo = { ...this.repo, mode: this.mode };
    }
    this.fetch = n2.fetch || P, this.git = n2.git, this.info = this.info.bind(this), this.warn = this.warn.bind(this), this.verboseInfo = this.verboseInfo.bind(this);
  }
  getGitClient() {
    return this.git ? Promise.resolve(this.git) : (this.gitClientPromise ||= Promise.resolve().then(() => (init_client_8slZtdoy(), client_8slZtdoy_exports)).then(({ defaultGitClient: e4 }) => (this.git = e4, e4)), this.gitClientPromise);
  }
  getDirectives(e4) {
    return $e2(e4);
  }
  async clone(e4) {
    if (!this.repo) throw new k(`clone() requires a source`, { code: `MISSING_SRC` });
    et2(e4, this.force, this.info, this.verboseInfo), await this.cloneToDestination(e4), at2(e4, this.files, this.warn), this.info({ code: `SUCCESS`, dest: e4, message: as(this.repo.user, this.repo.name, this.repo.ref, e4), repo: this.repo }), await this.runDirectives(e4);
  }
  remove(e4, t3) {
    nt2(e4, t3, this.info, this.warn);
  }
  info(e4) {
    this.emit(`info`, e4);
  }
  warn(e4) {
    this.emit(`warn`, e4);
  }
  verboseInfo(e4) {
    this.verbose && this.info(e4);
  }
  async getHash(e4, t3) {
    try {
      let t4 = await (await this.getGitClient()).fetchRefs(e4);
      return e4.ref === `HEAD` ? this.selectHead(t4) : this.selectRef(t4, e4.ref);
    } catch (n2) {
      this.warn(n2);
      let r2 = n2.original;
      return r2 && this.verboseInfo(r2), this.getHashFromCache(e4, t3);
    }
  }
  getHashFromCache(e4, t3) {
    if (e4.ref in t3) {
      let n2 = t3[e4.ref];
      return this.info({ code: `USING_CACHE`, message: `using cached commit hash ${n2}` }), n2;
    }
  }
  selectRef(e4, t3) {
    for (let n2 of e4) if (n2.name === t3) return this.verboseInfo({ code: `FOUND_MATCH`, message: `found matching commit hash: ${n2.hash}` }), n2.hash;
    if (t3.length < 8) return null;
    for (let n2 of e4) if (n2.hash.startsWith(t3)) return n2.hash;
  }
  selectHead(e4) {
    let t3 = e4.find((e5) => e5.type === `HEAD`);
    if (t3) return t3.hash;
    for (let t4 of [`main`, `master`]) {
      let n2 = e4.find((e5) => e5.type === `HEAD` || !e5.name ? false : e5.name === t4 || e5.name.endsWith(`/${t4}`));
      if (n2) return n2.hash;
    }
    return e4.find((e5) => e5.type === `branch` && e5.hash)?.hash;
  }
  getRepo() {
    if (!this.repo) throw new k(`operation requires a source`, { code: `MISSING_SRC` });
    return this.repo;
  }
  async cloneWithTar(e4) {
    let t3 = this.getRepo();
    await ts({ cache: this.cache, cloneWithGit: (e5, t4) => this.cloneWithGit(e5, t4), fetch: this.fetch, getHash: (e5, t4) => this.getHash(e5, t4), getHashFromCache: (e5, t4) => this.getHashFromCache(e5, t4), proxy: this.proxy, repo: t3, verboseInfo: this.verboseInfo, warn: this.warn }, this.getRepoDir(), e4);
  }
  async cloneWithGit(e4, t3) {
    let n2 = this.getRepo();
    await (await this.getGitClient()).clone(n2, e4, t3 ?? n2.ref, n2.transport);
  }
  async cloneGitToDestination(e4, t3) {
    let n2 = this.getRepo();
    if (n2.subdir) {
      let r2 = await pe2(`degit-git-`);
      try {
        await this.cloneWithGit(r2, t3), ot2(r2, e4, n2.subdir);
      } finally {
        await ge2(r2, { force: true, recursive: true });
      }
      return;
    }
    await this.cloneWithGit(e4, t3);
  }
  shouldFallbackToGit(e4) {
    return !e4 || typeof e4 != `object` ? false : e4.code === `COULD_NOT_DOWNLOAD` && !this.cache;
  }
  getRepoDir() {
    let e4 = this.getRepo();
    return b3.join(V, e4.site, e4.user, e4.name);
  }
  async doCloneToDestination(e4) {
    let t3 = this.getRepo();
    if (this.mode === `git`) {
      let n2 = await this.getHash(t3, {});
      await this.cloneGitToDestination(e4, n2 || t3.ref);
      return;
    }
    try {
      await this.cloneWithTar(e4);
    } catch (t4) {
      if (!this.shouldFallbackToGit(t4)) throw t4;
      this.warn({ message: `tar snapshot download or extraction failed; falling back to git clone` }), await this.cloneGitToDestination(e4);
    }
  }
  async cloneToDestination(e4) {
    let t3 = this.getRepo();
    t3.site === `gitlab` ? await this.tryGitlabProject(He2(this.src, t3), e4, t3) : await this.doCloneToDestination(e4);
  }
  async tryGitlabProject(e4, t3, n2, r2) {
    let [i3, ...a3] = e4;
    if (i3) {
      this.repo = i3, this.verboseInfo({ message: `trying GitLab project path ${i3.url}` });
      try {
        await this.doCloneToDestination(t3);
      } catch (e5) {
        this.repo = n2;
        let o3 = e5.code;
        if (e5 instanceof k && (o3 === `MISSING_REF` || o3 === `COULD_NOT_FETCH`)) this.warn({ message: `GitLab project path ${i3.url} not found; trying next` }), await this.tryGitlabProject(a3, t3, n2, r2 ?? e5);
        else throw e5;
      }
    } else throw r2 ?? new k(`could not find a valid GitLab project path`, { code: `COULD_NOT_FETCH` });
  }
  async runDirectives(e4) {
    let t3 = this.getDirectives(e4);
    t3 && await this.doActions(t3, e4);
  }
  async getActionsStagingDir() {
    return await fe2(V, { recursive: true }), pe2(b3.join(V, `actions-`));
  }
  async doActions(e4, n2) {
    if (!Array.isArray(e4)) throw new k(`directives must be an array`, { code: `BAD_DIRECTIVES` });
    let r2 = { aliases: this.aliases, cache: this.cache, fetch: this.fetch, getGitClient: () => this.getGitClient(), getStagingDir: async () => r2.stagingDir ??= await this.getActionsStagingDir(), hasStashed: false, info: this.info, verbose: this.verbose, warn: this.warn };
    try {
      await pt2(r2, e4, n2, (e5, n3) => new t2(e5, n3));
    } finally {
      r2.stagingDir && (r2.hasStashed ? this.warn({ message: `actions staging left for recovery: ${r2.stagingDir}`, recoveryPath: r2.stagingDir }) : await ge2(r2.stagingDir, { force: true, recursive: true }).catch((e5) => this.warn({ message: `could not remove actions staging: ${r2.stagingDir}`, original: e5 })));
    }
  }
};
function ss(e4, t3 = {}) {
  return new os(e4, t3);
}

// src/index.mjs
var index_default = ss;
export {
  index_default as default,
  ss as degit
};
/*! Bundled license information:

degit/dist/client-8slZtdoy.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  (*!
  * This code for `path.join` is directly copied from @zenfs/core/path for bundle size improvements.
  * SPDX-License-Identifier: LGPL-3.0-or-later
  * Copyright (c) James Prevett and other ZenFS contributors.
  *)
  (*! simple-concat. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  (*! simple-get. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
