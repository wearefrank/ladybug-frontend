import { Report } from './report';

export interface ReranReport {
  id: string;
  originalReport: Report;
  editedReport: Report;
  color: string;
  resultString: string;
}
