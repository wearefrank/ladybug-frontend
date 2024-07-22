import { UpdateReport } from '../interfaces/update-report';
import { UpdateCheckpoint } from '../interfaces/update-checkpoint';

export const UpdateReportUtil = {
  isUpdateReport(object: UpdateReport | UpdateCheckpoint): object is UpdateReport {
    return !!(object as UpdateReport).name;
  },

  isUpdateCheckpoint(object: UpdateReport | UpdateCheckpoint): object is UpdateCheckpoint {
    return !!(object as UpdateCheckpoint).checkpointMessage;
  },
};
