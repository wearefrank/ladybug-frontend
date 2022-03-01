import { Report } from './report';

export interface TestResult {
  currentTime: number;
  previousTime: number;
  originalReport: Report;
  runResultReport: Report;
  originalXml: string;
  runResultXml: string;
  equal: boolean;
  stubbed: number;
  total: number;
}
