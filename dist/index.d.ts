import { Subject } from 'rxjs';

declare const consoleSubject: Subject<any[]>;
declare const errorSubject: Subject<any[]>;
declare const networkSubject: Subject<any[]>;
declare const nativeEventSubject: Subject<any[]>;
/**
 * 得到打印日志
 * @returns
 */
declare function getConsoleLogs(): any[];
declare function getNetworkLogs(): any[];
declare function getNativeEventLogs(): any[];
declare function getErrorLogs(): any[];
declare function addErrorLogs(err: any): void;

export { addErrorLogs, consoleSubject, errorSubject, getConsoleLogs, getErrorLogs, getNativeEventLogs, getNetworkLogs, nativeEventSubject, networkSubject };
