// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"vim/node_modules/vim-wasm/vimwasm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkBrowserCompatibility = checkBrowserCompatibility;
exports.VimWasm = exports.ScreenCanvas = exports.InputHandler = exports.ResizeHandler = exports.VimWorker = exports.VIM_VERSION = void 0;
const VIM_VERSION = "8.1.1845";
exports.VIM_VERSION = VIM_VERSION;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function noop() {}

let debug = noop;
const STATUS_NOT_SET = 0;
const STATUS_NOTIFY_KEY = 1;
const STATUS_NOTIFY_RESIZE = 2;
const STATUS_NOTIFY_OPEN_FILE_BUF_COMPLETE = 3;
const STATUS_NOTIFY_CLIPBOARD_WRITE_COMPLETE = 4;
const STATUS_REQUEST_CMDLINE = 5;
const STATUS_REQUEST_SHARED_BUF = 6;
const STATUS_NOTIFY_ERROR_OUTPUT = 7;
const STATUS_NOTIFY_EVAL_FUNC_RET = 8;

function statusName(s) {
  switch (s) {
    case STATUS_NOT_SET:
      return "NOT_SET";

    case STATUS_NOTIFY_KEY:
      return "NOTIFY_KEY";

    case STATUS_NOTIFY_RESIZE:
      return "NOTIFY_RESIZE";

    case STATUS_NOTIFY_OPEN_FILE_BUF_COMPLETE:
      return "NOTIFY_OPEN_FILE_BUF_COMPLETE";

    case STATUS_NOTIFY_CLIPBOARD_WRITE_COMPLETE:
      return "NOTIFY_CLIPBOARD_WRITE_COMPLETE";

    case STATUS_REQUEST_CMDLINE:
      return "REQUEST_CMDLINE";

    case STATUS_REQUEST_SHARED_BUF:
      return "REQUEST_SHARED_BUF";

    case STATUS_NOTIFY_ERROR_OUTPUT:
      return "NOTIFY_ERROR_OUTPUT";

    case STATUS_NOTIFY_EVAL_FUNC_RET:
      return "STATUS_NOTIFY_EVAL_FUNC_RET";

    default:
      return `Unknown command: ${s}`;
  }
}

function checkBrowserCompatibility() {
  function notSupported(feat) {
    return `${feat} is not supported by this browser. If you're using Firefox or Safari, please enable feature flag.`;
  }

  if (typeof SharedArrayBuffer === "undefined") {
    return notSupported("SharedArrayBuffer");
  }

  if (typeof Atomics === "undefined") {
    return notSupported("Atomics API");
  }

  return undefined;
}

;

