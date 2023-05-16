import { REPORT_CONFIG } from './constant';
import { IReportConfig } from './interface';

export * from './probe';
export * from './report';

console.log(uni.getSystemInfoSync());

export default {
  install(options: Partial<IReportConfig>) {
    if (options.cacheLogMaxCount) {
      REPORT_CONFIG.cacheLogMaxCount = options.cacheLogMaxCount;
    }
    if (options.reportEventName) {
      REPORT_CONFIG.reportEventName = options.reportEventName;
    }
  },
};
