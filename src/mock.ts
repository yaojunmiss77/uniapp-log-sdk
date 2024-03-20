export const eventNameToAppCallbacks = new Map<string, (params: any, emit: (...params: any[]) => void) => void>();

/**
 * H5页面调试mock事件，用于模拟小程序通过sendNativeEvent发送事件之后，H5页面接收到事件的情况
 * @param eventName 时间名称
 * @param callback 事件回调 params: 事件参数 emit: 事件回调，发送事件给小程序
 */
export function mockAppOnEvent(eventName: string, callback: (params: any, emit: (...params: any[]) => void) => void) {
  eventNameToAppCallbacks.set(eventName, callback);
}

/**
 * 通过事件名称删除一个mock事件
 * @param eventName 事件名称
 */
export function mockAppOffEvent(eventName: string) {
  eventNameToAppCallbacks.delete(eventName);
}