class VimWorker {
  constructor(scriptPath, onMessage, onError) {
    this.worker = new Worker(scriptPath);
    this.worker.onmessage = this.recvMessage.bind(this);
    this.worker.onerror = this.recvError.bind(this);
    this.sharedBuffer = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 128));
    this.onMessage = onMessage;
    this.onError = onError;
    this.onOneshotMessage = new Map();
    this.debug = false;
    this.pendingEvents = [];
  }

  terminate() {
    this.worker.terminate();
    this.worker.onmessage = null;
    debug("Terminated worker thread. Thank you for working hard!");
  }

  sendStartMessage(msg) {
    this.worker.postMessage(msg);
    debug("Sent start message", msg);
  }

  notifyOpenFileBufComplete(filename, bufId) {
    this.enqueueEvent(STATUS_NOTIFY_OPEN_FILE_BUF_COMPLETE, bufId, filename);
  }

  notifyClipboardWriteComplete(cannotSend, bufId) {
    this.enqueueEvent(STATUS_NOTIFY_CLIPBOARD_WRITE_COMPLETE, cannotSend, bufId);
  }

  notifyKeyEvent(key, keyCode, ctrl, shift, alt, meta) {
    this.enqueueEvent(STATUS_NOTIFY_KEY, keyCode, ctrl, shift, alt, meta, key);
  }

  notifyResizeEvent(width, height) {
    this.enqueueEvent(STATUS_NOTIFY_RESIZE, width, height);
  }

  async requestSharedBuffer(byteLength) {
    this.enqueueEvent(STATUS_REQUEST_SHARED_BUF, byteLength);
    const msg = await this.waitForOneshotMessage("shared-buf:response");

    if (msg.buffer.byteLength !== byteLength) {
      throw new Error(`Size of shared buffer from worker ${msg.buffer.byteLength} bytes mismatches to requested size ${byteLength} bytes`);
    }

    return [msg.bufId, msg.buffer];
  }

  notifyClipboardError() {
    this.notifyClipboardWriteComplete(true, 0);
    debug("Reading clipboard failed. Notify it to worker");
  }

  async responseClipboardText(text) {
    const encoded = new TextEncoder().encode(text);
    const [bufId, buffer] = await this.requestSharedBuffer(encoded.byteLength + 1);
    new Uint8Array(buffer).set(encoded);
    this.notifyClipboardWriteComplete(false, bufId);
    debug("Wrote clipboard", encoded.byteLength, "bytes text and notified to worker");
  }

  async requestCmdline(cmdline) {
    if (cmdline.length === 0) {
      throw new Error("Specified command line is empty");
    }

    this.enqueueEvent(STATUS_REQUEST_CMDLINE, cmdline);
    const msg = await this.waitForOneshotMessage("cmdline:response");
    debug("Result of command", cmdline, ":", msg.success);

    if (!msg.success) {
      throw Error(`Command '${cmdline}' was invalid and not accepted by Vim`);
    }
  }

  async notifyErrorOutput(message) {
    const encoded = new TextEncoder().encode(message);
    const [bufId, buffer] = await this.requestSharedBuffer(encoded.byteLength);
    new Uint8Array(buffer).set(encoded);
    this.enqueueEvent(STATUS_NOTIFY_ERROR_OUTPUT, bufId);
    debug("Sent error message output:", message);
  }

  async notifyEvalFuncRet(ret) {
    const encoded = new TextEncoder().encode(ret);
    const [bufId, buffer] = await this.requestSharedBuffer(encoded.byteLength);
    new Uint8Array(buffer).set(encoded);
    this.enqueueEvent(STATUS_NOTIFY_EVAL_FUNC_RET, false, bufId);
    debug("Sent return value of evaluated JS function:", ret);
  }

  async notifyEvalFuncError(msg, err, dontReply) {
    const errmsg = `${msg} for jsevalfunc(): ${err.message}: ${err.stack}`;

    if (dontReply) {
      debug("Will send error output from jsevalfunc() though the invocation was notify-only:", errmsg);
      return this.notifyErrorOutput(errmsg);
    }

    const encoded = new TextEncoder().encode("E9999: " + errmsg);
    const [bufId, buffer] = await this.requestSharedBuffer(encoded.byteLength);
    new Uint8Array(buffer).set(encoded);
    this.enqueueEvent(STATUS_NOTIFY_EVAL_FUNC_RET, true, bufId);
    debug("Sent exception thrown by evaluated JS function:", msg, err);
  }

  onEventDone(doneStatus) {
    const done = statusName(doneStatus);
    const finished = this.pendingEvents.shift();

    if (finished === undefined) {
      throw new Error(`FATAL: Received ${done} event but event queue is empty`);
    }

    if (finished[0] !== doneStatus) {
      throw new Error(`FATAL: Received ${done} event but queue says previous event was ${statusName(finished[0])} with args ${finished[1]}`);
    }

    if (this.pendingEvents.length === 0) {
      debug("No pending event remains after event", done);
      return;
    }

    debug("After", done, "event, still", this.pendingEvents.length, "events are pending");
    const [status, values] = this.pendingEvents[0];
    this.sendEvent(status, values);
  }

  enqueueEvent(status, ...values) {
    this.pendingEvents.push([status, values]);

    if (this.pendingEvents.length > 1) {
      debug("Other event is being handled by worker. Pending:", statusName(status), values);
      return;
    }

    this.sendEvent(status, values);
  }

  sendEvent(status, values) {
    const event = statusName(status);

    if (this.debug) {
      const status = Atomics.load(this.sharedBuffer, 0);

      if (status !== STATUS_NOT_SET) {
        console.error("INVARIANT ERROR! Status byte must be zero cleared:", event);
      }
    }

    debug("Write event", event, "payload to buffer:", values);
    let idx = 0;
    this.sharedBuffer[idx++] = status;

    for (const value of values) {
      switch (typeof value) {
        case "string":
          idx = this.encodeStringToBuffer(value, idx);
          break;

        case "number":
          this.sharedBuffer[idx++] = value;
          break;

        case "boolean":
          this.sharedBuffer[idx++] = +value;
          break;

        default:
          throw new Error(`FATAL: Invalid value for payload to worker: ${value}`);
      }
    }

    debug("Wrote", idx * 4, "bytes to buffer for event", event);
    Atomics.notify(this.sharedBuffer, 0, 1);
    debug("Notified event", event, "to worker");
  }

  async waitForOneshotMessage(kind) {
    return new Promise(resolve => {
      this.onOneshotMessage.set(kind, resolve);
    });
  }

  encodeStringToBuffer(s, startIdx) {
    let idx = startIdx;
    const len = s.length;
    this.sharedBuffer[idx++] = len;

    for (let i = 0; i < len; ++i) {
      this.sharedBuffer[idx++] = s.charCodeAt(i);
    }

    return idx;
  }

  recvMessage(e) {
    const msg = e.data;
    const handler = this.onOneshotMessage.get(msg.kind);

    if (handler !== undefined) {
      this.onOneshotMessage.delete(msg.kind);
      handler(msg);
      return;
    }

    this.onMessage(msg);
  }

  recvError(e) {
    debug("Received an error from worker:", e);
    const msg = `${e.message} (${e.filename}:${e.lineno}:${e.colno})`;
    this.onError(new Error(msg));
  }

}

