import { REPORT_CONFIG } from './constant';
import { IReportConfig } from './interface';

export * from './probe';
export * from './report';
export * from './mock';

export default {
  install(options: Partial<IReportConfig>) {
    if (options.cacheLogMaxCount) {
      REPORT_CONFIG.cacheLogMaxCount = options.cacheLogMaxCount;
    }
    if (options.reportEventName) {
      REPORT_CONFIG.reportEventName = options.reportEventName;
    }
    if (options.whiteEventNames?.length) {
      REPORT_CONFIG.whiteEventNames = options.whiteEventNames;
    }
  },
};
