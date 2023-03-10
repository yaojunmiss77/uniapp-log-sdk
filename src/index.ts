import { Subject } from 'rxjs';
import { IOptions } from './interface';

const config: IOptions = {
  cacheLogMaxCount: 50,
};

export const consoleSubject = new Subject<any[]>();
export const errorSubject = new Subject<any[]>();
export const networkSubject = new Subject<any[]>();
export const nativeEventSubject = new Subject<any[]>();

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
  if (nativeEventLogs.length > config.cacheLogMaxCount) {
    nativeEventLogs.shift();
  }
  nativeEventLogs.push(log);
}
export function addErrorLogs(err: any) {
  if (err?.length) {
    errorLogs.push(err);
    errorSubject.next(errorLogs);
  }
}
export function addNetworkLog(log: any) {
  networkLogs.push(log);
}

export default {
  install(options: Partial<IOptions>) {
    if (options.cacheLogMaxCount) {
      config.cacheLogMaxCount = options.cacheLogMaxCount;
    }
  },
};

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
