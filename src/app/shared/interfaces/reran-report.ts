import { Report } from './report';

export interface ReranReport {
  id: string;
  originalReport: Report;
  editedReport: Report;
  originalXml: string;
  editedXml: string;
  color: string;
  resultString: string;
}
