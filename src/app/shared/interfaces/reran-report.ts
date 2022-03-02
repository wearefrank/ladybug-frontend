import { Report } from './report';

export interface ReranReport {
  id: string;
  originalReport: Report;
  runResultReport: Report;
  color: string;
  resultString: string;
}
