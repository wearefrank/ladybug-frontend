import { TestResult } from './test-result';

export interface ReranReport {
  originalIndex: string;
  newIndex: string;
  result: TestResult;
}
