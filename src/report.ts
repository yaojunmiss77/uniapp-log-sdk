import { REPORT_CONFIG } from './constant';
import { consoleBroadcast, errorBroadcast, nativeEventResponseBroadcast, networkResponseBroadcast } from './probe';

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
  uni.sendNativeEvent(
    REPORT_CONFIG.reportEventName,
    {
      logType: type,
      time: Date.now(),
      page: getCurrentPages?.()?.pop?.()?.route ?? '',
      data,
    },
    () => {
      console.info('上报成功');
    },
  );
}
