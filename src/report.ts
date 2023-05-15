import { consoleSubject, errorSubject, nativeEventSubject, networkSubject } from './probe';

interface IReportConfig {
  reportEventName: string;
}

/** 日志类型 */
type LogType = 'http' | 'console' | 'event' | 'exception' | 'custom';

const REPORT_CONFIG: IReportConfig = {
  /** 上报事件名称 */
  reportEventName: 'monitorReport',
};

const sendSubjectData = (data: any[]) => {
  sendData('console', [...(data ?? [])]?.pop?.() ?? '');
};

/** console上报 */
consoleSubject.subscribe(sendSubjectData);
errorSubject.subscribe(sendSubjectData);
nativeEventSubject.subscribe(sendSubjectData);
networkSubject.subscribe((data: any[]) => {
  console.log(333333333, data);
});

/**
 * 手动上报日志
 * @param data
 */
export function reportLog(data: any) {
  sendData('custom', data);
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
