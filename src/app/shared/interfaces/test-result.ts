import { Report } from './report';

export interface TestResult {
  currentTime: number;
  previousTime: number;
  originalReport: Report;
  editedReport: Report;
  originalXml: string;
  editedXml: string;
  equal: boolean;
  stubbed: number;
  total: number;
}
