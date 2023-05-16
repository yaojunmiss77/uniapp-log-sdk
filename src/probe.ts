import { Subject } from 'rxjs';
import { REPORT_CONFIG } from './constant';

/** 对应多值 */
export const consoleSubject = new Subject<any[]>();
export const errorSubject = new Subject<any[]>();
export const networkSubject = new Subject<any[]>();
export const nativeEventSubject = new Subject<any[]>();

/** 对应单值 */
export const consoleBroadcast = new Subject<any>();
export const errorBroadcast = new Subject<any>();
export const networkResponseBroadcast = new Subject<any>();
export const nativeEventResponseBroadcast = new Subject<any>();

const consoleLogs: any[] = [];
const networkLogs: any[] = [];
const nativeEventLogs: any[] = [];
const errorLogs: any[] = [];
/**
 * 得到打印日志
 * @returns
 */
export function getConsoleLogs() {
  return consoleLogs;
}
export function getNetworkLogs() {
  return networkLogs;
}
export function getNativeEventLogs() {
  return nativeEventLogs;
}
export function getErrorLogs() {
  return errorLogs;
}
export function addNativeEventLogs(log: any) {
  if (nativeEventLogs.length > REPORT_CONFIG.cacheLogMaxCount) {
    nativeEventLogs.shift();
  }
  nativeEventLogs.push(log);
}
export function addErrorLogs(err: any) {
  /** 排除错误不明确的 */
  if (/[a-zA-Z0-9]/.test(JSON.stringify(err))) {
    errorLogs.push(err);
    errorSubject.next(errorLogs);
    errorBroadcast.next(err);
  }
}
export function addNetworkLog(log: any) {
  networkLogs.push(log);
}

const originalUniSendEvent = uni.sendNativeEvent;
uni.sendNativeEvent = (eventName, params, callback: (...params: any[]) => void) => {
  // #ifndef H5
  const data = {
    key: `sendNativeEvent:${eventName}`,
    params,
    response: '',
    startTime: Date.now(),
    endTime: 0,
  };
  addNativeEventLogs(data);
  nativeEventSubject.next(nativeEventLogs);
  originalUniSendEvent(eventName, params, (...params: any[]) => {
    data.response = params?.[0] ?? '';
    data.endTime = Date.now();
    nativeEventSubject.next(nativeEventLogs);
    /** 对上报事件不进行劫持，防止死循环 */
    if (REPORT_CONFIG.reportEventName !== eventName) {
      nativeEventResponseBroadcast.next(data);
    }
    callback(...params);
  });
  // #endif
};
const originalUniOnEvent = uni.onNativeEventReceive;
uni.onNativeEventReceive = (callback) => {
  // #ifndef H5
  originalUniOnEvent((event, data) => {
    const log = {
      key: `onNativeEvent:${event}`,
      response: data,
      params: '',
      startTime: Date.now(),
      endTime: 0,
    };
    addNativeEventLogs(log);
    /** 对上报事件不进行劫持，防止死循环 */
    if (REPORT_CONFIG.reportEventName !== event) {
      nativeEventResponseBroadcast.next(log);
    }
    callback?.(event, data);
    log.endTime = Date.now();
    nativeEventSubject.next(nativeEventLogs);
  });
  // #endif
};
// #ifndef H5
/** H5的时候不进行拦截，以免log展示位置错误 */
const originalConsoleLog = console.log;
console.log = (...params) => {
  consoleLogs.push(params);
  consoleSubject.next(consoleLogs);
  consoleBroadcast.next(params);
  originalConsoleLog(...params);
};
// #endif
const originRequest = uni?.request;
Object.defineProperty(uni, 'request', {
  configurable: true,
  enumerable: true,
  writable: false,
  value(requestParams: any) {
    const onceReqResult = {
      request: requestParams,
      response: null,
      startTime: Date.now(),
      endTime: 0,
    };
    networkLogs.push(onceReqResult);
    networkSubject.next(networkLogs);
    const { complete: originalCompleteMethod } = requestParams;
    requestParams.complete = function (...resParams: any[]) {
      onceReqResult.response = resParams?.[0];
      onceReqResult.endTime = Date.now();
      networkSubject.next(networkLogs);
      networkResponseBroadcast.next(onceReqResult);
      if (typeof originalCompleteMethod === 'function') {
        return originalCompleteMethod.apply(this, resParams);
      }
    };
    return originRequest.call(this, requestParams);
  },
});

uni.onError((...err: any[]) => {
  addErrorLogs(err);
});