exports.VimWorker = VimWorker;
;

class ResizeHandler {
  constructor(domWidth, domHeight, canvas, worker) {
    this.canvas = canvas;
    this.worker = worker;
    this.elemHeight = domHeight;
    this.elemWidth = domWidth;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = domWidth * dpr;
    this.canvas.height = domHeight * dpr;
    this.bounceTimerToken = null;
    this.onResize = this.onResize.bind(this);
  }

  onVimInit() {
    window.addEventListener("resize", this.onResize, {
      passive: true
    });
  }

  onVimExit() {
    window.removeEventListener("resize", this.onResize);
  }

  doResize() {
    const rect = this.canvas.getBoundingClientRect();
    debug("Resize Vim:", rect);
    this.elemWidth = rect.width;
    this.elemHeight = rect.height;
    const res = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * res;
    this.canvas.height = rect.height * res;
    this.worker.notifyResizeEvent(rect.width, rect.height);
  }

  onResize() {
    if (this.bounceTimerToken !== null) {
      window.clearTimeout(this.bounceTimerToken);
    }

    this.bounceTimerToken = window.setTimeout(() => {
      this.bounceTimerToken = null;
      this.doResize();
    }, 500);
  }

}

exports.ResizeHandler = ResizeHandler;
;

class InputHandler {
  constructor(worker, input) {
    this.worker = worker;
    this.elem = input;
    this.onKeydown = this.onKeydown.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.focus();
  }

  setFont(name, size) {
    this.elem.style.fontFamily = name;
    this.elem.style.fontSize = size + "px";
  }

  focus() {
    this.elem.focus();
  }

  onVimInit() {
    this.elem.addEventListener("keydown", this.onKeydown, {
      capture: true
    });
    this.elem.addEventListener("blur", this.onBlur);
    this.elem.addEventListener("focus", this.onFocus);
  }

  onVimExit() {
    this.elem.removeEventListener("keydown", this.onKeydown);
    this.elem.removeEventListener("blur", this.onBlur);
    this.elem.removeEventListener("focus", this.onFocus);
  }

  onKeydown(event) {
    event.preventDefault();
    event.stopPropagation();
    debug("onKeydown():", event, event.key, event.keyCode);
    let key = event.key;
    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    const meta = event.metaKey;

    if (key.length > 1) {
      if (key === "Unidentified" || ctrl && key === "Control" || shift && key === "Shift" || alt && key === "Alt" || meta && key === "Meta") {
        debug("Ignore key input", key);
        return;
      }
    }

    if (key === "¥" || !shift && key === "|" && event.code === "IntlYen") {
      key = "\\";
    }

    this.worker.notifyKeyEvent(key, event.keyCode, ctrl, shift, alt, meta);
  }

  onFocus() {
    debug("onFocus()");
  }

  onBlur(event) {
    debug("onBlur():", event);
    event.preventDefault();
  }

}

exports.InputHandler = InputHandler;
;

