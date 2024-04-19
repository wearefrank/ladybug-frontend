import { Report } from './report';

export interface CompareReports {
  originalReport: Report;
  runResultReport: Report;
  viewName: string;
  nodeLinkStrategy: string;
  id?: string;
}
