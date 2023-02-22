import { Subject } from 'rxjs';

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
export function addConsoleLogs(log: any) {
  if (consoleLogs.length > config.cacheLogMaxCount) {
    consoleLogs.shift();
  }
  consoleLogs.push(log);
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
  };
  nativeEventLogs.push(data);
  nativeEventSubject.next(nativeEventLogs);
  originalUniSendEvent(eventName, params, (...params: any[]) => {
    data.response = params?.[0] ?? '';
    nativeEventSubject.next(nativeEventLogs);
    callback(...params);
  });
  // #endif
};
const originalUniOnEvent = uni.onNativeEventReceive;
uni.onNativeEventReceive = (callback) => {
  // #ifndef H5
  originalUniOnEvent((event, data) => {
    nativeEventLogs.push({
      key: `onNativeEvent:${event}`,
      response: data,
      params: '',
    });
    nativeEventSubject.next(nativeEventLogs);
    callback?.(event, data);
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
    };
    networkLogs.push(onceReqResult);
    networkSubject.next(networkLogs);
    const { complete: originalCompleteMethod } = requestParams;
    requestParams.complete = function (...resParams: any[]) {
      onceReqResult.response = resParams?.[0];
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