class ScreenCanvas {
  constructor(worker, canvas, input) {
    this.worker = worker;
    this.canvas = canvas;
    const ctx = this.canvas.getContext("2d", {
      alpha: false
    });

    if (ctx === null) {
      throw new Error("Cannot get 2D context for <canvas>");
    }

    this.ctx = ctx;
    const rect = this.canvas.getBoundingClientRect();
    const res = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * res;
    this.canvas.height = rect.height * res;
    this.canvas.addEventListener("click", this.onClick.bind(this), {
      capture: true,
      passive: true
    });
    this.input = new InputHandler(this.worker, input);
    this.resizer = new ResizeHandler(rect.width, rect.height, canvas, worker);
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.queue = [];
    this.rafScheduled = false;
    this.perf = false;
  }

  onVimInit() {
    this.input.onVimInit();
    this.resizer.onVimInit();
  }

  onVimExit() {
    this.input.onVimExit();
    this.resizer.onVimExit();
  }

  draw(msg) {
    if (!this.rafScheduled) {
      window.requestAnimationFrame(this.onAnimationFrame);
      this.rafScheduled = true;
    }

    this.queue.push(msg);
  }

  focus() {
    this.input.focus();
  }

  getDomSize() {
    return {
      width: this.resizer.elemWidth,
      height: this.resizer.elemHeight
    };
  }

  setPerf(enabled) {
    this.perf = enabled;
  }

  setColorFG(name) {
    this.fgColor = name;
  }

  setColorBG(_name) {}

  setColorSP(name) {
    this.spColor = name;
  }

  setFont(name, size) {
    this.fontName = name;
    this.input.setFont(name, size);
  }

  drawRect(x, y, w, h, color, filled) {
    const dpr = window.devicePixelRatio || 1;
    x = Math.floor(x * dpr);
    y = Math.floor(y * dpr);
    w = Math.floor(w * dpr);
    h = Math.floor(h * dpr);
    this.ctx.fillStyle = color;

    if (filled) {
      this.ctx.fillRect(x, y, w, h);
    } else {
      this.ctx.rect(x, y, w, h);
    }
  }

  drawText(text, ch, lh, cw, x, y, bold, underline, undercurl, strike) {
    const dpr = window.devicePixelRatio || 1;
    ch = ch * dpr;
    lh = lh * dpr;
    cw = cw * dpr;
    x = x * dpr;
    y = y * dpr;
    let font = Math.floor(ch) + "px " + this.fontName;

    if (bold) {
      font = "bold " + font;
    }

    this.ctx.font = font;
    this.ctx.textBaseline = "bottom";
    this.ctx.fillStyle = this.fgColor;
    const descent = (lh - ch) / 2;
    const yi = Math.floor(y + lh - descent);

    for (let i = 0; i < text.length; ++i) {
      const c = text[i];

      if (c === " ") {
        continue;
      }

      this.ctx.fillText(c, Math.floor(x + cw * i), yi);
    }

    if (underline) {
      this.ctx.strokeStyle = this.fgColor;
      this.ctx.lineWidth = 1 * dpr;
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      const underlineY = Math.floor(y + lh - descent - 1 * dpr);
      this.ctx.moveTo(Math.floor(x), underlineY);
      this.ctx.lineTo(Math.floor(x + cw * text.length), underlineY);
      this.ctx.stroke();
    } else if (undercurl) {
      this.ctx.strokeStyle = this.spColor;
      this.ctx.lineWidth = 1 * dpr;
      const curlWidth = Math.floor(cw / 3);
      this.ctx.setLineDash([curlWidth, curlWidth]);
      this.ctx.beginPath();
      const undercurlY = Math.floor(y + lh - descent - 1 * dpr);
      this.ctx.moveTo(Math.floor(x), undercurlY);
      this.ctx.lineTo(Math.floor(x + cw * text.length), undercurlY);
      this.ctx.stroke();
    } else if (strike) {
      this.ctx.strokeStyle = this.fgColor;
      this.ctx.lineWidth = 1 * dpr;
      this.ctx.beginPath();
      const strikeY = Math.floor(y + lh / 2);
      this.ctx.moveTo(Math.floor(x), strikeY);
      this.ctx.lineTo(Math.floor(x + cw * text.length), strikeY);
      this.ctx.stroke();
    }
  }

