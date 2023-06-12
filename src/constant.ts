import { IReportConfig } from './interface';

export const REPORT_CONFIG: IReportConfig = {
  /** 上报事件名称,缺省monitorReport */
  reportEventName: 'monitorReport',
  cacheLogMaxCount: 50,
  /** 事件白名单，有些事件太过于频繁，无需上报 */
  whiteEventNames: [],
};
