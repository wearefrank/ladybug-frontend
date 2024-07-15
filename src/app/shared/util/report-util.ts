import { Report } from '../interfaces/report';
import { Checkpoint } from '../interfaces/checkpoint';

export const ReportUtil = {
  isReport(node: Report | Checkpoint | undefined): node is Report {
    return !!node && !!(node as Report).xml;
  },

  isCheckPoint(node: Report | Checkpoint | undefined): node is Checkpoint {
    return !!node && !!(node as Checkpoint).uid;
  },
};