  invertRect(x, y, w, h) {
    const dpr = window.devicePixelRatio || 1;
    x = Math.floor(x * dpr);
    y = Math.floor(y * dpr);
    w = Math.floor(w * dpr);
    h = Math.floor(h * dpr);
    const img = this.ctx.getImageData(x, y, w, h);
    const data = img.data;
    const len = data.length;

    for (let i = 0; i < len; ++i) {
      data[i] = 255 - data[i];
      ++i;
      data[i] = 255 - data[i];
      ++i;
      data[i] = 255 - data[i];
      ++i;
    }

    this.ctx.putImageData(img, x, y);
  }

  imageScroll(x, sy, dy, w, h) {
    const dpr = window.devicePixelRatio || 1;
    x = Math.floor(x * dpr);
    sy = Math.floor(sy * dpr);
    dy = Math.floor(dy * dpr);
    w = Math.floor(w * dpr);
    h = Math.floor(h * dpr);
    this.ctx.drawImage(this.canvas, x, sy, w, h, x, dy, w, h);
  }

  onClick() {
    this.input.focus();
  }

  onAnimationFrame() {
    debug("Rendering", this.queue.length, "events on animation frame");
    this.perfMark("raf");

    for (const [method, args] of this.queue) {
      this.perfMark("draw");
      this[method].apply(this, args);
      this.perfMeasure("draw", `draw:${method}`);
    }

    this.queue.length = 0;
    this.rafScheduled = false;
    this.perfMeasure("raf");
  }

  perfMark(m) {
    if (this.perf) {
      performance.mark(m);
    }
  }

  perfMeasure(m, n) {
    if (this.perf) {
      performance.measure(n || m, m);
      performance.clearMarks(m);
    }
  }

}

exports.ScreenCanvas = ScreenCanvas;
;

class VimWasm {
  constructor(opts) {
    const script = opts.workerScriptPath;

    if (!script) {
      throw new Error("'workerScriptPath' option is required");
    }

    this.handleError = this.handleError.bind(this);
    this.worker = new VimWorker(script, this.onMessage.bind(this), this.handleError);

    if ("canvas" in opts && "input" in opts) {
      this.screen = new ScreenCanvas(this.worker, opts.canvas, opts.input);
    } else if ("screen" in opts) {
      this.screen = opts.screen;
    } else {
      throw new Error("Invalid options for VimWasm construction: " + JSON.stringify(opts));
    }

    this.perf = false;
    this.debug = false;
    this.perfMessages = {};
    this.running = false;
    this.end = false;
  }

  start(opts) {
    if (this.running || this.end) {
      throw new Error("Cannot start Vim twice");
    }

    const o = opts || {
      clipboard: navigator.clipboard !== undefined
    };

    if (o.debug) {
      debug = console.log.bind(console, "main:");
      this.worker.debug = true;
    }

    this.perf = !!o.perf;
    this.debug = !!o.debug;
    this.screen.setPerf(this.perf);
    this.running = true;
    this.perfMark("init");
    const {
      width: width,
      height: height
    } = this.screen.getDomSize();
    const msg = {
      kind: "start",
      buffer: this.worker.sharedBuffer,
      canvasDomWidth: width,
      canvasDomHeight: height,
      debug: this.debug,
      perf: this.perf,
      clipboard: !!o.clipboard,
      files: o.files || {},
      dirs: o.dirs || [],
      fetchFiles: o.fetchFiles || {},
      persistent: o.persistentDirs || [],
      cmdArgs: o.cmdArgs || []
    };
    this.worker.sendStartMessage(msg);
    debug("Started with drawer", this.screen);
  }

  async dropFile(name, contents) {
    if (!this.running) {
      throw new Error("Cannot open file since Vim is not running");
    }

    debug("Handling to open file", name, contents);
    const [bufId, buffer] = await this.worker.requestSharedBuffer(contents.byteLength);
    new Uint8Array(buffer).set(new Uint8Array(contents));
    this.worker.notifyOpenFileBufComplete(name, bufId);
    debug("Wrote file", name, "to", contents.byteLength, "bytes buffer and notified it to worker");
  }

  async dropFiles(files) {
    const reader = new FileReader();

    for (const file of files) {
      const [name, contents] = await this.readFile(reader, file);
      await this.dropFile(name, contents);
    }
  }

  resize(pixelWidth, pixelHeight) {
    this.worker.notifyResizeEvent(pixelWidth, pixelHeight);
  }

