import { REPORT_CONFIG } from './constant';
import {
  consoleBroadcast,
  errorBroadcast,
  nativeEventResponseBroadcast,
  nativeEventSendBroadcast,
  networkResponseBroadcast,
} from './probe';

/** 日志类型 */
enum LogType {
  HTTP = 'http',
  CONSOLE = 'console',
  EVENT = 'event',
  ERROR = 'error',
  CUSTOM = 'custom',
}

/** console上报 */
consoleBroadcast.subscribe((data) => {
  sendData(LogType.CONSOLE, data);
});
errorBroadcast.subscribe((data) => {
  sendData(LogType.ERROR, data);
});
nativeEventSendBroadcast.subscribe((data) => {
  sendData(LogType.EVENT, data);
});
nativeEventResponseBroadcast.subscribe((data) => {
  sendData(LogType.EVENT, data);
});
networkResponseBroadcast.subscribe((data: any) => {
  /** 当有响应后，且响应的errno不是0，则上报日志 */
  if (data?.response && data.response.data?.errno !== 0) {
    sendData(LogType.HTTP, data);
  }
});

/**
 * 手动上报日志
 * @param data
 */
export function reportLog(data: any) {
  sendData(LogType.CUSTOM, data);
}

/**
 *
 * @param data
 */
function sendData(type: LogType, data: any) {
  const { appName, appVersion, appId } = (uni.getSystemInfoSync() as any) ?? {};
  uni.sendNativeEvent(
    REPORT_CONFIG.reportEventName,
    {
      appName,
      appVersion,
      appId,
      logType: type,
      time: Date.now(),
      baseUrl: uni.getStorageSync('baseUrl'),
      token: uni.getStorageSync('token'),
      userInfo: uni.getStorageSync('userInfo'),
      page: getCurrentPages?.()?.pop?.()?.route ?? '',
      data,
    },
    () => {
      console.info('上报成功');
    },
  );
}
