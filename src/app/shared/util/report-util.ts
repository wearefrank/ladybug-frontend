import { Report } from '../interfaces/report';
import { Checkpoint } from '../interfaces/checkpoint';
import { CreateTreeItem, FileTreeItem } from 'ng-simple-file-tree';

type ReportOrCheckpoint = Report | Checkpoint | CreateTreeItem | FileTreeItem | undefined;

export const ReportUtil = {
  isReport(node: ReportOrCheckpoint): node is Report {
    return !!node && !!(node as Report).xml;
  },

  isCheckPoint(node: ReportOrCheckpoint): node is Checkpoint {
    return !!node && !!(node as Checkpoint).uid;
  },

  getCheckpointFromReport(report: Report, uid: string): Checkpoint | undefined {
    for (let checkpoint of report.checkpoints) {
      if (uid === checkpoint.uid) {
        return checkpoint;
      }
    }
    return undefined;
  },

  hasValidUid(uid: string) {
    return !uid.includes('null');
  },
};
