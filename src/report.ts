import { REPORT_CONFIG } from './constant';
import {
  errorBroadcast,
  nativeEventResponseBroadcast,
  nativeEventSendBroadcast,
  networkResponseBroadcast,
} from './probe';
import { formatDate } from './util';

/** 日志类型 */
enum LogType {
  HTTP = 'http',
  EVENT = 'event',
  ERROR = 'error',
  CUSTOM = 'custom',
}

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
    const params = { ...data };
    if (data.respose?.statusCode === 403) {
      params.token = uni.getStorageSync('token');
    } else {
      delete params.request?.header?.Authorization;
    }
    sendData(LogType.HTTP, params);
  }
});

/**
 * 手动上报日志
 * @param data 需要上报的数据
 * @param tags 上报数据的tag，支持多个tag
 */
export function reportLog(data: any, ...tags: string[]) {
  if (tags?.length) {
    sendData(LogType.CUSTOM, { tags: tags.join(','), ...data });
  } else {
    sendData(LogType.CUSTOM, data);
  }
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
      time: formatDate(Date.now()),
      baseUrl: uni.getStorageSync('baseUrl'),
      userInfo: uni.getStorageSync('userInfo'),
      page: getCurrentPages?.()?.pop?.()?.route ?? '',
      data,
    },
    () => {
      console.info('上报成功');
    },
  );
}
