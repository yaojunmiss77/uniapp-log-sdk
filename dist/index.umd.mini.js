(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rxjs'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["UNIAPP-LOG-SDK"] = {}, global.rxjs));
})(this, (function (exports, rxjs) { 'use strict';

  var consoleSubject = new rxjs.Subject();
  var errorSubject = new rxjs.Subject();
  var networkSubject = new rxjs.Subject();
  var nativeEventSubject = new rxjs.Subject();
  var consoleLogs = [];
  var networkLogs = [];
  var nativeEventLogs = [];
  var errorLogs = [];
  /**
   * 得到打印日志
   * @returns
   */
  function getConsoleLogs() {
    return consoleLogs;
  }
  function getNetworkLogs() {
    return networkLogs;
  }
  function getNativeEventLogs() {
    return nativeEventLogs;
  }
  function getErrorLogs() {
    return errorLogs;
  }
  function addErrorLogs(err) {
    if (err === null || err === void 0 ? void 0 : err.length) {
      errorLogs.push(err);
      errorSubject.next(errorLogs);
    }
  }
  var originalUniSendEvent = uni.sendNativeEvent;
  uni.sendNativeEvent = function (eventName, params, callback) {
    // #ifndef H5
    var data = {
      key: "sendNativeEvent:".concat(eventName),
      params: params,
      response: ''
    };
    nativeEventLogs.push(data);
    nativeEventSubject.next(nativeEventLogs);
    originalUniSendEvent(eventName, params, function () {
      var _a;
      for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }
      data.response = (_a = params === null || params === void 0 ? void 0 : params[0]) !== null && _a !== void 0 ? _a : '';
      nativeEventSubject.next(nativeEventLogs);
      callback.apply(void 0, params);
    });
    // #endif
  };

  var originalUniOnEvent = uni.onNativeEventReceive;
  uni.onNativeEventReceive = function (callback) {
    // #ifndef H5
    originalUniOnEvent(function (event, data) {
      nativeEventLogs.push({
        key: "onNativeEvent:".concat(event),
        response: data,
        params: ''
      });
      nativeEventSubject.next(nativeEventLogs);
      callback === null || callback === void 0 ? void 0 : callback(event, data);
    });
    // #endif
  };
  // #ifndef H5
  /** H5的时候不进行拦截，以免log展示位置错误 */
  var originalConsoleLog = console.log;
  console.log = function () {
    for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      params[_key2] = arguments[_key2];
    }
    consoleLogs.push(params);
    consoleSubject.next(consoleLogs);
    originalConsoleLog.apply(void 0, params);
  };
  // #endif
  var originRequest = uni === null || uni === void 0 ? void 0 : uni.request;
  Object.defineProperty(uni, 'request', {
    configurable: true,
    enumerable: true,
    writable: false,
    value: function value(requestParams) {
      var onceReqResult = {
        request: requestParams,
        response: null
      };
      networkLogs.push(onceReqResult);
      networkSubject.next(networkLogs);
      var originalCompleteMethod = requestParams.complete;
      requestParams.complete = function () {
        for (var _len3 = arguments.length, resParams = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          resParams[_key3] = arguments[_key3];
        }
        onceReqResult.response = resParams === null || resParams === void 0 ? void 0 : resParams[0];
        networkSubject.next(networkLogs);
        if (typeof originalCompleteMethod === 'function') {
          return originalCompleteMethod.apply(this, resParams);
        }
      };
      return originRequest.call(this, requestParams);
    }
  });
  uni.onError(function () {
    for (var _len4 = arguments.length, err = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      err[_key4] = arguments[_key4];
    }
    addErrorLogs(err);
  });

  exports.addErrorLogs = addErrorLogs;
  exports.consoleSubject = consoleSubject;
  exports.errorSubject = errorSubject;
  exports.getConsoleLogs = getConsoleLogs;
  exports.getErrorLogs = getErrorLogs;
  exports.getNativeEventLogs = getNativeEventLogs;
  exports.getNetworkLogs = getNetworkLogs;
  exports.nativeEventSubject = nativeEventSubject;
  exports.networkSubject = networkSubject;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