  sendKeydown(key, keyCode, modifiers) {
    const {
      ctrl = false,
      shift = false,
      alt = false,
      meta = false
    } = modifiers || {};

    if (key.length > 1) {
      if (key === "Unidentified" || ctrl && key === "Control" || shift && key === "Shift" || alt && key === "Alt" || meta && key === "Meta") {
        debug("Ignore key input", key);
        return;
      }
    }

    this.worker.notifyKeyEvent(key, keyCode, ctrl, shift, alt, meta);
  }

  cmdline(cmdline) {
    return this.worker.requestCmdline(cmdline);
  }

  isRunning() {
    return this.running;
  }

  focus() {
    this.screen.focus();
  }

  showError(message) {
    return this.worker.notifyErrorOutput(message);
  }

  async readFile(reader, file) {
    return new Promise((resolve, reject) => {
      reader.onload = f => {
        debug("Read file", file.name, "from D&D:", f);
        resolve([file.name, reader.result]);
      };

      reader.onerror = () => {
        reader.abort();
        reject(new Error(`Error on loading file ${file}`));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  async evalJS(path, contents) {
    debug("Evaluating JavaScript file", path, "with size", contents.byteLength, "bytes");
    const dec = new TextDecoder();
    const src = '"use strict";' + dec.decode(contents);

    try {
      Function(src)();
    } catch (err) {
      debug("Failed to evaluate", path, "with error:", err);
      await this.showError(`${err.message}\n\n${err.stack}`);
    }
  }

  async evalFunc(body, args, notifyOnly) {
    debug("Evaluating JavaScript function:", body, args);
    let f;

    try {
      f = new AsyncFunction(body);
    } catch (err) {
      return this.worker.notifyEvalFuncError("Could not construct function", err, notifyOnly);
    }

    let ret;

    try {
      ret = await f(...args);
    } catch (err) {
      return this.worker.notifyEvalFuncError("Exception was thrown while evaluating function", err, notifyOnly);
    }

    if (notifyOnly) {
      debug("Evaluated JavaScript result was discarded since the message was notify-only:", ret, body);
      return Promise.resolve();
    }

    let retJson;

    try {
      retJson = JSON.stringify(ret);
    } catch (err) {
      return this.worker.notifyEvalFuncError("Could not serialize return value as JSON from function", err, false);
    }

    return this.worker.notifyEvalFuncRet(retJson);
  }

  onMessage(msg) {
    if (this.perf && msg.timestamp !== undefined) {
      const duration = Date.now() - msg.timestamp;
      const name = msg.kind === "draw" ? `draw:${msg.event[0]}` : msg.kind;
      const timestamps = this.perfMessages[name];

      if (timestamps === undefined) {
        this.perfMessages[name] = [duration];
      } else {
        this.perfMessages[name].push(duration);
      }
    }

    switch (msg.kind) {
      case "draw":
        this.screen.draw(msg.event);
        debug("draw event", msg.event);
        break;

      case "done":
        this.worker.onEventDone(msg.status);
        break;

      case "evalfunc":
        {
          const args = msg.argsJson === undefined ? [] : JSON.parse(msg.argsJson);
          this.evalFunc(msg.body, args, msg.notifyOnly).catch(this.handleError);
          break;
        }

      case "title":
        if (this.onTitleUpdate) {
          debug("title was updated:", msg.title);
          this.onTitleUpdate(msg.title);
        }

        break;

      case "read-clipboard:request":
        if (this.readClipboard) {
          this.readClipboard().then(text => this.worker.responseClipboardText(text)).catch(err => {
            debug("Cannot read clipboard:", err);
            this.worker.notifyClipboardError();
          });
        } else {
          debug("Cannot read clipboard because VimWasm.readClipboard is not set");
          this.worker.notifyClipboardError();
        }

        break;

      case "write-clipboard":
        debug("Handle writing text", msg.text, "to clipboard with", this.onWriteClipboard);

        if (this.onWriteClipboard) {
          this.onWriteClipboard(msg.text);
        }

        break;

      case "export":
        if (this.onFileExport !== undefined) {
          debug("Exporting file", msg.path, "with size in bytes", msg.contents.byteLength);
          this.onFileExport(msg.path, msg.contents);
        }

        break;

      case "eval":
        this.evalJS(msg.path, msg.contents).catch(this.handleError);
        break;

      case "started":
        this.screen.onVimInit();

        if (this.onVimInit) {
          this.onVimInit();
        }

        this.perfMeasure("init");
        debug("Vim started");
        break;

      case "exit":
        this.screen.onVimExit();
        this.printPerfs();
        this.worker.terminate();

        if (this.onVimExit) {
          this.onVimExit(msg.status);
        }

        debug("Vim exited with status", msg.status);
        this.perf = false;
        this.debug = false;
        this.screen.setPerf(false);
        this.running = false;
        this.end = true;
        break;

      case "error":
        debug("Vim threw an error:", msg.message);
        this.handleError(new Error(msg.message));
        this.worker.terminate();
        break;

      default:
        throw new Error(`Unexpected message from worker: ${JSON.stringify(msg)}`);
    }
  }

  handleError(err) {
    if (this.onError) {
      this.onError(err);
    }
  }

  printPerfs() {
    if (!this.perf) {
      return;
    }

    {
      const measurements = new Map();

      for (const e of performance.getEntries()) {
        const ms = measurements.get(e.name);

        if (ms === undefined) {
          measurements.set(e.name, [e]);
        } else {
          ms.push(e);
        }
      }

      const averages = {};
      const amounts = {};
      const timings = [];

      for (const [name, ms] of measurements) {
        if (ms.length === 1 && ms[0].entryType !== "measure") {
          timings.push(ms[0]);
          continue;
        }

        console.log(`%c${name}`, "color: green; font-size: large");
        console.table(ms, ["duration", "startTime"]);
        const total = ms.reduce((a, m) => a + m.duration, 0);
        averages[name] = total / ms.length;
        amounts[name] = total;
      }

      console.log("%cTimings (ms)", "color: green; font-size: large");
      console.table(timings, ["name", "entryType", "startTime", "duration"]);
      console.log("%cAmount: Perf Mark Durations (ms)", "color: green; font-size: large");
      console.table(amounts);
      console.log("%cAverage: Perf Mark Durations (ms)", "color: green; font-size: large");
      console.table(averages);
      performance.clearMarks();
      performance.clearMeasures();
    }
    {
      const averages = {};

      for (const name of Object.keys(this.perfMessages)) {
        const durations = this.perfMessages[name];
        const total = durations.reduce((a, d) => a + d, 0);
        averages[name] = total / durations.length;
      }

      console.log("%cAverage: Inter-thread Messages Duration (ms)", "color: green; font-size: large");
      console.table(averages);
      this.perfMessages = {};
    }
  }

  perfMark(m) {
    if (this.perf) {
      performance.mark(m);
    }
  }

  perfMeasure(m) {
    if (this.perf) {
      performance.measure(m, m);
      performance.clearMarks(m);
    }
  }

}

exports.VimWasm = VimWasm;
;
},{}],"vim/index.js":[function(require,module,exports) {
"use strict";

var _vimWasm = require("vim-wasm");

var screenCanvasElement = document.getElementById('vim-screen');
var vim = new _vimWasm.VimWasm({
  workerScriptPath: 'vim.js',
  canvas: screenCanvasElement,
  input: document.getElementById('vim-input')
}); // Handle drag and drop

function cancel(e) {
  e.stopPropagation();
  e.preventDefault();
}

screenCanvasElement.addEventListener('dragover', function (e) {
  cancel(e);

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy';
  }
}, false);
screenCanvasElement.addEventListener('drop', function (e) {
  cancel(e);

  if (e.dataTransfer) {
    vim.dropFiles(e.dataTransfer.files).catch(console.error);
  }
}, false);

vim.onVimExit = function (status) {
  alert("Vim exited with status ".concat(status));
};

vim.onFileExport = function (fullpath, contents) {
  var slashIdx = fullpath.lastIndexOf('/');
  var filename = slashIdx !== -1 ? fullpath.slice(slashIdx + 1) : fullpath;
  var blob = new Blob([contents], {
    type: 'application/octet-stream'
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.rel = 'noopener';
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

vim.readClipboard = navigator.clipboard.readText;
vim.onWriteClipboard = navigator.clipboard.writeText;
vim.onError = console.error;
vim.start();
},{"vim-wasm":"vim/node_modules/vim-wasm/vimwasm.js"}],"../../../.nvm/versions/node/v12.13.0/lib/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "43391" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../.nvm/versions/node/v12.13.0/lib/node_modules/parcel/src/builtins/hmr-runtime.js","vim/index.js"], null)
//# sourceMappingURL=/vim.02a00fd6.js.map