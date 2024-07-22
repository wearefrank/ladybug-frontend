import { Report } from '../interfaces/report';
import { Checkpoint } from '../interfaces/checkpoint';
import { CreateTreeItem, FileTreeItem } from 'ng-simple-file-tree';

export type ReportOrCheckpoint = Report | Checkpoint | CreateTreeItem | FileTreeItem | undefined;

export const ReportUtil = {
  isReport(node: ReportOrCheckpoint): node is Report {
    return !!node && !!(node as Report).xml;
  },

  isCheckPoint(node: ReportOrCheckpoint): node is Checkpoint {
    return !!node && !!(node as Checkpoint).uid;
  },
};
