import { Report } from '../interfaces/report';
import { Checkpoint } from '../interfaces/checkpoint';

export const ReportUtil = {
  isReport(node: Report | Checkpoint): node is Report {
    return !!(node as Report).xml;
  },

  isCheckPoint(node: Report | Checkpoint): node is Checkpoint {
    return !!(node as Checkpoint).uid;
  },
};
