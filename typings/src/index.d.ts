import { Subject } from 'rxjs';
export declare const consoleSubject: Subject<any[]>;
export declare const errorSubject: Subject<any[]>;
export declare const networkSubject: Subject<any[]>;
export declare const nativeEventSubject: Subject<any[]>;
/**
 * 得到打印日志
 * @returns
 */
export declare function getConsoleLogs(): any[];
export declare function getNetworkLogs(): any[];
export declare function getNativeEventLogs(): any[];
export declare function getErrorLogs(): any[];
export declare function addNativeEventLogs(log: any): void;
export declare function addErrorLogs(err: any): void;
export declare function addNetworkLog(log: any): void;
declare const _default: {
    install(options: Partial<IOptions>): void;
};
export default _default;
